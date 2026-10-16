package com.example.learning.progress.service;

import com.example.learning.identity.entity.User;
import com.example.learning.identity.repository.UserRepository;
import com.example.learning.progress.dto.ProgressDto;
import com.example.learning.progress.entity.LearningProgress;
import com.example.learning.progress.repository.LearningProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final LearningProgressRepository progressRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProgressDto.ProgressResponse updateProgress(
            UUID userId,
            UUID lessonId,
            ProgressDto.UpdateProgressRequest req) {

        LearningProgress progress = progressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> LearningProgress.builder()
                        .userId(userId)
                        .lessonId(lessonId)
                        .positionSeconds(0)
                        .isCompleted(false)
                        .masteryLevel("FAMILIAR")
                        .build());

        progress.setPositionSeconds(req.getPositionSeconds());

        int awarded = 0;
        boolean newlyCompleted = false;

        // Completion rule: if watched >= 80% of video duration, or >= 120s if duration not set
        boolean shouldComplete = (req.getDurationSeconds() > 0 && req.getPositionSeconds() >= req.getDurationSeconds() * 0.8)
                || (req.getPositionSeconds() >= 120);

        if (shouldComplete && !progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setMasteryLevel("PROFICIENT");
            awarded = 50; // Khan Academy energy points
            newlyCompleted = true;
        }

        LearningProgress saved = progressRepository.save(progress);

        if (newlyCompleted) {
            userRepository.findById(userId).ifPresent(u -> {
                u.setEnergyPoints(u.getEnergyPoints() + 50);
                userRepository.save(u);
            });
        }

        return ProgressDto.ProgressResponse.builder()
                .lessonId(saved.getLessonId())
                .positionSeconds(saved.getPositionSeconds())
                .isCompleted(saved.isCompleted())
                .masteryLevel(saved.getMasteryLevel())
                .energyPointsAwarded(awarded)
                .lastAccessedAt(saved.getLastAccessedAt())
                .build();
    }

    public Optional<ProgressDto.ProgressResponse> getProgress(UUID userId, UUID lessonId) {
        return progressRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(p -> ProgressDto.ProgressResponse.builder()
                        .lessonId(p.getLessonId())
                        .positionSeconds(p.getPositionSeconds())
                        .isCompleted(p.isCompleted())
                        .masteryLevel(p.getMasteryLevel())
                        .energyPointsAwarded(0)
                        .lastAccessedAt(p.getLastAccessedAt())
                        .build());
    }

    public ProgressDto.ProgressSummaryResponse getSummary(UUID userId) {
        long completed = progressRepository.countByUserIdAndIsCompletedTrue(userId);
        User user = userRepository.findById(userId).orElse(null);

        int points = user != null ? user.getEnergyPoints() : 1000;
        int streak = user != null ? user.getStreakDays() : 1;

        String rank = "Học Viên Năng Nổ";
        if (points >= 15000) rank = "Bậc Thầy Khan Academy";
        else if (points >= 5000) rank = "Chiến Binh Tri Thức";

        return ProgressDto.ProgressSummaryResponse.builder()
                .completedLessonsCount(completed)
                .totalEnergyPoints(points)
                .streakDays(streak)
                .currentRank(rank)
                .build();
    }
}
