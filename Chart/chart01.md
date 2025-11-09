# 스프링부트 + Chart.js - 선그래프와 누적 막대그래프 추가

선그래프와 누적 막대그래프를 추가한 확장된 버전입니다.

## 1. 업데이트된 프로젝트 구조

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
│   │                   ├── ChartData.java
│   │                   └── StackedChartData.java
│   └── resources/
│       ├── static/
│       │   ├── css/
│       │   │   └── style.css
│       │   └── js/
│       │       └── chart.js
│       └── templates/
│           └── index.html
```

## 2. 업데이트된 백엔드 코드

### StackedChartData.java (누적 차트 데이터 모델)
```java
package com.example.chartdemo.model;

import java.util.List;
import java.util.Map;

public class StackedChartData {
    private List<String> labels;
    private List<Dataset> datasets;
    private String title;
    
    public StackedChartData() {}
    
    public StackedChartData(List<String> labels, List<Dataset> datasets, String title) {
        this.labels = labels;
        this.datasets = datasets;
        this.title = title;
    }
    
    // 내부 Dataset 클래스
    public static class Dataset {
        private String label;
        private List<Integer> data;
        private String backgroundColor;
        
        public Dataset() {}
        
        public Dataset(String label, List<Integer> data, String backgroundColor) {
            this.label = label;
            this.data = data;
            this.backgroundColor = backgroundColor;
        }
        
        // Getters and Setters
        public String getLabel() {
            return label;
        }
        
        public void setLabel(String label) {
            this.label = label;
        }
        
        public List<Integer> getData() {
            return data;
        }
        
        public void setData(List<Integer> data) {
            this.data = data;
        }
        
        public String getBackgroundColor() {
            return backgroundColor;
        }
        
        public void setBackgroundColor(String backgroundColor) {
            this.backgroundColor = backgroundColor;
        }
    }
    
    // Getters and Setters
    public List<String> getLabels() {
        return labels;
    }
    
    public void setLabels(List<String> labels) {
        this.labels = labels;
    }
    
    public List<Dataset> getDatasets() {
        return datasets;
    }
    
    public void setDatasets(List<Dataset> datasets) {
        this.datasets = datasets;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
}
```

### 업데이트된 ChartController.java
```java
package com.example.chartdemo.controller;

import com.example.chartdemo.model.ChartData;
import com.example.chartdemo.model.StackedChartData;
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
    
    // 막대 그래프 데이터
    @GetMapping("/api/chart-data")
    public ChartData getChartData() {
        List<String> labels = Arrays.asList("1월", "2월", "3월", "4월", "5월", "6월");
        List<Integer> values = Arrays.asList(65, 59, 80, 81, 56, 55);
        String title = "2023년 상반기 판매량";
        
        return new ChartData(labels, values, title);
    }
    
    // 원형 그래프 데이터
    @GetMapping("/api/pie-chart-data")
    public ChartData getPieChartData() {
        List<String> labels = Arrays.asList("Red", "Blue", "Yellow", "Green", "Purple", "Orange");
        List<Integer> values = Arrays.asList(12, 19, 3, 5, 2, 3);
        String title = "색상 분포";
        
        return new ChartData(labels, values, title);
    }
    
    // 선 그래프 데이터
    @GetMapping("/api/line-chart-data")
    public ChartData getLineChartData() {
        List<String> labels = Arrays.asList("1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월");
        List<Integer> values = Arrays.asList(65, 59, 80, 81, 56, 55, 70, 75, 82, 78, 85, 90);
        String title = "2023년 월별 방문자 수";
        
        return new ChartData(labels, values, title);
    }
    
    // 다중 선 그래프 데이터
    @GetMapping("/api/multi-line-chart-data")
    public StackedChartData getMultiLineChartData() {
        List<String> labels = Arrays.asList("1월", "2월", "3월", "4월", "5월", "6월");
        
        List<StackedChartData.Dataset> datasets = Arrays.asList(
            new StackedChartData.Dataset(
                "제품 A", 
                Arrays.asList(30, 45, 60, 50, 70, 65),
                "rgba(255, 99, 132, 0.7)"
            ),
            new StackedChartData.Dataset(
                "제품 B", 
                Arrays.asList(20, 35, 40, 45, 30, 50),
                "rgba(54, 162, 235, 0.7)"
            ),
            new StackedChartData.Dataset(
                "제품 C", 
                Arrays.asList(15, 25, 35, 30, 40, 45),
                "rgba(255, 206, 86, 0.7)"
            )
        );
        
        return new StackedChartData(labels, datasets, "2023년 상반기 제품별 판매량");
    }
    
    // 누적 막대 그래프 데이터
    @GetMapping("/api/stacked-bar-chart-data")
    public StackedChartData getStackedBarChartData() {
        List<String> labels = Arrays.asList("1분기", "2분기", "3분기", "4분기");
        
        List<StackedChartData.Dataset> datasets = Arrays.asList(
            new StackedChartData.Dataset(
                "온라인 판매", 
                Arrays.asList(120, 150, 180, 200),
                "rgba(255, 99, 132, 0.7)"
            ),
            new StackedChartData.Dataset(
                "오프라인 판매", 
                Arrays.asList(80, 100, 120, 140),
                "rgba(54, 162, 235, 0.7)"
            ),
            new StackedChartData.Dataset(
                "모바일 판매", 
                Arrays.asList(60, 80, 100, 120),
                "rgba(75, 192, 192, 0.7)"
            )
        );
        
        return new StackedChartData(labels, datasets, "2023년 분기별 판매 채널");
    }
}
```

## 3. 업데이트된 프론트엔드 코드

### 업데이트된 index.html
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
            <button id="loadBarChart">막대 그래프</button>
            <button id="loadPieChart">원형 그래프</button>
            <button id="loadLineChart">선 그래프</button>
            <button id="loadMultiLineChart">다중 선 그래프</button>
            <button id="loadStackedBarChart">누적 막대 그래프</button>
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

### 업데이트된 style.css
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
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 30px;
}

button {
    padding: 10px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
    flex: 1;
    min-width: 120px;
    max-width: 180px;
}

button:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
}

#loadBarChart {
    background-color: #3498db;
}

#loadPieChart {
    background-color: #9b59b6;
}

#loadLineChart {
    background-color: #2ecc71;
}

#loadMultiLineChart {
    background-color: #e67e22;
}

#loadStackedBarChart {
    background-color: #34495e;
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
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 30px;
    transition: all 0.3s;
}

.chart-container:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.chart-wrapper {
    position: relative;
    height: 500px;
    width: 100%;
}

.data-info {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
    transition: all 0.3s;
}

.data-info:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.data-info h3 {
    margin-bottom: 15px;
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 8px;
}

#dataInfo {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 6px;
    min-height: 80px;
    border-left: 4px solid #3498db;
}

.dataset-info {
    margin-top: 10px;
    padding: 10px;
    background-color: #e8f4f8;
    border-radius: 4px;
    border-left: 3px solid #2980b9;
}

.dataset-info h4 {
    color: #2c3e50;
    margin-bottom: 5px;
}

@media (max-width: 768px) {
    .controls {
        flex-direction: column;
    }
    
    button {
        max-width: 100%;
    }
    
    .chart-wrapper {
        height: 400px;
    }
}
```

### 업데이트된 chart.js
```javascript
// 전역 변수로 차트 인스턴스 저장
let myChart = null;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 버튼 이벤트 리스너 등록
    document.getElementById('loadBarChart').addEventListener('click', loadBarChart);
    document.getElementById('loadPieChart').addEventListener('click', loadPieChart);
    document.getElementById('loadLineChart').addEventListener('click', loadLineChart);
    document.getElementById('loadMultiLineChart').addEventListener('click', loadMultiLineChart);
    document.getElementById('loadStackedBarChart').addEventListener('click', loadStackedBarChart);
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

// 선 그래프 로드 함수
function loadLineChart() {
    fetch('/api/line-chart-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답에 문제가 있습니다.');
            }
            return response.json();
        })
        .then(data => {
            displayDataInfo(data);
            renderLineChart(data);
        })
        .catch(error => {
            console.error('데이터를 가져오는 중 오류 발생:', error);
            alert('데이터를 가져오는 중 오류가 발생했습니다.');
        });
}

// 다중 선 그래프 로드 함수
function loadMultiLineChart() {
    fetch('/api/multi-line-chart-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답에 문제가 있습니다.');
            }
            return response.json();
        })
        .then(data => {
            displayStackedDataInfo(data);
            renderMultiLineChart(data);
        })
        .catch(error => {
            console.error('데이터를 가져오는 중 오류 발생:', error);
            alert('데이터를 가져오는 중 오류가 발생했습니다.');
        });
}

// 누적 막대 그래프 로드 함수
function loadStackedBarChart() {
    fetch('/api/stacked-bar-chart-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('네트워크 응답에 문제가 있습니다.');
            }
            return response.json();
        })
        .then(data => {
            displayStackedDataInfo(data);
            renderStackedBarChart(data);
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

// 선 그래프 렌더링 함수
function renderLineChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // 기존 차트가 있으면 제거
    if (myChart) {
        myChart.destroy();
    }
    
    // 새로운 차트 생성
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: data.title,
                data: data.values,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
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

// 다중 선 그래프 렌더링 함수
function renderMultiLineChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // 기존 차트가 있으면 제거
    if (myChart) {
        myChart.destroy();
    }
    
    // datasets 변환
    const chartDatasets = data.datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor,
        borderColor: dataset.backgroundColor.replace('0.7', '1'),
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: dataset.backgroundColor.replace('0.7', '1'),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
    }));
    
    // 새로운 차트 생성
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: chartDatasets
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

// 누적 막대 그래프 렌더링 함수
function renderStackedBarChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // 기존 차트가 있으면 제거
    if (myChart) {
        myChart.destroy();
    }
    
    // datasets 변환
    const chartDatasets = data.datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor,
        borderColor: dataset.backgroundColor.replace('0.7', '1'),
        borderWidth: 1
    }));
    
    // 새로운 차트 생성
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: chartDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
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

// 단일 데이터 정보 표시 함수
function displayDataInfo(data) {
    const dataInfoDiv = document.getElementById('dataInfo');
    
    let infoHTML = `
        <p><strong>제목:</strong> ${data.title}</p>
        <p><strong>레이블:</strong> ${data.labels.join(', ')}</p>
        <p><strong>값:</strong> ${data.values.join(', ')}</p>
        <p><strong>데이터 수:</strong> ${data.labels.length}개</p>
        <p><strong>총합:</strong> ${data.values.reduce((a, b) => a + b, 0)}</p>
        <p><strong>평균:</strong> ${(data.values.reduce((a, b) => a + b, 0) / data.values.length).toFixed(2)}</p>
    `;
    
    dataInfoDiv.innerHTML = infoHTML;
}

// 다중 데이터 정보 표시 함수
function displayStackedDataInfo(data) {
    const dataInfoDiv = document.getElementById('dataInfo');
    
    let infoHTML = `
        <p><strong>제목:</strong> ${data.title}</p>
        <p><strong>레이블:</strong> ${data.labels.join(', ')}</p>
        <p><strong>데이터셋 수:</strong> ${data.datasets.length}개</p>
        <p><strong>데이터 포인트 수:</strong> ${data.labels.length}개</p>
    `;
    
    // 각 데이터셋 정보 추가
    data.datasets.forEach(dataset => {
        const total = dataset.data.reduce((a, b) => a + b, 0);
        const average = total / dataset.data.length;
        
        infoHTML += `
            <div class="dataset-info">
                <h4>${dataset.label}</h4>
                <p><strong>값:</strong> ${dataset.data.join(', ')}</p>
                <p><strong>총합:</strong> ${total}</p>
                <p><strong>평균:</strong> ${average.toFixed(2)}</p>
            </div>
        `;
    });
    
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

## 4. 새로운 기능 설명

### 추가된 차트 유형:
1. **선 그래프**: 시간에 따른 데이터 변화 추세를 보여줍니다
2. **다중 선 그래프**: 여러 데이터 시리즈를 하나의 차트에서 비교합니다
3. **누적 막대 그래프**: 여러 카테고리의 데이터를 쌓아서 전체와 부분을 동시에 보여줍니다

### 개선된 기능:
- 반응형 디자인 개선
- 데이터 통계 정보 추가 (총합, 평균)
- 다중 데이터셋 정보 표시
- 호버 효과 및 시각적 개선

이제 다양한 유형의 차트를 통해 더 풍부한 데이터 시각화를 제공할 수 있습니다. 각 차트 유형은 서로 다른 데이터 패턴을 효과적으로 보여주며, 실제 비즈니스 시나리오에 맞게 데이터를 활용할 수 있습니다.
