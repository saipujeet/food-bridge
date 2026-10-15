package com.foodbridge.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${foodbridge.jwt.secret:9a4f2c8d7e1b5a3f6e8d2c4b7a9f1e3d5c7b9a2f4e6d8c1b3a5f7e9d2c4b6a8f}") String secret,
            @Value("${foodbridge.jwt.expiration-ms:86400000}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(Long userId, String email, String role, String name) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("role", role)
                .claim("name", name)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return (String) claims.get("role");
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        Object val = claims.get("userId");
        if (val instanceof Number) {
            return ((Number) val).longValue();
        }
        return null;
    }
}
