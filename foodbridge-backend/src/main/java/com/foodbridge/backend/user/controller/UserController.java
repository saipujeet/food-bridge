package com.foodbridge.backend.user.controller;

import com.foodbridge.backend.auth.dto.UserDto;
import com.foodbridge.backend.common.dto.ApiResponse;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUserProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(ApiResponse.ok(new UserDto(user))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User profile not found")));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUserProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> updates) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }

        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User profile not found"));
        }

        User user = userOpt.get();

        if (updates.containsKey("name") && updates.get("name") != null) {
            user.setName(String.valueOf(updates.get("name")));
        }
        if (updates.containsKey("phone") && updates.get("phone") != null) {
            user.setPhone(String.valueOf(updates.get("phone")));
        }
        if (updates.containsKey("organizationName") && updates.get("organizationName") != null) {
            user.setOrganizationName(String.valueOf(updates.get("organizationName")));
        }
        if (updates.containsKey("address") && updates.get("address") != null) {
            user.setAddress(String.valueOf(updates.get("address")));
        }
        if (updates.containsKey("city") && updates.get("city") != null) {
            user.setCity(String.valueOf(updates.get("city")));
        }
        if (updates.containsKey("vehicleType") && updates.get("vehicleType") != null) {
            user.setVehicleType(String.valueOf(updates.get("vehicleType")));
        }
        if (updates.containsKey("foodCapacityKg") && updates.get("foodCapacityKg") != null) {
            try {
                int capacity = Integer.parseInt(String.valueOf(updates.get("foodCapacityKg")));
                user.setMaxCapacity(capacity);
                user.setAvailableCapacity(capacity);
            } catch (NumberFormatException ignored) {}
        }
        if (updates.containsKey("latitude") && updates.get("latitude") != null) {
            try {
                user.setLatitude(Double.parseDouble(String.valueOf(updates.get("latitude"))));
            } catch (NumberFormatException ignored) {}
        }
        if (updates.containsKey("longitude") && updates.get("longitude") != null) {
            try {
                user.setLongitude(Double.parseDouble(String.valueOf(updates.get("longitude"))));
            } catch (NumberFormatException ignored) {}
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", new UserDto(saved)));
    }
}
