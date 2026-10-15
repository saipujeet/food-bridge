package com.foodbridge.backend.notification.service;

import com.foodbridge.backend.notification.dto.NotificationPreferenceDto;
import com.foodbridge.backend.notification.entity.NotificationPreference;
import com.foodbridge.backend.notification.repository.NotificationPreferenceRepository;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public NotificationPreferenceService(NotificationPreferenceRepository preferenceRepository, UserRepository userRepository) {
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceDto getPreferences(Long userId) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreference(userId));
        return NotificationPreferenceDto.fromEntity(pref);
    }

    @Transactional
    public NotificationPreferenceDto updatePreferences(Long userId, NotificationPreferenceDto dto) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreference(userId));

        pref.setInAppEnabled(dto.isInAppEnabled());
        pref.setBrowserEnabled(dto.isBrowserEnabled());
        pref.setEmailEnabled(dto.isEmailEnabled());
        pref.setDonationUpdates(dto.isDonationUpdates());
        pref.setMatchingUpdates(dto.isMatchingUpdates());
        pref.setDeliveryUpdates(dto.isDeliveryUpdates());
        pref.setSystemUpdates(dto.isSystemUpdates());

        NotificationPreference saved = preferenceRepository.save(pref);
        return NotificationPreferenceDto.fromEntity(saved);
    }

    private NotificationPreference createDefaultPreference(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        NotificationPreference pref = new NotificationPreference(user);
        return preferenceRepository.save(pref);
    }
}
