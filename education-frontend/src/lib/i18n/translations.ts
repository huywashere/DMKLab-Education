export type Language = "vi" | "en";

export const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navigation & Header
  nav_courses: {
    vi: "Môn học",
    en: "Courses",
  },
  nav_about: {
    vi: "Giới thiệu",
    en: "About Us",
  },
  nav_articles: {
    vi: "Bài viết",
    en: "Articles",
  },
  nav_contact: {
    vi: "Liên hệ",
    en: "Contact",
  },
  nav_search_placeholder: {
    vi: "Tìm kiếm môn học, bài giảng...",
    en: "Search subjects, lessons...",
  },
  nav_ai_tutor: {
    vi: "DMK AI Tutor",
    en: "DMK AI Tutor",
  },
  nav_dashboard: {
    vi: "Bảng Điều Khiển",
    en: "Dashboard",
  },
  nav_login: {
    vi: "Đăng nhập",
    en: "Log In",
  },
  nav_register: {
    vi: "Đăng ký",
    en: "Sign Up",
  },
  nav_logout: {
    vi: "Đăng xuất",
    en: "Log Out",
  },
  nav_profile: {
    vi: "Hồ sơ cá nhân",
    en: "User Profile",
  },
  nav_streak: {
    vi: "Chuỗi ngày học",
    en: "Day Streak",
  },
  nav_energy: {
    vi: "Điểm năng lượng",
    en: "Energy Points",
  },
  nav_notifications: {
    vi: "Thông Báo Học Tập",
    en: "Notifications",
  },
  nav_mark_read: {
    vi: "Đánh dấu đã đọc",
    en: "Mark all as read",
  },
  nav_no_notifications: {
    vi: "Chưa có thông báo mới",
    en: "No new notifications",
  },
  nav_featured_fields: {
    vi: "Lĩnh vực nổi bật",
    en: "Featured Fields",
  },
  nav_current_grade: {
    vi: "Khối Lớp Hiện Tại",
    en: "Current Grade",
  },
  nav_math_k12: {
    vi: "Toán: Lớp 1 – Lớp 12",
    en: "Math: Grade 1 – 12",
  },
  nav_science_stem: {
    vi: "Khoa học & Tự nhiên",
    en: "Science & STEM",
  },
  nav_english_lang: {
    vi: "Tiếng Anh & Ngôn ngữ",
    en: "English & Languages",
  },
  nav_explore_more: {
    vi: "Khám phá thêm về DMKLab:",
    en: "Explore more about DMKLab:",
  },

  // Hero Section
  hero_headline_1: {
    vi: "Biến mục tiêu học tập lớn thành",
    en: "Turn big learning goals into",
  },
  hero_headline_2: {
    vi: "kết quả thực sự.",
    en: "real results.",
  },
  hero_desc: {
    vi: "DMKLab giúp cá nhân hóa việc học, củng cố kỹ năng nền tảng và hỗ trợ từng học sinh từ lớp 1 đến lớp 12 tiến bộ mỗi ngày.",
    en: "DMKLab personalizes learning, reinforces foundational skills, and supports every student from grades 1 to 12 to make progress every day.",
  },
  hero_check_1: {
    vi: "Luyện tập xây dựng hiểu biết thông qua các kỹ năng theo chuẩn chương trình",
    en: "Practice builds understanding through curriculum-aligned skills",
  },
  hero_check_2: {
    vi: "Phản hồi tức thì giúp học sinh vượt qua điểm khó khi gặp",
    en: "Immediate feedback helps students overcome sticky points as they arise",
  },
  hero_check_3: {
    vi: "Thấu hiểu học sinh giúp giáo viên định hướng chính xác",
    en: "Student insights help teachers pinpoint instruction",
  },
  hero_btn_start: {
    vi: "Bắt đầu học ngay",
    en: "Start learning now",
  },
  hero_btn_learn_more: {
    vi: "Tìm hiểu thêm",
    en: "Learn more",
  },
  hero_who_are_you: {
    vi: "Bạn là ai?",
    en: "Who are you?",
  },
  hero_role_student: {
    vi: "Học sinh",
    en: "Learners",
  },
  hero_role_student_desc: {
    vi: "Học tập theo tốc độ của bản thân",
    en: "Find your own pace",
  },
  hero_role_family: {
    vi: "Gia đình",
    en: "Families",
  },
  hero_role_family_desc: {
    vi: "Hỗ trợ việc học của con bạn",
    en: "Support your child's learning",
  },
  hero_role_teacher: {
    vi: "Giáo viên",
    en: "Teachers",
  },
  hero_role_teacher_desc: {
    vi: "Giáo viên với lớp học",
    en: "Empower your classroom",
  },
  hero_role_school: {
    vi: "Trường học & Sở",
    en: "Districts",
  },
  hero_role_school_desc: {
    vi: "Triển khai AI toàn trường",
    en: "Bring AI to your school",
  },
  hero_has_account: {
    vi: "Đã có tài khoản?",
    en: "Already have an account?",
  },
  hero_login_link: {
    vi: "Đăng nhập",
    en: "Log in",
  },

  // Stats Section
  stats_students_label: {
    vi: "học sinh đăng ký học",
    en: "registered learners",
  },
  stats_minutes_label: {
    vi: "phút học tập thực sự",
    en: "minutes of authentic learning",
  },
  stats_free_val: {
    vi: "Miễn phí",
    en: "Free",
  },
  stats_free_label: {
    vi: "cho học sinh & giáo viên",
    en: "for students & teachers",
  },
  stats_years_val: {
    vi: "15+ năm",
    en: "15+ years",
  },
  stats_years_label: {
    vi: "tập trung vào một sứ mệnh",
    en: "focused on one mission",
  },

  // Courses Section
  courses_heading: {
    vi: "Khám phá các môn học",
    en: "Explore our courses",
  },
  subject_math_primary: {
    vi: "Toán: Tiểu học (Lớp 1–5)",
    en: "Math: Elementary (Grades 1–5)",
  },
  subject_math_secondary: {
    vi: "Toán: THCS & THPT (Lớp 6–12)",
    en: "Math: Middle & High School (Grades 6–12)",
  },
  subject_math_by_grade: {
    vi: "Toán: Phân theo lớp học",
    en: "Math: By grade level",
  },
  subject_stem: {
    vi: "Khoa học Tự nhiên & STEM",
    en: "Natural Science & STEM",
  },
  subject_english: {
    vi: "Tiếng Anh giao tiếp K–12",
    en: "K–12 English Communication",
  },
  subject_literature: {
    vi: "Ngữ Văn & Ngôn ngữ học",
    en: "Literature & Language Arts",
  },
  subject_history: {
    vi: "Lịch sử & Địa lý Việt Nam",
    en: "History & Geography of Vietnam",
  },
  subject_economics: {
    vi: "Kinh tế & Giáo dục tài chính",
    en: "Economics & Financial Literacy",
  },
  subject_ai_coding: {
    vi: "AI & Lập trình cho học sinh",
    en: "AI & Coding for Students",
  },

  // How it Works Section
  how_badge: {
    vi: "Cách DMKLab hoạt động",
    en: "How DMKLab works",
  },
  how_title_1: {
    vi: "Tiến bộ thực sự bắt đầu từ",
    en: "Real progress starts with",
  },
  how_title_emphasis: {
    vi: "cách",
    en: "how",
  },
  how_title_2: {
    vi: "học sinh học.",
    en: "students learn.",
  },
  how_desc: {
    vi: "Học sinh học tốt nhất khi thực hành đều đặn, nhận phản hồi ngay và được hỗ trợ kịp thời. DMKLab giúp điều đó khả thi để học sinh luôn tiến về phía trước, dù ở đâu trong hành trình học tập.",
    en: "Students learn best through deliberate practice, instant feedback, and targeted support. DMKLab makes that possible so students keep moving forward at every stage.",
  },

  // Learner Results Section
  results_badge: {
    vi: "Kết quả học sinh",
    en: "Learner results",
  },
  results_title: {
    vi: "Mỗi kỹ năng đều có giá trị.",
    en: "Every skill counts.",
  },
  results_desc: {
    vi: "Mỗi kỹ năng học sinh làm chủ đều xây dựng lên kỹ năng tiếp theo, giúp lấp đầy lỗ hổng kiến thức, tạo tự tin và tiến lên. Tiến bộ là có thể đo lường – và nó cộng dồn theo thời gian.",
    en: "Every skill students master builds upon the next, closing learning gaps, unlocking confidence, and driving mastery. Progress is measurable — and compounds over time.",
  },
  results_check_1: {
    vi: "1 kỹ năng thành thạo = +0.5 điểm phần trăm",
    en: "1 mastered skill = +0.5 percentile points",
  },
  results_check_2: {
    vi: "10 kỹ năng thành thạo = +5 điểm phần trăm",
    en: "10 mastered skills = +5 percentile points",
  },
  results_check_3: {
    vi: "60 kỹ năng thành thạo = +30 điểm phần trăm",
    en: "60 mastered skills = +30 percentile points",
  },
  results_btn: {
    vi: "Xem tác động thực tế",
    en: "See our impact",
  },

  // Audience Tabs Section
  audience_tab_schools: {
    vi: "Trường học & Sở GD",
    en: "Districts & Schools",
  },
  audience_tab_teachers: {
    vi: "Giáo viên",
    en: "Teachers",
  },
  audience_tab_students: {
    vi: "Học sinh",
    en: "Learners",
  },
  audience_tab_families: {
    vi: "Gia đình",
    en: "Families",
  },
  audience_schools_title: {
    vi: "Thúc đẩy tiến bộ trên mọi lớp học.",
    en: "Foster progress across every classroom.",
  },
  audience_teachers_title: {
    vi: "Cung cấp cho mỗi học sinh sự hỗ trợ cần thiết.",
    en: "Give every student the support they need.",
  },
  audience_students_title: {
    vi: "Tự học theo tốc độ của bản thân, miễn phí.",
    en: "Learn at your own pace, 100% free.",
  },
  audience_families_title: {
    vi: "Xem con bạn học thật sự hiệu quả.",
    en: "Watch your child thrive and succeed.",
  },
  audience_schools_desc: {
    vi: "DMKLab được giáo viên tin dùng mỗi ngày. Các quan hệ đối tác cấp trường xây dựng trên nền tảng đó, mang lại sự nhất quán và học tập sâu hơn trên toàn trường.",
    en: "DMKLab is trusted by educators daily. School partnerships build on that foundation, bringing consistency and deeper mastery school-wide.",
  },
  audience_teachers_desc: {
    vi: "Hiểu chính xác mỗi học sinh cần gì, tiết kiệm thời gian chuẩn bị bài và tập trung vào những khoảnh khắc dạy học quan trọng nhất.",
    en: "Pinpoint exactly what each student needs, save lesson prep time, and focus on moments of highest teaching impact.",
  },
  audience_students_desc: {
    vi: "Hàng nghìn video bài giảng, bài tập và giải thích. Học mọi thứ từ toán cơ bản đến đại số nâng cao, khoa học, lịch sử và nhiều hơn nữa.",
    en: "Thousands of video lessons, practice exercises, and step-by-step guides. Master everything from fundamental math to STEM, languages, and more.",
  },
  audience_families_desc: {
    vi: "Theo dõi tiến độ học tập của con, biết con đang học gì và cần hỗ trợ ở đâu – tất cả trong một nơi.",
    en: "Track your child's academic journey, celebrate milestones, and discover where they need help — all in one place.",
  },
  audience_btn_partnership: {
    vi: "Khám phá quan hệ đối tác",
    en: "Explore partnerships",
  },
  audience_btn_get_started: {
    vi: "Bắt đầu ngay",
    en: "Get started",
  },
  audience_btn_contact: {
    vi: "Liên hệ với chúng tôi",
    en: "Contact our team",
  },
  audience_card_skill_practiced: {
    vi: "Thực hành 25 bài tập kỹ năng",
    en: "Practiced 25 skill exercises",
  },
  audience_card_status: {
    vi: "Đang ở mức Thành Thạo — tiếp tục để đạt Tinh Thông!",
    en: "Proficient level — keep practicing to reach Mastered!",
  },

  // AI Chatbot Banner
  ai_banner_tag: {
    vi: "Trợ lý AI giáo dục K–12",
    en: "K–12 Educational AI Assistant",
  },
  ai_banner_title_1: {
    vi: "DMK AI – Gia sư AI gợi mở",
    en: "DMK AI – Your Socratic",
  },
  ai_banner_title_socratic: {
    vi: "Socratic",
    en: "AI Tutor",
  },
  ai_banner_title_2: {
    vi: "của bạn.",
    en: "companion.",
  },
  ai_banner_desc: {
    vi: "Không cho chép bài. Không đưa đáp án ngay. DMK AI đặt câu hỏi dẫn dắt tư duy giúp học sinh thực sự hiểu – không chỉ làm xong bài tập.",
    en: "Never copy-pastes answers. DMK AI guides students through step-by-step thinking to ensure genuine deep understanding.",
  },
  ai_banner_btn: {
    vi: "Trải nghiệm DMK AI ngay",
    en: "Try DMK AI Tutor Now",
  },
  ai_bubble_prompt: {
    vi: "💡 \"Bước đầu tiên em định làm gì với bài toán này?\"",
    en: "💡 \"What is your first step to approach this problem?\"",
  },
  ai_tutor_badge: {
    vi: "DMK AI Tutor",
    en: "DMK AI Tutor",
  },
  ai_tutor_subbadge: {
    vi: "Gia sư gợi mở Socratic",
    en: "Socratic AI Tutor",
  },
  points_label: {
    vi: "Điểm",
    en: "Pts",
  },

  // Pre-Footer CTA (Khan Academy Style)
  prefooter_title: {
    vi: "Tiếp sức cho mọi lớp học và học sinh.",
    en: "Strengthen every classroom.",
  },
  prefooter_desc: {
    vi: "Từ từng học sinh cá nhân đến toàn bộ hệ thống trường học, DMKLab giúp việc học tập trở nên hứng khởi và hiệu quả.",
    en: "From individual learners to entire school systems, DMKLab helps learning happen.",
  },
  prefooter_btn: {
    vi: "Bắt đầu ngay",
    en: "Get started",
  },
  prefooter_pricing_prompt: {
    vi: "Bạn quan tâm giải pháp cho trường học?",
    en: "Looking for district pricing?",
  },
  prefooter_pricing_cta: {
    vi: "Liên hệ đội ngũ DMKLab",
    en: "Talk to our team",
  },

  // Footer
  footer_about_heading: {
    vi: "VỀ CHÚNG TÔI",
    en: "ABOUT US",
  },
  footer_company_desc: {
    vi: "Công ty Đức Mai Khôi chuyên sản xuất, nhập khẩu, phân phối thiết bị phòng thí nghiệm cho trường học từ cấp Tiểu học, THCS, THPT đến Đại học. Chúng tôi tự hào là công ty đầu tiên tại Việt Nam sản xuất tiêu bản hiển vi phục vụ dạy học. Chúng tôi là đại diện của nhiều kính hiển vi chính hãng như Labomed, Leica, Nikon, Olympus, Carton...",
    en: "Duc Mai Khoi Company specializes in manufacturing, importing, and distributing laboratory equipment for schools from Primary to University levels. We take pride in being the first enterprise in Vietnam to produce microscope slides for education, representing leading optical brands including Labomed, Leica, Nikon, Olympus, Carton...",
  },
  footer_contact_heading: {
    vi: "LIÊN HỆ",
    en: "CONTACT US",
  },
  footer_headquarters_label: {
    vi: "Trụ sở:",
    en: "Headquarters:",
  },
  footer_headquarters_val: {
    vi: "702/67/9 Lê Đức Thọ, Phường An Hội Đông, Thành phố Hồ Chí Minh, Việt Nam",
    en: "702/67/9 Le Duc Tho, An Hoi Dong Ward, Ho Chi Minh City, Vietnam",
  },
  footer_send_message_btn: {
    vi: "Gửi tin nhắn tư vấn",
    en: "Send Inquiry",
  },
  footer_info_heading: {
    vi: "THÔNG TIN",
    en: "INFORMATION",
  },
  footer_payment_guide: {
    vi: "Hướng Dẫn Thanh Toán",
    en: "Payment Guide",
  },
  footer_warranty: {
    vi: "Quy Định Bảo Hành",
    en: "Warranty Policy",
  },
  footer_return: {
    vi: "Quy định đổi trả sản phẩm",
    en: "Return & Refund Policy",
  },
  footer_shipping: {
    vi: "Quy Định Vận Chuyển",
    en: "Shipping Policy",
  },
  footer_privacy: {
    vi: "Chính Sách Bảo Mật",
    en: "Privacy Policy",
  },
  footer_k12_heading: {
    vi: "GIÁO DỤC K–12",
    en: "K–12 EDUCATION",
  },
  footer_about_dmklab: {
    vi: "Giới thiệu DMKLab",
    en: "About DMKLab",
  },
  footer_socratic_method: {
    vi: "Phương Pháp Socratic",
    en: "Socratic Method",
  },
  footer_articles_link: {
    vi: "Bài viết & Cẩm nang",
    en: "Articles & Guides",
  },
  footer_hotline_label: {
    vi: "Tổng đài: 1900 6868",
    en: "Hotline: 1900 6868",
  },
  footer_copyright: {
    vi: "© 2026 DMKLab - Công Ty TNHH MTV Đức Mai Khôi & Nền Tảng Giáo Dục Trực Tuyến DMKLab Education. Tất cả quyền được bảo lưu.",
    en: "© 2026 DMKLab - Duc Mai Khoi Co., Ltd & DMKLab Education Platform. All rights reserved.",
  },
  footer_coppa: {
    vi: "Chuẩn an toàn dữ liệu học sinh & COPPA",
    en: "COPPA & Student Data Privacy Compliant",
  },
  footer_partner_vn: {
    vi: "Đồng hành cùng học sinh Việt Nam",
    en: "Empowering Vietnamese Students",
  },

  // Language Selector
  lang_select_title: {
    vi: "Chọn ngôn ngữ",
    en: "Select language",
  },
  lang_vi: {
    vi: "Tiếng Việt",
    en: "Vietnamese",
  },
  lang_en: {
    vi: "English",
    en: "English",
  },

  // Dark Mode Theme
  theme_toggle: {
    vi: "Chuyển giao diện sáng/tối",
    en: "Toggle light/dark theme",
  },
  theme_light: {
    vi: "Giao diện Sáng",
    en: "Light Mode",
  },
  theme_dark: {
    vi: "Giao diện Tối",
    en: "Dark Mode",
  },
};

export function getTranslation(key: string, lang: Language): string {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  return TRANSLATIONS[key]?.vi || key;
}
