# 얼굴 인식 출석 시스템 - Spring Boot 백엔드 구성

## 1. 프로젝트 구조

```
face-attendance-system/
├── frontend/
│   └── face-recognition.html (기존 HTML 파일)
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── attendance/
│   │       │           ├── FaceAttendanceApplication.java
│   │       │           ├── controller/
│   │       │           ├── service/
│   │       │           ├── mapper/
│   │       │           ├── entity/
│   │       │           └── dto/
│   │       └── resources/
│   │           ├── application.yml
│   │           └── mapper/
│   ├── build.gradle
│   └── src/main/resources/sql/schema.sql
```

## 2. 데이터베이스 스키마

```sql
-- src/main/resources/sql/schema.sql
CREATE DATABASE IF NOT EXISTS face_attendance;
USE face_attendance;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS face_descriptors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    descriptor_data TEXT NOT NULL, -- 얼굴 디스크립터 데이터 (JSON 배열)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recognition_confidence DECIMAL(5,4) NOT NULL,
    attendance_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ATTENDANCE', 'LATE', 'ABSENT') DEFAULT 'ATTENDANCE',
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_attendance_user_date ON attendance_records(user_id, DATE(attendance_time));
CREATE INDEX idx_users_employee_id ON users(employee_id);
```

## 3. Spring Boot 엔티티 클래스들

### User 엔티티
```java
// src/main/java/com/attendance/entity/User.java
package com.attendance.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class User {
    private Long id;
    private String name;
    private String employeeId;
    private String department;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<FaceDescriptor> faceDescriptors;
    private List<AttendanceRecord> attendanceRecords;
}
```

### FaceDescriptor 엔티티
```java
// src/main/java/com/attendance/entity/FaceDescriptor.java
package com.attendance.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FaceDescriptor {
    private Long id;
    private Long userId;
    private float[] descriptorData; // 128차원 얼굴 디스크립터
    private LocalDateTime createdAt;
}
```

### AttendanceRecord 엔티티
```java
// src/main/java/com/attendance/entity/AttendanceRecord.java
package com.attendance.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttendanceRecord {
    private Long id;
    private Long userId;
    private Double recognitionConfidence;
    private LocalDateTime attendanceTime;
    private AttendanceStatus status;
    private String notes;
    
    public enum AttendanceStatus {
        ATTENDANCE, LATE, ABSENT
    }
}
```

## 4. DTO 클래스들

```java
// src/main/java/com/attendance/dto/FaceRegistrationRequest.java
package com.attendance.dto;

import lombok.Data;
import java.util.List;

@Data
public class FaceRegistrationRequest {
    private String name;
    private String employeeId;
    private String department;
    private List<float[]> descriptors; // 여러 개의 얼굴 디스크립터
}
```

```java
// src/main/java/com/attendance/dto/RecognitionRequest.java
package com.attendance.dto;

import lombok.Data;

@Data
public class RecognitionRequest {
    private float[] descriptor; // 인식할 얼굴 디스크립터
    private Double threshold; // 인식 임계값 (선택사항)
}
```

```java
// src/main/java/com/attendance/dto/RecognitionResponse.java
package com.attendance.dto;

import lombok.Data;

@Data
public class RecognitionResponse {
    private Long userId;
    private String userName;
    private String employeeId;
    private Double confidence;
    private Boolean attendanceRegistered;
    private String message;
}
```

```java
// src/main/java/com/attendance/dto/AttendanceResponse.java
package com.attendance.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttendanceResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String employeeId;
    private Double recognitionConfidence;
    private LocalDateTime attendanceTime;
    private String status;
    private String notes;
}
```

## 5. MyBatis Mapper 인터페이스

```java
// src/main/java/com/attendance/mapper/UserMapper.java
package com.attendance.mapper;

import com.attendance.entity.User;
import com.attendance.entity.FaceDescriptor;
import com.attendance.entity.AttendanceRecord;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {
    
    // User 관련
    @Insert("INSERT INTO users (name, employee_id, department) VALUES (#{name}, #{employeeId}, #{department})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insertUser(User user);
    
    @Select("SELECT * FROM users WHERE id = #{id}")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "name", column = "name"),
        @Result(property = "employeeId", column = "employee_id"),
        @Result(property = "department", column = "department"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "updatedAt", column = "updated_at")
    })
    Optional<User> findUserById(Long id);
    
    @Select("SELECT * FROM users WHERE employee_id = #{employeeId}")
    Optional<User> findUserByEmployeeId(String employeeId);
    
    @Select("SELECT * FROM users")
    List<User> findAllUsers();

    // FaceDescriptor 관련
    @Insert("INSERT INTO face_descriptors (user_id, descriptor_data) VALUES (#{userId}, #{descriptorData})")
    void insertFaceDescriptor(FaceDescriptor descriptor);
    
    @Select("SELECT * FROM face_descriptors WHERE user_id = #{userId}")
    List<FaceDescriptor> findFaceDescriptorsByUserId(Long userId);
    
    @Select("SELECT fd.*, u.name, u.employee_id FROM face_descriptors fd JOIN users u ON fd.user_id = u.id")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "userId", column = "user_id"),
        @Result(property = "descriptorData", column = "descriptor_data", typeHandler = FloatArrayTypeHandler.class),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "user.name", column = "name"),
        @Result(property = "user.employeeId", column = "employee_id")
    })
    List<FaceDescriptor> findAllFaceDescriptors();

    // AttendanceRecord 관련
    @Insert("INSERT INTO attendance_records (user_id, recognition_confidence, status, notes) " +
            "VALUES (#{userId}, #{recognitionConfidence}, #{status}, #{notes})")
    void insertAttendanceRecord(AttendanceRecord record);
    
    @Select("SELECT ar.*, u.name as user_name, u.employee_id FROM attendance_records ar " +
            "JOIN users u ON ar.user_id = u.id " +
            "WHERE DATE(ar.attendance_time) = CURDATE() " +
            "ORDER BY ar.attendance_time DESC")
    List<AttendanceRecord> findTodayAttendanceRecords();
    
    @Select("SELECT ar.*, u.name as user_name, u.employee_id FROM attendance_records ar " +
            "JOIN users u ON ar.user_id = u.id " +
            "WHERE ar.user_id = #{userId} AND DATE(ar.attendance_time) = CURDATE()")
    Optional<AttendanceRecord> findTodayAttendanceByUserId(Long userId);
}
```

## 6. FloatArrayTypeHandler (MyBatis 타입 핸들러)

```java
// src/main/java/com/attendance/handler/FloatArrayTypeHandler.java
package com.attendance.handler;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;

@MappedTypes(float[].class)
public class FloatArrayTypeHandler extends BaseTypeHandler<float[]> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, float[] parameter, JdbcType jdbcType) throws SQLException {
        String arrayString = Arrays.toString(parameter)
                .replace("[", "")
                .replace("]", "")
                .replace(" ", "");
        ps.setString(i, arrayString);
    }

    @Override
    public float[] getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String arrayString = rs.getString(columnName);
        return stringToFloatArray(arrayString);
    }

    @Override
    public float[] getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String arrayString = rs.getString(columnIndex);
        return stringToFloatArray(arrayString);
    }

    @Override
    public float[] getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String arrayString = cs.getString(columnIndex);
        return stringToFloatArray(arrayString);
    }

    private float[] stringToFloatArray(String arrayString) {
        if (arrayString == null || arrayString.isEmpty()) {
            return new float[0];
        }
        String[] stringValues = arrayString.split(",");
        float[] floatArray = new float[stringValues.length];
        for (int i = 0; i < stringValues.length; i++) {
            floatArray[i] = Float.parseFloat(stringValues[i].trim());
        }
        return floatArray;
    }
}
```

## 7. Service 클래스

```java
// src/main/java/com/attendance/service/FaceRecognitionService.java
package com.attendance.service;

import com.attendance.entity.FaceDescriptor;
import com.attendance.entity.User;
import com.attendance.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FaceRecognitionService {
    
    private final UserMapper userMapper;
    
    public User registerFace(String name, String employeeId, String department, List<float[]> descriptors) {
        // 사용자 등록
        User user = new User();
        user.setName(name);
        user.setEmployeeId(employeeId);
        user.setDepartment(department);
        
        userMapper.insertUser(user);
        log.info("사용자 등록 완료: {} (ID: {})", name, user.getId());
        
        // 얼굴 디스크립터 저장
        for (float[] descriptor : descriptors) {
            FaceDescriptor faceDescriptor = new FaceDescriptor();
            faceDescriptor.setUserId(user.getId());
            faceDescriptor.setDescriptorData(descriptor);
            userMapper.insertFaceDescriptor(faceDescriptor);
        }
        
        log.info("얼굴 디스크립터 {}개 저장 완료", descriptors.size());
        return user;
    }
    
    public RecognitionResult recognizeFace(float[] inputDescriptor, Double threshold) {
        if (threshold == null) {
            threshold = 0.6; // 기본 임계값
        }
        
        List<FaceDescriptor> allDescriptors = userMapper.findAllFaceDescriptors();
        Double bestConfidence = 0.0;
        User bestMatchUser = null;
        
        for (FaceDescriptor storedDescriptor : allDescriptors) {
            double distance = calculateEuclideanDistance(inputDescriptor, storedDescriptor.getDescriptorData());
            double confidence = 1 - distance; // 거리를 신뢰도로 변환
            
            if (confidence > bestConfidence && confidence >= threshold) {
                bestConfidence = confidence;
                bestMatchUser = new User();
                bestMatchUser.setId(storedDescriptor.getUserId());
                bestMatchUser.setName(storedDescriptor.getUser().getName());
                bestMatchUser.setEmployeeId(storedDescriptor.getUser().getEmployeeId());
            }
        }
        
        return new RecognitionResult(bestMatchUser, bestConfidence);
    }
    
    private double calculateEuclideanDistance(float[] a, float[] b) {
        if (a.length != b.length) {
            throw new IllegalArgumentException("디스크립터 차원이 일치하지 않습니다");
        }
        
        double sum = 0.0;
        for (int i = 0; i < a.length; i++) {
            double diff = a[i] - b[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
    
    // 인식 결과를 담을 내부 클래스
    public static class RecognitionResult {
        public final User user;
        public final Double confidence;
        
        public RecognitionResult(User user, Double confidence) {
            this.user = user;
            this.confidence = confidence;
        }
        
        public boolean isRecognized() {
            return user != null && confidence != null;
        }
    }
}
```

```java
// src/main/java/com/attendance/service/AttendanceService.java
package com.attendance.service;

import com.attendance.entity.AttendanceRecord;
import com.attendance.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    
    private final UserMapper userMapper;
    
    @Transactional
    public AttendanceRecord recordAttendance(Long userId, Double confidence, String notes) {
        // 오늘 이미 출석했는지 확인
        var existingRecord = userMapper.findTodayAttendanceByUserId(userId);
        if (existingRecord.isPresent()) {
            // 이미 출석한 경우 기존 기록 반환
            return existingRecord.get();
        }
        
        // 출석 상태 결정 (9시 30분까지 정상, 이후 지각)
        LocalDateTime now = LocalDateTime.now();
        AttendanceRecord.AttendanceStatus status = now.toLocalTime().isBefore(LocalTime.of(9, 30)) 
                ? AttendanceRecord.AttendanceStatus.ATTENDANCE 
                : AttendanceRecord.AttendanceStatus.LATE;
        
        AttendanceRecord record = new AttendanceRecord();
        record.setUserId(userId);
        record.setRecognitionConfidence(confidence);
        record.setAttendanceTime(now);
        record.setStatus(status);
        record.setNotes(notes);
        
        userMapper.insertAttendanceRecord(record);
        return record;
    }
    
    public List<AttendanceRecord> getTodayAttendance() {
        return userMapper.findTodayAttendanceRecords();
    }
    
    public List<AttendanceRecord> getUserAttendanceHistory(Long userId) {
        // 사용자별 출석 기록 조회 (최근 30일)
        return userMapper.findAttendanceHistoryByUserId(userId);
    }
}
```

## 8. Controller 클래스

```java
// src/main/java/com/attendance/controller/FaceRecognitionController.java
package com.attendance.controller;

import com.attendance.dto.*;
import com.attendance.entity.AttendanceRecord;
import com.attendance.service.AttendanceService;
import com.attendance.service.FaceRecognitionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/face")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 프론트엔드에서 접근 허용
public class FaceRecognitionController {
    
    private final FaceRecognitionService faceRecognitionService;
    private final AttendanceService attendanceService;
    
    @PostMapping("/register")
    public ResponseEntity<?> registerFace(@RequestBody FaceRegistrationRequest request) {
        try {
            var user = faceRecognitionService.registerFace(
                request.getName(),
                request.getEmployeeId(),
                request.getDepartment(),
                request.getDescriptors()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", user.getId());
            response.put("message", "얼굴 등록이 완료되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("얼굴 등록 실패", e);
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "message", "얼굴 등록에 실패했습니다: " + e.getMessage())
            );
        }
    }
    
    @PostMapping("/recognize")
    public ResponseEntity<RecognitionResponse> recognizeFace(@RequestBody RecognitionRequest request) {
        var result = faceRecognitionService.recognizeFace(
            request.getDescriptor(), 
            request.getThreshold()
        );
        
        RecognitionResponse response = new RecognitionResponse();
        
        if (result.isRecognized()) {
            response.setUserId(result.user.getId());
            response.setUserName(result.user.getName());
            response.setEmployeeId(result.user.getEmployeeId());
            response.setConfidence(result.confidence);
            response.setMessage("인식 성공: " + result.user.getName());
            
            // 출석 등록
            if (result.confidence >= 0.9) { // 90% 이상이면 출석 등록
                var attendanceRecord = attendanceService.recordAttendance(
                    result.user.getId(), 
                    result.confidence, 
                    "얼굴 인식 출석"
                );
                response.setAttendanceRegistered(true);
                response.setMessage(response.getMessage() + " - 출석등록 완료");
            } else {
                response.setAttendanceRegistered(false);
                response.setMessage(response.getMessage() + " - 인식률 부족으로 출석등록 안됨");
            }
            
        } else {
            response.setMessage("얼굴을 인식할 수 없습니다.");
            response.setConfidence(0.0);
            response.setAttendanceRegistered(false);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/attendance/today")
    public ResponseEntity<List<AttendanceRecord>> getTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getTodayAttendance());
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        // 등록된 모든 사용자 조회
        return ResponseEntity.ok(Map.of("users", faceRecognitionService.getAllUsers()));
    }
}
```

## 9. Spring Boot 설정 파일

```yaml
# src/main/resources/application.yml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/face_attendance?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
    username: your_username
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jackson:
    property-naming-strategy: SNAKE_CASE
    serialization:
      write-dates-as-timestamps: false

mybatis:
  type-aliases-package: com.attendance.entity
  configuration:
    map-underscore-to-camel-case: true

logging:
  level:
    com.attendance: DEBUG
```

## 10. build.gradle

```gradle
plugins {
    id 'org.springframework.boot' version '2.7.0'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'java'
}

group = 'com.attendance'
version = '1.0.0'
sourceCompatibility = '11'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:2.2.2'
    implementation 'mysql:mysql-connector-java:8.0.33'
    
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
    useJUnitPlatform()
}
```

## 11. 메인 애플리케이션 클래스

```java
// src/main/java/com/attendance/FaceAttendanceApplication.java
package com.attendance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FaceAttendanceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FaceAttendanceApplication.class, args);
    }
}
```

이제 프론트엔드 코드를 수정하여 백엔드 API와 통신하도록 업데이트하겠습니다.
