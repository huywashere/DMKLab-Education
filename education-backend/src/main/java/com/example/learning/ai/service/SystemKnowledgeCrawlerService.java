package com.example.learning.ai.service;

import com.example.learning.ai.dto.AiChatDto;
import com.example.learning.content.entity.Lesson;
import com.example.learning.content.repository.LessonRepository;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Động cơ Crawl & Lập chỉ mục Tài liệu Hệ thống (System Knowledge Crawler & Topic Grounding Engine)
 * 1. Thu thập & lập chỉ mục giáo trình SGK chuẩn hóa K-12 (Toán, Lý, Hóa, Anh theo GDPT 2018).
 * 2. Crawl cơ sở dữ liệu bài giảng từ LessonRepository.
 * 3. Quét và trích xuất tài liệu dạng file (.txt, .md, .json) từ thư mục lưu trữ hệ thống.
 * 4. Đối sánh ngữ nghĩa (Semantic Keyword Matcher) tìm đoạn kiến thức & công thức LaTeX chuẩn.
 * 5. Thiết lập rào cản bảo vệ chủ đề (Strict Topic Guardrail) ngăn chặn AI nói lan man hoặc lạc đề.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SystemKnowledgeCrawlerService {

    private final LessonRepository lessonRepository;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KnowledgeChunk {
        private String id;
        private String sourceType; // SGK_TEXTBOOK, LESSON_DB, SYSTEM_FILE
        private String sourceName; // e.g. "SGK Toán 10 - Bộ Cánh Diều"
        private Integer gradeLevel; // 1 to 12
        private String subject; // "Toán học", "Vật lý", "Hóa học", "Tiếng Anh"
        private String chapterTitle;
        private String sectionTitle;
        private String calloutType; // "DEFINITION", "THEOREM", "FORMULA", "EXAMPLE", "PRACTICE"
        private String content;
        private String formulaLatex;
        private List<String> keywords;
        private String targetUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KnowledgeCrawlResult {
        private boolean onTopic;
        private double confidenceScore;
        private List<KnowledgeChunk> matchedChunks;
        private String groundedPromptKnowledge;
        private List<AiChatDto.CitationDto> citations;
        private String offTopicRedirectAdvice;
        private String primaryFormula;
    }

    // Danh mục tri thức hệ thống được lập chỉ mục trong bộ nhớ (In-Memory Inverted Knowledge Index)
    private final List<KnowledgeChunk> indexedKnowledgeBase = new ArrayList<>();

    // Từ khóa cảnh báo lạc đề / phi học thuật K-12
    private static final List<String> OFF_TOPIC_KEYWORDS = List.of(
            "liên quân", "lien quan", "free fire", "roblox", "minecraft", "fifa", "pubg",
            "chơi game", "choi game", "game mobile", "nạp thẻ", "nap the", "rank thách đấu",
            "người yêu", "crush", "hẹn hò", "bạn gái", "bạn trai", "thất tình",
            "nấu ăn", "món ngon", "cách làm bánh", "nấu phở", "trà sữa",
            "giá bitcoin", "tiền ảo", "crypto", "chứng khoán", "cổ phiếu", "lô đề", "xổ số",
            "bóng đá ngoại hạng", "chuyển nhượng cầu thủ", "scandal", "showbiz", "ca sĩ",
            "hack facebook", "hack pass", "bẻ khóa wifi", "cheat code"
    );

    @PostConstruct
    public void initAndCrawlKnowledgeBase() {
        log.info("[KNOWLEDGE_CRAWLER] Bắt đầu khởi động bộ thu thập & lập chỉ mục tri thức hệ thống...");
        indexedKnowledgeBase.clear();

        // 1. Nạp giáo trình SGK K-12 chuẩn hóa (GDPT 2018)
        loadStandardK12Textbooks();

        // 2. Crawl cơ sở dữ liệu bài học hệ thống (Lesson DB Crawl)
        crawlDatabaseLessons();

        // 3. Quét các file tri thức bổ sung trong hệ thống (System Docs Scan)
        crawlSystemFiles();

        log.info("[KNOWLEDGE_CRAWLER] Đã lập chỉ mục thành công {} phân đoạn tri thức SGK & tài liệu hệ thống.", indexedKnowledgeBase.size());
    }

    /**
     * Crawl bài học trực tiếp từ cơ sở dữ liệu hệ thống (LessonRepository)
     */
    public synchronized void crawlDatabaseLessons() {
        try {
            List<Lesson> lessons = lessonRepository.findAll();
            int count = 0;
            for (Lesson lesson : lessons) {
                if (lesson.isPublished() && lesson.getTitle() != null && !lesson.getTitle().isBlank()) {
                    String subjName = (lesson.getSubject() != null && lesson.getSubject().getName() != null)
                            ? lesson.getSubject().getName()
                            : "Toán học";

                    String desc = (lesson.getDescription() != null && !lesson.getDescription().isBlank())
                            ? lesson.getDescription()
                            : "Bài giảng chuẩn hóa trong chương trình học DMKLab Education.";

                    KnowledgeChunk chunk = KnowledgeChunk.builder()
                            .id("db-lesson-" + lesson.getId())
                            .sourceType("LESSON_DB")
                            .sourceName("Bài học hệ thống DMKLab: " + lesson.getTitle())
                            .subject(subjName)
                            .gradeLevel(10) // Mặc định phổ thông
                            .chapterTitle("Chương trình bài giảng trực tuyến")
                            .sectionTitle(lesson.getTitle())
                            .calloutType("LESSON_CONTENT")
                            .content(desc)
                            .keywords(extractSearchKeywords(lesson.getTitle() + " " + desc))
                            .targetUrl("/dashboard?lessonId=" + lesson.getId())
                            .build();

                    indexedKnowledgeBase.add(chunk);
                    count++;
                }
            }
            log.info("[KNOWLEDGE_CRAWLER] Đã crawl {} bài học từ Database vào bộ chỉ mục AI.", count);
        } catch (Exception ex) {
            log.warn("[KNOWLEDGE_CRAWLER_WARN] Không thể crawl bài học từ DB: {}", ex.getMessage());
        }
    }

    /**
     * Quét và trích xuất tài liệu từ hệ thống tệp lưu trữ (Local / Resources / Custom docs)
     */
    public void crawlSystemFiles() {
        try {
            Path knowledgeDir = Path.of("data", "knowledge");
            if (Files.exists(knowledgeDir) && Files.isDirectory(knowledgeDir)) {
                try (var stream = Files.walk(knowledgeDir, 2)) {
                    stream.filter(Files::isRegularFile)
                          .filter(p -> p.toString().endsWith(".md") || p.toString().endsWith(".txt"))
                          .forEach(this::indexLocalDocumentFile);
                }
            }
        } catch (Exception ex) {
            log.debug("[KNOWLEDGE_CRAWLER] Không có thư mục data/knowledge ngoài (sử dụng tài liệu chuẩn đóng gói sẵn).");
        }
    }

    private void indexLocalDocumentFile(Path filePath) {
        try {
            String content = Files.readString(filePath);
            String fileName = filePath.getFileName().toString();
            String[] paragraphs = content.split("(\\r?\\n){2,}");
            for (int i = 0; i < paragraphs.length; i++) {
                String p = paragraphs[i].trim();
                if (p.length() > 30) {
                    indexedKnowledgeBase.add(KnowledgeChunk.builder()
                            .id("file-" + fileName + "-" + i)
                            .sourceType("SYSTEM_FILE")
                            .sourceName("Tài liệu hệ thống: " + fileName)
                            .gradeLevel(10)
                            .subject("Toán học")
                            .chapterTitle("Tài liệu bổ trợ")
                            .sectionTitle(fileName + " (Đoạn " + (i + 1) + ")")
                            .calloutType("REFERENCE_DOC")
                            .content(p)
                            .keywords(extractSearchKeywords(p))
                            .targetUrl("/books")
                            .build());
                }
            }
        } catch (Exception ex) {
            log.warn("[KNOWLEDGE_CRAWLER_WARN] Lỗi đọc file tài liệu {}: {}", filePath, ex.getMessage());
        }
    }

    /**
     * Crawl và đối sánh tri thức hệ thống cho câu hỏi của học sinh
     */
    public KnowledgeCrawlResult crawlAndGroundKnowledge(
            String rawMessage,
            Integer gradeLevel,
            String subject,
            String lessonTitle,
            String customKnowledge) {

        if (rawMessage == null || rawMessage.isBlank()) {
            return KnowledgeCrawlResult.builder()
                    .onTopic(true)
                    .confidenceScore(1.0)
                    .matchedChunks(Collections.emptyList())
                    .groundedPromptKnowledge("")
                    .citations(Collections.emptyList())
                    .build();
        }

        String msgLower = rawMessage.toLowerCase().trim();
        String contextLesson = lessonTitle != null ? lessonTitle : "Kiến thức bài học K-12";
        String currentSubj = subject != null ? subject : "Toán học";
        int currentGrade = (gradeLevel != null && gradeLevel >= 1 && gradeLevel <= 12) ? gradeLevel : 10;

        // 1. Kiểm tra rào cản chủ đề (Strict Topic Guardrail)
        boolean isOffTopicStray = checkIsOffTopicStray(msgLower, contextLesson, currentSubj);

        // 2. Tìm kiếm và chấm điểm các đoạn tri thức khớp nhất trong bộ chỉ mục
        List<ScoredChunk> scoredList = new ArrayList<>();
        List<String> queryTokens = extractSearchKeywords(rawMessage + " " + contextLesson);

        for (KnowledgeChunk chunk : indexedKnowledgeBase) {
            double score = computeMatchScore(chunk, queryTokens, currentGrade, currentSubj, contextLesson);
            if (score > 12.0) {
                scoredList.add(new ScoredChunk(chunk, score));
            }
        }

        scoredList.sort((a, b) -> Double.compare(b.score, a.score));
        List<KnowledgeChunk> topChunks = scoredList.stream()
                .limit(3)
                .map(sc -> sc.chunk)
                .collect(Collectors.toList());

        // Nếu người dùng có upload tài liệu riêng (Custom Knowledge), ưu tiên thêm vào
        StringBuilder promptKnowledge = new StringBuilder();
        if (customKnowledge != null && !customKnowledge.isBlank()) {
            promptKnowledge.append("=== TÀI LIỆU RIÊNG DO HỌC SINH/GIÁO VIÊN NẠP TRỰC TIẾP ===\n")
                    .append(customKnowledge.trim())
                    .append("\n\n");
        }

        // Tạo trích dẫn SGK chuẩn (Citations)
        List<AiChatDto.CitationDto> citations = new ArrayList<>();
        String primaryFormula = null;

        if (!topChunks.isEmpty()) {
            promptKnowledge.append("=== TÀI LIỆU SGK & GIÁO TRÌNH CHUẨN ĐƯỢC CRAWL TỰ ĐỘNG TỪ HỆ THỐNG ===\n");
            for (int i = 0; i < topChunks.size(); i++) {
                KnowledgeChunk c = topChunks.get(i);
                promptKnowledge.append(String.format("[%d] Nguồn: %s - %s\n", (i + 1), c.getSourceName(), c.getChapterTitle()))
                        .append(String.format("Tiết mục: %s [%s]\n", c.getSectionTitle(), c.getCalloutType()))
                        .append(String.format("Nội dung cốt lõi: %s\n", c.getContent()));

                if (c.getFormulaLatex() != null && !c.getFormulaLatex().isBlank()) {
                    promptKnowledge.append(String.format("Công thức SGK chuẩn: $%s$\n", c.getFormulaLatex()));
                    if (primaryFormula == null) primaryFormula = c.getFormulaLatex();
                }
                promptKnowledge.append("\n");

                citations.add(AiChatDto.CitationDto.builder()
                        .sourceBook(c.getSourceName())
                        .chapter(c.getChapterTitle())
                        .title(c.getSectionTitle())
                        .targetUrl(c.getTargetUrl())
                        .build());
            }
        }

        // Định hình thông báo điều hướng nếu học sinh hỏi lạc đề
        String offTopicRedirect = null;
        if (isOffTopicStray) {
            offTopicRedirect = String.format(
                    "Thầy/cô thấy câu hỏi của em đang chưa liên quan đến bài học '%s' (môn %s). Trong giờ học này, chúng mình hãy cùng tập trung làm chủ kiến thức bài học trước nhé! Em có muốn thầy gợi ý câu hỏi liên quan đến '%s' không?",
                    contextLesson, currentSubj, contextLesson);
        }

        return KnowledgeCrawlResult.builder()
                .onTopic(!isOffTopicStray)
                .confidenceScore(topChunks.isEmpty() ? 0.4 : 0.95)
                .matchedChunks(topChunks)
                .groundedPromptKnowledge(promptKnowledge.toString())
                .citations(citations)
                .offTopicRedirectAdvice(offTopicRedirect)
                .primaryFormula(primaryFormula)
                .build();
    }

    /**
     * Kiểm tra xem câu hỏi có bị lạc đề hoàn toàn khỏi bối cảnh học tập hay không
     */
    private boolean checkIsOffTopicStray(String msgLower, String lessonTitle, String subject) {
        // Kiểm tra danh sách từ khóa cấm / phi học thuật
        for (String badWord : OFF_TOPIC_KEYWORDS) {
            if (msgLower.contains(badWord)) {
                return true;
            }
        }

        // Nếu câu hỏi rất ngắn dạng chào hỏi thông thường ("chào thầy", "em chào cô", "bắt đầu thôi") thì không xem là lạc đề
        if (msgLower.matches(".*(chào|hello|hi thầy|hi cô|bắt đầu|sẵn sàng|cảm ơn|dạ|vâng).*") && msgLower.length() < 30) {
            return false;
        }

        // Kiểm tra xem câu hỏi có chứa bất kỳ từ khóa nào liên quan đến môn học hoặc bài giảng không
        List<String> contextKeywords = extractSearchKeywords(lessonTitle + " " + subject);
        boolean hasContextOverlap = contextKeywords.stream().anyMatch(msgLower::contains);

        // Nếu hỏi điều gì đó hoàn toàn không dính líu đến trường lớp và độ dài > 20 ký tự
        if (!hasContextOverlap && msgLower.length() > 50) {
            // Kiểm tra xem có chứa từ vựng toán học / khoa học cơ bản không
            boolean isAcademicTerm = msgLower.matches(".*(tính|giải|chứng minh|tìm x|nghiệm|phương trình|hàm số|vecto|vectơ|đạo hàm|tích phân|diện tích|chu vi|tam giác|hình vuông|vận tốc|gia tốc|lực|hóa học|nguyên tử|câu|thì|ngữ pháp|bài tập|đáp án|công thức).*");
            if (!isAcademicTerm) {
                return true;
            }
        }

        return false;
    }

    private double computeMatchScore(KnowledgeChunk chunk, List<String> queryTokens, int grade, String subject, String lessonContext) {
        double score = 0.0;

        // Trùng lớp học (+20 điểm)
        if (chunk.getGradeLevel() != null && chunk.getGradeLevel() == grade) {
            score += 20.0;
        }

        // Trùng môn học (+25 điểm)
        if (chunk.getSubject() != null && subject != null &&
                normalizeVietnamese(chunk.getSubject()).contains(normalizeVietnamese(subject))) {
            score += 25.0;
        }

        // Khớp từ khóa trong tên bài học (+30 điểm)
        String normLesson = normalizeVietnamese(lessonContext);
        String normChapter = normalizeVietnamese(chunk.getChapterTitle());
        String normSection = normalizeVietnamese(chunk.getSectionTitle());
        if (normChapter.contains(normLesson) || normLesson.contains(normChapter)) {
            score += 30.0;
        }
        if (normSection.contains(normLesson) || normLesson.contains(normSection)) {
            score += 35.0;
        }

        // Khớp các từ khóa câu hỏi của học sinh
        String fullChunkText = normalizeVietnamese(chunk.getSectionTitle() + " " + chunk.getContent() + " " + (chunk.getFormulaLatex() != null ? chunk.getFormulaLatex() : ""));
        for (String token : queryTokens) {
            String normToken = normalizeVietnamese(token);
            if (normToken.length() >= 2 && fullChunkText.contains(normToken)) {
                score += 8.0;
            }
        }

        return score;
    }

    private List<String> extractSearchKeywords(String text) {
        if (text == null) return Collections.emptyList();
        String clean = text.replaceAll("[^\\p{L}\\p{Nd}\\s]", " ").toLowerCase();
        String[] words = clean.split("\\s+");
        return Arrays.stream(words)
                .filter(w -> w.length() >= 2 && !isVietnameseStopword(w))
                .distinct()
                .collect(Collectors.toList());
    }

    private boolean isVietnameseStopword(String word) {
        return List.of("và", "là", "của", "cho", "các", "những", "được", "trong", "với", "có", "này", "đó", "một", "về", "đến", "khi", "lúc", "như", "thì", "mà", "ở").contains(word);
    }

    private String normalizeVietnamese(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase().replace("đ", "d");
    }

    private record ScoredChunk(KnowledgeChunk chunk, double score) {}

    /**
     * Nạp kho dữ liệu SGK K-12 chuẩn hóa trực tiếp vào bộ chỉ mục
     */
    private void loadStandardK12Textbooks() {
        // ==========================================
        // 1. TOÁN 10 CÁNH DIỀU (ĐẠI SỐ & HÌNH HỌC)
        // ==========================================
        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t10-sec-1-1")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 10 Tập 1 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Toán học")
                .chapterTitle("Chương I: Mệnh Đề và Tập Hợp")
                .sectionTitle("§1. Mệnh đề toán học và Mệnh đề chứa biến")
                .calloutType("DEFINITION")
                .content("Mệnh đề toán học là một khẳng định có tính chất ĐÚNG hoặc SAI dứt khoát. Một mệnh đề không thể vừa đúng vừa sai. Khẳng định chứa biến P(x) trở thành mệnh đề khi thay x bằng một giá trị cụ thể trong tập xác định.")
                .formulaLatex("P(x) \\quad (x \\in X)")
                .keywords(List.of("mệnh đề", "mệnh đề toán học", "đúng sai", "mệnh đề chứa biến", "chân lý"))
                .targetUrl("/books?id=toan-10-canh-dieu&chap=1")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t10-sec-1-2")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 10 Tập 1 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Toán học")
                .chapterTitle("Chương I: Mệnh Đề và Tập Hợp")
                .sectionTitle("§2. Mệnh đề phủ định và Mệnh đề kéo theo (P => Q)")
                .calloutType("THEOREM")
                .content("Cho mệnh đề P. Phủ định của P là P̄, đúng khi P sai và sai khi P đúng. Mệnh đề kéo theo 'Nếu P thì Q' (ký hiệu P => Q) chỉ sai khi P đúng mà Q sai. P là điều kiện đủ để có Q; Q là điều kiện cần để có P.")
                .formulaLatex("P \\Rightarrow Q \\quad \\text{(P là điều kiện đủ, Q là điều kiện cần)}")
                .keywords(List.of("mệnh đề phủ định", "phủ định", "mệnh đề kéo theo", "điều kiện cần", "điều kiện đủ", "tương đương"))
                .targetUrl("/books?id=toan-10-canh-dieu&chap=1")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t10-sec-1-3")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 10 Tập 1 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Toán học")
                .chapterTitle("Chương I: Mệnh Đề và Tập Hợp")
                .sectionTitle("§3. Các phép toán trên tập hợp (Giao, Hợp, Hiệu)")
                .calloutType("FORMULA")
                .content("Giao của hai tập hợp A và B (A ∩ B) gồm các phần tử vừa thuộc A, vừa thuộc B. Hợp (A ∪ B) gồm các phần tử thuộc A hoặc thuộc B. Hiệu (A \\ B) gồm các phần tử thuộc A nhưng không thuộc B. Công thức đếm: n(A ∪ B) = n(A) + n(B) - n(A ∩ B).")
                .formulaLatex("n(A \\cup B) = n(A) + n(B) - n(A \\cap B), \\quad A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}")
                .keywords(List.of("tập hợp", "phép toán tập hợp", "giao", "hợp", "hiệu", "phần bù", "tập con"))
                .targetUrl("/books?id=toan-10-canh-dieu&chap=1")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t10-sec-2-1")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 10 Tập 1 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Toán học")
                .chapterTitle("Chương II: Bất Phương Trình Bậc Nhất Hai Ẩn")
                .sectionTitle("§1. Bất phương trình bậc nhất hai ẩn và Miền nghiệm Oxy")
                .calloutType("DEFINITION")
                .content("Bất phương trình bậc nhất hai ẩn có dạng ax + by <= c (với a^2 + b^2 khác 0). Miền nghiệm trên mặt phẳng tọa độ Oxy là nửa mặt phẳng có bờ là đường thẳng d: ax + by = c. Để xác định miền nghiệm, ta lấy thử điểm O(0; 0) nếu d không đi qua gốc tọa độ.")
                .formulaLatex("ax + by \\le c \\quad (a^2 + b^2 \\neq 0)")
                .keywords(List.of("bất phương trình", "hai ẩn", "miền nghiệm", "mặt phẳng tọa độ", "oxy", "quy hoạch tuyến tính"))
                .targetUrl("/books?id=toan-10-canh-dieu&chap=2")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t10-sec-3-1")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 10 Tập 1 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Toán học")
                .chapterTitle("Chương III: Hệ Thức Lượng Trong Tam Giác")
                .sectionTitle("§1. Định lý Côsin trong tam giác bất kỳ")
                .calloutType("THEOREM")
                .content("Trong tam giác ABC, bình phương một cạnh bằng tổng bình phương hai cạnh kia trừ hai lần tích của chúng với côsin góc xen giữa: a^2 = b^2 + c^2 - 2bc*cos(A). Hệ quả tính góc: cos(A) = (b^2 + c^2 - a^2) / (2bc).")
                .formulaLatex("a^2 = b^2 + c^2 - 2bc \\cos A, \\quad \\cos A = \\frac{b^2 + c^2 - a^2}{2bc}")
                .keywords(List.of("định lý côsin", "cosin", "tam giác", "tính cạnh", "tính góc", "hệ thức lượng"))
                .targetUrl("/books?id=toan-10-canh-dieu&chap=3")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t10-sec-3-2")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 10 Tập 1 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Toán học")
                .chapterTitle("Chương III: Hệ Thức Lượng Trong Tam Giác")
                .sectionTitle("§2. Định lý Sin và Bán kính đường tròn ngoại tiếp R")
                .calloutType("THEOREM")
                .content("Trong tam giác ABC với R là bán kính đường tròn ngoại tiếp: a / sin(A) = b / sin(B) = c / sin(C) = 2R. Định lý Sin cho phép tính bán kính R hoặc cạnh đối diện khi biết một góc và cạnh tương ứng.")
                .formulaLatex("\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R")
                .keywords(List.of("định lý sin", "bán kính ngoại tiếp", "đường tròn ngoại tiếp", "giải tam giác"))
                .targetUrl("/books?id=toan-10-canh-dieu&chap=3")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t10-sec-3-3")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 10 Tập 1 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Toán học")
                .chapterTitle("Chương III: Hệ Thức Lượng Trong Tam Giác")
                .sectionTitle("§3. Công thức Hê-rông (Heron) và Các công thức diện tích tam giác")
                .calloutType("FORMULA")
                .content("Với nửa chu vi p = (a+b+c)/2: Diện tích tam giác S = sqrt[p(p-a)(p-b)(p-c)] = 1/2 ab*sin(C) = abc/(4R) = p*r. Bán kính đường tròn nội tiếp r = S / p.")
                .formulaLatex("S = \\sqrt{p(p-a)(p-b)(p-c)} = \\frac{1}{2}ab\\sin C = \\frac{abc}{4R} = p \\cdot r")
                .keywords(List.of("hê-rông", "heron", "diện tích tam giác", "bán kính nội tiếp", "nửa chu vi"))
                .targetUrl("/books?id=toan-10-canh-dieu&chap=3")
                .build());

        // ==========================================
        // 2. TOÁN 5 KẾT NỐI TRI THỨC (TIỂU HỌC)
        // ==========================================
        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t5-sec-1-1")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 5 - Bộ Kết Nối Tri Thức")
                .gradeLevel(5)
                .subject("Toán học")
                .chapterTitle("Chương I: Ôn Tập và Bổ Sung Về Phân Số")
                .sectionTitle("§1. Khái niệm phân số và Tính chất cơ bản")
                .calloutType("DEFINITION")
                .content("Phân số gồm Tử số (số phần được lấy) viết trên dấu gạch ngang, và Mẫu số (số phần bằng nhau chia ra, mẫu số phải khác 0) viết dưới dấu gạch ngang. Tính chất cơ bản: Nhân hoặc chia cả tử và mẫu với cùng số tự nhiên khác 0 thì giá trị phân số không đổi.")
                .formulaLatex("\\frac{a}{b} = \\frac{a \\times m}{b \\times m} = \\frac{a : n}{b : n} \\quad (m, n \\neq 0)")
                .keywords(List.of("phân số", "tử số", "mẫu số", "tính chất phân số", "toán 5", "chia bánh"))
                .targetUrl("/books?id=toan-5-ket-noi&chap=1")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t5-sec-1-2")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 5 - Bộ Kết Nối Tri Thức")
                .gradeLevel(5)
                .subject("Toán học")
                .chapterTitle("Chương I: Ôn Tập và Bổ Sung Về Phân Số")
                .sectionTitle("§2. Rút gọn phân số và Quy đồng mẫu số")
                .calloutType("PRACTICE")
                .content("Phân số tối giản là phân số mà tử số và mẫu số không cùng chia hết cho số tự nhiên nào lớn hơn 1. Muốn rút gọn phân số, chia cả tử và mẫu cho ước chung lớn hơn 1. Muốn quy đồng mẫu số hai phân số, tìm Mẫu số chung (MSC), lấy MSC chia cho từng mẫu số để tìm thừa số phụ rồi nhân cả tử và mẫu với thừa số phụ đó.")
                .formulaLatex("\\frac{a}{b} \\xrightarrow{\\text{rút gọn}} \\frac{a : d}{b : d} \\quad (d = \\text{ƯCLN}(a,b))")
                .keywords(List.of("rút gọn phân số", "tối giản", "quy đồng", "mẫu số chung", "thừa số phụ"))
                .targetUrl("/books?id=toan-5-ket-noi&chap=1")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("t5-sec-2-1")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Toán 5 - Bộ Kết Nối Tri Thức")
                .gradeLevel(5)
                .subject("Toán học")
                .chapterTitle("Chương III: Hình Học Đo Lường")
                .sectionTitle("§1. Diện tích hình tam giác, hình thang và hình tròn")
                .calloutType("FORMULA")
                .content("Diện tích hình tam giác: S = (đáy x chiều cao) / 2. Diện tích hình thang: S = [(đáy lớn + đáy bé) x chiều cao] / 2. Chu vi hình tròn: C = d x 3.14 (hoặc 2 x r x 3.14). Diện tích hình tròn: S = r x r x 3.14.")
                .formulaLatex("S_{\\Delta} = \\frac{a \\times h}{2}, \\quad S_{\\text{thang}} = \\frac{(a+b) \\times h}{2}, \\quad S_{\\bigcirc} = r \\times r \\times 3{,}14")
                .keywords(List.of("diện tích tam giác", "diện tích hình thang", "hình tròn", "chu vi", "bán kính", "đường kính"))
                .targetUrl("/books?id=toan-5-ket-noi&chap=3")
                .build());

        // ==========================================
        // 3. VẬT LÝ 10 CÁNH DIỀU
        // ==========================================
        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("vl10-sec-1-1")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Vật Lý 10 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Vật lý")
                .chapterTitle("Chương I: Mô Tả Chuyển Động")
                .sectionTitle("§1. Độ dịch chuyển, Vận tốc và Gia tốc")
                .calloutType("DEFINITION")
                .content("Độ dịch chuyển d là vectơ nối vị trí đầu và vị trí cuối của vật. Vận tốc v = d / t (vectơ). Gia tốc a = (v - v0) / t đặc trưng cho tốc độ thay đổi vận tốc theo thời gian. Khi vật chuyển động nhanh dần đều thì a và v cùng dấu (a*v > 0); khi chậm dần đều thì a và v trái dấu (a*v < 0).")
                .formulaLatex("v = \\frac{d}{t}, \\quad a = \\frac{\\Delta v}{\\Delta t} = \\frac{v - v_0}{t}")
                .keywords(List.of("độ dịch chuyển", "vận tốc", "gia tốc", "nhanh dần đều", "chậm dần đều", "vật lý 10"))
                .targetUrl("/books?id=vat-ly-10-canh-dieu&chap=1")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("vl10-sec-1-2")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Vật Lý 10 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Vật lý")
                .chapterTitle("Chương I: Mô Tả Chuyển Động")
                .sectionTitle("§2. Ba phương trình chuyển động thẳng biến đổi đều")
                .calloutType("FORMULA")
                .content("Phương trình vận tốc: v = v0 + at. Phương trình độ dịch chuyển: d = v0*t + 1/2 a*t^2. Công thức độc lập thời gian liên hệ vận tốc, gia tốc và độ dịch chuyển: v^2 - v0^2 = 2ad.")
                .formulaLatex("v = v_0 + at, \\quad d = v_0 t + \\frac{1}{2} a t^2, \\quad v^2 - v_0^2 = 2ad")
                .keywords(List.of("công thức độc lập thời gian", "phương trình chuyển động", "quãng đường", "vận tốc ban đầu"))
                .targetUrl("/books?id=vat-ly-10-canh-dieu&chap=1")
                .build());

        indexedKnowledgeBase.add(KnowledgeChunk.builder()
                .id("vl10-sec-2-1")
                .sourceType("SGK_TEXTBOOK")
                .sourceName("SGK Vật Lý 10 - Bộ Cánh Diều")
                .gradeLevel(10)
                .subject("Vật lý")
                .chapterTitle("Chương II: Động Lực Học")
                .sectionTitle("§1. Ba Định Luật Newton Về Chuyển Động")
                .calloutType("THEOREM")
                .content("Định luật 1 Newton (Quán tính): Nếu một vật không chịu tác dụng của lực nào hoặc chịu tác dụng của các lực cân bằng, vật đang đứng yên sẽ tiếp tục đứng yên, đang chuyển động sẽ tiếp tục chuyển động thẳng đều. Định luật 2: Gia tốc của một vật cùng hướng với lực tác dụng, vectơ a = vectơ F / m (F = m*a). Định luật 3: Trong mọi trường hợp, khi vật A tác dụng lên vật B một lực, vật B cũng tác dụng lại vật A một lực cùng phương, ngược chiều, cùng độ lớn (F_AB = - F_BA).")
                .formulaLatex("\\vec{F} = m\\vec{a}, \\quad \\vec{F}_{AB} = -\\vec{F}_{BA}")
                .keywords(List.of("định luật newton", "quán tính", "lực", "khối lượng", "gia tốc", "phản lực"))
                .targetUrl("/books?id=vat-ly-10-canh-dieu&chap=2")
                .build());
    }
}
