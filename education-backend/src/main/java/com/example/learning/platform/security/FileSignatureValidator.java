package com.example.learning.platform.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Component
@Slf4j
public class FileSignatureValidator {

    // Danh sách các định dạng hợp lệ cho nền tảng giáo dục K-12
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "mp4", "m4v", "mov", "webm", "png", "jpg", "jpeg", "webp", "pdf", "svg"
    );

    // Danh sách phần mở rộng nguy hiểm cấm tuyệt đối (Web Shells / Executables)
    private static final List<String> DANGEROUS_EXTENSIONS = List.of(
            "exe", "dll", "so", "sh", "bat", "cmd", "php", "phtml", "php3", "php4", "php5",
            "jsp", "jspx", "asp", "aspx", "cgi", "py", "pl", "jar", "vbs", "wsf", "scr"
    );

    /**
     * Kiểm tra tính hợp lệ của tên file và phần mở rộng
     */
    public static boolean isSafeFilename(String filename) {
        if (filename == null || filename.isBlank()) return false;

        String lower = filename.toLowerCase(Locale.ROOT).trim();

        // Chống tấn công Path Traversal
        if (lower.contains("..") || lower.contains("/") || lower.contains("\\")) {
            log.warn("[MALICIOUS_UPLOAD] Phát hiện ký tự Path Traversal trong filename: {}", filename);
            return false;
        }

        // Chống tấn công Double Extension (ví dụ: avatar.php.png hoặc payload.exe.mp4)
        for (String dangerous : DANGEROUS_EXTENSIONS) {
            if (lower.contains("." + dangerous + ".") || lower.endsWith("." + dangerous)) {
                log.warn("[MALICIOUS_UPLOAD] Phát hiện file thực thi nguy hiểm: {}", filename);
                return false;
            }
        }

        // Lấy extension cuối cùng
        int lastDot = lower.lastIndexOf('.');
        if (lastDot == -1 || lastDot == lower.length() - 1) {
            return false;
        }
        String ext = lower.substring(lastDot + 1);
        return ALLOWED_EXTENSIONS.contains(ext);
    }

    /**
     * Xác thực Magic Bytes nhị phân của các tệp đa phương tiện
     */
    public static boolean verifyMagicBytes(byte[] headerBytes, String expectedFormat) {
        if (headerBytes == null || headerBytes.length < 4) return false;

        String fmt = expectedFormat != null ? expectedFormat.toLowerCase(Locale.ROOT) : "";

        // PNG: 89 50 4E 47
        if (fmt.contains("png")) {
            return headerBytes.length >= 8 &&
                    headerBytes[0] == (byte) 0x89 && headerBytes[1] == (byte) 0x50 &&
                    headerBytes[2] == (byte) 0x4E && headerBytes[3] == (byte) 0x47;
        }

        // JPEG: FF D8 FF
        if (fmt.contains("jpg") || fmt.contains("jpeg")) {
            return (headerBytes[0] & 0xFF) == 0xFF &&
                    (headerBytes[1] & 0xFF) == 0xD8 &&
                    (headerBytes[2] & 0xFF) == 0xFF;
        }

        // WebP: RIFF ... WEBP
        if (fmt.contains("webp")) {
            return headerBytes.length >= 12 &&
                    headerBytes[0] == 'R' && headerBytes[1] == 'I' && headerBytes[2] == 'F' && headerBytes[3] == 'F' &&
                    headerBytes[8] == 'W' && headerBytes[9] == 'E' && headerBytes[10] == 'B' && headerBytes[11] == 'P';
        }

        // MP4 Video: offset 4 ftyp
        if (fmt.contains("mp4") || fmt.contains("video")) {
            if (headerBytes.length >= 8) {
                return headerBytes[4] == 'f' && headerBytes[5] == 't' &&
                        headerBytes[6] == 'y' && headerBytes[7] == 'p';
            }
        }

        return true;
    }
}
