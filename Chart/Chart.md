# 스프링부트 + Chart.js를 이용한 데이터 시각화 애플리케이션

간단한 스프링부트 애플리케이션을 만들어 JavaScript로 데이터를 요청하고, Chart.js를 사용해 차트를 표시하는 예제를 구현해보겠습니다.

## 1. 프로젝트 구조

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── example/
│   │           └── chartdemo/
│   │               ├── ChartDemoApplication.java
│   │               ├── controller/
│   │               │   └── ChartController.java
│   │               └── model/
│   │                   └── ChartData.java
│   └── resources/
│       ├── static/
│       │   ├── css/
│       │   │   └── style.css
│       │   └── js/
│       │       └── chart.js
│       └── templates/
│           └── index.html
```

## 2. 의존성 설정 (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>chart-demo</artifactId>
    <version>1.0.0</version>
    <name>chart-demo</name>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## 3. 백엔드 코드

### ChartData.java (데이터 모델)
```java
package com.example.chartdemo.model;

import java.util.List;

public class ChartData {
    private List<String> labels;
    private List<Integer> values;
    private String title;
    
    public ChartData() {}
    
    public ChartData(List<String> labels, List<Integer> values, String title) {
        this.labels = labels;
        this.values = values;
        this.title = title;
    }
    
    // Getters and Setters
    public List<String> getLabels() {
        return labels;
    }
    
    public void setLabels(List<String> labels) {
        this.labels = labels;
    }
    
    public List<Integer> getValues() {
        return values;
    }
    
    public void setValues(List<Integer> values) {
        this.values = values;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
}
```

### ChartController.java (컨트롤러)
```java
package com.example.chartdemo.controller;

import com.example.chartdemo.model.ChartData;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import java.util.Arrays;
import java.util.List;

@RestController
public class ChartController {
    
    // 기본 페이지
    @RequestMapping("/")
    public ModelAndView index() {
        return new ModelAndView("index");
    }
    
    // 차트 데이터 API
    @GetMapping("/api/chart-data")
    public ChartData getChartData() {
        List<String> labels = Arrays.asList("1월", "2월", "3월", "4월", "5월", "6월");
        List<Integer> values = Arrays.asList(65, 59, 80, 81, 56, 55);
        String title = "2023년 상반기 판매량";
        
        return new ChartData(labels, values, title);
    }
    
    // 다른 유형의 차트 데이터
    @GetMapping("/api/pie-chart-data")
    public ChartData getPieChartData() {
        List<String> labels = Arrays.asList("Red", "Blue", "Yellow", "Green", "Purple", "Orange");
        List<Integer> values = Arrays.asList(12, 19, 3, 5, 2, 3);
        String title = "색상 분포";
        
        return new ChartData(labels, values, title);
    }
}
```

### ChartDemoApplication.java (메인 애플리케이션)
```java
package com.example.chartdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChartDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChartDemoApplication.class, args);
    }
}
```

## 4. 프론트엔드 코드

### index.html
```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chart.js + Spring Boot Demo</title>
    <link rel="stylesheet" th:href="@{/css/style.css}">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <h1>Chart.js + Spring Boot 데이터 시각화</h1>
        
        <div class="controls">
            <button id="loadBarChart">막대 그래프 로드</button>
            <button id="loadPieChart">원형 그래프 로드</button>
            <button id="clearCharts">차트 지우기</button>
        </div>
        
        <div class="chart-container">
            <div class="chart-wrapper">
                <canvas id="myChart"></canvas>
            </div>
        </div>
        
        <div class="data-info">
            <h3>데이터 정보</h3>
            <div id="dataInfo"></div>
        </div>
    </div>
    
    <script th:src="@{/js/chart.js}"></script>
</body>
</html>
```

### style.css
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #2c3e50;
}

.controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;
}

button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #2980b9;
}

#clearCharts {
    background-color: #e74c3c;
}

#clearCharts:hover {
    background-color: #c0392b;
}

.chart-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 30px;
}

.chart-wrapper {
    position: relative;
    height: 400px;
    width: 100%;
}

.data-info {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.data-info h3 {
    margin-bottom: 15px;
    color: #2c3e50;
}

#dataInfo {
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    min-height: 50px;
}
```

### chart.js
```javascript
// 전역 변수로 차트 인스턴스 저장
let myChart = null;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 버튼 이벤트 리스너 등록
    document.getElementById('loadBarChart').addEventListener('click', loadBarChart);
    document.getElementById('loadPieChart').addEventListener('click', loadPieChart);
    document.getElementById('clearCharts').addEventListener('click', clearCharts);
});

// 막대 그래프 로드 함수
function loadBarChart() {
    fetch('/api/chart-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답에 문제가 있습니다.');
            }
            return response.json();
        })
        .then(data => {
            displayDataInfo(data);
            renderBarChart(data);
        })
        .catch(error => {
            console.error('데이터를 가져오는 중 오류 발생:', error);
            alert('데이터를 가져오는 중 오류가 발생했습니다.');
        });
}

// 원형 그래프 로드 함수
function loadPieChart() {
    fetch('/api/pie-chart-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답에 문제가 있습니다.');
            }
            return response.json();
        })
        .then(data => {
            displayDataInfo(data);
            renderPieChart(data);
        })
        .catch(error => {
            console.error('데이터를 가져오는 중 오류 발생:', error);
            alert('데이터를 가져오는 중 오류가 발생했습니다.');
        });
}

// 막대 그래프 렌더링 함수
function renderBarChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // 기존 차트가 있으면 제거
    if (myChart) {
        myChart.destroy();
    }
    
    // 새로운 차트 생성
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: data.title,
                data: data.values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: data.title,
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// 원형 그래프 렌더링 함수
function renderPieChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // 기존 차트가 있으면 제거
    if (myChart) {
        myChart.destroy();
    }
    
    // 새로운 차트 생성
    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                label: data.title,
                data: data.values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: data.title,
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: true,
                    position: 'right'
                }
            }
        }
    });
}

// 데이터 정보 표시 함수
function displayDataInfo(data) {
    const dataInfoDiv = document.getElementById('dataInfo');
    
    let infoHTML = `
        <p><strong>제목:</strong> ${data.title}</p>
        <p><strong>레이블:</strong> ${data.labels.join(', ')}</p>
        <p><strong>값:</strong> ${data.values.join(', ')}</p>
        <p><strong>데이터 수:</strong> ${data.labels.length}개</p>
    `;
    
    dataInfoDiv.innerHTML = infoHTML;
}

// 차트 지우기 함수
function clearCharts() {
    if (myChart) {
        myChart.destroy();
        myChart = null;
    }
    
    document.getElementById('dataInfo').innerHTML = '';
}
```

## 5. 실행 방법

1. 프로젝트를 생성하고 위의 파일들을 적절한 위치에 추가합니다.
2. Maven을 사용하여 의존성을 설치합니다: `mvn clean install`
3. 애플리케이션을 실행합니다: `mvn spring-boot:run`
4. 웹 브라우저에서 `http://localhost:8080`으로 접속합니다.

## 6. 기능 설명

- **막대 그래프 로드**: 서버에서 막대 그래프 데이터를 가져와 표시합니다.
- **원형 그래프 로드**: 서버에서 원형 그래프 데이터를 가져와 표시합니다.
- **차트 지우기**: 현재 표시된 차트를 제거합니다.
- **데이터 정보**: 현재 표시된 차트의 데이터 정보를 보여줍니다.

이 예제는 스프링부트 백엔드에서 데이터를 제공하고, JavaScript의 Fetch API를 사용하여 데이터를 요청하며, Chart.js를 사용하여 데이터를 시각화하는 기본적인 방법을 보여줍니다. 실제 프로젝트에서는 데이터베이스 연동, 더 다양한 차트 유형, 에러 처리 등을 추가로 구현할 수 있습니다.
