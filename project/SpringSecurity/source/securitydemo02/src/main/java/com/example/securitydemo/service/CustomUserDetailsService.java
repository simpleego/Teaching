package com.example.securitydemo.service;

import com.example.securitydemo.model.CustomUser;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        System.out.println("UserDetailsService loadUserByUsername--->");
        // 실제로는 DB에서 조회해야 하지만 지금은 예제용으로 하드코딩
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        if (username.equals("admin")) {
            return new CustomUser("admin", encoder.encode("1234"), "ROLE_ADMIN");
        } else if (username.equals("user")) {
            return new CustomUser("user", encoder.encode("1111"), "ROLE_USER");
        }

        throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username);


//        if (username.equals("admin")) {
//            return new CustomUser("admin", "{noop}1234", "ROLE_ADMIN");
//            // {noop} : 암호화하지 않은 평문 비밀번호 사용
//        } else if (username.equals("user")) {
//            return new CustomUser("user", "{noop}1111", "ROLE_USER");
//        }
//
//        throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username);
    }
}