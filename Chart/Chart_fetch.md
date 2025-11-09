# 스프링부트 + Chart.js + 반복 데이터 요청 기능

사용자가 주기를 설정하여 자동으로 데이터를 요청하고 수동으로도 요청할 수 있는 기능을 추가했습니다.

## 1. 최종 프로젝트 구조

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

## 2. 백엔드 코드 (변경 없음)

이전과 동일하게 유지됩니다.

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
        
        <!-- 자동 업데이트 컨트롤 -->
        <div class="auto-update-controls">
            <h3>자동 업데이트 설정</h3>
            <div class="control-group">
                <label for="updateInterval">업데이트 주기 (초):</label>
                <select id="updateInterval">
                    <option value="0">수동 모드</option>
                    <option value="10">10초</option>
                    <option value="15">15초</option>
                    <option value="20">20초</option>
                    <option value="30">30초</option>
                </select>
                <button id="startAutoUpdate">자동 업데이트 시작</button>
                <button id="stopAutoUpdate">자동 업데이트 중지</button>
            </div>
            <div class="status">
                <span id="updateStatus">현재 상태: 수동 모드</span>
                <span id="lastUpdateTime">마지막 업데이트: -</span>
            </div>
        </div>
        
        <!-- 차트 타입 선택 -->
        <div class="chart-type-controls">
            <h3>차트 타입 선택</h3>
            <div class="controls">
                <button id="loadBarChart">막대 그래프</button>
                <button id="loadPieChart">원형 그래프</button>
                <button id="loadLineChart">선 그래프</button>
                <button id="loadMultiLineChart">다중 선 그래프</button>
                <button id="loadStackedBarChart">누적 막대 그래프</button>
                <button id="clearCharts">차트 지우기</button>
            </div>
        </div>
        
        <!-- 실시간 데이터 새로고침 -->
        <div class="manual-refresh">
            <button id="refreshData">데이터 새로고침</button>
            <span id="refreshStatus"></span>
        </div>
        
        <!-- 차트 컨테이너 -->
        <div class="chart-container">
            <div class="chart-header">
                <h3 id="chartTitle">차트를 선택해주세요</h3>
                <div class="chart-actions">
                    <button id="exportChart">차트 내보내기</button>
                </div>
            </div>
            <div class="chart-wrapper">
                <canvas id="myChart"></canvas>
            </div>
        </div>
        
        <!-- 데이터 정보 -->
        <div class="data-info">
            <h3>데이터 정보</h3>
            <div id="dataInfo"></div>
        </div>
        
        <!-- 요청 기록 -->
        <div class="request-history">
            <h3>최근 요청 기록</h3>
            <div id="requestLog"></div>
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

h3 {
    margin-bottom: 15px;
    color: #2c3e50;
}

/* 자동 업데이트 컨트롤 */
.auto-update-controls {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 25px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.auto-update-controls h3 {
    color: white;
    margin-bottom: 15px;
}

.control-group {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
    margin-bottom: 15px;
}

.control-group label {
    font-weight: 600;
}

.control-group select {
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    background-color: white;
    color: #333;
}

.status {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
}

/* 차트 타입 컨트롤 */
.chart-type-controls {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 25px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

/* 수동 새로고침 */
.manual-refresh {
    background-color: white;
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 25px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 15px;
}

/* 차트 컨테이너 */
.chart-container {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 25px;
    transition: all 0.3s;
}

.chart-container:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
}

.chart-header h3 {
    margin: 0;
    color: #2c3e50;
}

.chart-actions {
    display: flex;
    gap: 10px;
}

.chart-wrapper {
    position: relative;
    height: 500px;
    width: 100%;
}

/* 데이터 정보 */
.data-info {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 25px;
    transition: all 0.3s;
}

.data-info:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

#dataInfo {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 6px;
    min-height: 80px;
    border-left: 4px solid #3498db;
}

/* 요청 기록 */
.request-history {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 25px;
}

#requestLog {
    max-height: 200px;
    overflow-y: auto;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.request-item {
    padding: 8px 12px;
    margin-bottom: 5px;
    background-color: white;
    border-radius: 4px;
    border-left: 4px solid #3498db;
    font-size: 14px;
}

.request-item.success {
    border-left-color: #2ecc71;
}

.request-item.error {
    border-left-color: #e74c3c;
}

/* 버튼 스타일 */
button {
    padding: 10px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
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

button:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
    transform: none;
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

#refreshData {
    background-color: #27ae60;
    min-width: 150px;
}

#startAutoUpdate {
    background-color: #27ae60;
}

#stopAutoUpdate {
    background-color: #e74c3c;
}

#clearCharts {
    background-color: #e74c3c;
}

#exportChart {
    background-color: #8e44ad;
    min-width: 120px;
}

/* 상태 표시 */
#updateStatus {
    font-weight: 600;
}

#lastUpdateTime {
    color: rgba(255, 255, 255, 0.9);
}

#refreshStatus {
    color: #27ae60;
    font-weight: 600;
}

.loading {
    color: #f39c12 !important;
}

.error {
    color: #e74c3c !important;
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
    
    .control-group {
        flex-direction: column;
        align-items: flex-start;
    }
    
    button {
        max-width: 100%;
    }
    
    .chart-wrapper {
        height: 400px;
    }
    
    .chart-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }
    
    .status {
        flex-direction: column;
        gap: 5px;
    }
}
```

### 완전히 새로 작성된 chart.js
```javascript
// 전역 변수
let myChart = null;
let autoUpdateInterval = null;
let currentChartType = null;
let currentEndpoint = null;
let requestHistory = [];

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 애플리케이션 초기화
function initializeApp() {
    // 이벤트 리스너 등록
    setupEventListeners();
    
    // 초기 상태 설정
    updateStatus('수동 모드');
    updateLastUpdateTime();
    
    // 요청 기록 초기화
    updateRequestLog();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 차트 타입 버튼
    document.getElementById('loadBarChart').addEventListener('click', () => loadChart('bar', '/api/chart-data'));
    document.getElementById('loadPieChart').addEventListener('click', () => loadChart('pie', '/api/pie-chart-data'));
    document.getElementById('loadLineChart').addEventListener('click', () => loadChart('line', '/api/line-chart-data'));
    document.getElementById('loadMultiLineChart').addEventListener('click', () => loadChart('multi-line', '/api/multi-line-chart-data'));
    document.getElementById('loadStackedBarChart').addEventListener('click', () => loadChart('stacked-bar', '/api/stacked-bar-chart-data'));
    
    // 컨트롤 버튼
    document.getElementById('clearCharts').addEventListener('click', clearCharts);
    document.getElementById('refreshData').addEventListener('click', refreshData);
    document.getElementById('startAutoUpdate').addEventListener('click', startAutoUpdate);
    document.getElementById('stopAutoUpdate').addEventListener('click', stopAutoUpdate);
    document.getElementById('exportChart').addEventListener('click', exportChart);
    
    // 인터벌 선택 변경
    document.getElementById('updateInterval').addEventListener('change', handleIntervalChange);
}

// 차트 로드 함수
function loadChart(chartType, endpoint) {
    currentChartType = chartType;
    currentEndpoint = endpoint;
    
    fetchData(endpoint)
        .then(data => {
            renderChart(chartType, data);
            updateChartTitle(getChartTitle(chartType));
            addToRequestHistory(endpoint, 'success', `차트 로드: ${chartType}`);
        })
        .catch(error => {
            console.error('차트 로드 중 오류:', error);
            addToRequestHistory(endpoint, 'error', `차트 로드 실패: ${error.message}`);
            alert('차트 데이터를 불러오는 중 오류가 발생했습니다.');
        });
}

// 데이터 새로고침
function refreshData() {
    if (!currentChartType || !currentEndpoint) {
        alert('먼저 차트를 선택해주세요.');
        return;
    }
    
    const refreshBtn = document.getElementById('refreshData');
    const statusSpan = document.getElementById('refreshStatus');
    
    refreshBtn.disabled = true;
    statusSpan.textContent = '업데이트 중...';
    statusSpan.className = 'loading';
    
    fetchData(currentEndpoint)
        .then(data => {
            renderChart(currentChartType, data);
            updateLastUpdateTime();
            statusSpan.textContent = '업데이트 완료!';
            statusSpan.className = '';
            addToRequestHistory(currentEndpoint, 'success', '수동 업데이트');
            
            // 2초 후 상태 메시지 초기화
            setTimeout(() => {
                statusSpan.textContent = '';
            }, 2000);
        })
        .catch(error => {
            console.error('데이터 새로고침 중 오류:', error);
            statusSpan.textContent = '업데이트 실패';
            statusSpan.className = 'error';
            addToRequestHistory(currentEndpoint, 'error', `업데이트 실패: ${error.message}`);
        })
        .finally(() => {
            refreshBtn.disabled = false;
        });
}

// Fetch API를 사용한 데이터 요청
function fetchData(endpoint) {
    return new Promise((resolve, reject) => {
        fetch(endpoint)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

// 자동 업데이트 시작
function startAutoUpdate() {
    const intervalSelect = document.getElementById('updateInterval');
    const interval = parseInt(intervalSelect.value);
    
    if (interval === 0) {
        alert('업데이트 주기를 선택해주세요.');
        return;
    }
    
    if (!currentChartType || !currentEndpoint) {
        alert('먼저 차트를 선택해주세요.');
        return;
    }
    
    // 기존 인터벌 정리
    stopAutoUpdate();
    
    // 새로운 인터벌 설정
    autoUpdateInterval = setInterval(() => {
        if (currentChartType && currentEndpoint) {
            fetchData(currentEndpoint)
                .then(data => {
                    renderChart(currentChartType, data);
                    updateLastUpdateTime();
                    addToRequestHistory(currentEndpoint, 'success', `자동 업데이트 (${interval}초)`);
                })
                .catch(error => {
                    console.error('자동 업데이트 중 오류:', error);
                    addToRequestHistory(currentEndpoint, 'error', `자동 업데이트 실패: ${error.message}`);
                });
        }
    }, interval * 1000);
    
    updateStatus(`자동 업데이트 중 (${interval}초 주기)`);
    document.getElementById('startAutoUpdate').disabled = true;
    document.getElementById('stopAutoUpdate').disabled = false;
}

// 자동 업데이트 중지
function stopAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
    }
    
    updateStatus('수동 모드');
    document.getElementById('startAutoUpdate').disabled = false;
    document.getElementById('stopAutoUpdate').disabled = true;
}

// 인터벌 변경 처리
function handleIntervalChange() {
    const interval = parseInt(document.getElementById('updateInterval').value);
    
    if (interval === 0) {
        stopAutoUpdate();
    } else if (autoUpdateInterval) {
        // 인터벌이 변경되었고 자동 업데이트가 실행 중이면 재시작
        startAutoUpdate();
    }
}

// 차트 렌더링 함수
function renderChart(chartType, data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // 기존 차트 제거
    if (myChart) {
        myChart.destroy();
    }
    
    // 데이터 정보 표시
    if (chartType === 'multi-line' || chartType === 'stacked-bar') {
        displayStackedDataInfo(data);
    } else {
        displayDataInfo(data);
    }
    
    // 차트 생성
    switch (chartType) {
        case 'bar':
            myChart = createBarChart(ctx, data);
            break;
        case 'pie':
            myChart = createPieChart(ctx, data);
            break;
        case 'line':
            myChart = createLineChart(ctx, data);
            break;
        case 'multi-line':
            myChart = createMultiLineChart(ctx, data);
            break;
        case 'stacked-bar':
            myChart = createStackedBarChart(ctx, data);
            break;
    }
}

// 차트 생성 함수들
function createBarChart(ctx, data) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: data.title,
                data: data.values,
                backgroundColor: generateColors(data.labels.length, 0.7),
                borderColor: generateColors(data.labels.length, 1),
                borderWidth: 1
            }]
        },
        options: getChartOptions(data.title, 'bar')
    });
}

function createPieChart(ctx, data) {
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                label: data.title,
                data: data.values,
                backgroundColor: generateColors(data.labels.length, 0.7),
                borderColor: generateColors(data.labels.length, 1),
                borderWidth: 1
            }]
        },
        options: getChartOptions(data.title, 'pie')
    });
}

function createLineChart(ctx, data) {
    return new Chart(ctx, {
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
        options: getChartOptions(data.title, 'line')
    });
}

function createMultiLineChart(ctx, data) {
    const chartDatasets = data.datasets.map((dataset, index) => ({
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
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: chartDatasets
        },
        options: getChartOptions(data.title, 'line')
    });
}

function createStackedBarChart(ctx, data) {
    const chartDatasets = data.datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor,
        borderColor: dataset.backgroundColor.replace('0.7', '1'),
        borderWidth: 1
    }));
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: chartDatasets
        },
        options: getChartOptions(data.title, 'bar', true)
    });
}

// 차트 옵션 생성
function getChartOptions(title, type, stacked = false) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    size: 18,
                    weight: 'bold'
                },
                padding: 20
            },
            legend: {
                display: true,
                position: type === 'pie' ? 'right' : 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        scales: {}
    };
    
    if (type === 'bar' || type === 'line') {
        options.scales.y = {
            beginAtZero: true
        };
        
        if (stacked) {
            options.scales.x = { stacked: true };
            options.scales.y = { ...options.scales.y, stacked: true };
        }
    }
    
    return options;
}

// 유틸리티 함수들
function generateColors(count, alpha = 1) {
    const colors = [
        `rgba(255, 99, 132, ${alpha})`,
        `rgba(54, 162, 235, ${alpha})`,
        `rgba(255, 206, 86, ${alpha})`,
        `rgba(75, 192, 192, ${alpha})`,
        `rgba(153, 102, 255, ${alpha})`,
        `rgba(255, 159, 64, ${alpha})`,
        `rgba(199, 199, 199, ${alpha})`,
        `rgba(83, 102, 255, ${alpha})`,
        `rgba(40, 159, 64, ${alpha})`,
        `rgba(210, 99, 132, ${alpha})`
    ];
    
    return colors.slice(0, count);
}

function getChartTitle(chartType) {
    const titles = {
        'bar': '막대 그래프',
        'pie': '원형 그래프',
        'line': '선 그래프',
        'multi-line': '다중 선 그래프',
        'stacked-bar': '누적 막대 그래프'
    };
    
    return titles[chartType] || '차트';
}

function updateChartTitle(title) {
    document.getElementById('chartTitle').textContent = title;
}

function updateStatus(status) {
    document.getElementById('updateStatus').textContent = `현재 상태: ${status}`;
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR');
    document.getElementById('lastUpdateTime').textContent = `마지막 업데이트: ${timeString}`;
}

function addToRequestHistory(endpoint, type, message) {
    const now = new Date();
    const historyItem = {
        timestamp: now.toLocaleTimeString('ko-KR'),
        endpoint: endpoint,
        type: type,
        message: message
    };
    
    requestHistory.unshift(historyItem);
    
    // 최대 10개 항목만 유지
    if (requestHistory.length > 10) {
        requestHistory = requestHistory.slice(0, 10);
    }
    
    updateRequestLog();
}

function updateRequestLog() {
    const logContainer = document.getElementById('requestLog');
    
    if (requestHistory.length === 0) {
        logContainer.innerHTML = '<div class="request-item">요청 기록이 없습니다.</div>';
        return;
    }
    
    logContainer.innerHTML = requestHistory.map(item => `
        <div class="request-item ${item.type}">
            <strong>[${item.timestamp}]</strong> ${item.message}
        </div>
    `).join('');
}

function displayDataInfo(data) {
    const total = data.values.reduce((a, b) => a + b, 0);
    const average = total / data.values.length;
    
    const infoHTML = `
        <p><strong>제목:</strong> ${data.title}</p>
        <p><strong>레이블:</strong> ${data.labels.join(', ')}</p>
        <p><strong>값:</strong> ${data.values.join(', ')}</p>
        <p><strong>데이터 수:</strong> ${data.labels.length}개</p>
        <p><strong>총합:</strong> ${total}</p>
        <p><strong>평균:</strong> ${average.toFixed(2)}</p>
        <p><strong>최대값:</strong> ${Math.max(...data.values)}</p>
        <p><strong>최소값:</strong> ${Math.min(...data.values)}</p>
    `;
    
    document.getElementById('dataInfo').innerHTML = infoHTML;
}

function displayStackedDataInfo(data) {
    let infoHTML = `
        <p><strong>제목:</strong> ${data.title}</p>
        <p><strong>레이블:</strong> ${data.labels.join(', ')}</p>
        <p><strong>데이터셋 수:</strong> ${data.datasets.length}개</p>
        <p><strong>데이터 포인트 수:</strong> ${data.labels.length}개</p>
    `;
    
    data.datasets.forEach(dataset => {
        const total = dataset.data.reduce((a, b) => a + b, 0);
        const average = total / dataset.data.length;
        
        infoHTML += `
            <div class="dataset-info">
                <h4>${dataset.label}</h4>
                <p><strong>값:</strong> ${dataset.data.join(', ')}</p>
                <p><strong>총합:</strong> ${total}</p>
                <p><strong>평균:</strong> ${average.toFixed(2)}</p>
                <p><strong>최대값:</strong> ${Math.max(...dataset.data)}</p>
                <p><strong>최소값:</strong> ${Math.min(...dataset.data)}</p>
            </div>
        `;
    });
    
    document.getElementById('dataInfo').innerHTML = infoHTML;
}

function clearCharts() {
    if (myChart) {
        myChart.destroy();
        myChart = null;
    }
    
    document.getElementById('dataInfo').innerHTML = '';
    document.getElementById('chartTitle').textContent = '차트를 선택해주세요';
    currentChartType = null;
    currentEndpoint = null;
    
    addToRequestHistory('N/A', 'success', '차트 초기화');
}

function exportChart() {
    if (!myChart) {
        alert('내보낼 차트가 없습니다.');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `chart-${new Date().getTime()}.png`;
    link.href = myChart.toBase64Image();
    link.click();
    
    addToRequestHistory('N/A', 'success', '차트 내보내기');
}
```

## 4. 새로운 기능 설명

### 추가된 주요 기능:

1. **자동 업데이트 시스템**:
   - 10초, 15초, 20초, 30초 주기 선택
   - 시작/중지 버튼으로 제어
   - 실시간 상태 표시

2. **수동 새로고침**:
   - 언제든지 데이터를 수동으로 갱신
   - 업데이트 상태 실시간 표시

3. **요청 기록**:
   - 모든 데이터 요청 기록 저장
   - 성공/실패 상태 표시
   - 타임스탬프 포함

4. **향상된 UI/UX**:
   - 직관적인 컨트롤 패널
   - 상태 표시기
   - 반응형 디자인

5. **추가 기능**:
   - 차트 내보내기 기능
   - 상세한 데이터 통계
   - 에러 처리 및 사용자 피드백

### 사용 방법:

1. 원하는 차트 타입 선택
2. 업데이트 주기 설정 (수동 모드 또는 자동 모드)
3. 자동 업데이트 시작/중지로 제어
4. 필요시 수동 새로고침 사용
5. 요청 기록에서 상태 확인

이제 사용자는 원하는 주기로 데이터를 자동으로 갱신하거나 수동으로 요청할 수 있으며, 모든 요청의 상태를 실시간으로 확인할 수 있습니다.
