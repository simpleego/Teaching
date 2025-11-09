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