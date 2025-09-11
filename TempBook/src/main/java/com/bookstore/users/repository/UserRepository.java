package com.bookstore.users.repository;

import com.bookstore.users.entity.User;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {
    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // 회원정보 저장
    public User save(User user) {
        System.out.println("==> user added");
        String sql = "INSERT INTO users (name, username, password, birthday, email, address, phone) " +
                " VALUES (?,?,?,?,?,?,?)";
        int result = jdbc.update(sql,
                user.getName(),
                user.getUserName(),
                user.getPassword(),
                java.sql.Date.valueOf(user.getBirthday()), // LocalDate → java.sql.Date
                user.getEmail(),
                user.getAddress(),
                user.getPhone()
        );
        if (result == 1) {
            System.out.println(result);
            System.out.println("회원 등록 성공");
            return user;
        }else {
            System.out.println("회원등록 실패");
            return null;
        }
    }

    public void add(User user) {
        System.out.println("==> user added");
        String sql = "INSERT INTO users (name, username, password, birthday, email, address, phone) " +
                " VALUES (?,?,?,?,?,?,?)";
        int result = jdbc.update(sql,
                user.getName(),
                user.getUserName(),
                user.getPassword(),
                java.sql.Date.valueOf(user.getBirthday()), // LocalDate → java.sql.Date
                user.getEmail(),
                user.getAddress(),
                user.getPhone()
        );

        if (result == 1) {
            System.out.println(result);
            System.out.println("회원 등록 성공");
        }else {
            System.out.println("회원등록 실패");
        }
    }

    public Optional<User> findByUsername(String userName) {
        System.out.println("==> user findByUserName :"+userName);
        String sql = "SELECT * FROM users WHERE username = ?";
        try {
            User user = jdbc.queryForObject(sql, userRowMapper(), userName);
            System.out.println("user : "+user);
            return Optional.ofNullable(user);
        }catch (EmptyResultDataAccessException e){
            return Optional.empty();
        }

    }

    public Optional<User> findById(String custId) {
        System.out.println("==> user findById"+custId);
        String sql = "SELECT * FROM users WHERE custid = ?";
        User user = jdbc.queryForObject(sql, userRowMapper(), custId);
        System.out.println("==> user : "+user);
        return Optional.ofNullable(user);
    }

    public List<User> findAll(){
        String sql = "SELECT * FROM users";
        return jdbc.query(sql,userRowMapper());
    }

    private RowMapper<User> userRowMapper() {
        return (rs, rowNum) -> {
            Date birthDate = rs.getDate("birthday");
            LocalDate birthDay = birthDate != null ? ((java.sql.Date) birthDate).toLocalDate() : null;
            return new User(
                    rs.getInt("custid"),
                    rs.getString("name"),
                    rs.getString("username"),
                    rs.getString("password"),
                    birthDay,
                    rs.getString("email"),
                    rs.getString("phone"),
                    rs.getString("address")
            );
        };
    }

    public void update(User user) {
        String sql = "UPDATE users SET address = ?, email = ?, phone =?  WHERE custid = ?";
        jdbc.update(sql,
                user.getAddress(),
                user.getEmail(),
                user.getPhone(),
                user.getCustId()
        );

    }

    public void deleteById(String id) {
        String sql = "DELETE FROM users WHERE custid = ?";
        int rowAffected = jdbc.update(sql, id);
        if (rowAffected > 0) {
            System.out.println(rowAffected);
        }else {
            System.out.println("삭제할 사용자가 없습니다."+id);
        }
    }
}
