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
        <section className="bg-black text-white pt-16 sm:pt-20 pb-0 overflow-hidden relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {t("prefooter_title", "Tiếp sức cho mọi lớp học và học sinh.")}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t(
                "prefooter_desc",
                "Từ từng học sinh cá nhân đến toàn bộ hệ thống trường học, DMKLab giúp việc học tập trở nên hứng khởi và hiệu quả."
              )}
            </p>

            {/* CTA Button */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={onGetStarted || onOpenAbout}
                className="px-8 py-3 rounded-lg bg-[#4638F2] hover:bg-[#3828D6] active:scale-[0.98] text-white text-sm font-extrabold shadow-lg transition-all cursor-pointer"
              >
                {t("prefooter_btn", "Bắt đầu ngay")}
              </button>
            </div>

            {/* Sublink */}
            <p className="text-xs text-slate-400 pt-2 font-medium">
              {t("prefooter_pricing_prompt", "Bạn quan tâm giải pháp cho trường học?")}{" "}
              <button
                type="button"
                onClick={onOpenContact}
                className="text-white hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
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
          MAIN FOOTER (matching company reference specifications)
      ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#EDF6F9] dark:bg-[#070D18] text-[#285366] dark:text-slate-300 border-t-2 border-[#1E6782] dark:border-slate-800 pt-12 pb-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main 4-Column Grid matching the user's reference image */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[#D2E7EF] dark:border-slate-800">
            
            {/* Column 1: VỀ CHÚNG TÔI (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0A4358] dark:text-slate-100 uppercase tracking-wider">
                {t("footer_about_heading", "VỀ CHÚNG TÔI")}
              </h3>
              
              {/* Official DMKLab Logo */}
              <div className="pt-1">
                <img
                  src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
                  alt="DMKLab - Công ty Đức Mai Khôi"
                  className="h-11 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Exact Company Description from Reference Image */}
              <p className="text-xs text-[#285366] leading-relaxed text-justify pr-2">
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
                  className="inline-flex items-center border border-slate-300 rounded overflow-hidden text-[9px] shadow-xs hover:opacity-95 transition"
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
                  className="w-8 h-8 rounded-full bg-[#0077B5] text-white flex items-center justify-center hover:scale-105 transition shadow-xs"
                  title="LinkedIn DMKLab"
                >
                  <span className="font-bold text-xs tracking-tighter">in</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com/dmklab.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 transition shadow-xs"
                  title="Facebook DMKLab"
                >
                  <span className="font-bold text-sm">f</span>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@dmklab"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-105 transition shadow-xs"
                  title="YouTube DMKLab"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com/@dmklab"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center hover:scale-105 transition shadow-xs"
                  title="TikTok DMKLab"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: LIÊN HỆ (3.5 cols on lg) */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-sm font-bold text-[#0A4358] dark:text-slate-100 uppercase tracking-wider">
                {t("footer_contact_heading", "LIÊN HỆ")}
              </h3>

              <div className="space-y-3.5 text-xs text-[#285366] dark:text-slate-300">
                {/* Address */}
                <div className="flex items-start gap-2.5">
                  <span className="font-extrabold text-[#0B65C2] text-sm shrink-0 mt-0.5">A</span>
                  <p className="leading-relaxed">
                    <strong className="text-[#0A4358] dark:text-slate-100">{t("footer_headquarters_label", "Trụ sở:")}</strong>{" "}
                    {t("footer_headquarters_val", "702/67/9 Lê Đức Thọ, Phường An Hội Đông, Thành phố Hồ Chí Minh, Việt Nam")}
                  </p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#0B65C2] shrink-0" />
                  <a 
                    href="tel:0909907861" 
                    className="font-bold text-[#0A4358] dark:text-slate-100 hover:text-[#0B65C2] dark:hover:text-blue-400 transition"
                  >
                    0909907861
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#0B65C2] shrink-0" />
                  <a 
                    href="mailto:info@dmklab.vn" 
                    className="font-medium text-[#0A4358] dark:text-slate-100 hover:text-[#0B65C2] dark:hover:text-blue-400 transition"
                  >
                    info@dmklab.vn
                  </a>
                </div>

                {/* Quick direct contact button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#B8D7E3] dark:border-slate-700 text-[#0A4358] dark:text-slate-100 font-bold text-xs hover:bg-blue-50/50 dark:hover:bg-slate-700 hover:border-[#0B65C2] transition cursor-pointer"
                  >
                    <span>{t("footer_send_message_btn", "Gửi tin nhắn tư vấn")}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: THÔNG TIN (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-[#0A4358] dark:text-slate-100 uppercase tracking-wider">
                {t("footer_info_heading", "THÔNG TIN")}
              </h3>

              <ul className="space-y-2 text-xs text-[#285366] dark:text-slate-300">
                <li>
                  <a href="#payment-guide" className="hover:text-[#0B65C2] dark:hover:text-blue-400 transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285366] dark:bg-slate-500" />
                    <span>{t("footer_payment_guide", "Hướng Dẫn Thanh Toán")}</span>
                  </a>
                </li>
                <li>
                  <a href="#warranty" className="hover:text-[#0B65C2] dark:hover:text-blue-400 transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285366] dark:bg-slate-500" />
                    <span>{t("footer_warranty", "Quy Định Bảo Hành")}</span>
                  </a>
                </li>
                <li>
                  <a href="#returns" className="hover:text-[#0B65C2] dark:hover:text-blue-400 transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285366] dark:bg-slate-500" />
                    <span>{t("footer_return", "Quy định đổi trả sản phẩm")}</span>
                  </a>
                </li>
                <li>
                  <a href="#shipping" className="hover:text-[#0B65C2] dark:hover:text-blue-400 transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285366] dark:bg-slate-500" />
                    <span>{t("footer_shipping", "Quy Định Vận Chuyển")}</span>
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-[#0B65C2] dark:hover:text-blue-400 transition flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285366] dark:bg-slate-500" />
                    <span>{t("footer_privacy", "Chính Sách Bảo Mật")}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: GIÁO DỤC K–12 (1.5 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-[#0A4358] dark:text-slate-100 uppercase tracking-wider">
                {t("footer_k12_heading", "GIÁO DỤC K–12")}
              </h3>

              <ul className="space-y-2 text-xs text-[#285366] dark:text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={onOpenAbout}
                    className="hover:text-[#0B65C2] dark:hover:text-blue-400 transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285366] dark:bg-slate-500" />
                    <span>{t("footer_about_dmklab", "Giới thiệu DMKLab")}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAbout}
                    className="hover:text-[#0B65C2] dark:hover:text-blue-400 transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285366] dark:bg-slate-500" />
                    <span>{t("footer_socratic_method", "Phương Pháp Socratic")}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenArticles}
                    className="hover:text-[#0B65C2] dark:hover:text-blue-400 transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285366] dark:bg-slate-500" />
                    <span>{t("footer_articles_link", "Bài viết & Cẩm nang")}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="hover:text-[#0B65C2] dark:hover:text-blue-400 transition text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#285366] dark:bg-slate-500" />
                    <span>{t("footer_hotline_label", "Tổng đài: 1900 6868")}</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Safety */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4A7285] dark:text-slate-400">
            <p>
              {t("footer_copyright")}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[#285366] dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("footer_coppa", "Chuẩn an toàn dữ liệu học sinh & COPPA")}</span>
              </div>
              <div className="flex items-center gap-1 text-[#285366] dark:text-slate-300">
                <span>{t("footer_partner_vn", "Đồng hành cùng học sinh Việt Nam")}</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
