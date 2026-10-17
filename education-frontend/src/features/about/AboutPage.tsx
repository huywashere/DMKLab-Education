"use client";

import React from "react";
import {
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Users,
} from "lucide-react";
import { FaLightbulb, FaShieldHalved } from "react-icons/fa6";
import { TbTargetArrow } from "react-icons/tb";
import { RiRobot2Fill } from "react-icons/ri";
import {
  NumberTicker,
  SpotlightCard,
  ShimmerButton,
  GridPattern,
  AnimatedShinyText,
} from "@/components/ui";

interface AboutPageProps {
  onBackToHome: () => void;
  onOpenRegister?: () => void;
  onOpenContact?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onBackToHome,
  onOpenRegister,
  onOpenContact,
}) => {
  const CORE_VALUES = [
    {
      icon: <FaLightbulb className="w-6 h-6 text-[#1865F2]" />,
      title: "Phương Pháp Gợi Mở (Socratic)",
      desc: "Không đưa ra đáp án có sẵn để học sinh sao chép. DMKLab đặt câu hỏi định hướng, kích hoạt tư duy phản biện và giúp học sinh tự tìm ra câu trả lời.",
      spotlight: "rgba(24, 101, 242, 0.15)",
    },
    {
      icon: <TbTargetArrow className="w-6 h-6 text-emerald-600" />,
      title: "Tinh Thông Từng Kỹ Năng (Mastery Learning)",
      desc: "Học sinh tiến bộ theo nhịp độ riêng. Mỗi kỹ năng đều được luyện tập qua 4 cấp độ: Chưa học → Làm quen → Thành thạo → Tinh thông.",
      spotlight: "rgba(20, 191, 150, 0.15)",
    },
    {
      icon: <RiRobot2Fill className="w-6 h-6 text-purple-600" />,
      title: "Công Nghệ Trí Tuệ Nhân Tạo",
      desc: "Trợ lý DMK AI Tutor đồng hành 24/7 với hạn mức 30 lượt/ngày có kiểm soát, bảo vệ học sinh và hỗ trợ giáo viên theo dõi tiến độ chính xác.",
      spotlight: "rgba(116, 51, 255, 0.15)",
    },
    {
      icon: <FaShieldHalved className="w-6 h-6 text-amber-600" />,
      title: "An Toàn & Bảo Mật Tuyệt Đối",
      desc: "Tuân thủ nghiêm ngặt chuẩn bảo vệ quyền riêng tư trẻ em (COPPA). Mọi dữ liệu học tập đều được mã hóa bằng thuật toán HMAC-SHA512.",
      spotlight: "rgba(245, 158, 11, 0.15)",
    },
  ];

  const TEAM = [
    {
      name: "ThS. Nguyễn Văn Đức",
      role: "Đồng Sáng Lập & Viện Trưởng Sư Phạm",
      bio: "15 năm nghiên cứu phương pháp Socratic tại ĐH Sư Phạm Hà Nội, cố vấn chương trình Toán học K-12.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=expert_duc",
    },
    {
      name: "TS. Trần Minh Khoa",
      role: "Kiến Trúc Sư Trưởng Hệ Thống AI",
      bio: "Chuyên gia học máy giáo dục, cựu kỹ sư tại Silicon Valley, phụ trách mô hình ngôn ngữ định hướng tư duy.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=expert_khoa",
    },
    {
      name: "Cô Nguyễn Thị Mai",
      role: "Trưởng Ban Nội Dung & Lớp Học Mẫu",
      bio: "Giáo viên dạy giỏi cấp Quốc gia, tác giả hơn 50 bài giảng video môn Toán và Khoa học ứng dụng.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher_mai",
    },
  ];

  return (
    <div className="w-full bg-white space-y-16 pb-20">
      {/* 1. Hero Banner */}
      <section className="bg-gradient-to-b from-[#FEF8E7] via-white to-white border-b border-[#E8E3D0]/60 pt-14 pb-20 relative overflow-hidden">
        <GridPattern width={44} height={44} className="opacity-30" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="flex justify-center mb-1">
            <div className="px-5 py-2.5 bg-white rounded-2xl shadow-sm border border-slate-200 inline-flex items-center justify-center">
              <img
                src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
                alt="DMKLab"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1865F2] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <AnimatedShinyText>Về Hệ Thống Giáo Dục DMKLab</AnimatedShinyText>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0A2540] tracking-tight leading-tight">
            Vì một thế hệ học sinh Việt Nam{" "}
            <span className="text-[#1865F2]">tự tin làm chủ tri thức</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            DMKLab Education là nền tảng giáo dục trực tuyến K–12 thế hệ mới, kết hợp tinh hoa sư
            phạm gợi mở Socratic với công nghệ trí tuệ nhân tạo hiện đại, giúp mọi học sinh từ lớp 1
            đến lớp 12 học đúng phương pháp và tiến bộ bền vững.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <ShimmerButton
              onClick={onBackToHome}
              background="#1865F2"
              className="text-sm px-7 py-3.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Khám Phá Các Khóa Học</span>
            </ShimmerButton>

            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="khan-btn-secondary text-sm px-6 py-3 cursor-pointer"
              >
                <span>Liên Hệ Hợp Tác</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Key Stats with NumberTicker */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0A2540] text-white rounded-3xl p-8 sm:p-12 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative overflow-hidden border border-slate-800">
          <GridPattern width={32} height={32} className="opacity-15" />

          <div className="space-y-2 relative z-10">
            <p className="text-3xl sm:text-4xl font-black text-[#14BF96]">
              <NumberTicker value={12} suffix=" Khối Lớp" />
            </p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-snug">
              Chương trình chuẩn hóa K–12 Việt Nam
            </p>
          </div>

          <div className="space-y-2 relative z-10">
            <p className="text-3xl sm:text-4xl font-black text-[#14BF96]">
              <NumberTicker value={100} suffix="+" />
            </p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-snug">
              Chuyên đề bài giảng video & trắc nghiệm
            </p>
          </div>

          <div className="space-y-2 relative z-10">
            <p className="text-3xl sm:text-4xl font-black text-[#14BF96]">
              <NumberTicker value={24} suffix="/7" />
            </p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-snug">
              Gia sư AI Socratic hỗ trợ giải đáp
            </p>
          </div>

          <div className="space-y-2 relative z-10">
            <p className="text-3xl sm:text-4xl font-black text-[#14BF96]">
              <NumberTicker value={98.5} decimalPlaces={1} suffix="%" />
            </p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-snug">
              Học sinh cải thiện điểm số sau 4 tuần
            </p>
          </div>
        </div>
      </section>

      {/* 3. Sứ Mệnh & Tầm Nhìn */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1865F2] uppercase tracking-wider">
            <span>Sứ Mệnh Của Chúng Tôi</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2540] leading-snug">
            Chuyển dịch từ "Học để thi" sang "Học để thấu hiểu và ứng dụng"
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Chúng tôi tin rằng mọi học sinh đều có tiềm năng học giỏi nếu được tiếp cận đúng cách.
            Trong môi trường học tập truyền thống, tốc độ giảng dạy thường cố định cho cả lớp khiến
            học sinh hổng kiến thức không kịp bắt nhịp.
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Tại <strong>DMKLab Education</strong>, công nghệ được sinh ra để trao quyền: học sinh tự
            điều khiển nhịp học, xem lại video bất cứ lúc nào, giải bài tập tương tác với sự dẫn dắt
            từng bước của gia sư AI và nhận điểm thưởng để nuôi dưỡng niềm đam mê khám phá.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Cung cấp giáo trình chuẩn hóa bám sát chương trình Giáo dục Phổ thông K–12",
              "Ứng dụng phương pháp gamification: Streak học tập, Huy hiệu Tinh Thông, Điểm Năng Lượng",
              "Kết nối liền mạch 3 bên: Học sinh – Nhà trường/Giáo viên – Phụ huynh học sinh",
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto max-w-md">
            <img
              src="/img-web/background-hoc-tap-001.webp"
              alt="Môi trường học tập DMKLab"
              className="w-full rounded-3xl shadow-2xl border border-slate-200 object-cover"
              style={{ aspectRatio: "4/3" }}
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 max-w-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1865F2] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Cam Kết Chất Lượng</p>
                <p className="text-[11px] text-slate-500">
                  Giáo trình biên soạn bởi các chuyên gia sư phạm hàng đầu
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 4 Trụ Cột — SpotlightCard Effect */}
      <section className="bg-slate-50 py-16 sm:py-24 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2540]">
              4 Trụ Cột Tạo Nên Sự Khác Biệt
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              Kiến trúc hệ thống được xây dựng để phục vụ trực tiếp cho hiệu quả tiếp thu kiến thức của học viên
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CORE_VALUES.map((val, idx) => (
              <SpotlightCard
                key={idx}
                spotlightColor={val.spotlight}
                className="space-y-4 border border-slate-200 hover:border-blue-400/60"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  {val.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {val.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{val.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Đội Ngũ Chuyên Gia */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1865F2] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Đội Ngũ Chuyên Môn</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540]">
            Những Người Xây Dựng DMKLab
          </h2>
          <p className="text-sm text-slate-500">
            Sự kết hợp giữa các nhà sư phạm tâm huyết và các kỹ sư công nghệ hàng đầu
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TEAM.map((member, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4 hover:shadow-md transition"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-20 h-20 rounded-full mx-auto bg-slate-50 border-2 border-slate-200 object-cover"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{member.name}</h3>
                <p className="text-xs font-bold text-[#1865F2] mt-0.5">{member.role}</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CTA Cuối Trang */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0A2540] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden border border-slate-800">
          <GridPattern width={32} height={32} className="opacity-20" />

          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Sẵn sàng trải nghiệm phương pháp học tập tương lai?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Đăng ký tài khoản hoàn toàn miễn phí và bắt đầu bài học đầu tiên ngay hôm nay cùng DMK AI Tutor!
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <ShimmerButton
                onClick={onOpenRegister || onBackToHome}
                background="#1865F2"
                className="text-sm px-8 py-3.5"
              >
                <span>Tạo Tài Khoản Học Viên Ngay</span>
              </ShimmerButton>
              <button
                type="button"
                onClick={onBackToHome}
                className="khan-btn-secondary text-sm px-6 py-3 cursor-pointer"
              >
                <span>Về Trang Chủ</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
