package com.example.learning.identity.repository;

import com.example.learning.identity.entity.User;
import com.example.learning.identity.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
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

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(u.energyPoints), 0) FROM User u")
    long sumEnergyPoints();
}
