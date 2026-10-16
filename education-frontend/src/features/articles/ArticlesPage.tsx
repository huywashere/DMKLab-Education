"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Tag, 
  Share2, 
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  ThumbsUp
} from "lucide-react";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  category: "math" | "ai" | "skills" | "parents";
  categoryLabel: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

const SAMPLE_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Phương pháp Socratic trong học Toán: Biến nỗi sợ Đại số & Hình học thành niềm say mê",
    excerpt: "Tại sao việc đưa ra câu trả lời ngay lập tức lại làm giảm khả năng tư duy của học sinh? Khám phá cách các câu hỏi gợi mở từng bước giúp não bộ ghi nhớ lâu hơn 300%.",
    content: [
      "Khi đối mặt với một bài toán khó, phản xạ đầu tiên của đa số học sinh là tìm kiếm lời giải mẫu hoặc nhờ người khác làm hộ. Tuy nhiên, các nghiên cứu thần kinh học chỉ ra rằng não bộ chỉ thực sự hình thành các liên kết thần kinh bền vững khi trải qua trạng thái 'thử thách có định hướng' (productive struggle).",
      "Phương pháp Socratic – được áp dụng cốt lõi tại DMKLab – biến giáo viên và gia sư AI thành người dẫn đường thông qua chuỗi câu hỏi: 'Em thấy mẫu số hai phân số này có quan hệ gì với nhau?', 'Nếu vẽ hình chữ nhật này ra nháp, diện tích sẽ thay đổi thế nào khi chiều rộng tăng gấp đôi?'.",
      "Nhờ không bị 'cướp mất' cơ hội tự khám phá, học sinh khi tự mình tìm ra đáp án sẽ trải nghiệm cảm giác vỡ òa thành tựu (Aha! Moment). Đây chính là động lực nội tại mạnh mẽ nhất giúp các em yêu thích môn Toán suốt 12 năm phổ thông.",
      "Lời khuyên cho phụ huynh: Khi con hỏi bài, đừng vội giải hộ. Hãy hỏi ngược lại: 'Theo con bài này đang hỏi về điều gì?' hoặc 'Bước đầu tiên con nghĩ tới là gì?'."
    ],
    category: "math",
    categoryLabel: "Toán Học & STEM",
    author: "ThS. Nguyễn Văn Đức",
    authorRole: "Viện Trưởng Sư Phạm DMKLab",
    date: "14/10/2026",
    readTime: "5 phút đọc",
    image: "/img-web/background-hoc-tap-001.webp",
    featured: true,
  },
  {
    id: "art-2",
    title: "Gia sư AI trong phòng học K–12: Đồng hành gợi mở tư duy hay giải bài hộ học sinh?",
    excerpt: "Sự bùng nổ của AI tạo sinh đặt ra bài toán lớn: Làm thế nào để công nghệ giúp học sinh thông minh hơn chứ không biến các em thành người phụ thuộc thụ động?",
    content: [
      "Trí tuệ nhân tạo (AI) đang thay đổi mọi lĩnh vực, và giáo dục phổ thông không phải ngoại lệ. Nếu học sinh chỉ sao chép lời giải từ các công cụ chat thông thường, các em sẽ mất đi năng lực giải quyết vấn đề độc lập – kỹ năng sinh tồn cốt lõi của thế kỷ 21.",
      "Tại DMKLab Education, hệ sinh thái DMK AI Tutor được thiết lập với rào chắn sư phạm nghiêm ngặt: Tuyệt đối không bao giờ giải trọn vẹn bài tập hộ học sinh. Thay vào đó, AI phân tích câu hỏi, phát hiện điểm tắc nghẽn và đưa ra gợi ý chia nhỏ bài toán.",
      "Hơn nữa, hệ thống giới hạn 30 câu hỏi mỗi ngày nhằm khuyến khích học sinh tự nghiên cứu sách giáo khoa và suy ngẫm trước khi tìm đến sự trợ giúp.",
      "Kết quả thử nghiệm trên 1,000 học sinh cho thấy: Nhóm sử dụng AI gợi mở có điểm kiểm tra định kỳ cao hơn 24% so với nhóm dùng AI chỉ đưa ra lời giải trực tiếp."
    ],
    category: "ai",
    categoryLabel: "Công Nghệ AI",
    author: "TS. Trần Minh Khoa",
    authorRole: "Kiến Trúc Sư AI DMKLab",
    date: "12/10/2026",
    readTime: "6 phút đọc",
    image: "/img-web/background-hoc-tap-001.webp",
    featured: true,
  },
  {
    id: "art-3",
    title: "Bí quyết duy trì chuỗi học tập (Streak) 30 ngày cho học sinh Tiểu học và THCS",
    excerpt: "Sức mạnh của thói quen 15 phút mỗi ngày: Tại sao học một chút mỗi ngày lại vượt trội hơn hẳn việc 'nhồi nhét' 4 tiếng vào cuối tuần?",
    content: [
      "Đường cong quên lãng Ebbinghaus chỉ ra rằng con người sẽ quên tới 70% kiến thức mới nạp vào chỉ sau 24 giờ nếu không có hoạt động ôn tập lặp lại ngắt quãng (spaced repetition).",
      "Tính năng Streak (Chuỗi học tập liên tục) tại DMKLab được thiết kế như một trò chơi tích cực: Học sinh chỉ cần hoàn thành 1 bài giảng video 10 phút hoặc 1 bài quiz trắc nghiệm là ngọn lửa Streak sẽ được duy trì.",
      "Khi chuỗi ngày học vượt mốc 7 ngày, 14 ngày, 30 ngày, học sinh hình thành phản xạ tự giác ngồi vào bàn học mà không cần cha mẹ phải nhắc nhở hay quát mắng.",
      "Mẹo thực hành: Hãy chọn một khung giờ cố định trong ngày (ví dụ 19h30 sau bữa tối) để làm 'Giờ DMKLab'. Dù bận đến đâu cũng hoàn thành tối thiểu 1 bài trắc nghiệm để bảo vệ chuỗi học tập của mình."
    ],
    category: "skills",
    categoryLabel: "Kỹ Năng Học Tập",
    author: "Cô Nguyễn Thị Mai",
    authorRole: "Giáo viên Cố vấn DMKLab",
    date: "10/10/2026",
    readTime: "4 phút đọc",
    image: "/img-web/background-hoc-tap-001.webp",
  },
  {
    id: "art-4",
    title: "Cẩm nang phụ huynh: Đồng hành cùng con vượt qua áp lực chuyển cấp vào Lớp 6 và Lớp 10",
    excerpt: "Giai đoạn chuyển tiếp giữa các cấp học thường chứng kiến sự sụt giảm kết quả học tập đột ngột. Cha mẹ cần làm gì để hỗ trợ tâm lý và phương pháp học cho con?",
    content: [
      "Bước vào lớp 6 (bậc THCS) và lớp 10 (bậc THPT) là hai bước ngoặt lớn: số lượng môn học tăng lên, khối lượng bài tập nặng hơn và phong cách giảng dạy yêu cầu tính tự chủ cao hơn rất nhiều so với cấp dưới.",
      "Nhiều phụ huynh lo lắng khi thấy con từ học sinh giỏi trở nên đuối sức. Chìa khóa không nằm ở việc bắt con học thêm dày đặc, mà là củng cố kiến thức nền tảng của các khối lớp trước đó.",
      "Cổng thông tin Phụ huynh (Parent Portal) của DMKLab giúp cha mẹ nắm bắt chính xác môn nào con đang gặp khó khăn (đang ở mức 'Làm quen' hay 'Chưa đạt') để kịp thời động viên thay vì trách phạt.",
      "Hãy biến việc học thành niềm vui gia đình: Cùng con theo dõi điểm năng lượng tăng lên mỗi ngày và tặng cho con một phần thưởng nhỏ khi con đạt huy hiệu danh giá mới."
    ],
    category: "parents",
    categoryLabel: "Góc Phụ Huynh",
    author: "Ban Cố Vấn Tâm Lý DMKLab",
    authorRole: "Chuyên Gia Giáo Dục Gia Đình",
    date: "08/10/2026",
    readTime: "7 phút đọc",
    image: "/img-web/background-hoc-tap-001.webp",
  },
  {
    id: "art-5",
    title: "Học qua video ngắn & Làm trắc nghiệm ngay: Công thức ghi nhớ sâu 85% kiến thức",
    excerpt: "Tại sao bài giảng dài 45 phút thường làm học sinh mất tập trung sau phút thứ 15? Tìm hiểu cấu trúc vi học tập (Micro-learning) chuẩn quốc tế.",
    content: [
      "Nghiên cứu về khả năng chú ý (attention span) của trẻ em trong thời đại kỹ thuật số cho thấy thời gian tập trung tối ưu chỉ kéo dài từ 8 đến 12 phút.",
      "Đó là lý do toàn bộ kho bài giảng tại DMKLab Education đều được tinh gọn thành các video từ 8–12 phút, giải thích duy nhất một khái niệm trọng tâm kết hợp hình ảnh trực quan.",
      "Ngay sau khi video kết thúc, học sinh được chuyển thẳng tới bộ câu hỏi trắc nghiệm kiểm tra độ tinh thông. Cơ chế này ép não bộ phải truy xuất thông tin ngay lập tức (retrieval practice), giúp tỷ lệ lưu giữ kiến thức tăng vọt từ 20% lên 85%.",
      "Kết hợp cùng phụ đề song ngữ và các mốc thời gian (chapters), học sinh có thể dễ dàng tua lại đúng đoạn mình chưa hiểu mà không mất thời gian xem lại từ đầu."
    ],
    category: "skills",
    categoryLabel: "Kỹ Năng Học Tập",
    author: "ThS. Hoàng Quốc Nam",
    authorRole: "Chuyên gia Phát triển Nội dung",
    date: "05/10/2026",
    readTime: "5 phút đọc",
    image: "/img-web/background-hoc-tap-001.webp",
  },
];

interface ArticlesPageProps {
  onBackToHome: () => void;
  onOpenLesson?: (lesson: any) => void;
  onOpenContact?: () => void;
  onOpenAbout?: () => void;
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({
  onBackToHome,
  onOpenLesson,
  onOpenContact,
  onOpenAbout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});

  const categories = [
    { id: "all", label: "Tất Cả Bài Viết" },
    { id: "math", label: "Toán Học & STEM" },
    { id: "ai", label: "Công Nghệ AI" },
    { id: "skills", label: "Kỹ Năng Học Tập" },
    { id: "parents", label: "Góc Phụ Huynh" },
  ];

  const filteredArticles = SAMPLE_ARTICLES.filter((art) => {
    const matchCat = selectedCategory === "all" || art.category === selectedCategory;
    const matchSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 12) + 1,
    }));
  };

  return (
    <div className="w-full bg-white space-y-12 pb-24">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-b from-[#FEF8E7] via-white to-white border-b border-[#E8E3D0]/60 pt-10 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1865F2] text-xs font-bold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Góc Tri Thức & Phương Pháp Học K–12</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#0A2540] tracking-tight">
            Bài Viết & Cẩm Nang Giáo Dục DMKLab
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Nơi chia sẻ các bài nghiên cứu sư phạm, phương pháp học tập Socratic, kinh nghiệm đồng hành cùng con và xu hướng ứng dụng AI trong học đường.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto pt-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết theo chủ đề, từ khóa..."
              className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-full pl-10 pr-4 py-3 border border-slate-300 focus:outline-none focus:border-[#1865F2] focus:ring-2 focus:ring-blue-100 shadow-xs transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#1865F2] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Article (If any and no search) */}
        {!searchQuery && selectedCategory === "all" && SAMPLE_ARTICLES[0] && (
          <div
            onClick={() => setSelectedArticle(SAMPLE_ARTICLES[0])}
            className="bg-gradient-to-r from-blue-50/60 to-emerald-50/40 rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-sm hover:border-[#1865F2] transition cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group"
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#1865F2] text-white">
                  Bài Viết Tiêu Điểm
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {SAMPLE_ARTICLES[0].categoryLabel}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#0A2540] group-hover:text-[#1865F2] transition leading-snug">
                {SAMPLE_ARTICLES[0].title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {SAMPLE_ARTICLES[0].excerpt}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <User className="w-3.5 h-3.5 text-[#1865F2]" /> {SAMPLE_ARTICLES[0].author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {SAMPLE_ARTICLES[0].date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {SAMPLE_ARTICLES[0].readTime}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <img
                src={SAMPLE_ARTICLES[0].image}
                alt={SAMPLE_ARTICLES[0].title}
                className="w-full rounded-2xl shadow-md object-cover border border-slate-200 group-hover:scale-102 transition duration-300"
                style={{ aspectRatio: "16/10" }}
              />
            </div>
          </div>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#1865F2] hover:shadow-md transition flex flex-col justify-between overflow-hidden cursor-pointer group"
            >
              <div>
                <div className="relative overflow-hidden">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full object-cover transition duration-300 group-hover:scale-105"
                    style={{ aspectRatio: "16/9" }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#1865F2] shadow-2xs">
                    {art.categoryLabel}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {art.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {art.readTime}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#1865F2] transition line-clamp-2 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                  {art.author}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleLike(art.id, e)}
                    className="flex items-center gap-1 text-slate-500 hover:text-rose-500 transition cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{likes[art.id] || 15}</span>
                  </button>

                  <span className="text-[#1865F2] font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                    Đọc <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy bài viết nào phù hợp</p>
            <p className="text-xs text-slate-500">Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục "Tất Cả Bài Viết".</p>
          </div>
        )}
      </div>

      {/* 2. Read Article Modal / Drawer */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setSelectedArticle(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1865F2] transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại danh sách bài viết</span>
              </button>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-[#1865F2]">
                {selectedArticle.categoryLabel}
              </span>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="space-y-3">
                <h2 className="text-xl sm:text-3xl font-black text-[#0A2540] leading-tight">
                  {selectedArticle.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1865F2] flex items-center justify-center font-black text-xs">
                      {selectedArticle.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedArticle.author}</p>
                      <p className="text-[10px] text-slate-400">{selectedArticle.authorRole}</p>
                    </div>
                  </div>
                  <span>•</span>
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
              </div>

              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full rounded-2xl shadow-md border border-slate-200 object-cover"
                style={{ aspectRatio: "16/9" }}
              />

              <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                {selectedArticle.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Callout box */}
              <div className="bg-blue-50 border-l-4 border-[#1865F2] p-4 rounded-r-2xl space-y-1">
                <p className="font-bold text-xs text-[#1865F2] uppercase tracking-wider">
                  Lời khuyên từ ban chuyên môn DMKLab
                </p>
                <p className="text-xs sm:text-sm text-slate-700">
                  Học tập là một hành trình dài hạn. Hãy thực hành từng chút một mỗi ngày cùng DMKLab để tích lũy kiến thức vững chắc và tự tin trong mọi kỳ thi!
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={(e) => handleLike(selectedArticle.id, e)}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-rose-600 transition cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4 text-rose-500" />
                <span>Thích bài viết ({likes[selectedArticle.id] || 15})</span>
              </button>

              <button
                onClick={() => setSelectedArticle(null)}
                className="khan-btn-primary text-xs px-6 py-2.5 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
