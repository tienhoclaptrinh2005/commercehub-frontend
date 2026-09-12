import type { Metadata } from "next";
import { FileCheck2, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description:
    "Điều khoản sử dụng nền tảng giao dịch sản phẩm số CommerceHub dành cho người mua và người bán.",
};

const sections = [
  { id: "general", label: "Quy định chung" },
  { id: "account", label: "Tài khoản và bảo mật" },
  { id: "buyer", label: "Điều khoản đối với người mua" },
  { id: "seller", label: "Điều khoản đối với người bán" },
  { id: "orders", label: "Đơn hàng, thanh toán và giao nhận" },
  { id: "disputes", label: "Bảo hành, khiếu nại và hoàn tiền" },
  { id: "prohibited", label: "Sản phẩm và hành vi bị cấm" },
  { id: "moderation", label: "Kiểm duyệt và xử lý vi phạm" },
  { id: "liability", label: "Giới hạn trách nhiệm" },
  { id: "changes", label: "Thay đổi điều khoản và liên hệ" },
] as const;

const headingClassName =
  "scroll-mt-6 text-xl font-black tracking-[-0.025em] text-slate-950 sm:text-2xl";
const subheadingClassName = "mt-5 text-base font-bold text-slate-900";
const listClassName = "mt-3 list-disc space-y-2 pl-5 marker:text-emerald-600";

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Quy chế nền tảng"
      title="Điều khoản sử dụng"
      description="Các nguyên tắc áp dụng khi truy cập, đăng ký tài khoản, mua hoặc bán sản phẩm số trên CommerceHub."
      updatedAt="07/09/2026"
      icon={FileCheck2}
      sections={sections}
    >
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 sm:p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <p className="text-sm leading-6">
            Chào mừng bạn đến với <strong>CommerceHub</strong> — nền tảng trung
            gian kết nối người mua và người bán sản phẩm, tài nguyên và dịch vụ
            số. Khi tạo tài khoản hoặc thực hiện giao dịch, bạn xác nhận đã đọc,
            hiểu và đồng ý tuân thủ các điều khoản dưới đây.
          </p>
        </div>
      </div>

      <section id="general" className="mt-9">
        <h2 className={headingClassName}>I. Quy định chung</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 marker:font-bold marker:text-emerald-700">
          <li>
            <strong className="text-slate-900">Vai trò của nền tảng:</strong>{" "}
            CommerceHub cung cấp hạ tầng kỹ thuật, ví nội bộ và cơ chế giữ tiền
            để hỗ trợ giao dịch giữa người mua và người bán. Sản phẩm do từng
            người bán đăng tải và chịu trách nhiệm cung cấp.
          </li>
          <li>
            <strong className="text-slate-900">Tuân thủ pháp luật:</strong> mọi
            người dùng phải sử dụng nền tảng cho mục đích hợp pháp, tuân thủ pháp
            luật Việt Nam và quy định có liên quan tại nơi mình hoạt động.
          </li>
          <li>
            <strong className="text-slate-900">Phạm vi áp dụng:</strong> điều
            khoản này áp dụng cho khách truy cập, người mua, người bán và mọi
            giao dịch được tạo trên CommerceHub.
          </li>
        </ol>
      </section>

      <section id="account" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>II. Tài khoản và bảo mật</h2>
        <ul className={listClassName}>
          <li>Cung cấp thông tin đăng ký chính xác và duy trì thông tin liên hệ còn sử dụng được.</li>
          <li>
            Tự bảo vệ mật khẩu, phiên đăng nhập và mã xác thực; không cho người
            khác sử dụng tài khoản của mình để thực hiện giao dịch trái phép.
          </li>
          <li>
            Thông báo ngay cho CommerceHub khi phát hiện đăng nhập, thanh toán
            hoặc thay đổi tài khoản bất thường.
          </li>
          <li>
            Không giả mạo danh tính, mạo danh shop hoặc dùng thông tin gây nhầm
            lẫn cho người dùng khác.
          </li>
        </ul>
      </section>

      <section id="buyer" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>III. Điều khoản đối với người mua</h2>
        <h3 className={subheadingClassName}>1. Quyền lợi</h3>
        <ul className={listClassName}>
          <li>Được xem giá, loại giao hàng, mô tả, biến thể và thông tin shop trước khi thanh toán.</li>
          <li>
            Được nhận sản phẩm giao ngay tự động hoặc theo dõi tiến độ đơn đặt
            hàng trong lịch sử mua hàng.
          </li>
          <li>
            Được sử dụng cơ chế giữ tiền, bảo hành, khiếu nại và hoàn tiền theo
            trạng thái thực tế của từng mục hàng.
          </li>
        </ul>
        <h3 className={subheadingClassName}>2. Nghĩa vụ</h3>
        <ul className={listClassName}>
          <li>Đọc kỹ mô tả, biến thể, giá, hình thức giao hàng và lưu ý của shop trước khi mua.</li>
          <li>
            Cung cấp đúng thông tin cần thiết cho đơn đặt hàng; nội dung gửi shop
            không được chứa dữ liệu trái pháp luật hoặc không liên quan đến đơn.
          </li>
          <li>
            Kiểm tra sản phẩm sau khi nhận, bảo mật dữ liệu được giao và chỉ sử
            dụng cho mục đích hợp pháp.
          </li>
          <li>
            Không lạm dụng khiếu nại, tạo bằng chứng giả hoặc yêu cầu hoàn tiền
            cho sản phẩm đã nhận và sử dụng đúng mô tả.
          </li>
        </ul>
      </section>

      <section id="seller" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>IV. Điều khoản đối với người bán</h2>
        <h3 className={subheadingClassName}>1. Quyền lợi</h3>
        <ul className={listClassName}>
          <li>
            Được đăng bán sản phẩm số sau khi hồ sơ gian hàng được quản trị viên
            duyệt và tài khoản được cấp quyền SELLER.
          </li>
          <li>
            Được nhận doanh thu sau khi giao dịch đủ điều kiện quyết toán, trừ
            phí nền tảng được hiển thị theo chính sách tại thời điểm giao dịch.
          </li>
          <li>Được phản hồi khiếu nại, cung cấp bằng chứng và yêu cầu quản trị viên xem xét tranh chấp.</li>
        </ul>
        <h3 className={subheadingClassName}>2. Nghĩa vụ và cam kết</h3>
        <ul className={listClassName}>
          <li>
            Chỉ đăng sản phẩm có quyền cung cấp; mô tả đúng chất lượng, số lượng,
            thời hạn sử dụng, điều kiện bảo hành và phương thức giao hàng.
          </li>
          <li>Duy trì tồn kho hợp lệ cho sản phẩm giao ngay và không giao lại cùng một dữ liệu cho nhiều người mua.</li>
          <li>
            Phản hồi đơn đặt hàng, giao kết quả và xử lý khiếu nại trong thời hạn
            hiển thị trên hệ thống.
          </li>
          <li>
            Tên hiển thị đã được duyệt phải nhất quán với gian hàng; không mạo
            danh thương hiệu hoặc cá nhân khác.
          </li>
        </ul>
      </section>

      <section id="orders" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>V. Đơn hàng, thanh toán và giao nhận</h2>
        <ul className={listClassName}>
          <li>
            Giao dịch hiện được thanh toán bằng số dư ví CommerceHub. Tiền nạp
            chỉ được ghi nhận khi hệ thống nhận và xác minh giao dịch ngân hàng
            phù hợp với yêu cầu nạp tiền.
          </li>
          <li>
            <strong className="text-slate-900">Sản phẩm giao ngay:</strong> hệ
            thống trừ tồn kho và tự động bàn giao dữ liệu sau khi thanh toán thành
            công. Người mua có thể xem lại trong chi tiết đơn hàng.
          </li>
          <li>
            <strong className="text-slate-900">Sản phẩm đặt hàng:</strong> sau
            khi thanh toán, shop có tối đa 24 giờ để tiếp nhận. Khi đã tiếp nhận,
            shop có tối đa 24 giờ để hoàn thành; shop từ chối hoặc quá hạn thì hệ
            thống tự động hủy đơn và hoàn 100% số tiền của đơn về ví người mua.
          </li>
          <li>
            Mã đơn hàng là căn cứ đối chiếu. Người dùng cần kiểm tra đúng mã đơn
            trong lịch sử giao dịch khi liên hệ hỗ trợ.
          </li>
        </ul>
      </section>

      <section id="disputes" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>VI. Bảo hành, khiếu nại và hoàn tiền</h2>
        <ul className={listClassName}>
          <li>
            Tiền của mỗi mục hàng đã giao được giữ trong 7 ngày (T+7) trước khi
            quyết toán cho người bán. Trong thời gian còn giữ tiền, người mua có
            thể tạo một khiếu nại cho mỗi mục hàng đủ điều kiện.
          </li>
          <li>
            Khi khiếu nại được mở, đồng hồ T+7 tạm dừng. Seller có 24 giờ để
            phản hồi; nếu nhận bảo hành, seller có thêm tối đa 24 giờ để xử lý.
          </li>
          <li>
            Seller không phản hồi hoặc không hoàn tất bảo hành đúng hạn thì hệ
            thống hoàn 100% số tiền của mục hàng cho người mua. Trường hợp hai
            bên không thống nhất sẽ được chuyển cho quản trị viên xem xét dựa
            trên dữ liệu giao dịch và bằng chứng.
          </li>
          <li>
            Khi khiếu nại được đóng theo hướng giao dịch tiếp tục, thời gian T+7
            còn lại tiếp tục chạy thay vì bắt đầu lại từ đầu.
          </li>
        </ul>
        <Link
          href="/warranty-policy"
          className="mt-5 inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
        >
          Xem đầy đủ Chính sách bảo hành
        </Link>
      </section>

      <section id="prohibited" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>VII. Sản phẩm và hành vi bị cấm</h2>
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-bold text-rose-900">Nghiêm cấm đăng bán hoặc sử dụng:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-rose-900/80 marker:text-rose-500">
                <li>Tài khoản ngân hàng, ví điện tử, thông tin thẻ hoặc tài sản có nguồn gốc chiếm đoạt.</li>
                <li>Dữ liệu cá nhân bị thu thập, mua bán hoặc tiết lộ trái phép.</li>
                <li>Malware, virus, trojan, công cụ phishing, DDoS hoặc công cụ nhằm xâm nhập và phá hoại hệ thống.</li>
                <li>Sản phẩm xâm phạm bản quyền, giả mạo, lừa đảo tài chính hoặc phục vụ hành vi phạm pháp.</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-4">
          Ngoài ra, người dùng không được thao túng đánh giá, lợi dụng lỗi hệ
          thống, spam yêu cầu thanh toán, né phí hoặc can thiệp trái phép vào dữ
          liệu và hoạt động của CommerceHub.
        </p>
      </section>

      <section id="moderation" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>VIII. Kiểm duyệt và xử lý vi phạm</h2>
        <p className="mt-4">
          CommerceHub có quyền ẩn sản phẩm, hạn chế chức năng, tạm khóa hoặc khóa
          tài khoản khi phát hiện dấu hiệu vi phạm, gian lận, rủi ro bảo mật hoặc
          theo yêu cầu hợp pháp của cơ quan có thẩm quyền. Việc xử lý sẽ căn cứ
          vào mức độ vi phạm, dữ liệu hệ thống và bằng chứng liên quan.
        </p>
      </section>

      <section id="liability" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>IX. Giới hạn trách nhiệm</h2>
        <ul className={listClassName}>
          <li>
            CommerceHub không phải nhà phát hành của các dịch vụ bên thứ ba và
            không bảo đảm chính sách của bên thứ ba sẽ không thay đổi sau giao
            dịch.
          </li>
          <li>
            Nền tảng không chịu trách nhiệm cho thiệt hại phát sinh từ việc dùng
            sản phẩm sai hướng dẫn, chia sẻ dữ liệu sau khi nhận, vi phạm điều
            khoản của bên thứ ba hoặc thực hiện hành vi trái pháp luật.
          </li>
          <li>
            Trong sự cố bất khả kháng hoặc gián đoạn ngoài khả năng kiểm soát,
            CommerceHub sẽ cố gắng khôi phục dịch vụ và bảo toàn dữ liệu giao
            dịch trong phạm vi kỹ thuật hợp lý.
          </li>
        </ul>
      </section>

      <section id="changes" className="mt-10 border-t border-slate-100 pt-9">
        <h2 className={headingClassName}>X. Thay đổi điều khoản và liên hệ</h2>
        <p className="mt-4">
          CommerceHub có thể cập nhật điều khoản để phù hợp với chức năng, quy
          trình vận hành hoặc quy định pháp luật. Phiên bản mới có hiệu lực từ
          ngày được công bố trên trang này; các giao dịch đã phát sinh vẫn được
          đối chiếu theo dữ liệu và chính sách được hiển thị tại thời điểm liên
          quan.
        </p>
        <p className="mt-3">
          Nếu cần giải thích hoặc báo cáo vi phạm, vui lòng gửi thông tin kèm mã
          đơn tại{" "}
          <Link href="/contact" className="font-bold text-emerald-700 underline underline-offset-2">
            trang Liên hệ
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
