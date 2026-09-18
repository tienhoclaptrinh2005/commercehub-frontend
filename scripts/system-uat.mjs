import { createHmac, randomUUID } from "node:crypto";

const API = (process.env.SYSTEM_UAT_API_URL || "http://localhost:8081").replace(/\/$/, "");
const WEBHOOK_SECRET = process.env.SYSTEM_UAT_SEPAY_WEBHOOK_SECRET;
const BANK_ACCOUNT = process.env.SYSTEM_UAT_SEPAY_BANK_ACCOUNT;

const credentials = {
  buyer: ["buyer@commercehub.test", "Test@123456"],
  seller: ["seller@commercehub.test", "Test@123456"],
  vpnSeller: ["vpn.seller@commercehub.test", "Test@123456"],
  admin: ["admin@commercehub.test", "Test@123456"],
};

const report = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, { method = "GET", token, body, rawBody, headers = {}, ok = [200] } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((body !== undefined || rawBody !== undefined) ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: rawBody !== undefined ? rawBody : body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let payload = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }
  if (!ok.includes(response.status)) {
    throw new Error(`${method} ${path} trả ${response.status}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
  }
  return { status: response.status, payload };
}

async function login(email, password) {
  const { payload } = await request("/api/v1/auth/login", {
    method: "POST",
    body: { email, password, deviceId: `system-uat-${randomUUID()}` },
  });
  assert(payload?.data?.accessToken, `Không nhận được access token cho ${email}`);
  return payload.data;
}

async function checkout(token, variantId, { buyerInputs, voucher } = {}) {
  const body = {
    items: [{ productVariantId: variantId, quantity: 1, ...(buyerInputs ? { buyerInputs } : {}) }],
    paymentMethod: "WALLET",
    idempotencyKey: randomUUID(),
    vouchers: voucher ? [voucher] : [],
  };
  const result = await request("/api/v1/checkout", { method: "POST", token, body, ok: [200, 400, 404, 409, 422] });
  return { ...result, request: body };
}

async function orderDetail(token, orderCode) {
  return (await request(`/api/v1/orders/${encodeURIComponent(orderCode)}`, { token })).payload.data;
}

async function wallet(token) {
  return (await request("/api/v1/wallet", { token })).payload.data;
}

function pageRows(data) {
  if (!data) return [];
  return data.data || data.content || [];
}

function add(name, details = {}) {
  report.push({ name, ok: true, ...details });
}

function money(value) {
  return Number(value || 0);
}

function vietnamTimestamp() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).format(new Date());
}

async function main() {
  assert(WEBHOOK_SECRET, "Thiếu SYSTEM_UAT_SEPAY_WEBHOOK_SECRET");
  assert(BANK_ACCOUNT, "Thiếu SYSTEM_UAT_SEPAY_BANK_ACCOUNT");

  const [buyer, seller, vpnSeller, admin] = await Promise.all(
    Object.values(credentials).map(([email, password]) => login(email, password)),
  );
  assert(buyer.roles.includes("BUYER"), "Tài khoản buyer sai role");
  assert(seller.roles.includes("SELLER"), "Tài khoản seller sai role");
  assert(admin.roles.some((role) => role === "ADMIN" || role === "SUPER_ADMIN"), "Tài khoản admin sai role");
  add("Đăng nhập và role Buyer/Seller/Admin");

  await request("/api/v1/seller/dashboard", { token: buyer.accessToken, ok: [403] });
  await request("/api/v1/admin/dashboard", { token: seller.accessToken, ok: [403] });
  add("Phân quyền route Seller/Admin", { buyerSellerRoute: 403, sellerAdminRoute: 403 });

  const products = (await request("/api/v1/products?page=0&size=30")).payload.data.data;
  const bySlug = Object.fromEntries(products.map((product) => [product.slug, product]));
  for (const slug of ["netflix-premium-demo", "chatgpt-plus-demo", "capcut-pro-demo", "canva-pro-demo", "nordvpn-demo"]) {
    assert(bySlug[slug], `Thiếu sản phẩm seed ${slug}`);
  }
  const variant = (slug, name) => {
    const result = bySlug[slug].variants.find((item) => item.name === name);
    assert(result, `Thiếu biến thể ${slug}/${name}`);
    return result.id;
  };

  const buyerWalletBeforeDeposit = await wallet(buyer.accessToken);
  const depositKey = randomUUID();
  const depositBody = { amount: 10000, idempotencyKey: depositKey };
  const deposit1 = (await request("/api/v1/wallet/deposits", {
    method: "POST", token: buyer.accessToken, body: depositBody,
  })).payload.data;
  const depositRetry = (await request("/api/v1/wallet/deposits", {
    method: "POST", token: buyer.accessToken, body: depositBody,
  })).payload.data;
  assert(deposit1.transactionCode === depositRetry.transactionCode, "Retry nạp tiền tạo giao dịch mới");

  const providerId = Date.now();
  const webhookBody = JSON.stringify({
    id: providerId,
    gateway: "MBBank",
    transactionDate: vietnamTimestamp(),
    accountNumber: BANK_ACCOUNT,
    code: deposit1.paymentCode,
    content: deposit1.paymentCode,
    transferType: "in",
    description: `SYSTEM UAT ${deposit1.paymentCode}`,
    transferAmount: 10000,
    accumulated: 10000,
    referenceCode: `UAT-${providerId}`,
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  await request("/api/v1/payments/sepay/webhook", {
    method: "POST", rawBody: webhookBody,
    headers: { "X-SePay-Timestamp": timestamp, "X-SePay-Signature": "sha256=00" },
    ok: [401, 403],
  });
  const signature = `sha256=${createHmac("sha256", WEBHOOK_SECRET).update(`${timestamp}.${webhookBody}`).digest("hex")}`;
  const webhookHeaders = { "X-SePay-Timestamp": timestamp, "X-SePay-Signature": signature };
  await request("/api/v1/payments/sepay/webhook", { method: "POST", rawBody: webhookBody, headers: webhookHeaders });
  await request("/api/v1/payments/sepay/webhook", { method: "POST", rawBody: webhookBody, headers: webhookHeaders });
  const depositStatus = (await request(`/api/v1/wallet/deposits/${deposit1.transactionCode}`, { token: buyer.accessToken })).payload.data;
  const buyerWalletAfterDeposit = await wallet(buyer.accessToken);
  assert(depositStatus.status === "SUCCESS", `Deposit có trạng thái ${depositStatus.status}`);
  assert(money(buyerWalletAfterDeposit.availableBalance) - money(buyerWalletBeforeDeposit.availableBalance) === 10000,
    "Webhook retry đã cộng tiền sai hoặc cộng lặp");
  add("Nạp tiền SePay HMAC + idempotency", { transactionCode: deposit1.transactionCode, creditedOnce: true });

  const unique = Date.now().toString().slice(-8);
  const voucherCode = `UAT${unique}`;
  const voucherCreated = (await request("/api/v1/seller/vouchers", {
    method: "POST",
    token: seller.accessToken,
    ok: [200, 201],
    body: {
      code: voucherCode,
      description: "Voucher cạnh tranh UAT",
      discountType: "FIXED",
      discountValue: 1000,
      minOrderAmount: 0,
      applyAllProducts: true,
      productIds: [],
      startsAt: new Date(Date.now() - 60_000).toISOString(),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      usageLimit: 1,
    },
  })).payload.data;
  const voucherRef = { shopId: seller.shopId, deliveryType: "INSTANT", code: voucherCode };
  const voucherRace = await Promise.all([
    checkout(buyer.accessToken, variant("netflix-premium-demo", "Gói Premium"), { voucher: voucherRef }),
    checkout(vpnSeller.accessToken, variant("chatgpt-plus-demo", "Gói 1 tháng"), { voucher: voucherRef }),
  ]);
  assert(voucherRace.filter((entry) => entry.status === 200).length === 1,
    `Voucher usageLimit=1 nhưng số checkout thành công là ${voucherRace.filter((entry) => entry.status === 200).length}`);
  const vouchers = pageRows((await request("/api/v1/seller/vouchers?page=0&size=50", { token: seller.accessToken })).payload.data);
  const voucherAfterRace = vouchers.find((item) => item.id === voucherCreated.id);
  assert(voucherAfterRace?.usedCount === 1, `usedCount voucher là ${voucherAfterRace?.usedCount}`);
  add("Hai checkout đồng thời không vượt usageLimit voucher", { voucherCode, usedCount: 1 });

  const stockRace = await Promise.all([
    checkout(buyer.accessToken, variant("capcut-pro-demo", "Gói 1 tháng")),
    checkout(vpnSeller.accessToken, variant("capcut-pro-demo", "Gói 1 tháng")),
  ]);
  assert(stockRace.filter((entry) => entry.status === 200).length === 1,
    `Kho chỉ còn 1 asset nhưng số checkout thành công là ${stockRace.filter((entry) => entry.status === 200).length}`);
  add("Hai checkout đồng thời không bán trùng asset", { successCount: 1, rejectedCount: 1 });

  const preCheckout = await checkout(buyer.accessToken, variant("canva-pro-demo", "Nâng cấp 1 năm"), {
    buyerInputs: JSON.stringify({ canvaEmail: `uat-${unique}@commercehub.test` }),
  });
  assert(preCheckout.status === 200, "Checkout đơn đặt hàng thất bại");
  const preOrderCode = preCheckout.payload.data[0].orderCode;
  let preOrder = await orderDetail(buyer.accessToken, preOrderCode);
  assert(preOrder.status === "WAITING_SELLER_ACCEPTANCE", `Đơn đặt hàng mới có trạng thái ${preOrder.status}`);
  const preItem = preOrder.items[0];
  await request(`/api/v1/seller/orders/${preOrder.id}`, { token: vpnSeller.accessToken, ok: [404] });
  await request(`/api/v1/seller/orders/${preOrder.id}/accept`, { method: "POST", token: seller.accessToken });
  await request(`/api/v1/seller/orders/${preOrder.id}/complete`, {
    method: "POST", token: seller.accessToken,
    body: {
      items: [{
        orderItemId: preItem.id,
        deliveryContentType: "MESSAGE",
        deliveryContent: `UAT hoàn tất Canva ${unique}`,
        sellerNotes: "Ghi chú nội bộ UAT",
      }],
    },
  });
  preOrder = await orderDetail(buyer.accessToken, preOrderCode);
  assert(preOrder.status === "DELIVERED", `Đơn đặt hàng hoàn tất có trạng thái ${preOrder.status}`);
  assert(preOrder.items[0].preOrder.deliveryContent.includes(unique), "Buyer không đọc được nội dung giao PRE_ORDER");
  add("Đặt hàng: checkout → nhận đơn → hoàn thành", { orderCode: preOrderCode, ownershipBlocked: true });

  const refundCheckout = await checkout(buyer.accessToken, variant("netflix-premium-demo", "Gói tiêu chuẩn"));
  assert(refundCheckout.status === 200, "Không tạo được đơn để test seller refund");
  const refundOrder = await orderDetail(buyer.accessToken, refundCheckout.payload.data[0].orderCode);
  const refundItem = refundOrder.items[0];
  const walletBeforeRefund = await wallet(buyer.accessToken);
  const refundDispute = (await request(`/api/v1/orders/${refundOrder.orderCode}/items/${refundItem.id}/complain`, {
    method: "POST", token: buyer.accessToken,
    body: { reason: "UAT: tài khoản không sử dụng được", evidenceUrls: [] }, ok: [201],
  })).payload.data;
  const sellerRefund = (await request(`/api/v1/seller/orders/${refundOrder.id}/items/${refundItem.id}/dispute-refund`, {
    method: "POST", token: seller.accessToken,
    body: { response: "UAT: shop chủ động hoàn tiền", evidenceUrls: [] },
  })).payload.data;
  const walletAfterRefund = await wallet(buyer.accessToken);
  assert(sellerRefund.status === "RESOLVED" && sellerRefund.resolution === "SELLER_REFUND", "Seller refund không kết thúc đúng trạng thái");
  const refundCredit = money(walletAfterRefund.availableBalance) - money(walletBeforeRefund.availableBalance);
  assert(Math.abs(refundCredit - money(refundDispute.disputedAmount)) < 0.01,
    `Buyer không nhận đúng số tiền seller refund: before=${walletBeforeRefund.availableBalance}, after=${walletAfterRefund.availableBalance}, expected=${refundDispute.disputedAmount}`);
  add("Khiếu nại: Seller hoàn tiền", { orderCode: refundOrder.orderCode, amount: refundDispute.disputedAmount });

  const adminCheckout = await checkout(buyer.accessToken, variant("chatgpt-plus-demo", "Gói 3 tháng"));
  assert(adminCheckout.status === 200, "Không tạo được đơn để test admin phán quyết");
  const adminOrder = await orderDetail(buyer.accessToken, adminCheckout.payload.data[0].orderCode);
  const adminItem = adminOrder.items[0];
  const adminDispute = (await request(`/api/v1/orders/${adminOrder.orderCode}/items/${adminItem.id}/complain`, {
    method: "POST", token: buyer.accessToken,
    body: { reason: "UAT: yêu cầu bảo hành", evidenceUrls: [] }, ok: [201],
  })).payload.data;
  await request(`/api/v1/seller/orders/${adminOrder.id}/items/${adminItem.id}/warranty-start`, {
    method: "POST", token: seller.accessToken, body: { response: "Đã nhận bảo hành", evidenceUrls: [] },
  });
  const warrantyCompleted = (await request(`/api/v1/seller/orders/${adminOrder.id}/items/${adminItem.id}/warranty-complete`, {
    method: "POST", token: seller.accessToken, body: { response: "Đã cấp tài khoản thay thế", evidenceUrls: [] },
  })).payload.data;
  assert(warrantyCompleted.status === "WAITING_BUYER_CONFIRMATION", `Hoàn tất bảo hành có trạng thái ${warrantyCompleted.status}`);
  const escalated = (await request(`/api/v1/disputes/${adminDispute.id}/escalate`, {
    method: "POST", token: buyer.accessToken,
    body: { reason: "Kết quả bảo hành chưa đạt, đề nghị Admin xem xét", evidenceUrls: [] },
  })).payload.data;
  assert(escalated.status === "ADMIN_REVIEW", `Escalate có trạng thái ${escalated.status}`);
  const queue = pageRows((await request("/api/v1/admin/disputes?scope=QUEUE&page=0&size=50", { token: admin.accessToken })).payload.data);
  assert(queue.some((item) => item.id === adminDispute.id), "Admin queue không chứa dispute ADMIN_REVIEW");
  const adminResolved = (await request(`/api/v1/admin/disputes/${adminDispute.id}/resolve`, {
    method: "POST", token: admin.accessToken,
    body: { decision: "BUYER_WIN", resolutionNote: "UAT: bằng chứng xác nhận buyer thắng" },
  })).payload.data;
  assert(adminResolved.status === "RESOLVED" && adminResolved.resolution === "BUYER_WIN", "Admin phán quyết sai trạng thái");
  add("Khiếu nại: bảo hành → buyer từ chối → Admin phán quyết", { orderCode: adminOrder.orderCode, disputeId: adminDispute.id });

  const sellerEscalateCheckout = await checkout(buyer.accessToken, variant("nordvpn-demo", "Gói 1 tháng"));
  assert(sellerEscalateCheckout.status === 200, "Không tạo được đơn để test seller escalation");
  const sellerEscalateOrder = await orderDetail(buyer.accessToken, sellerEscalateCheckout.payload.data[0].orderCode);
  const sellerEscalateItem = sellerEscalateOrder.items[0];
  const sellerEscalateDispute = (await request(`/api/v1/orders/${sellerEscalateOrder.orderCode}/items/${sellerEscalateItem.id}/complain`, {
    method: "POST", token: buyer.accessToken,
    body: { reason: "UAT: VPN không kết nối", evidenceUrls: [] }, ok: [201],
  })).payload.data;
  await request(`/api/v1/seller/orders/${sellerEscalateOrder.id}/items/${sellerEscalateItem.id}/dispute`, {
    method: "POST", token: vpnSeller.accessToken,
    body: { reason: "", evidenceUrls: [] }, ok: [400],
  });
  const sellerEscalated = (await request(`/api/v1/seller/orders/${sellerEscalateOrder.id}/items/${sellerEscalateItem.id}/dispute`, {
    method: "POST", token: vpnSeller.accessToken,
    body: { reason: "Shop không thể bảo hành, đề nghị Admin xử lý", evidenceUrls: [] },
  })).payload.data;
  assert(sellerEscalated.status === "ADMIN_REVIEW", "Seller chuyển Admin sai trạng thái");
  await request(`/api/v1/admin/disputes/${sellerEscalateDispute.id}/resolve`, {
    method: "POST", token: admin.accessToken,
    body: { decision: "SELLER_WIN", resolutionNote: "UAT: bằng chứng xác nhận seller thắng" },
  });
  add("Seller bắt buộc nhập lý do khi chuyển Admin", { orderCode: sellerEscalateOrder.orderCode, disputeId: sellerEscalateDispute.id });

  const sellerWalletBeforeWithdrawal = await wallet(seller.accessToken);
  const withdrawalKey = randomUUID();
  const withdrawalBody = {
    amount: 500000,
    bankName: "MBBank",
    accountNumber: "0123456789",
    accountName: "COMMERCEHUB UAT SELLER",
    idempotencyKey: withdrawalKey,
  };
  const withdrawal = (await request("/api/v1/seller/wallet/withdrawals", {
    method: "POST", token: seller.accessToken, body: withdrawalBody,
  })).payload.data;
  const withdrawalRetry = (await request("/api/v1/seller/wallet/withdrawals", {
    method: "POST", token: seller.accessToken, body: withdrawalBody,
  })).payload.data;
  assert(withdrawal.id === withdrawalRetry.id, "Retry rút tiền tạo yêu cầu mới");
  assert(withdrawal.status === "PENDING", `Yêu cầu rút mới có trạng thái ${withdrawal.status}`);
  const sellerWalletPending = await wallet(seller.accessToken);
  assert(money(sellerWalletBeforeWithdrawal.availableBalance) - money(sellerWalletPending.availableBalance) === 500000,
    "Số dư không bị khóa đúng một lần khi yêu cầu rút");
  await request(`/api/v1/admin/withdrawals/${withdrawal.id}/decision`, {
    method: "PUT", token: admin.accessToken,
    body: { action: "APPROVE", note: "UAT: đã đối soát" },
  });
  await request(`/api/v1/admin/withdrawals/${withdrawal.id}/decision`, {
    method: "PUT", token: admin.accessToken,
    body: { action: "COMPLETE", note: "UAT: đã chuyển khoản", transferReference: `UAT-TRANSFER-${unique}` },
  });
  const withdrawalsAfterDone = pageRows((await request("/api/v1/seller/wallet/withdrawals?page=0&size=20", { token: seller.accessToken })).payload.data);
  assert(withdrawalsAfterDone.find((item) => item.id === withdrawal.id)?.status === "DONE", "Đơn rút không chuyển DONE");

  const rejected = (await request("/api/v1/seller/wallet/withdrawals", {
    method: "POST", token: seller.accessToken,
    body: { ...withdrawalBody, idempotencyKey: randomUUID(), amount: 500000 },
  })).payload.data;
  const walletBeforeReject = await wallet(seller.accessToken);
  await request(`/api/v1/admin/withdrawals/${rejected.id}/decision`, {
    method: "PUT", token: admin.accessToken,
    body: { action: "REJECT", note: "UAT: thông tin ngân hàng không khớp" },
  });
  const walletAfterReject = await wallet(seller.accessToken);
  assert(money(walletAfterReject.availableBalance) - money(walletBeforeReject.availableBalance) === 500000,
    "Từ chối rút tiền không hoàn đúng số dư");
  add("Rút tiền: idempotency, duyệt/hoàn tất và từ chối/hoàn số dư", { doneWithdrawalId: withdrawal.id, rejectedWithdrawalId: rejected.id });

  const [sellerDashboard, sellerFees, adminDashboard] = await Promise.all([
    request("/api/v1/seller/dashboard", { token: seller.accessToken }),
    request(`/api/v1/seller/fees/summary?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`, { token: seller.accessToken }),
    request("/api/v1/admin/dashboard", { token: admin.accessToken }),
  ]);
  assert(sellerDashboard.payload.data && sellerFees.payload.data && adminDashboard.payload.data,
    "Dashboard/fee summary không trả dữ liệu");
  add("Dashboard doanh thu, phí sàn và Admin tổng quan");

  console.log(JSON.stringify({
    ok: true,
    api: API,
    report,
    holdReleaseCandidate: { orderCode: preOrderCode, orderId: preOrder.id },
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, api: API, report, error: error.message }, null, 2));
  process.exitCode = 1;
});
