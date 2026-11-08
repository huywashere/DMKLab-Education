package com.example.learning.identity.repository;

import com.example.learning.identity.entity.User;
import com.example.learning.identity.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    long countByRole(UserRole role);

    @Query("SELECT COALESCE(SUM(u.energyPoints), 0) FROM User u")
    long sumEnergyPoints();

    // Aggregated KPI Stats projection - Single database roundtrip replacing 4 separate queries
    interface UserKpiStats {
        long getTotalUsers();
        long getTotalStudents();
        long getTotalTeachers();
        long getTotalEnergyPoints();
    }

    @Query(value = """
        SELECT 
            COUNT(*) AS totalUsers,
            COUNT(*) FILTER (WHERE role = 'STUDENT') AS totalStudents,
            COUNT(*) FILTER (WHERE role = 'TEACHER') AS totalTeachers,
            COALESCE(SUM(energy_points), 0) AS totalEnergyPoints
        FROM users
    """, nativeQuery = true)
    UserKpiStats getUserKpiStats();

    // Atomic Energy Points Increment - avoids entity hydration and race conditions
    @Modifying
    @Query("UPDATE User u SET u.energyPoints = u.energyPoints + :points WHERE u.id = :userId")
    int addEnergyPoints(@Param("userId") UUID userId, @Param("points") int points);
}
