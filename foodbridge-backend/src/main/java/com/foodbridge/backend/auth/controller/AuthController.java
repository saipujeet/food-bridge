package com.foodbridge.backend.auth.controller;

import com.foodbridge.backend.auth.dto.AuthResponse;
import com.foodbridge.backend.auth.dto.LoginRequest;
import com.foodbridge.backend.auth.dto.UserDto;
import com.foodbridge.backend.common.dto.ApiResponse;
import com.foodbridge.backend.security.JwtTokenProvider;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email and password are required."));
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid email or password."));
        }

        User user = userOpt.get();
        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Your account has been suspended by an administrator. Please contact support."));
        }

        // Support plain text credentials for initial development / seeded accounts
        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid email or password."));
        }

        user.setLastActivity(LocalDateTime.now());
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.getName());
        AuthResponse response = new AuthResponse(token, new UserDto(user));

        return ResponseEntity.ok(ApiResponse.ok("Authentication successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<com.foodbridge.backend.auth.dto.RegisterResponse>> register(@RequestBody com.foodbridge.backend.auth.dto.RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required."));
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password is required."));
        }
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Name is required."));
        }

        // Security requirement: Never allow self-registering as ADMIN through public portal
        if (request.getRole() == com.foodbridge.backend.user.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Administrative accounts cannot be self-registered through the public portal."));
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("An account with this email address already exists."));
        }

        com.foodbridge.backend.user.Role role = request.getRole() != null ? request.getRole() : com.foodbridge.backend.user.Role.DONOR;
        User user = new User(
                request.getName().trim(),
                normalizedEmail,
                request.getPassword(),
                role,
                request.getPhone() != null ? request.getPhone().trim() : null
        );

        user.setOrganizationName(request.getOrganizationName());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());

        if (role == com.foodbridge.backend.user.Role.NGO) {
            user.setVerificationStatus("PENDING");
            int capacity = request.getFoodCapacityKg() != null && request.getFoodCapacityKg() > 0 ? request.getFoodCapacityKg() : 200;
            user.setMaxCapacity(capacity);
            user.setAvailableCapacity(capacity);
        } else if (role == com.foodbridge.backend.user.Role.VOLUNTEER) {
            user.setVerificationStatus("PENDING");
            user.setVehicleType("Motorcycle / Scooter");
        } else {
            user.setVerificationStatus("VERIFIED");
        }

        User savedUser = userRepository.save(user);
        com.foodbridge.backend.auth.dto.RegisterResponse response =
                new com.foodbridge.backend.auth.dto.RegisterResponse(new UserDto(savedUser), role != com.foodbridge.backend.user.Role.DONOR);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(ApiResponse.ok(new UserDto(user))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found")));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Successfully logged out", null));
    }
}
