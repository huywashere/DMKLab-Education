"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ChevronDown,
  User,
  GraduationCap
} from "lucide-react";
import { FaPhoneVolume, FaEnvelopeOpenText, FaLocationDot } from "react-icons/fa6";
import { RiCustomerService2Fill, RiMailSendFill, RiMapPin2Fill, RiTimeFill } from "react-icons/ri";
import { TbHeadset, TbClockHour4 } from "react-icons/tb";

interface ContactPageProps {
  onBackToHome: () => void;
  onOpenArticles?: () => void;
  onOpenAbout?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onBackToHome,
  onOpenArticles,
  onOpenAbout,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "student",
    grade: "Lớp 10",
    subject: "Lộ trình học tập cá nhân hóa",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const FAQS = [
    {
      q: "DMKLab Education có mở miễn phí toàn bộ chương trình K–12 không?",
      a: "Có! Sứ mệnh của DMKLab là mang nền giáo dục đẳng cấp quốc tế hoàn toàn miễn phí tới mọi học sinh trên khắp 63 tỉnh thành Việt Nam. Học sinh có thể học bài giảng video, làm bài tập thực hành và theo dõi cây tiến độ mà không tốn bất kỳ chi phí nào.",
    },
    {
      q: "Gia sư DMK AI Tutor hoạt động như thế nào và có giới hạn không?",
      a: "DMK AI Tutor áp dụng triết lý gợi mở Socratic: không đưa ra lời giải ăn sẵn mà dẫn dắt học sinh bằng các gợi ý tư duy logic. Mỗi học sinh được cấp 30 lượt tương tác AI chất lượng cao mỗi ngày để đảm bảo việc tự học độc lập và an toàn số.",
    },
    {
      q: "Phụ huynh có thể đồng hành và xem báo cáo học tập của con ra sao?",
      a: "Phụ huynh có thể tạo tài khoản giám sát liên kết với tài khoản của con. Hệ thống cung cấp bảng báo cáo thời gian thực về: thời gian học, tỷ lệ hoàn thành kỹ năng, mức độ tinh thông và các điểm tắc nghẽn cần bổ trợ.",
    },
    {
      q: "Nhà trường hoặc tổ chức giáo dục có thể tích hợp DMKLab vào giảng dạy không?",
      a: "Hoàn toàn có thể. DMKLab cung cấp tài khoản Giáo viên (Teacher Portal) và Quản trị viên (Admin Portal) giúp thầy cô giao bài tập, theo dõi biểu đồ tiến độ cả lớp và tổ chức kiểm tra đánh giá định kỳ theo chuẩn Bộ GD&ĐT.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A2540]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A2540] via-[#0E3560] to-[#124278] text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1865F2_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="flex justify-center mb-1">
            <div className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-md inline-flex items-center justify-center">
              <img
                src="/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png"
                alt="DMKLab"
                className="h-9 w-auto object-contain"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Đồng Hành Cùng 100.000+ Học Sinh & Phụ Huynh Việt Nam
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Liên Hệ Với <span className="text-[#38BDF8]">DMKLab Education</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe mọi câu hỏi, ý kiến đóng góp hoặc yêu cầu tư vấn lộ trình học tập từ học sinh, phụ huynh và quý thầy cô.
          </p>
        </div>
      </section>

      {/* Main Content: Info Cards & Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Contact Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-[#0A2540] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1865F2]" />
                Kênh Hỗ Trợ Trực Tiếp
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Đội ngũ chuyên viên sư phạm và kỹ thuật của DMKLab luôn trực tuyến để giải đáp thắc mắc và hỗ trợ tài khoản nhanh chóng.
              </p>

              <div className="space-y-5 pt-2">
                {/* Hotline */}
                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1865F2] flex items-center justify-center shrink-0">
                    <FaPhoneVolume className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Đài & Hotline Hỗ Trợ</div>
                    <a href="tel:0909907861" className="text-base font-bold text-[#0A2540] hover:text-[#1865F2] transition-colors">
                      0909907861 <span className="text-xs font-normal text-emerald-600">(Hotline/Zalo)</span>
                    </a>
                    <div className="text-xs text-slate-500 mt-0.5">Tổng đài CSKH: 1900 6868 (8:00 – 21:30)</div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaEnvelopeOpenText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hòm Thư Điện Tử</div>
                    <a href="mailto:info@dmklab.vn" className="text-base font-bold text-[#0A2540] hover:text-[#1865F2] transition-colors">
                      info@dmklab.vn
                    </a>
                    <div className="text-xs text-slate-500 mt-0.5">Tiếp nhận thông tin 24/7 (Phản hồi trong 2h)</div>
                  </div>
                </div>

                {/* Office */}
                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <FaLocationDot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trụ Sở Công Ty Đức Mai Khôi</div>
                    <div className="text-sm font-semibold text-[#0A2540] mt-0.5 leading-snug">
                      702/67/9 Lê Đức Thọ, Phường An Hội Đông, Thành phố Hồ Chí Minh, Việt Nam
                    </div>
                  </div>
                </div>

                {/* Working hours */}
                <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <TbClockHour4 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Thời Gian Làm Việc Văn Phòng</div>
                    <div className="text-sm font-semibold text-[#0A2540] mt-0.5">
                      Thứ Hai – Thứ Bảy: 8:00 – 18:00 (Nền tảng online hoạt động 24/7)
                    </div>
                  </div>
                </div>
              </div>

              {/* Social / Direct links */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Tìm hiểu thêm:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onOpenAbout}
                    className="text-xs font-semibold text-[#1865F2] hover:underline"
                  >
                    Về DMKLab →
                  </button>
                  <button
                    onClick={onOpenArticles}
                    className="text-xs font-semibold text-[#1865F2] hover:underline"
                  >
                    Bài viết giáo dục →
                  </button>
                </div>
              </div>
            </div>

            {/* Quality Commitment Card */}
            <div className="bg-gradient-to-br from-blue-500 to-[#1865F2] text-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 font-bold text-white text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                Cam Kết Bảo Mật Thông Tin
              </div>
              <p className="text-xs text-blue-50 leading-relaxed">
                Mọi thông tin liên hệ của học sinh và phụ huynh gửi về DMKLab đều được bảo mật theo tiêu chuẩn quốc tế COPPA và GDPR. Chúng tôi tuyệt đối không chia sẻ thông tin cho bên thứ ba vì bất kỳ mục đích thương mại nào.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0A2540]">Gửi Tin Nhắn Thành Công!</h3>
                  <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                    Cảm ơn bạn <strong className="text-[#0A2540]">{formData.fullName}</strong> đã liên hệ với DMKLab Education. Ban cố vấn giáo dục sẽ phản hồi qua email hoặc số điện thoại trong vòng 2 giờ làm việc.
                  </p>
                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          fullName: "",
                          email: "",
                          phone: "",
                          role: "student",
                          grade: "Lớp 10",
                          subject: "Lộ trình học tập cá nhân hóa",
                          message: "",
                        });
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Gửi tin nhắn khác
                    </button>
                    <button
                      onClick={onBackToHome}
                      className="px-5 py-2.5 rounded-xl bg-[#1865F2] text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Trở về trang chủ
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0A2540]">Gửi Thắc Mắc Cho Chúng Tôi</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Điền thông tin bên dưới để được chuyên viên DMKLab tư vấn lộ trình học phù hợp nhất.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Họ và Tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0A2540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1865F2]/20 focus:border-[#1865F2] transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Địa Chỉ Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="an.nguyen@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0A2540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1865F2]/20 focus:border-[#1865F2] transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Số Điện Thoại / Zalo
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0987 654 321"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0A2540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1865F2]/20 focus:border-[#1865F2] transition-colors"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Bạn Là Ai?
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0A2540] bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2]/20 focus:border-[#1865F2] transition-colors"
                      >
                        <option value="student">Học sinh K–12</option>
                        <option value="parent">Phụ huynh học sinh</option>
                        <option value="teacher">Giáo viên / Nhà trường</option>
                        <option value="partner">Đối tác giáo dục / Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Grade & Subject of inquiry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Khối Lớp Quan Tâm
                      </label>
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0A2540] bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2]/20 focus:border-[#1865F2] transition-colors"
                      >
                        <option value="Tiểu học (Lớp 1-5)">Tiểu học (Lớp 1–5)</option>
                        <option value="THCS (Lớp 6-9)">THCS (Lớp 6–9)</option>
                        <option value="Lớp 10">Lớp 10 (Chương trình mới)</option>
                        <option value="Lớp 11">Lớp 11</option>
                        <option value="Lớp 12">Lớp 12 (Luyện thi tốt nghiệp)</option>
                        <option value="Đại cương / Khác">Đại cương / Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nội Dung Cần Hỗ Trợ
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0A2540] bg-white focus:outline-none focus:ring-2 focus:ring-[#1865F2]/20 focus:border-[#1865F2] transition-colors"
                      >
                        <option value="Lộ trình học tập cá nhân hóa">Tư vấn lộ trình học Socratic</option>
                        <option value="Hỗ trợ kỹ thuật / tài khoản">Hỗ trợ kỹ thuật & đăng nhập</option>
                        <option value="Hướng dẫn sử dụng DMK AI Tutor">Hướng dẫn dùng DMK AI Tutor</option>
                        <option value="Triển khai cho trường học">Đăng ký tài khoản Giáo viên / Trường học</option>
                        <option value="Góp ý phát triển">Góp ý nội dung chuyên môn</option>
                      </select>
                    </div>
                  </div>

                  {/* Message body */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nội Dung Tin Nhắn <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Mô tả cụ thể mục tiêu học tập hoặc vấn đề bạn cần DMKLab hỗ trợ..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0A2540] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1865F2]/20 focus:border-[#1865F2] transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#1865F2] text-white text-base font-bold hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang gửi thông tin...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Gửi Yêu Cầu Hỗ Trợ Ngay</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="bg-white border-t border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1865F2] uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              Giải Đáp Thắc Mắc Thường Gặp
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540]">
              Câu Hỏi Phổ Biến Về DMKLab
            </h2>
            <p className="text-sm text-slate-500">
              Những thông tin quan trọng giúp bạn an tâm bắt đầu hành trình chinh phục kiến thức.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#0A2540]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#1865F2]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 py-4 text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Support Banner */}
          <div className="mt-12 text-center p-6 rounded-2xl bg-blue-50 border border-blue-100">
            <h3 className="text-base font-bold text-[#0A2540] mb-1">
              Bạn chưa tìm thấy câu trả lời phù hợp?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Gọi điện trực tiếp cho chuyên gia DMKLab qua đường dây nóng miễn cước.
            </p>
            <a
              href="tel:19006868"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1865F2] text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Gọi 1900 6868 Ngay
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
