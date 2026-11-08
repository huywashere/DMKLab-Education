export interface BookFormula {
  id: string;
  name: string;
  latex: string;
  meaning: string;
  example: string;
}

export interface BookExercise {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  solution: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface BookSection {
  id: string;
  title: string;
  calloutType?: "DEFINITION" | "THEOREM" | "EXAMPLE" | "NOTE" | "PRACTICE";
  content: string[];
  highlightNotes?: string;
  formula?: string;
}

export interface BookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  sections: BookSection[];
  formulas: BookFormula[];
  exercises: BookExercise[];
  mindmap: {
    root: string;
    branches: { name: string; items: string[] }[];
  };
  summary: string[];
}

export interface Textbook {
  id: string;
  title: string;
  shortTitle: string;
  grade: string;
  gradeNumber: number;
  subject: string;
  publisher: string;
  edition: string;
  color: string;
  accentBg: string;
  borderColor: string;
  description: string;
  totalChapters: number;
  totalPages: number;
  author: string;
  chapters: BookChapter[];
}

export const K12_SAMPLE_BOOKS: Textbook[] = [
  {
    id: "toan-10-canh-dieu",
    title: "Sách Giáo Khoa Toán Học 10 - Tập 1 (Đại Số & Hình Học)",
    shortTitle: "Toán 10 - Tập 1",
    grade: "Lớp 10",
    gradeNumber: 10,
    subject: "Toán học",
    publisher: "NXB Giáo Dục Việt Nam - Bộ Cánh Diều",
    edition: "Chương trình Giáo dục Phổ thông 2018",
    color: "#1865F2",
    accentBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/30",
    description: "Tài liệu SGK Toán 10 chuẩn hóa kiến thức Mệnh đề, Tập hợp, Bất phương trình và Hệ thức lượng trong tam giác.",
    totalChapters: 4,
    totalPages: 128,
    author: "GS.TSKH. Đỗ Đức Thái (Tổng Chủ biên) & Ban Cố vấn Toán K-12",
    chapters: [
      {
        id: "chap-t10-1",
        chapterNumber: 1,
        title: "Chương I: Mệnh Đề và Tập Hợp",
        subtitle: "Nền tảng logic toán học và các phép toán giao, hợp, hiệu",
        summary: [
          "Mệnh đề toán học là một khẳng định đúng hoặc sai, không thể vừa đúng vừa sai.",
          "Mệnh đề phủ định của P là ký hiệu P̄, đúng khi P sai và sai khi P đúng.",
          "Tập hợp con: A ⊂ B khi và chỉ khi mọi phần tử của A đều thuộc B.",
          "Các phép toán: Giao (A ∩ B), Hợp (A ∪ B), Hiệu (A \\ B) và Phần bù C_E(A)."
        ],
        sections: [
          {
            id: "sec-1-1",
            title: "§1. Mệnh đề toán học và Mệnh đề chứa biến",
            calloutType: "DEFINITION",
            content: [
              "Trong đời sống, ta thường gặp nhiều câu nói khẳng định hoặc nghi vấn. Tuy nhiên, trong toán học, chỉ những khẳng định có tính chất ĐÚNG hoặc SAI dứt khoát mới được gọi là một MỆNH ĐỀ TOÁN HỌC.",
              "Ví dụ 1: 'Số 17 là một số nguyên tố' là mệnh đề đúng.",
              "Ví dụ 2: 'Tam giác đều có 4 cạnh' là mệnh đề sai.",
              "Câu cảm thán 'Hôm nay trời đẹp quá!' hoặc câu hỏi 'Bạn có thích học toán không?' không phải là mệnh đề toán học vì không thể xác định giá trị chân lý đúng/sai khách quan."
            ]
          },
          {
            id: "sec-1-2",
            title: "§2. Mệnh đề phủ định và Mệnh đề kéo theo (P ⇒ Q)",
            calloutType: "THEOREM",
            content: [
              "Cho mệnh đề P. Mệnh đề 'Không phải P' được gọi là mệnh đề phủ định của P, ký hiệu là P̄. Nếu P đúng thì P̄ sai; nếu P sai thì P̄ đúng.",
              "Mệnh đề kéo theo có dạng 'Nếu P thì Q', ký hiệu P ⇒ Q. Mệnh đề này chỉ sai khi P đúng mà Q lại sai. Khi P ⇒ Q đúng, ta nói P là điều kiện đủ để có Q, và Q là điều kiện cần để có P."
            ],
            formula: "P \\Rightarrow Q \\quad \\text{(P là điều kiện đủ, Q là điều kiện cần)}"
          },
          {
            id: "sec-1-3",
            title: "§3. Tập hợp và Các phép toán trên tập hợp",
            calloutType: "EXAMPLE",
            content: [
              "Tập hợp là một khái niệm cơ bản của toán học. Ta viết x ∈ A để chỉ phần tử x thuộc tập hợp A, và x ∉ A để chỉ x không thuộc A.",
              "Giao của hai tập hợp A và B (A ∩ B) là tập hợp gồm các phần tử vừa thuộc A, vừa thuộc B: A ∩ B = {x | x ∈ A và x ∈ B}.",
              "Hợp của hai tập hợp A và B (A ∪ B) là tập hợp gồm các phần tử thuộc A hoặc thuộc B: A ∪ B = {x | x ∈ A hoặc x ∈ B}."
            ],
            formula: "A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}, \\quad A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}"
          }
        ],
        formulas: [
          {
            id: "f-1",
            name: "Công thức số phần tử hợp hai tập hợp",
            latex: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
            meaning: "Số phần tử thuộc hợp của 2 tập hợp bằng tổng số phần tử từng tập trừ đi phần giao chung.",
            example: "Lớp có 25 bạn học giỏi Toán, 20 bạn học giỏi Lý, 10 bạn giỏi cả hai: n(Toán ∪ Lý) = 25 + 20 - 10 = 35 bạn."
          },
          {
            id: "f-2",
            name: "Phủ định của mệnh đề với mọi (∀) và tồn tại (∃)",
            latex: "\\overline{\\forall x \\in X, P(x)} \\iff \\exists x \\in X, \\overline{P(x)}",
            meaning: "Phủ định của 'tất cả phần tử thỏa mãn P' là 'tồn tại ít nhất một phần tử không thỏa mãn P'.",
            example: "Phủ định của 'Mọi học sinh lớp 10 đều thích đá bóng' là 'Có ít nhất một học sinh lớp 10 không thích đá bóng'."
          }
        ],
        exercises: [
          {
            id: "ex-1",
            question: "Cho tập hợp A = {1; 2; 3; 4; 5} và B = {2; 4; 6; 8}. Tìm tập hợp A ∩ B?",
            options: ["{1; 3; 5}", "{2; 4}", "{1; 2; 3; 4; 5; 6; 8}", "{6; 8}"],
            correctAnswer: "{2; 4}",
            solution: "Giao của hai tập hợp là các phần tử xuất hiện ở cả hai tập. Ta thấy số 2 và 4 vừa thuộc A vừa thuộc B, do đó A ∩ B = {2; 4}.",
            difficulty: "EASY"
          },
          {
            id: "ex-2",
            question: "Phát biểu nào sau đây là mệnh đề ĐÚNG về điều kiện cần và đủ?",
            options: [
              "Tứ giác có 4 góc vuông là điều kiện cần để tứ giác đó là hình vuông.",
              "Tam giác có hai góc bằng 60° là điều kiện cần và đủ để tam giác đó đều.",
              "Số chia hết cho 2 là điều kiện đủ để số đó chia hết cho 4.",
              "Hai tam giác có diện tích bằng nhau là điều kiện cần và đủ để hai tam giác đó bằng nhau."
            ],
            correctAnswer: "Tam giác có hai góc bằng 60° là điều kiện cần và đủ để tam giác đó đều.",
            solution: "Tam giác có 2 góc 60° thì góc còn lại 180° - 120° = 60°, nên tam giác có 3 góc bằng nhau, tức tam giác đều.",
            difficulty: "MEDIUM"
          }
        ],
        mindmap: {
          root: "Mệnh Đề & Tập Hợp",
          branches: [
            {
              name: "1. Mệnh Đề Logic",
              items: ["Khẳng định Đúng / Sai", "Mệnh đề phủ định P̄", "Kéo theo P ⇒ Q", "Tương đương P ⇔ Q"]
            },
            {
              name: "2. Ký Hiệu Lượng Từ",
              items: ["Với mọi (∀)", "Tồn tại (∃)", "Phủ định lượng từ"]
            },
            {
              name: "3. Các Phép Toán Tập Hợp",
              items: ["Giao (∩)", "Hợp (∪)", "Hiệu (\\)", "Phần bù (C_E A)"]
            }
          ]
        }
      },
      {
        id: "chap-t10-2",
        chapterNumber: 2,
        title: "Chương II: Bất Phương Trình Bậc Nhất Hai Ẩn",
        subtitle: "Biểu diễn hình học miền nghiệm trên mặt phẳng tọa độ Oxy",
        summary: [
          "Bất phương trình bậc nhất hai ẩn có dạng ax + by < c (hoặc ≤, >, ≥) với a² + b² ≠ 0.",
          "Miền nghiệm là một nửa mặt phẳng được giới hạn bởi đường thẳng d: ax + by = c.",
          "Hệ bất phương trình bậc nhất hai ẩn có miền nghiệm là giao của các miền nghiệm thành phần (thường là miền đa giác lồi).",
          "Bài toán tối ưu: Giá trị lớn nhất / nhỏ nhất của biểu thức F = ax + by luôn đạt tại một trong các đỉnh của miền đa giác."
        ],
        sections: [
          {
            id: "sec-2-1",
            title: "§1. Bất phương trình bậc nhất hai ẩn",
            calloutType: "DEFINITION",
            content: [
              "Bất phương trình bậc nhất hai ẩn x, y là bất phương trình có dạng ax + by ≤ c (hoặc ax + by < c, ax + by ≥ c, ax + by > c), trong đó a, b, c là các số thực đã cho, a và b không đồng thời bằng 0.",
              "Mỗi cặp số (x₀; y₀) sao cho ax₀ + by₀ ≤ c là một khẳng định đúng được gọi là một nghiệm của bất phương trình."
            ],
            formula: "ax + by \\le c \\quad (a^2 + b^2 \\neq 0)"
          },
          {
            id: "sec-2-2",
            title: "§2. Cách xác định miền nghiệm trên mặt phẳng Oxy",
            calloutType: "THEOREM",
            content: [
              "Bước 1: Vẽ đường thẳng d: ax + by = c trên mặt phẳng tọa độ Oxy.",
              "Bước 2: Lấy một điểm M(x₀; y₀) không thuộc d (thường chọn gốc tọa độ O(0; 0) nếu d không đi qua O).",
              "Bước 3: Tính ax₀ + by₀ và so sánh với c.",
              "Bước 4: Kết luận: Nếu ax₀ + by₀ < c thì nửa mặt phẳng chứa điểm M là miền nghiệm; ngược lại nửa mặt phẳng không chứa M là miền nghiệm."
            ]
          }
        ],
        formulas: [
          {
            id: "f-3",
            name: "Biểu thức mục tiêu tối ưu hóa tuyến tính",
            latex: "F(x, y) = ax + by \\implies F_{\\max} = \\max \\{F(A_1), F(A_2), \\dots, F(A_k)\\}",
            meaning: "Giá trị cực trị của biểu thức F trên miền nghiệm đa giác luôn đạt tại một trong các đỉnh A_i của đa giác.",
            example: "Miền nghiệm là tam giác ABC với A(0,0), B(3,0), C(1,2). Để tìm max của F = 2x + 3y, ta chỉ cần so sánh F(A)=0, F(B)=6, F(C)=8 => Max là 8 tại C."
          }
        ],
        exercises: [
          {
            id: "ex-3",
            question: "Điểm nào sau đây thuộc miền nghiệm của bất phương trình 2x - y + 4 > 0?",
            options: ["(-3; 0)", "(0; 5)", "(1; 2)", "(-2; -1)"],
            correctAnswer: "(1; 2)",
            solution: "Thay tọa độ (1; 2) vào vế trái: 2(1) - 2 + 4 = 4 > 0 (Đúng). Vậy (1; 2) thuộc miền nghiệm.",
            difficulty: "EASY"
          }
        ],
        mindmap: {
          root: "Bất Phương Trình 2 Ẩn",
          branches: [
            {
              name: "1. Dạng Chuẩn",
              items: ["ax + by ≤ c", "a² + b² ≠ 0", "Nghiệm (x₀; y₀)"]
            },
            {
              name: "2. Miền Nghiệm Oxy",
              items: ["Đường bờ ax + by = c", "Thử nghiệm điểm O(0,0)", "Gạch bỏ phần không thỏa mãn"]
            },
            {
              name: "3. Ứng Dụng Thực Tế",
              items: ["Quy hoạch tuyến tính", "Tối ưu hóa chi phí sản xuất", "Cực trị tại các đỉnh đa giác"]
            }
          ]
        }
      },
      {
        id: "chap-t10-3",
        chapterNumber: 3,
        title: "Chương III: Hệ Thức Lượng Trong Tam Giác",
        subtitle: "Định lý côsin, định lý sin và các công thức tính diện tích tam giác",
        summary: [
          "Định lý Côsin: a² = b² + c² - 2bc·cos(A).",
          "Định lý Sin: a/sin(A) = b/sin(B) = c/sin(C) = 2R (R là bán kính đường tròn ngoại tiếp).",
          "Các công thức diện tích tam giác: S = 1/2 a·hₐ = 1/2 ab·sin(C) = abc/(4R) = p·r = √[p(p-a)(p-b)(p-c)]."
        ],
        sections: [
          {
            id: "sec-3-1",
            title: "§1. Định lý côsin trong tam giác bất kỳ",
            calloutType: "THEOREM",
            content: [
              "Trong tam giác ABC với BC = a, CA = b, AB = c, bình phương một cạnh bằng tổng bình phương hai cạnh kia trừ đi hai lần tích của chúng với côsin góc xen giữa.",
              "Hệ quả: Cho phép tính góc của một tam giác khi biết độ dài 3 cạnh: cos(A) = (b² + c² - a²) / (2bc)."
            ],
            formula: "a^2 = b^2 + c^2 - 2bc \\cos A, \\quad \\cos A = \\frac{b^2 + c^2 - a^2}{2bc}"
          },
          {
            id: "sec-3-2",
            title: "§2. Định lý sin và Bán kính ngoại tiếp R",
            calloutType: "THEOREM",
            content: [
              "Trong mọi tam giác ABC, tỉ số giữa độ dài mỗi cạnh và sin của góc đối diện luôn bằng đường kính đường tròn ngoại tiếp tam giác đó.",
              "Định lý này cực kỳ hữu ích khi giải bài toán đo đạc thực địa: tính khoảng cách từ bờ tới một con tàu trên biển mà không cần trực tiếp ra biển."
            ],
            formula: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R"
          },
          {
            id: "sec-3-3",
            title: "§3. Công thức Hê-rông (Heron) tính diện tích tam giác",
            calloutType: "EXAMPLE",
            content: [
              "Khi biết độ dài cả 3 cạnh a, b, c, ta tính nửa chu vi p = (a + b + c)/2.",
              "Diện tích tam giác được tính bằng căn bậc hai của tích p(p-a)(p-b)(p-c).",
              "Đây là một trong những công thức đẹp và mạnh nhất của hình học cổ điển, được phát minh bởi nhà toán học Heron thành Alexandria."
            ],
            formula: "S = \\sqrt{p(p-a)(p-b)(p-c)} \\quad \\text{với } p = \\frac{a+b+c}{2}"
          }
        ],
        formulas: [
          {
            id: "f-4",
            name: "Định lý Côsin",
            latex: "a^2 = b^2 + c^2 - 2bc \\cos A",
            meaning: "Tính cạnh còn lại khi biết 2 cạnh và góc xen giữa; hoặc tính góc khi biết 3 cạnh.",
            example: "Cho b=5, c=8, A=60°. Ta có a² = 25 + 64 - 2(5)(8)(0.5) = 89 - 40 = 49 => a = 7."
          },
          {
            id: "f-5",
            name: "Hệ thức diện tích theo bán kính nội tiếp r",
            latex: "S = p \\cdot r \\implies r = \\frac{S}{p}",
            meaning: "Bán kính đường tròn nội tiếp r bằng diện tích chia cho nửa chu vi tam giác.",
            example: "Tam giác có S = 84, chu vi = 42 => p = 21 => r = 84 / 21 = 4."
          }
        ],
        exercises: [
          {
            id: "ex-4",
            question: "Cho tam giác ABC có a = 7, b = 5, c = 8. Tính số đo góc A?",
            options: ["30°", "45°", "60°", "90°"],
            correctAnswer: "60°",
            solution: "Áp dụng hệ quả định lý côsin: cos(A) = (5² + 8² - 7²) / (2 × 5 × 8) = (25 + 64 - 49) / 80 = 40 / 80 = 0.5. Vậy góc A = 60°.",
            difficulty: "MEDIUM"
          }
        ],
        mindmap: {
          root: "Hệ Thức Lượng Tam Giác",
          branches: [
            {
              name: "1. Định Lý Côsin",
              items: ["a² = b² + c² - 2bc·cos(A)", "Tính góc cos(A)", "Định lý Pythagore suy rộng"]
            },
            {
              name: "2. Định Lý Sin",
              items: ["a/sin(A) = 2R", "Bán kính ngoại tiếp R", "Giải tam giác thực tế"]
            },
            {
              name: "3. Bộ Công Thức Diện Tích S",
              items: ["1/2 a·hₐ", "1/2 ab·sin(C)", "abc/(4R)", "p·r", "Công thức Hê-rông"]
            }
          ]
        }
      }
    ]
  },
  {
    id: "toan-5-ket-noi",
    title: "Sách Giáo Khoa Toán Lớp 5 (Số Học, Phân Số & Hình Học Đo Lường)",
    shortTitle: "Toán 5 - Số Học",
    grade: "Lớp 5",
    gradeNumber: 5,
    subject: "Toán học",
    publisher: "NXB Giáo Dục Việt Nam - Kết Nối Tri Thức",
    edition: "Bộ chuẩn K-12 Tiểu học 2026",
    color: "#10B981",
    accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/30",
    description: "Bộ sách phân số và số thập phân trực quan dành cho học sinh tiểu học chuyển giao lên THCS.",
    totalChapters: 3,
    totalPages: 96,
    author: "PGS.TS. Vũ Quốc Chung & Ban Biên Soạn Toán Tiểu Học",
    chapters: [
      {
        id: "chap-t5-1",
        chapterNumber: 1,
        title: "Chương I: Ôn Tập và Bổ Sung Về Phân Số",
        subtitle: "Tính chất cơ bản của phân số, rút gọn và quy đồng mẫu số",
        summary: [
          "Phân số gồm tử số (số phần lấy) và mẫu số (số phần bằng nhau được chia ra, mẫu số luôn khác 0).",
          "Nếu nhân hoặc chia cả tử số và mẫu số với cùng một số tự nhiên khác 0, ta được phân số bằng phân số đã cho.",
          "Quy đồng mẫu số: Tìm mẫu số chung, nhân cả tử và mẫu với thừa số phụ tương ứng.",
          "So sánh phân số: Cùng mẫu số thì tử lớn hơn thì lớn hơn; khác mẫu số thì quy đồng rồi so sánh."
        ],
        sections: [
          {
            id: "sec-5-1",
            title: "§1. Khái niệm phân số và tính chất cơ bản",
            calloutType: "DEFINITION",
            content: [
              "Một chiếc bánh pizza được cắt thành 6 miếng đều nhau. Nếu em lấy đi 2 miếng, ta nói em đã lấy 2/6 chiếc bánh. Số 2 ở trên là TỬ SỐ (chỉ số phần được lấy), số 6 ở dưới là MẪU SỐ (chỉ tổng số phần bằng nhau được chia ra).",
              "Tính chất vàng: Khi nhân hoặc chia cả tử và mẫu của một phân số với cùng một số tự nhiên khác 0, giá trị của phân số đó hoàn toàn KHÔNG THAY ĐỔI.",
              "Ví dụ: 2/6 chia cả tử và mẫu cho 2 ta được 1/3. Vậy ăn 2 miếng bánh của chiếc bánh chia 6 tương đương với ăn 1 miếng của chiếc bánh chia 3!"
            ],
            formula: "\\frac{a}{b} = \\frac{a \\times m}{b \\times m} = \\frac{a : n}{b : n} \\quad (m, n \\neq 0)"
          },
          {
            id: "sec-5-2",
            title: "§2. Rút gọn phân số về phân số tối giản",
            calloutType: "PRACTICE",
            content: [
              "Thế nào là phân số tối giản? Phân số tối giản là phân số mà tử số và mẫu số không cùng chia hết cho một số tự nhiên nào lớn hơn 1.",
              "Để rút gọn phân số, ta xét xem tử số và mẫu số cùng chia hết cho số tự nhiên nào lớn hơn 1, rồi chia cả tử và mẫu cho số đó, lặp lại cho đến khi được phân số tối giản."
            ]
          }
        ],
        formulas: [
          {
            id: "f-6",
            name: "Tính chất cơ bản của phân số",
            latex: "\\frac{a}{b} = \\frac{a \\times k}{b \\times k} \\quad (k \\in \\mathbb{N}^*), \\quad \\frac{a}{b} = \\frac{a : d}{b : d}",
            meaning: "Nhân hoặc chia cả tử và mẫu cho cùng một số d khác 0 không làm thay đổi giá trị phân số.",
            example: "Rút gọn 18/24: Chia cả tử và mẫu cho 6 ta được 3/4 (phân số tối giản)."
          }
        ],
        exercises: [
          {
            id: "ex-5",
            question: "Rút gọn phân số 15/25 về phân số tối giản?",
            options: ["3/5", "1/2", "5/3", "3/10"],
            correctAnswer: "3/5",
            solution: "Ta thấy cả 15 và 25 đều chia hết cho 5: 15 : 5 = 3 và 25 : 5 = 5. Do đó 15/25 = 3/5.",
            difficulty: "EASY"
          }
        ],
        mindmap: {
          root: "Phân Số Lớp 5",
          branches: [
            {
              name: "1. Khái Niệm",
              items: ["Tử số (số phần lấy)", "Mẫu số khác 0 (số phần chia)"]
            },
            {
              name: "2. Tính Chất",
              items: ["Nhân/chia cùng số k ≠ 0", "Rút gọn về tối giản", "Quy đồng mẫu số chung"]
            },
            {
              name: "3. Ứng Dụng",
              items: ["Cộng trừ phân số", "Nhân chia phân số", "Toán chuyển động đều"]
            }
          ]
        }
      }
    ]
  },
  {
    id: "vat-ly-10-canh-dieu",
    title: "Sách Giáo Khoa Vật Lý 10 (Cơ Học Chuyển Động & Động Lực Học)",
    shortTitle: "Vật Lý 10 - Cơ Học",
    grade: "Lớp 10",
    gradeNumber: 10,
    subject: "Vật lý",
    publisher: "NXB Giáo Dục Việt Nam",
    edition: "Chương trình GDPT mới 2026",
    color: "#8B5CF6",
    accentBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/30",
    description: "Bộ sách nghiên cứu chuyển động thẳng đều, biến đổi đều, gia tốc và các định luật Newton trong đời sống.",
    totalChapters: 2,
    totalPages: 110,
    author: "GS.TS. Nguyễn Thế Khôi & Đội ngũ Vật lý Sư phạm",
    chapters: [
      {
        id: "chap-vl10-1",
        chapterNumber: 1,
        title: "Chương I: Mô Tả Chuyển Động",
        subtitle: "Độ dịch chuyển, vận tốc tức thời và chuyển động biến đổi đều",
        summary: [
          "Độ dịch chuyển d là đại lượng vectơ nối vị trí đầu và vị trí cuối của vật trong không gian.",
          "Vận tốc v = d/t (khác với tốc độ là quãng đường chia cho thời gian).",
          "Gia tốc a = (v - v₀)/t đặc trưng cho độ biến thiên nhanh hay chậm của vận tốc theo thời gian.",
          "Ba phương trình chuyển động thẳng biến đổi đều: v = v₀ + at, d = v₀t + 1/2 at², v² - v₀² = 2ad."
        ],
        sections: [
          {
            id: "sec-vl-1",
            title: "§1. Độ dịch chuyển và Vận tốc",
            calloutType: "DEFINITION",
            content: [
              "Trong cơ học cổ điển, quãng đường s là độ dài quỹ đạo mà vật đi được (luôn dương). Còn độ dịch chuyển d là một vectơ có gốc tại vị trí ban đầu và ngọn tại vị trí lúc sau.",
              "Ví dụ: Một người bơi từ đầu bể bơi sang bờ bên kia 50m rồi quay lại vị trí xuất phát. Quãng đường bơi được là 100m, nhưng độ dịch chuyển tổng cộng lại bằng 0!"
            ]
          },
          {
            id: "sec-vl-2",
            title: "§2. Chuyển động thẳng biến đổi đều và gia tốc",
            calloutType: "THEOREM",
            content: [
              "Chuyển động thẳng biến đổi đều là chuyển động có gia tốc không đổi theo thời gian (a = const).",
              "Nếu gia tốc a cùng dấu với vận tốc v (a·v > 0), vật chuyển động nhanh dần đều.",
              "Nếu gia tốc a ngược dấu với vận tốc v (a·v < 0), vật chuyển động chậm dần đều."
            ],
            formula: "v = v_0 + at, \\quad d = v_0 t + \\frac{1}{2} a t^2, \\quad v^2 - v_0^2 = 2ad"
          }
        ],
        formulas: [
          {
            id: "f-7",
            name: "Công thức liên hệ vận tốc, gia tốc và độ dịch chuyển (Công thức độc lập thời gian)",
            latex: "v^2 - v_0^2 = 2ad",
            meaning: "Tính quãng đường hoặc vận tốc mà không cần biết thời gian t.",
            example: "Một ô tô đang chạy 20 m/s thì hãm phanh với gia tốc a = -2 m/s² đến khi dừng hẳn (v=0): 0 - 400 = 2(-2)d => d = 100m."
          }
        ],
        exercises: [
          {
            id: "ex-6",
            question: "Một đoàn tàu rời ga chuyển động thẳng nhanh dần đều với gia tốc a = 0.5 m/s². Vận tốc đoàn tàu sau 20 giây là bao nhiêu?",
            options: ["5 m/s", "10 m/s", "15 m/s", "20 m/s"],
            correctAnswer: "10 m/s",
            solution: "Tàu rời ga nên v₀ = 0. Vận tốc sau 20s là v = v₀ + at = 0 + 0.5 × 20 = 10 m/s.",
            difficulty: "EASY"
          }
        ],
        mindmap: {
          root: "Mô Tả Chuyển Động",
          branches: [
            {
              name: "1. Đại Lượng Động Học",
              items: ["Quãng đường s (vô hướng)", "Độ dịch chuyển d (vectơ)", "Vận tốc v = d/t"]
            },
            {
              name: "2. Chuyển Động Biến Đổi",
              items: ["Gia tốc a = Δv/Δt", "Nhanh dần đều (a·v > 0)", "Chậm dần đều (a·v < 0)"]
            },
            {
              name: "3. Hệ Thống Công Thức",
              items: ["v = v₀ + at", "d = v₀t + 1/2 at²", "v² - v₀² = 2ad"]
            }
          ]
        }
      }
    ]
  }
];

