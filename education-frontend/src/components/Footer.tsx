import React from "react";
import { Heart, GraduationCap, Lock, ShieldCheck } from "lucide-react";

interface FooterProps {
  onOpenAbout?: () => void;
  onOpenArticles?: () => void;
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenArticles,
  onOpenContact,
}) => {
  return (
    <footer className="bg-[#21242C] text-slate-300 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: Brand + Nav Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-700/50">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1865F2] flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-extrabold text-white">DMKLab Education</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng giáo dục trực tuyến K–12 hiện đại, cá nhân hóa lộ trình học tập và hỗ trợ tư duy Socratic thông minh.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <Lock className="w-3 h-3" />
              <span>Dữ liệu học sinh được bảo vệ an toàn</span>
            </div>
          </div>

          {/* Column 1: Môn Học */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Môn Học</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><span className="hover:text-white transition cursor-pointer">Toán học K–12</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Khoa học STEM</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Tiếng Anh & Ngữ Văn</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Lịch sử & Địa lý</span></li>
              <li><span className="hover:text-white transition cursor-pointer">AI & Lập trình</span></li>
            </ul>
          </div>

          {/* Column 2: Đối Tượng */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Đối Tượng</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><span className="hover:text-white transition cursor-pointer">Học sinh K–12</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Giáo viên & Nhà trường</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Gia đình & Phụ huynh</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Quản trị viên</span></li>
            </ul>
          </div>

          {/* Column 3: Về Chúng Tôi */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Về Chúng Tôi</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="hover:text-[#38BDF8] transition text-left cursor-pointer"
                >
                  Giới thiệu về DMKLab
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="hover:text-[#38BDF8] transition text-left cursor-pointer"
                >
                  Sứ mệnh & Triết lý Socratic
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenArticles}
                  className="hover:text-[#38BDF8] transition text-left cursor-pointer"
                >
                  Bài viết & Cẩm nang K-12
                </button>
              </li>
              <li><span className="hover:text-white transition cursor-pointer">Chính sách bảo mật (COPPA)</span></li>
            </ul>
          </div>

          {/* Column 4: Hỗ Trợ & Liên Hệ */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Hỗ Trợ & Liên Hệ</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="hover:text-[#38BDF8] transition text-left cursor-pointer font-medium"
                >
                  Liên hệ chúng tôi
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="hover:text-[#38BDF8] transition text-left cursor-pointer"
                >
                  Tổng đài: 1900 6868
                </button>
              </li>
              <li><span className="hover:text-white transition cursor-pointer">Email: contact@dmklab.edu.vn</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Cộng đồng học sinh tinh thông</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom: Copyright & Safety */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DMKLab Education Platform. Nền tảng giáo dục trực tuyến K–12 Việt Nam.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tuân thủ chuẩn bảo vệ dữ liệu trẻ em</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span>Đồng hành cùng học sinh Việt Nam</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
