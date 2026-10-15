package com.foodbridge.backend.config;

import com.foodbridge.backend.security.CustomAccessDeniedHandler;
import com.foodbridge.backend.security.CustomAuthenticationEntryPoint;
import com.foodbridge.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomAuthenticationEntryPoint authenticationEntryPoint,
            CustomAccessDeniedHandler accessDeniedHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/test/**", "/ws/**", "/h2-console/**").permitAll()
                // Explicit tamper-proofing: Disallow modification or deletion of history & audit trails
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/history/**", "/api/admin/audit-logs/**").denyAll()
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/history/**", "/api/admin/audit-logs/**").denyAll()
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/history/**", "/api/admin/audit-logs/**").denyAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/analytics/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/analytics/ngo/**").hasAnyRole("NGO", "ADMIN")
                .requestMatchers("/api/analytics/donor/**").hasAnyRole("DONOR", "ADMIN")
                .requestMatchers("/api/analytics/volunteer/**").hasAnyRole("VOLUNTEER", "ADMIN")
                .requestMatchers("/api/analytics/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                // Module 12: Audit & History route scoping
                .requestMatchers("/api/history/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/history/donations/**").hasAnyRole("DONOR", "NGO", "ADMIN")
                .requestMatchers("/api/history/deliveries/**").hasAnyRole("VOLUNTEER", "NGO", "ADMIN")
                .requestMatchers("/api/history/**").authenticated()
                .requestMatchers("/api/**").permitAll()
                .anyRequest().permitAll()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .headers(headers -> headers.frameOptions(frame -> frame.disable())); // Allow H2 console frames

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
