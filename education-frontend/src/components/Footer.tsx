"use client";

import React, { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";
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
  const { lang, setLang, toggleLang } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const isVi = lang === "vi";

  return (
    <>
      {/* ────────────────────────────────────────────────────────
          KHAN ACADEMY PRE-FOOTER CTA SECTION (Solid Pitch Black)
      ──────────────────────────────────────────────────────── */}
      {showPreFooter && (
        <section className="bg-black text-white pt-16 sm:pt-20 pb-0 overflow-hidden relative selection:bg-blue-600 selection:text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {isVi ? "Tiếp sức cho mọi lớp học." : "Strengthen every classroom."}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed pt-1">
              {isVi
                ? "Từ từng học sinh cá nhân đến toàn bộ hệ thống trường học, Khan Academy giúp việc học tập trở nên hứng khởi và hiệu quả."
                : "From individual learners to entire school systems, Khan Academy helps learning happen."}
            </p>

            {/* Khan Royal Blue Pill CTA Button */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={onGetStarted || onOpenAbout}
                className="px-8 py-3 rounded-full bg-[#1865F2] hover:bg-[#0B4ED7] active:scale-[0.98] text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
              >
                {isVi ? "Bắt đầu ngay" : "Get started"}
              </button>
            </div>

            {/* Sublink with External Link Arrow */}
            <p className="text-xs sm:text-sm text-slate-300 pt-2 font-medium">
              {isVi ? "Bạn quan tâm giải pháp cho trường học?" : "Looking for district pricing?"}{" "}
              <button
                type="button"
                onClick={onOpenContact}
                className="text-white hover:text-slate-200 underline font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{isVi ? "Liên hệ đội ngũ của chúng tôi" : "Talk to our team"}</span>
                <ExternalLink className="w-3.5 h-3.5 inline shrink-0" />
              </button>
            </p>
          </div>

          {/* Khan Academy Mascot Graphic resting seamlessly flush on black bottom */}
          <div className="mt-8 sm:mt-12 flex justify-center w-full px-2">
            <img
              src="/img-web/75eaf31453137fba-pre_footer_graphic_desktop@2x.webp"
              alt="Strengthen every classroom - Khan Academy"
              className="w-full max-w-4xl lg:max-w-5xl h-auto object-contain select-none pointer-events-none -mb-1 block mx-auto"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────
          MAIN FOOTER (Authentic Khan Academy Black & White Style)
      ──────────────────────────────────────────────────────── */}
      <footer className="bg-black text-slate-300 border-t border-[#222222] pt-14 pb-8 transition-colors duration-200 selection:bg-blue-600 selection:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main 5-Column Grid matching Khan Academy's layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 pb-12">
            {/* Column 1: SCHOOL SYSTEMS & CONTACT */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  {isVi ? "HỆ THỐNG TRƯỜNG HỌC" : "SCHOOL SYSTEMS"}
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={onOpenAbout}
                      className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                    >
                      {isVi ? "Khan Academy cho Trường học" : "Khan Academy School Systems"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onOpenAbout}
                      className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                    >
                      {isVi ? "Khan Kids cho Mầm non" : "Khan Kids for Schools"}
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  {isVi ? "LIÊN HỆ" : "CONTACT"}
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={onOpenContact}
                      className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                    >
                      {isVi ? "Báo chí & Truyền thông" : "Press"}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onOpenContact}
                      className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                    >
                      {isVi ? "Trung tâm trợ giúp" : "Help center"}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 2: TEACHERS & DOWNLOADS */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  {isVi ? "GIÁO VIÊN" : "TEACHERS"}
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={onOpenAbout}
                      className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                    >
                      {isVi ? "Khan Academy cho Giáo viên" : "Khan Academy for Teachers"}
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  {isVi ? "TẢI ỨNG DỤNG" : "DOWNLOADS"}
                </h3>
                <div className="space-y-2.5">
                  {/* Apple App Store Official Badge */}
                  <a
                    href="https://apps.apple.com/app/khan-academy/id469863705"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/30 hover:border-white text-white transition-all w-36 shadow-xs group"
                  >
                    <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.73-7.85-12.09-14.42-7.16-10.74-12.63-22.75-16.41-36.03C8.19 96.16 6.3 83.21 6.3 70.43c0-14.88 3.8-27.42 11.4-37.63 7.6-10.22 17.29-15.42 29.07-15.63 4.8 0 10.23 1.34 16.31 4.03 6.08 2.68 10.05 4.1 11.92 4.24 1.5.07 5.75-1.42 12.75-4.47 7-3.05 12.98-4.38 17.95-3.98 13.37 1.07 23.95 5.92 31.74 14.57-11.83 7.15-17.58 16.9-17.25 29.24.33 9.87 4.12 18.06 11.38 24.58 7.25 6.51 15.82 10.15 25.7 10.92-2.1 6.46-4.78 13.06-8.05 19.8-.15.35-.3.71-.46 1.07zM119.22 33.56c0-7.84 2.82-15.11 8.46-21.8 5.64-6.7 12.68-10.96 21.13-12.76.22 1.48.33 2.82.33 4.02 0 7.84-2.88 15.36-8.65 22.56-5.76 7.2-12.96 11.51-21.6 12.93-.32-1.74-.48-3.32-.48-4.75z" />
                    </svg>
                    <div className="flex flex-col text-left leading-none">
                      <span className="text-[8px] text-slate-300 font-normal">Download on the</span>
                      <span className="text-[12px] font-semibold text-white tracking-tight mt-0.5">App Store</span>
                    </div>
                  </a>

                  {/* Google Play Official Badge */}
                  <a
                    href="https://play.google.com/store/apps/details?id=org.khanacademy.android"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/30 hover:border-white text-white transition-all w-36 shadow-xs group"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M3.6 1.9L13.8 12 3.6 22.1c-.4-.4-.6-.9-.6-1.6V3.5c0-.7.2-1.2.6-1.6z"/>
                      <path fill="#FBBC04" d="M17.3 8.6L13.8 12l3.5 3.4 4-2.3c.7-.4.7-1.8 0-2.2l-4-2.3z"/>
                      <path fill="#EA4335" d="M3.6 22.1l10.2-10.1 3.5 3.4-11.8 6.8c-.7.4-1.5.3-1.9-.1z"/>
                      <path fill="#34A853" d="M17.3 8.6L13.8 12 3.6 1.9C4 1.5 4.8 1.4 5.5 1.8l11.8 6.8z"/>
                    </svg>
                    <div className="flex flex-col text-left leading-none">
                      <span className="text-[8px] text-slate-300 font-normal uppercase tracking-wider">GET IT ON</span>
                      <span className="text-[12px] font-semibold text-white tracking-tight mt-0.5">Google Play</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: ORGANIZATION */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                {isVi ? "TỔ CHỨC" : "ORGANIZATION"}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button
                    type="button"
                    onClick={onOpenAbout}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Về chúng tôi" : "About us"}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAbout}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Tác động" : "Impact"}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAbout}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Lãnh đạo" : "Leadership"}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAbout}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Nhà tài trợ & Đối tác" : "Supporters"}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Tuyển dụng" : "Careers"}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenArticles}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Blog chia sẻ" : "Blog"}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: GET INVOLVED */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                {isVi ? "THAM GIA CÙNG CHÚNG TÔI" : "GET INVOLVED"}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Chia sẻ câu chuyện của bạn" : "Share your story"}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Ủng hộ / Quyên góp" : "Giving"}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Cơ hội nghề nghiệp" : "Careers"}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="text-slate-300 hover:text-white hover:underline transition-colors text-left cursor-pointer"
                  >
                    {isVi ? "Thực tập sinh" : "Internships"}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: OFFICIAL BRAND LOGO & MISSION */}
            <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                {/* Official Khan Academy Sprout Hexagon Icon */}
                <div className="w-8 h-8 rounded-lg bg-[#14BF96] flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C9.5 4.5 8 8 8 11.5c0 2.2 1.8 4 4 4s4-1.8 4-4C16 8 14.5 4.5 12 2z" />
                    <path d="M8.5 11c-1.8 0-3.5 1.5-3.5 3.5 0 1.8 1.5 3.5 3.5 3.5 1 0 2.2-.4 3-1-.6-2-1.8-4.5-3-6z" opacity="0.85" />
                    <path d="M15.5 11c1.8 0 3.5 1.5 3.5 3.5 0 1.8-1.5 3.5-3.5 3.5-1 0-2.2-.4-3-1 .6-2 1.8-4.5 3-6z" opacity="0.85" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Khan Academy</span>
              </div>

              {/* Mission Statement */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {isVi
                  ? "Sứ mệnh của chúng tôi là cung cấp nền giáo dục miễn phí, đẳng cấp thế giới cho bất kỳ ai, ở bất cứ nơi đâu."
                  : "Our mission is to provide a free, world-class education to anyone, anywhere."}
              </p>

              {/* 501(c)(3) Nonprofit Notice with Support Link */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {isVi ? (
                  <>
                    Khan Academy là tổ chức phi lợi nhuận 501(c)(3). Xin vui lòng{" "}
                    <button
                      type="button"
                      onClick={onOpenContact}
                      className="underline text-white hover:text-[#14BF96] inline-flex items-center gap-0.5 font-medium cursor-pointer"
                    >
                      <span>ủng hộ chúng tôi</span>
                      <ExternalLink className="w-2.5 h-2.5 inline" />
                    </button>{" "}
                    ngay hôm nay.
                  </>
                ) : (
                  <>
                    Khan Academy is a 501(c)(3) nonprofit organization. Please{" "}
                    <button
                      type="button"
                      onClick={onOpenContact}
                      className="underline text-white hover:text-[#14BF96] inline-flex items-center gap-0.5 font-medium cursor-pointer"
                    >
                      <span>support us</span>
                      <ExternalLink className="w-2.5 h-2.5 inline" />
                    </button>{" "}
                    today.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Language Selector & Country Row matching Khan Academy */}
          <div className="pt-4 pb-8 space-y-2 border-t border-[#1C1C1C]">
            <div className="flex items-center gap-2 text-xs text-slate-400 relative">
              <span className="font-semibold text-slate-400">Language</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="inline-flex items-center gap-1 text-white font-medium hover:underline cursor-pointer py-1"
                >
                  <span>{isVi ? "Tiếng Việt" : "English"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLangMenu ? "rotate-180" : ""}`} />
                </button>

                {showLangMenu && (
                  <div className="absolute bottom-full left-0 mb-1 w-32 bg-[#1A1A1A] border border-white/20 rounded-md shadow-xl py-1 z-30">
                    <button
                      type="button"
                      onClick={() => {
                        setLang("en");
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition cursor-pointer ${
                        !isVi ? "bg-blue-600 text-white font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLang("vi");
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition cursor-pointer ${
                        isVi ? "bg-blue-600 text-white font-bold" : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      Tiếng Việt
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-400">Country</span>
              <button
                type="button"
                onClick={() => setLang("en")}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white hover:underline cursor-pointer"
              >
                <span>🇺🇸</span> U.S.
              </button>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-slate-300 hover:text-white hover:underline cursor-pointer">
                <span>🇮🇳</span> India
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-slate-300 hover:text-white hover:underline cursor-pointer">
                <span>🇲🇽</span> Mexico
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-slate-300 hover:text-white hover:underline cursor-pointer">
                <span>🇧🇷</span> Brazil
              </span>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setLang("vi")}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white hover:underline cursor-pointer"
              >
                <span>🇻🇳</span> Vietnam
              </button>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Legal Links, Social Icons */}
          <div className="pt-6 border-t border-[#1C1C1C] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            {/* Left side: Copyright & Legal Links */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center md:justify-start">
              <span className="text-slate-300">© 2026 Khan Academy</span>
              <button
                type="button"
                onClick={onOpenAbout}
                className="hover:text-white hover:underline transition cursor-pointer"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={onOpenAbout}
                className="hover:text-white hover:underline transition cursor-pointer"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={onOpenAbout}
                className="hover:text-white hover:underline transition cursor-pointer"
              >
                Accessibility
              </button>
              <button
                type="button"
                onClick={onOpenAbout}
                className="hover:text-white hover:underline transition cursor-pointer"
              >
                Cookie Notice
              </button>
              <button
                type="button"
                onClick={onOpenAbout}
                className="hover:text-white hover:underline transition cursor-pointer"
              >
                Cookie Preferences
              </button>
            </div>

            {/* Right side: 4 Social Icons */}
            <div className="flex items-center gap-3">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/khan-academy"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded bg-[#1A1A1A] hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-3.5 h-3.5" />
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/khanacademy"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded bg-[#1A1A1A] hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer"
                title="Facebook"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-3.5 h-3.5" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/khanacademy"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded bg-[#1A1A1A] hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer"
                title="Instagram"
                aria-label="Instagram"
              >
                <FaInstagram className="w-3.5 h-3.5" />
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/user/khanacademy"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded bg-[#1A1A1A] hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer"
                title="YouTube"
                aria-label="YouTube"
              >
                <FaYoutube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
