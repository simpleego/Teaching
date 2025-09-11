package com.bookstore.users.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private int custId;
    private String name;
    private String userName;
    private String password;
    private LocalDate birthday;
    private String email;
    private String address;
    private String phone;
}



