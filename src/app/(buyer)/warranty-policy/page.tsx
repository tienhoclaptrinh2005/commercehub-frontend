import type { Metadata } from "next";
import {
  BadgeCheck,
  Ban,
  Clock3,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Store,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Chính sách bảo hành",
  description:
    "Chính sách giữ tiền T+7, bảo hành, khiếu nại và hoàn tiền cho giao dịch trên CommerceHub.",
};

const sections = [
  { id: "scope", label: "Phạm vi áp dụng" },
  { id: "instant", label: "Sản phẩm giao ngay" },
  { id: "pre-order", label: "Sản phẩm đặt hàng" },
  { id: "holding", label: "Cơ chế giữ tiền T+7" },
  { id: "complaint", label: "Quy trình khiếu nại và bảo hành" },
  { id: "refund", label: "Điều kiện hoàn tiền" },
  { id: "exclusions", label: "Trường hợp không được bảo hành" },
  { id: "evidence", label: "Bằng chứng và hỗ trợ sau bảo hành" },
] as const;

const headingClassName =
  "scroll-mt-6 text-xl font-black tracking-[-0.025em] text-slate-950 sm:text-2xl";
const listClassName = "mt-3 list-disc space-y-2 pl-5 marker:text-emerald-600";

const flowSteps = [
  ["01", "Buyer mở khiếu nại", "Chỉ thực hiện khi mục hàng còn HOLDING và còn thời gian T+7."],
  ["02", "Seller phản hồi trong 24 giờ", "Seller nhận bảo hành hoặc chuyển tranh chấp cho Admin."],
  ["03", "Bảo hành tối đa 24 giờ", "Nếu seller đã nhận nhưng không xử lý đúng hạn, hệ thống hoàn tiền."],
  ["04", "Buyer xác nhận", "Buyer có 24 giờ để đồng ý kết quả hoặc chuyển Admin khi không đồng ý."],
  ["05", "Đóng hoặc phán quyết", "Giao dịch tiếp tục T+7 còn lại hoặc buyer được hoàn 100%."],
] as const;

export default function WarrantyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Bảo vệ giao dịch"
      title="Chính sách bảo hành"
      description="Quy định dành cho sản phẩm giao ngay và đơn đặt hàng, từ lúc thanh toán đến khi tiền được quyết toán cho người bán."
      updatedAt="07/09/2026"
      icon={ShieldCheck}
      sections={sections}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Clock3, value: "T+7", label: "Thời gian giữ tiền" },
          { icon: BadgeCheck, value: "01 lần", label: "Khiếu nại mỗi mục hàng" },
          { icon: RotateCcw, value: "100%", label: "Mức hoàn khi buyer thắng" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <Icon className="size-5 text-emerald-700" />
            <p className="mt-3 text-xl font-black text-emerald-950">{value}</p>
            <p className="mt-1 text-xs font-medium text-emerald-900/65">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <TriangleAlert className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-black sm:text-lg">
              Mỗi sản phẩm có chính sách bảo hành riêng
            </h2>
            <p className="mt-1.5 text-sm font-medium leading-6 sm:text-[15px]">
              Chính sách, thời hạn và phạm vi bảo hành có thể khác nhau đối với
              từng sản phẩm và từng shop. Người mua phải đọc kỹ mô tả, điều kiện
              bảo hành và các trường hợp loại trừ trên trang sản phẩm trước khi
              thanh toán. Việc tiếp tục mua hàng được hiểu là người mua đã xem
              và chấp nhận chính sách được shop công bố cho sản phẩm đó.
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-900/80">
              Cơ chế giữ tiền T+7 và xử lý khiếu nại của CommerceHub là lớp bảo
              vệ giao dịch chung, không thay thế cam kết bảo hành riêng của shop.
            </p>
          </div>
        </div>
      </div>

      <section id="scope" className="mt-9">
        <h2 className={headingClassName}>I. Phạm vi áp dụng</h2>
        <p className="mt-4">
          Chính sách áp dụng cho từng mục hàng được mua và thanh toán thành công
          trên CommerceHub, gồm hai hình thức Giao ngay và Đặt hàng. Thời hạn cụ
          thể được xác định bằng trạng thái và mốc thời
          gian lưu trong hệ thống, không tính theo nội dung trao đổi bên ngoài.
        </p>
        <p className="mt-3">
          Bảo hành của CommerceHub là cơ chế bảo vệ giao dịch trong thời gian giữ
          tiền; không thay thế cam kết riêng của nhà sản xuất hoặc nhà cung cấp
          dịch vụ bên thứ ba.
        </p>
      </section>

      <section id="instant" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>II. Sản phẩm giao ngay</h2>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sky-950 sm:p-5">
          <PackageCheck className="mt-0.5 size-5 shrink-0 text-sky-700" />
          <p className="text-sm leading-6">
            Sau khi thanh toán thành công, hệ thống trừ tồn kho và tự động bàn
            giao dữ liệu. Mốc T+7 bắt đầu từ thời điểm giao hàng được ghi nhận.
          </p>
        </div>
        <ul className={listClassName}>
          <li>Buyer cần mở chi tiết đơn để kiểm tra đúng nội dung, số lượng và khả năng sử dụng.</li>
          <li>Dữ liệu giao hàng có thể được xem lại hoặc tải dưới dạng TXT tại chi tiết đơn nếu hệ thống hỗ trợ.</li>
          <li>Nếu dữ liệu sai mô tả, trùng, thiếu hoặc không hoạt động, buyer phải khiếu nại trước khi T+7 kết thúc.</li>
        </ul>
      </section>

      <section id="pre-order" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>III. Sản phẩm đặt hàng</h2>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:p-5">
          <Store className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div className="text-sm leading-6">
            <p className="font-bold">Đơn đặt hàng được xử lý theo hai thời hạn:</p>
            <p className="mt-1">
              Shop có tối đa 24 giờ để nhận đơn; sau khi nhận có tối đa 24 giờ
              để hoàn thành và bàn giao kết quả.
            </p>
          </div>
        </div>
        <ul className={listClassName}>
          <li>Buyer cần nhập đúng thông tin gửi shop và không vượt quá giới hạn 100 ký tự.</li>
          <li>Shop từ chối, không nhận trong 24 giờ hoặc đã nhận nhưng không hoàn thành trong 24 giờ: đơn bị hủy và buyer được hoàn 100% về ví.</li>
          <li>Sau khi shop hoàn thành và hệ thống ghi nhận giao hàng, mục hàng chuyển sang giai đoạn giữ tiền T+7.</li>
        </ul>
      </section>

      <section id="holding" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>IV. Cơ chế giữ tiền T+7</h2>
        <ul className={listClassName}>
          <li>Khoản thanh toán được giữ trong 7 ngày kể từ khi mục hàng được giao thành công.</li>
          <li>Trong thời gian HOLDING, số tiền chưa được quyết toán thành số dư khả dụng của seller.</li>
          <li>Khi buyer mở khiếu nại hợp lệ, đồng hồ T+7 dừng và thời gian còn lại được bảo lưu.</li>
          <li>Nếu khiếu nại được rút, được giải quyết thành công hoặc seller thắng, đồng hồ tiếp tục từ phần thời gian còn lại.</li>
          <li>Khi hết T+7 mà không có khiếu nại đang xử lý, hệ thống quyết toán doanh thu và phí nền tảng.</li>
        </ul>
      </section>

      <section id="complaint" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>V. Quy trình khiếu nại và bảo hành</h2>
        <div className="mt-5 space-y-3">
          {flowSteps.map(([number, title, description]) => (
            <div key={number} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-700 text-xs font-black text-white">
                {number}
              </span>
              <div>
                <h3 className="font-bold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
        <ul className={listClassName}>
          <li>Buyer có thể tự hủy khiếu nại khi hồ sơ đang chờ seller hoặc seller đang bảo hành và thời hạn phản hồi chưa hết.</li>
          <li>Buyer tự hủy đồng nghĩa hồ sơ được đóng; cùng mục hàng đó không thể tạo khiếu nại lần thứ hai.</li>
          <li>Khi seller báo đã xử lý, buyer có 24 giờ để đồng ý hoặc từ chối kết quả. Buyer từ chối sẽ chuyển hồ sơ cho Admin.</li>
          <li>Buyer không phản hồi trong 24 giờ thì hồ sơ đóng và thời gian T+7 còn lại tiếp tục chạy.</li>
        </ul>
      </section>

      <section id="refund" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>VI. Điều kiện hoàn tiền</h2>
        <p className="mt-4">Buyer được hoàn 100% giá trị mục hàng hoặc đơn thuộc một trong các trường hợp:</p>
        <ul className={listClassName}>
          <li>Đơn đặt hàng bị shop từ chối hoặc tự động hủy vì quá hạn tiếp nhận/xử lý.</li>
          <li>Seller không phản hồi khiếu nại trong 24 giờ.</li>
          <li>Seller đã nhận bảo hành nhưng không hoàn tất trong 24 giờ.</li>
          <li>Admin xem xét bằng chứng và phán quyết buyer thắng tranh chấp.</li>
        </ul>
        <p className="mt-3">
          Khoản hoàn được cộng về ví CommerceHub của đúng tài khoản đã mua. Hệ
          thống đồng thời hủy phần phí liên quan đến mục hàng được hoàn.
        </p>
      </section>

      <section id="exclusions" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>VII. Trường hợp không được bảo hành</h2>
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-950 sm:p-5">
          <Ban className="mt-0.5 size-5 shrink-0 text-rose-600" />
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 marker:text-rose-500">
            <li>Hết thời gian T+7 hoặc khoản tiền không còn ở trạng thái cho phép khiếu nại.</li>
            <li>Buyer đã sử dụng, thay đổi, chia sẻ hoặc làm lộ dữ liệu rồi yêu cầu đổi/hoàn không có căn cứ.</li>
            <li>Lỗi do buyer nhập sai thông tin, không làm theo hướng dẫn hoặc dùng sai mục đích.</li>
            <li>Sản phẩm bị bên thứ ba hạn chế do hành vi của buyer sau khi bàn giao.</li>
            <li>Bằng chứng giả mạo, cắt ghép, không liên quan hoặc không đủ để đối chiếu với giao dịch.</li>
          </ul>
        </div>
      </section>

      <section id="evidence" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>VIII. Bằng chứng và hỗ trợ sau bảo hành</h2>
        <ul className={listClassName}>
          <li>Cung cấp mã đơn, mục hàng, mô tả lỗi, thời điểm phát hiện và ảnh hoặc đường dẫn bằng chứng rõ ràng.</li>
          <li>Ưu tiên trao đổi trong hệ thống hoặc kênh có thể lưu lại nội dung để phục vụ đối chiếu.</li>
          <li>Không công khai mật khẩu, mã khôi phục hoặc dữ liệu nhạy cảm trong ảnh bằng chứng.</li>
          <li>
            Sau khi đã dùng một lượt khiếu nại hoặc T+7 kết thúc, buyer nên liên
            hệ shop để được hỗ trợ thêm; nếu shop không hỗ trợ, có thể gửi yêu
            cầu tới Admin. Việc tiếp nhận hỗ trợ ngoài thời hạn không đồng nghĩa
            giao dịch tự động đủ điều kiện hoàn tiền.
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Xem lịch sử đơn hàng
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Liên hệ hỗ trợ
          </Link>
        </div>
      </section>
    </LegalPageShell>
  );
}
