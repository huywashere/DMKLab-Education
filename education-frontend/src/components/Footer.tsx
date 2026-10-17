import React from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Heart,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa6";
import { RiMapPin2Fill, RiPhoneFill, RiMailFill, RiShieldCheckFill, RiHeartFill, RiBuilding4Fill } from "react-icons/ri";
import { TbCertificate, TbShieldCheck } from "react-icons/tb";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface FooterProps {
  onOpenAbout?: () => void;
  onOpenArticles?: () => void;
  onOpenContact?: () => void;
  onGetStarted?: () => void;
  showPreFooter?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenArticles,
  onOpenContact,
  onGetStarted,
  showPreFooter = true,
}) => {
  const { lang, t } = useLanguage();

  return (
    <>
      {/* ────────────────────────────────────────────────────────
          KHAN ACADEMY STYLE PRE-FOOTER CTA SECTION
          Default Vietnamese / English with i18n
      ──────────────────────────────────────────────────────── */}
      {showPreFooter && (
        <section className="bg-[#0B2149] text-white pt-16 sm:pt-20 pb-0 overflow-hidden relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#14BF96] text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#14BF96] animate-pulse" />
              <span>Nền Tảng Giáo Dục K–12 Chuẩn Quốc Tế</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {t("prefooter_title", "Tiếp sức cho mọi lớp học và học sinh.")}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t(
                "prefooter_desc",
                "Từ từng học sinh cá nhân đến toàn bộ hệ thống trường học, DMKLab giúp việc học tập trở nên hứng khởi và hiệu quả."
              )}
            </p>

            {/* CTA Button in Khan Royal Blue */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={onGetStarted || onOpenAbout}
                className="px-8 py-3 rounded-full bg-[#1865F2] hover:bg-[#0B4ED7] active:scale-[0.98] text-white text-sm font-extrabold shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
              >
                {t("prefooter_btn", "Bắt đầu ngay")}
              </button>
            </div>

            {/* Sublink */}
            <p className="text-xs text-slate-300 pt-2 font-medium">
              {t("prefooter_pricing_prompt", "Bạn quan tâm giải pháp cho trường học?")}{" "}
              <button
                type="button"
                onClick={onOpenContact}
                className="text-[#14BF96] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                {t("prefooter_pricing_cta", "Liên hệ đội ngũ DMKLab")} <ExternalLink className="w-3 h-3" />
              </button>
            </p>
          </div>

          {/* Graphic Mascot with floating badges resting on bottom edge */}
          <div className="mt-8 flex justify-center w-full px-2">
            <img
              src="/img-web/75eaf31453137fba-pre_footer_graphic_desktop@2x.webp"
              alt="Strengthen every classroom with DMKLab"
              className="w-full max-w-4xl lg:max-w-5xl h-auto object-contain select-none pointer-events-none -mb-1 block"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────
          MAIN FOOTER (Khan Academy Official Midnight Navy)
      ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#08182D] text-slate-300 border-t border-[#132A4D] pt-14 pb-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main 4-Column Grid matching Khan Academy's layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[#183660]">
            
            {/* Column 1: VỀ CHÚNG TÔI (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14BF96]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t("footer_about_heading", "VỀ CHÚNG TÔI & SỨ MỆNH")}
                </h3>
              </div>
              
              {/* Official DMKLab + Khan Sprout Identity */}
              <div className="pt-1 flex items-center gap-3">
                <img
                  src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
                  alt="DMKLab - Công ty Đức Mai Khôi"
                  className="h-10 w-auto object-contain brightness-0 invert"
                  loading="lazy"
                  decoding="async"
                />
                <div className="border-l border-slate-700 pl-3">
                  <p className="text-xs font-bold text-white">DMKLab Education</p>
                  <p className="text-[10px] text-[#14BF96] font-semibold">Theo chuẩn Khan Academy</p>
                </div>
              </div>

              {/* Exact Company Description from Reference Image */}
              <p className="text-xs text-slate-300 leading-relaxed text-justify pr-2">
                {t("footer_company_desc")}
              </p>

              {/* Official Certification Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {/* Badge Bộ Công Thương */}
                <a 
                  href="http://online.gov.vn" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B65C2] text-white shadow-xs hover:opacity-95 transition"
                  title="Đã thông báo Bộ Công Thương"
                >
                  <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[9px] font-bold uppercase tracking-wider">ĐÃ THÔNG BÁO</span>
                    <span className="text-[8px] font-medium opacity-90">BỘ CÔNG THƯƠNG</span>
                  </div>
                </a>

                {/* Badge DMCA Protected */}
                <a 
                  href="https://www.dmca.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center border border-slate-700 rounded overflow-hidden text-[9px] shadow-xs hover:opacity-95 transition"
                  title="DMCA Protected"
                >
                  <span className="bg-[#60B832] text-white px-2 py-1 font-bold">PROTECTED BY</span>
                  <span className="bg-white text-slate-800 px-2 py-1 font-black">DMCA.com</span>
                </a>
              </div>

              {/* 4 Social Media Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#0077B5] text-white flex items-center justify-center hover:scale-110 transition shadow-xs"
                  title="LinkedIn DMKLab"
                >
                  <FaLinkedinIn className="w-4 h-4" />
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com/dmklab.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition shadow-xs"
                  title="Facebook DMKLab"
                >
                  <FaFacebookF className="w-3.5 h-3.5" />
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@dmklab"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 transition shadow-xs"
                  title="YouTube DMKLab"
                >
                  <FaYoutube className="w-4 h-4" />
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com/@dmklab"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:scale-110 transition shadow-xs"
                  title="TikTok DMKLab"
                >
                  <FaTiktok className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Column 2: LIÊN HỆ (3.5 cols on lg) */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t("footer_contact_heading", "LIÊN HỆ")}
              </h3>

              <div className="space-y-3.5 text-xs text-slate-300">
                {/* Address */}
                <div className="flex items-start gap-2.5">
                  <RiMapPin2Fill className="w-4 h-4 text-[#14BF96] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-white">{t("footer_headquarters_label", "Trụ sở:")}</strong>{" "}
                    {t("footer_headquarters_val", "702/67/9 Lê Đức Thọ, Phường An Hội Đông, Thành phố Hồ Chí Minh, Việt Nam")}
                  </p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2.5">
                  <RiPhoneFill className="w-4 h-4 text-[#14BF96] shrink-0" />
                  <a 
                    href="tel:0909907861" 
                    className="font-bold text-white hover:text-[#14BF96] transition"
                  >
                    0909907861
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2.5">
                  <RiMailFill className="w-4 h-4 text-[#14BF96] shrink-0" />
                  <a 
                    href="mailto:info@dmklab.vn" 
                    className="font-medium text-white hover:text-[#14BF96] transition"
                  >
                    info@dmklab.vn
                  </a>
                </div>

                {/* Quick direct contact button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-xs hover:bg-slate-700 hover:border-[#14BF96] transition cursor-pointer"
                  >
                    <span>{t("footer_send_message_btn", "Gửi tin nhắn tư vấn")}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#14BF96]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: THÔNG TIN (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t("footer_info_heading", "THÔNG TIN")}
              </h3>

              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <a href="#payment-guide" className="hover:text-[#14BF96] transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>{t("footer_payment_guide", "Hướng Dẫn Thanh Toán")}</span>
                  </a>
                </li>
                <li>
                  <a href="#warranty" className="hover:text-[#14BF96] transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>{t("footer_warranty", "Quy Định Bảo Hành")}</span>
                  </a>
                </li>
                <li>
                  <a href="#returns" className="hover:text-[#14BF96] transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>{t("footer_return", "Quy định đổi trả sản phẩm")}</span>
                  </a>
                </li>
                <li>
                  <a href="#shipping" className="hover:text-[#14BF96] transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>{t("footer_shipping", "Quy Định Vận Chuyển")}</span>
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-[#14BF96] transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>{t("footer_privacy", "Chính Sách Bảo Mật")}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: GIÁO DỤC K–12 (1.5 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t("footer_k12_heading", "GIÁO DỤC K–12")}
              </h3>

              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={onOpenAbout}
                    className="hover:text-[#14BF96] transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>{t("footer_about_dmklab", "Giới thiệu DMKLab")}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAbout}
                    className="hover:text-[#14BF96] transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>{t("footer_socratic_method", "Phương Pháp Socratic")}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenArticles}
                    className="hover:text-[#14BF96] transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>{t("footer_articles_link", "Bài viết & Cẩm nang")}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="hover:text-[#14BF96] transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14BF96]" />
                    <span>{t("footer_hotline_label", "Tổng đài: 1900 6868")}</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Safety */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              {t("footer_copyright")}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[#285366] dark:text-slate-300">
                <RiShieldCheckFill className="w-4 h-4 text-emerald-600" />
                <span>{t("footer_coppa", "Chuẩn an toàn dữ liệu học sinh & COPPA")}</span>
              </div>
              <div className="flex items-center gap-1 text-[#285366] dark:text-slate-300">
                <span>{t("footer_partner_vn", "Đồng hành cùng học sinh Việt Nam")}</span>
                <RiHeartFill className="w-3.5 h-3.5 text-rose-500" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
