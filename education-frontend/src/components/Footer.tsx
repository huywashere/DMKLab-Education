import React from "react";
import { Heart, GraduationCap, Lock, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  const footerLinks = [
    {
      heading: "Môn Học",
      links: ["Toán học K–12", "Khoa học STEM", "Tiếng Anh & Ngữ Văn", "Lịch sử & Địa lý", "Kinh tế & Tài chính", "AI & Lập trình"],
    },
    {
      heading: "Đối Tượng",
      links: ["Học sinh", "Giáo viên & Nhà trường", "Gia đình & Phụ huynh", "Quản trị viên"],
    },
    {
      heading: "Về Chúng Tôi",
      links: ["Sứ mệnh giáo dục", "Đội ngũ xây dựng", "Chính sách bảo mật", "Điều khoản sử dụng"],
    },
    {
      heading: "Hỗ Trợ",
      links: ["Trung tâm trợ giúp", "Liên hệ chúng tôi", "Phản hồi", "Cộng đồng học tập"],
    },
  ];

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
              Nền tảng giáo dục trực tuyến K–12 hiện đại, cá nhân hóa lộ trình học tập và hỗ trợ tư duy thông minh.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <Lock className="w-3 h-3" />
              <span>Dữ liệu học sinh được bảo vệ an toàn</span>
            </div>
          </div>

          {/* Nav Columns */}
          {footerLinks.map((col) => (
            <div key={col.heading} className="space-y-2">
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">{col.heading}</h4>
              <ul className="space-y-1.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-slate-400 hover:text-white transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: Copyright & Safety */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DMKLab Education Platform. Hệ sinh thái giáo dục trực tuyến K–12 Việt Nam.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tuân thủ COPPA & bảo vệ dữ liệu trẻ em</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span>Làm với</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
