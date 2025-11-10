// 전역 변수
let myChart = null;
let autoUpdateInterval = null;
let currentChartType = null;
let currentEndpoint = null;
let requestHistory = [];

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
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
            options.scales.x = {stacked: true};
            options.scales.y = {...options.scales.y, stacked: true};
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