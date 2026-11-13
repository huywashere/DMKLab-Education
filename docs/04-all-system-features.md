# 🌟 04. DANH MỤC TOÀN BỘ CHỨC NĂNG HỆ THỐNG (ALL SYSTEM FEATURES)

> **Mục tiêu**: Bóc tách và mô tả chi tiết 100% các chức năng, phân hệ nghiệp vụ và trải nghiệm người dùng trong hệ sinh thái **DMKLab Education Platform**.

---

## 🧭 1. MA TRẬN PHÂN QUYỀN CHỨC NĂNG (RBAC FEATURE MATRIX)

Hệ thống phân định rõ 5 nhóm người dùng chính với quyền hạn chi tiết:

| Nhóm chức năng | Khách (Guest) | Học sinh (Student) | Giáo viên (Teacher) | Phụ huynh (Parent) | Quản trị viên (Admin) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Xem trang chủ, bài viết, giới thiệu** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Đọc sách giáo khoa K-12 (E-Reader)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Học bài giảng Video HLS (LessonRoom)** | ⚠️ Xem thử | ✅ | ✅ | ✅ | ✅ |
| **Làm bài tập trắc nghiệm & Tính điểm** | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Tích lũy Điểm Năng Lượng & Chuỗi Streak** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Hỏi đáp Gia sư Socratic AI 24/7** | ⚠️ Giới hạn | ✅ (30 câu/ngày)| ✅ Không hạn mức | ⚠️ Giới hạn | ✅ Không hạn mức |
| **Đánh dấu & Ghi chú bài học (Bookmarks)**| ❌ | ✅ | ✅ | ❌ | ✅ |
| **Tải lên sách & giáo án cá nhân** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Xem báo cáo học tập con em** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Tạo, sửa, xuất bản bài học & video** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Bảng điều khiển Quản trị CMS (`/admin`)** | ❌ | ❌ | ⚠️ Giới hạn | ❌ | ✅ Toàn quyền |
| **Giám sát Token AI & Chi phí USD** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Xem Nhật ký kiểm toán (Audit Logs)** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Quản lý phân quyền người dùng (RBAC)** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Xóa bộ đệm phân tán (Redis Cache Purge)**| ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🎓 2. PHÂN HỆ HỌC SINH (STUDENT PORTAL)

### 2.1 Bộ điều hướng Khối lớp (K-12 Grade Selector)
- Cho phép học sinh lựa chọn nhanh khối lớp từ **Lớp 1 đến Lớp 12** ngay trên thanh Header.
- Toàn bộ danh mục bài học, sách giáo khoa, gợi ý sư phạm và phong cách trò chuyện của Gia sư AI sẽ tự động điều chỉnh theo đúng tâm sinh lý lứa tuổi của khối lớp đã chọn.

### 2.2 Phòng học tập bài giảng trực quan (Interactive LessonRoom)
- **Trình phát Video HLS thích ứng**:
  - Tự động điều chỉnh độ phân giải phù hợp với băng thông mạng (360p, 720p, 1080p).
  - Tự động ghi nhớ mốc thời gian đang xem dở vào `localStorage`, học sinh có thể tiếp tục xem bất cứ lúc nào.
  - Phím tắt tiện lợi: Phím cách (Play/Pause), Mũi tên trái/phải (Tua 5s), Mũi tên lên/xuống (Âm lượng).
- **Cơ chế Heartbeat đồng bộ tiến độ tự động**:
  - Cứ mỗi 15 giây học tập liên tục, hệ thống gửi tín hiệu về máy chủ cập nhật tỉ lệ hoàn thành.
  - Khi xem đạt trên 80% thời lượng video, bài học được đánh dấu **"Đã hoàn thành"** và cộng Điểm Năng Lượng.
- **Hệ thống câu hỏi trắc nghiệm kiểm tra hiểu bài (In-Lesson Quizzes)**:
  - Tích hợp các câu hỏi trắc nghiệm tương tác ngay dưới bài học.
  - Học sinh chọn đáp án và nhận ngay phản hồi giải thích chi tiết, giúp củng cố kiến thức tức thì.
- **Sổ tay ghi chú & Đánh dấu bài học (Personal Notes & Bookmarks)**:
  - Học sinh có thể ghi chép các ý chính cần nhớ ngay bên cạnh video bài giảng.
  - Bấm nút "Lưu bài học" để thêm vào danh sách yêu thích, truy cập nhanh từ trang Dashboard cá nhân.

### 2.3 Bảng thành tích học tập (Student Dashboard - `/dashboard`)
- **Điểm Năng Lượng (Energy Points)**: Tích lũy điểm khi xem xong bài giảng, trả lời đúng câu hỏi trắc nghiệm và hoàn thành bài tập SGK.
- **Chuỗi ngày học liên tục (Learning Streak)**: Khích lệ học sinh duy trì thói quen học tập hàng ngày (Streak ngọn lửa cam).
- **Thống kê tiến độ trực quan**: Biểu đồ hình quạt hiển thị tỉ lệ bài học đã hoàn thành theo từng môn học (Toán, Vật lý, Hóa học...).

---

## 📖 3. PHÂN HỆ THƯ VIỆN SÁCH & E-READER STUDIO (`/books`)

Được thiết kế chuyên sâu dành cho việc nghiên cứu sách giáo khoa và tài liệu học tập K-12:

### 3.1 Ba chế độ đọc sách linh hoạt (Multi-Mode Reader)
1. **Chế độ Sách điện tử (Reader Mode)**:
   - Hiển thị nội dung sách theo dạng trang đôi hoặc trang đơn, tối ưu cho việc đọc sâu.
   - Hỗ trợ đổi phông chữ (Serif, Sans-serif, Monospace), tăng giảm cỡ chữ và chỉnh khoảng cách dòng.
   - Ba tông màu trang sách chống mỏi mắt: Nền Trắng tinh khôi, Nền Giấy Sepia cổ điển, Nền Tối Dark Mode.
2. **Chế độ Trình chiếu bài giảng (Lecture Presentation Mode)**:
   - Chuyển toàn bộ nội dung chương sách thành các slide bài giảng khổ lớn toàn màn hình.
   - Hỗ trợ giáo viên giảng bài trên lớp qua máy chiếu hoặc học sinh tự thuyết trình, chuyển slide bằng phím mũi tên `←` / `→` hoặc chuột.
3. **Chế độ Sơ đồ tư duy (Interactive Mindmap View)**:
   - Trực quan hóa cấu trúc bài học thành dạng cây sơ đồ tư duy (Mindmap).
   - Hiển thị rõ ranh giới giữa khái niệm cốt lõi, công thức nhánh và ví dụ thực tế.

### 3.2 Bộ công cụ tương tác trên trang sách
- **Đánh dấu màu (Color Highlighting)**: Bôi màu văn bản quan trọng với các màu sắc trực quan (Vàng, Xanh lục, Xanh lam, Hồng).
- **Ghi chú giấy dán (Sticky Notes)**: Đính kèm ghi chú suy nghĩ cá nhân tại từng mục của sách.
- **Bộ tra cứu công thức toán học chuẩn LaTeX (Formula Digest)**:
  - Bảng tổng hợp toàn bộ định lý, công thức toán/lý trong chương kèm ví dụ áp dụng cụ thể.
- **Đọc to trang sách bằng giọng nói (Text-to-Speech)**:
  - Tích hợp giọng đọc tiếng Việt truyền cảm, hỗ trợ học sinh tiểu học hoặc học sinh khiếm thị dễ dàng tiếp cận tri thức.
- **Tải lên tài liệu & giáo án riêng**:
  - Cho phép giáo viên tải các file tài liệu `.txt`, `.md` vào tủ sách để giảng dạy.

---

## 🤖 4. PHÂN HỆ TRỢ LÝ SOCRATIC AI 2.0 (SOCRATIC CHATBOT)

Trợ lý sư phạm AI vận hành 24/7 theo tiêu chuẩn Socratic của Khanmigo (Khan Academy) và Brilliant.org:

### 4.1 Năm chế độ sư phạm chuyên sâu (5 Pedagogical Modes)
1. **💡 Gợi ý từng bước (SOCRATIC)**:
   - Tuyệt đối không làm hộ hay đưa luôn đáp số cuối cùng.
   - Tuân thủ nguyên tắc *"Một bước mỗi lần"* (One step at a time): chỉ đưa ra 01 câu hỏi gợi mở tiếp theo để học sinh tự tư duy.
2. **🎓 Theo lớp học (GRADE_ADAPTED)**:
   - **Tiểu học (Lớp 1–5)**: Xưng "thầy/cô" - gọi "con", dùng hình ảnh que tính, cái kẹo, lát bánh pizza.
   - **THCS (Lớp 6–9)**: Xưng "thầy/cô" - gọi "em", giải thích logic, tìm BCNN, quy tắc đại số.
   - **THPT (Lớp 10–12)**: Dẫn dắt tư duy hệ thống, phân tích bản chất định lý và liên hệ đề thi tốt nghiệp THPT/Đại học.
3. **📝 Tạo bài luyện tập (PRACTICE)**:
   - Sinh câu hỏi trắc nghiệm tương tác bám sát nội dung đang học, có 4 đáp án chọn lựa, chấm điểm và thưởng Điểm Năng Lượng tức thì.
4. **🔍 Vì sao em sai? (ERROR_DIAGNOSIS)**:
   - Chẩn đoán chính xác điểm ngộ nhận (Misconception Diagnosis) khi học sinh tính sai (nhầm dấu, nhầm công thức lũy thừa...).
5. **📖 Căn cứ SGK & Video (CITE_LESSON)**:
   - Trích dẫn chính xác chương, tiết, trang sách giáo khoa GDPT 2018 và mốc thời gian video bài giảng làm căn cứ học thuật.

### 4.2 Các tính năng công nghệ vượt trội của AI
- **Động cơ Crawl SGK & Rào cản bảo vệ chủ đề (Strict Topic Guardrail)**:
  - Tự động crawl tri thức SGK và bài học hệ thống làm căn cứ trả lời.
  - Ngăn chặn hoàn toàn hiện tượng học sinh hỏi lan man về game, mạng xã hội, giải trí; lịch sự nhắc nhở học sinh quay lại bài học.
- **Trí nhớ ngữ cảnh nhiều lượt (Multi-turn Context Memory)**:
  - Ghi nhớ tối đa 6–8 lượt hội thoại trước đó, duy trì mạch tư duy liền mạch xuyên suốt buổi học.
- **Bộ đệm ngữ nghĩa Redis (Semantic Prompt Cache)**:
  - Tự động băm SHA-256 câu hỏi: nếu câu hỏi SGK đã có câu trả lời chuẩn, trả về ngay lập tức với **độ trễ 0ms và 0đ chi phí token API**.
- **Đánh giá phản hồi chất lượng RLHF (Thumbs Up / Thumbs Down)**:
  - Học sinh có thể đánh giá câu trả lời của AI hữu ích hay chưa hữu ích, dữ liệu được ghi nhận vào cơ sở dữ liệu để phục vụ tinh chỉnh mô hình.
- **Thẻ gợi ý phản hồi nhanh 1 chạm (Quick Reply Chips)**:
  - Đưa ra 4 lựa chọn phản hồi nhanh: *"💡 Thầy gợi ý bước tiếp theo"*, *"🔍 Em chưa rõ, giải thích kỹ hơn"*, *"📝 Cho em bài tập tương tự"*, *"✨ Em đã hiểu rồi"*.
- **Bảo vệ an toàn dữ liệu K-12 (PII Detection & Safety Filter)**:
  - Tự động phát hiện và chặn các tin nhắn chứa số điện thoại, số CCCD, địa chỉ email cá nhân hoặc các câu lệnh cố tình tấn công Prompt Injection / Jailbreak.
- **Hạn mức sử dụng thân thiện**:
  - Giới hạn 30 câu hỏi/ngày/học sinh tránh tình trạng lạm dụng phụ thuộc vào AI; thanh đếm ngược Cooldown 4 giây khích lệ học sinh đọc kĩ lời gợi ý.
- **Động cơ chuyển đổi linh hoạt (Cloud AI & Offline Fallback)**:
  - Hỗ trợ chuyển đổi mượt mà giữa Google Gemini, Groq LLaMA, OpenAI và Động cơ Gia sư Socratic Offline khi mất mạng.

---

## 🛠️ 5. PHÂN HỆ QUẢN TRỊ VIÊN & GIÁO VIÊN (ADMIN CMS - `/admin`)

Trung tâm điều hành và quản trị dữ liệu dành cho Ban Giám hiệu, Giáo viên và Quản trị viên hệ thống:

### 5.1 Bảng điều khiển phân tích số liệu thời gian thực (KPIs Analytics)
- Tổng số học sinh đã đăng ký và số tài khoản đang hoạt động.
- Tổng số bài giảng đã xuất bản và tỉ lệ hoàn thành bài học trung bình.
- Biểu đồ tăng trưởng người dùng mới theo tuần và tháng.

### 5.2 Quản lý nội dung chương trình học (Curriculum & Lesson CMS)
- Tạo mới, cập nhật, sắp xếp thứ tự hiển thị và xuất bản bài giảng.
- Quản lý video bài giảng thông qua liên kết Cloudflare R2.
- Quản lý ngân hàng câu hỏi trắc nghiệm kiểm tra tương ứng với từng bài học.

### 5.3 Bảng giám sát chi phí Token & Ngân sách AI (AI Token Monitoring)
- Theo dõi số lượng Token tiêu thụ trong ngày theo thời gian thực.
- Thống kê chi phí ước tính bằng USD đối với từng mô hình AI (Gemini, Groq, OpenAI).
- Quản lý và điều chỉnh hạn mức câu hỏi hàng ngày của học sinh.

### 5.4 Nhật ký kiểm toán bảo mật (Security Audit Logs)
- Ghi nhận chi tiết mọi hành vi quan trọng trên hệ thống: Ai thực hiện, thao tác gì (Đăng nhập, Tạo bài học, Đổi phân quyền, Xóa dữ liệu), vào thời điểm nào và từ địa chỉ IP nào.

### 5.5 Quản lý người dùng & Phân quyền RBAC
- Danh sách tài khoản người dùng kèm bộ lọc theo vai trò (`STUDENT`, `TEACHER`, `PARENT`, `ADMIN`).
- Khóa/mở khóa tài khoản khi phát hiện dấu hiệu vi phạm điều khoản học đường.

### 5.6 Kiểm tra sức khỏe hệ thống & Quản lý bộ đệm (System Health & Cache Purge)
- Kiểm tra trạng thái kết nối tức thời của PostgreSQL 17 và Redis In-Memory.
- Nút bấm **"Xóa sạch bộ đệm Redis (Purge Cache)"** giúp đồng bộ ngay lập tức các thay đổi về danh mục sách và bài giảng.

---

## 👨‍👩‍👧 6. PHÂN HỆ PHỤ HUYNH (PARENT PORTAL)

Được thiết kế nhằm kết nối chặt chẽ giữa gia đình và nhà trường:
- **Theo dõi tiến độ học tập**: Xem biểu đồ thời lượng học tập trong tuần của con em mình.
- **Báo cáo tương tác với Gia sư AI**: Xem số lượng câu hỏi con đã hỏi, các chủ đề con quan tâm và những bài tập con thường làm sai.
- **Nhận diện điểm mạnh & điểm yếu**: Giúp phụ huynh nắm bắt môn học con đang học tốt và chủ đề con cần hỗ trợ thêm mà không gây áp lực.

---

## 🌐 7. PHÂN HỆ TRANG THÔNG TIN CÔNG CỘNG (PUBLIC PAGES)

- **Trang chủ (`/`)**: Trình diễn tổng quan nền tảng, các môn học tiêu biểu, danh mục bài giảng mới nhất và lối vào nhanh các tính năng.
- **Trang Bài viết sư phạm (`/articles`)**: Kho bài viết chia sẻ phương pháp học tập hiệu quả, mẹo ôn thi THPT Quốc gia, cẩm nang đồng hành cùng con của các chuyên gia giáo dục.
- **Trang Giới thiệu (`/about`)**: Giới thiệu sứ mệnh, tầm nhìn và đội ngũ sáng lập DMKLab Education.
- **Trang Liên hệ (`/contact`)**: Biểu mẫu gửi câu hỏi tư vấn tuyển sinh, đóng góp ý kiến và thông tin hỗ trợ kỹ thuật 24/7.
