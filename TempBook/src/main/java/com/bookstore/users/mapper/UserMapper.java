package com.bookstore.users.mapper;

import com.bookstore.users.entity.User;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {

    @Select("SELECT * FROM users  where custid > 4;")
    List<User> findAll();

    @Select("SELECT * FROM users WHERE custid = #{id}")
    Optional<User> findById(int id);

    void save(User user);

    @Select("SELECT * FROM users WHERE username = #{userName}")
    Optional<User> findByUsername(String userName);

    void updateUser(int id);

    @Delete("DELETE FROM users WHERE custid = #{id}")
    void deleteById(int id);
}
