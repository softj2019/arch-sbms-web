/* 전역변수 */
let terminalList = []; // 정류장 데이터 배열
const chartInstances = {}; // 차트 인스턴스를 저장하는 객체
let terminalTotalCnt = 0; // 설치된 정류장 수
let initialTerminals = []; // 소켓데이터를 받지 못한 정류장 목록
const terminalDataMap = new Map();
const stationDataMap  = new Map();
// const previousTerminalsCache = new Map(); // 이전에 들어온 터미널 목록(캐싱)
const dashboardData = [
    { title: '통합제어보드'		, cd: 'ctl_board_power'		, data: { on: 0, off: 0 } },
    { title: '스마트스크린'		, cd: 'smartscreen_power'	, data: { on: 0, off: 0 } },
    { title: '재실감지카메라'  	, cd: 'vc_power'			, data: { on: 0, off: 0 } },
    { title: '승하차알림시스템'	, cd: 'led_panel_power'		, data: { on: 0, off: 0 } },
    { title: '공기질표출장치'		, cd: 'lcd_display_power'	, data: { on: 0, off: 0 } },
    { title: 'LTE라우터'       	, cd: 'lte_router_power'	, data: { on: 0, off: 0 } },
    { title: 'LED전등'    		, cd: 'led_light_power'		, data: { on: 0, off: 0 } },
    { title: '냉각FAN'			, cd: 'fan'					, data: { on: 0, off: 0 } }
];

dashboardData.forEach(item => {
    item.terminals = []; // OFF 상태의 정류장 목록을 저장할 배열 추가
});

/* 페이지 온로드 */
$(document).ready(function(){
    // display on/off 처리
    const urlPath = window.location.pathname;
    const $page1 = $(".content_area").first();
    const $page2 = $(".content_area").eq(1);

    if (urlPath.includes("dashboard2")) {
        $page1.hide();
        $page2.show();
    } else {
        $page1.show();
        $page2.hide();
    }

    getDevicesCnt();
    getTerminalList(); // 시설물 데이터 조회 성공시 funcCard() 실행
});

// **색상 적용 로직**
function applyColor(element, value) {
    if (value >= 90) {
        element.style.color = "red"; // 90% 이상 붉은색
    } else if (value >= 80) {
        element.style.color = "orange"; // 80% 이상 주황색
    } else {
        element.style.color = "black"; // 정상 범위는 검은색
    }
}

/* 정류장카드 그리기 */
function funcCard(){
    const socket             = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    const stompClient        = Stomp.over(socket);
    const existingCards      = {};
    const dashboardContainer = document.querySelector('.dashboard-grid');

    // 1. terminalList 모든 정류장을 먼저 표시 (초기 로딩)
    terminalList.forEach(station => {
        const card = createDashboardCard(station); // 초기값은 null (데이터 없음)
        existingCards[station.terminal_id] = card;
        dashboardContainer.appendChild(card);
    });
    stompClient.debug = null;
    // 소켓통신
    stompClient.connect({}, () => {
        stompClient.subscribe('/topic/dashboard', (message) => {
            const data = JSON.parse(message.body);
            // Map에 데이터 저장
            if (data.terminal_id) {
                terminalDataMap.set(data.terminal_id, data);
                updateDashboardCharts('dashboard-chart',terminalDataMap)
            }
            updateDashboard(data);
        });
    });

    // 차트 초기화
    function updateDashboardCharts(containerId, dataMap) {
        // 1. 상태 갱신 (전체 데이터 수량 기준)
        updateDashboardData(dataMap);

        // 2. 대시보드 컨테이너 선택
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        // 3. 모든 항목의 차트를 업데이트 (기존 차트가 있는지 확인)
        dashboardData.forEach((item, index) => {
            if (!chartInstances[index]) { // 기존 차트가 없을 때만 추가
                const chartCard = createDashboardChart(item, index);
                if (chartCard instanceof Node) { // 🚀 Node 타입만 추가
                    container.appendChild(chartCard);
                }
            } else {
                updateExistingChart(chartInstances[index], item);
            }
        });
    }

    // 기존 차트가 있으면 destroy() 한 후 다시 업데이트
    function updateExistingChart(chartInstance, item) {
        const total         = item.data.on + item.data.off;
        const onPercentage  = total > 0
            ? ((item.data.on / total) * 100).toFixed(1)
            : 0;
        const offPercentage = total > 0
            ? ((item.data.off / total) * 100).toFixed(1)
            : 0;
        if (chartInstance) {
            // 기존 차트 데이터 변경
            chartInstance.data.datasets[0].data = [onPercentage, 100-onPercentage];
            chartInstance.update();
        }
    }

    function updateDashboard(data) {
        const terminalId = data.terminal_id;
        // 데이터가 있는 경우 카드 업데이트
        if (existingCards[terminalId]) {
            updateExistingCard(existingCards[terminalId], data);
        }
    }

    // 전체시스템현황 차트 업데이트
    function updateDashboardData(dataMap) {
        // 모든 항목 초기화
        dashboardData.forEach(item => {
            item.data.on  = 0;
            item.data.off = terminalTotalCnt;
            item.terminals = [];
        });

        // 소켓에서 받은 정류장 ID 저장
        let receivedTerminalIds = new Set();

        // Map 데이터를 순회하면서 ON/OFF 개수 업데이트
        dataMap.forEach((status, terminalId) => {
            receivedTerminalIds.add(terminalId); // 소켓에서 받은 정류장 기록

            Object.keys(status).forEach(key => {
                let powerState = status[key]; // 현재 항목 상태 (ON/OFF, true/false 포함)

                // Boolean 변환 처리
                if (powerState === true) powerState = "ON";
                else if (powerState === false) powerState = "OFF";
                else if (typeof powerState === "string") powerState = powerState.toUpperCase();

                if (powerState !== "ON") powerState = "OFF";

                // `dashboardData`에서 해당 항목 찾기
                const targetItem = dashboardData.find(item => item.cd === key);
                if (targetItem) {
                    if (key === 'led_panel_power') {
                        // console.log(`[DEBUG] ${key} @${terminalId} =`, powerState);
                    }

                    if (powerState === "ON") {
                        targetItem.data.on += 1;
                        targetItem.data.off -= 1;

                        // 정류장이 OFF 목록에 있으면 제거
                        targetItem.terminals = targetItem.terminals.filter(
                            t => !t.includes(`(${terminalId})`)
                        );
                    } else if (powerState === "OFF") {
                        const terminalName = getStationName(terminalId);
                        const terminalDisplay = `${terminalName || '정보 없음'} (${terminalId})`;

                        // 로그는 승하차알림시스템만
                        if (key === 'led_panel_power') {
                            // console.log(`[OFF 추가됨] ${targetItem.title} =>`, terminalDisplay);
                        }

                        if (!targetItem.terminals.includes(terminalDisplay)) {
                            targetItem.terminals.push(terminalDisplay);
                        }
                    }
                }
            });
        });

        // 아직 소켓 데이터를 받지 않은 정류장 추가
        dashboardData.forEach(item => {
            let unreceivedTerminals = initialTerminals.filter(terminal => {
                let terminalId = terminal.match(/\((\d+)\)$/)?.[1]; // 정류장 ID 추출
                return terminalId && !receivedTerminalIds.has(terminalId);
            });

            if (unreceivedTerminals.length > 0) {
                item.terminals.push(...unreceivedTerminals);
            }
        });

        // HTML 업데이트 추가 (각 차트의 ON/OFF 값 표시)
        dashboardData.forEach((item, index) => {
            const onElement = document.getElementById(`chartOn_${index}`);
            const offElement = document.getElementById(`chartOff_${index}`);

            if (onElement) onElement.textContent = item.data.on;
            if (offElement) offElement.textContent = item.data.off;
        });
    }

    // 카드 상태 변경
    function updateExistingCard(card, data) {
        card.className   = `station ${data.rfc_cpu ? 'station-normal' : 'station-off'}`;
        // 헤더를 정상 상태로 변경
        const header	 = card.querySelector('.station-header');
        header.className = 'station-header header-normal';
        card.querySelector('.station-title').textContent = getStationName(data.terminal_id) +' ('+data.terminal_id+')';
        const metrics = card.querySelectorAll('.metric-value');

        // **NaN 방지 및 기본값 설정**
        const memoryTotal = parseFloat(data.rfc_memory_total) || 0;
        const memoryUsed  = parseFloat(data.rfc_memory_used) || 0;
        const memoryUsage = memoryTotal > 0 ? ((memoryUsed / memoryTotal) * 100).toFixed(2) : '0';

        const storageTotal = parseFloat(data.rfc_storage_total) || 0;
        const storageUsed  = parseFloat(data.rfc_storage_used) || 0;
        const storageUsage = storageTotal > 0 ? ((storageUsed / storageTotal) * 100).toFixed(2) : '0';

        // 데이터 업데이트
        metrics[0].textContent = `${data.rfc_cpu || '0%'}`;
        metrics[1].textContent = `${data.cpu_temperature || '0°C'}`;
        metrics[2].textContent = `${memoryUsage}%`;
        metrics[3].textContent = `${storageUsage}%`;

        // on/off 변환함수
        function onOffTransfer(value) {
            if (value === "1" || value === 1 || value === "ON" || value === true) {
                return "ON";
            }
            return "OFF";
        }

        const updatedStationData = {
            name: getStationName(data?.terminal_id),
            devices: {
                통합제어보드     : onOffTransfer(data?.ctl_board_power),
                스마트스크린     : onOffTransfer(data?.smartscreen_power),
                재실감지카메라   : onOffTransfer(data?.vc_power),
                LED전광판       : onOffTransfer(data?.led_panel_power),
                공기질표출장치   : onOffTransfer(data?.lcd_display_power),
                LTE라우터       : onOffTransfer(data?.lte_router_power),
                LED전등         : onOffTransfer(data?.led_light_power),
                FAN            : onOffTransfer(data?.fan),
            },
            metrics: [data?.rfc_cpu, data?.cpu_temperature, memoryUsage, storageUsage],
        };

        // **Map에 업데이트**
        if (stationDataMap.has(data.terminal_id)) {
            stationDataMap.set(data.terminal_id, updatedStationData);
        } else {
            stationDataMap.set(data.terminal_id, updatedStationData);
        }
        // 색상 적용
        applyColor(metrics[0], parseFloat(data.rfc_cpu));
        applyColor(metrics[2], parseFloat(memoryUsage));
        applyColor(metrics[3], parseFloat(storageUsage));
    }

    // Initialize dashboard
    const dashboardChartContainer = document.querySelector('.dashboard-chart');
    dashboardData.forEach((item, index) => {
        const card = createDashboardChart(item, index);
        dashboardChartContainer.appendChild(card);
    });
}

// 툴팁 커스터마이징
const customTooltip = document.createElement("div");
customTooltip.id = "custom-tooltip";
customTooltip.style.position = "absolute";
customTooltip.style.background = "white";
customTooltip.style.border = "1px solid #ccc";
customTooltip.style.padding = "8px 10px";
customTooltip.style.borderRadius = "6px";
customTooltip.style.color = "black";
customTooltip.style.fontSize = "12px";
customTooltip.style.pointerEvents = "none";
customTooltip.style.whiteSpace = "nowrap";
customTooltip.style.height = "auto";
customTooltip.style.opacity = 0;
customTooltip.style.zIndex = 9999;
document.body.appendChild(customTooltip);

// 커스텀 툴팁 핸들러
function customTooltipHandler(context) {
    const tooltip = context.tooltip;

    if (!tooltip || tooltip.opacity === 0) {
        customTooltip.style.opacity = 0;
        return;
    }

    const chart = context.chart;
    const index = chart.$customIndex; // 아래에서 설정함

    const terminals = dashboardData[index]?.terminals ?? [];

    // Hover가 "OFF" 차트일 때만 표시
    const label = tooltip.dataPoints?.[0]?.label;
    if (label === "ON") {
        customTooltip.style.opacity = 0;
        return;
    }

    // Tooltip HTML 구성
    if (terminals.length === 0) {
        customTooltip.innerHTML = "<div>데이터 없음</div>";
    } else {
        customTooltip.innerHTML = terminals
            .map(t => `<div>• ${t}</div>`)
            .join("");
    }

    // 위치 설정
    const canvasRect = chart.canvas.getBoundingClientRect();
    customTooltip.style.opacity = 1;
    customTooltip.style.left = canvasRect.left + window.scrollX + tooltip.caretX + "px";
    customTooltip.style.top  = canvasRect.top  + window.scrollY + tooltip.caretY + "px";
}

// 차트 생성
function createDashboardChart(item, index) {
    const existingCanvas = document.getElementById(`chart-${index}`);
    if (existingCanvas) {
        return document.createTextNode("");
    }

    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-lg p-4';

    const total         = item.total || 0; // total 값 적용
    const onPercentage = total > 0 ? ((item.data.on / total) * 100).toFixed(1) : 0;
    const offPercentage = total > 0 ? ((1 - onPercentage) * 100).toFixed(1) : 0;

    // 차트
    card.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 mb-4 text-center">${item.title}</h3>
        <div class="flex flex-col items-center space-y-4">
            <div class="w-full h-48">
                <canvas id="chart-${index}"></canvas>
            </div>
            <div class="bg-red-50 px-4 py-2 rounded-lg w-full">
                <div class="flex justify-between items-center">
                    <span class="text-gray-600 text-sm">ON:</span>
                    <span class="text-green-600 font-bold" id="chartOn_${index}">0</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-600 text-sm">OFF:</span>
                    <span class="text-red-600 font-bold" id="chartOff_${index}">${terminalTotalCnt}</span>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        const canvas = document.getElementById(`chart-${index}`);
        const ctx = canvas.getContext('2d');

        if (chartInstances[index]) {
            chartInstances[index].destroy();
        }

        chartInstances[index] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['ON', 'OFF'],
                datasets: [{
                    data: [onPercentage, offPercentage],
                    backgroundColor: ['#22c55e', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive         : true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding : 15
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: customTooltipHandler
                    }
                },
                cutout: '60%'
            }
        });
        chartInstances[index].$customIndex = index;

    }, 0);

    return card;
}

// 정류장현황 카드 생성
function createDashboardCard(data) {
    const card     = document.createElement('div');
    card.className = `station ${data.rfc_cpu ? 'station-normal' : 'station-off'}`;
    // 데이터가 없는 경우 header-off 스타일 적용
    const headerClass = data?.rfc_cpu ? 'header-normal' : 'header-off';

    // **NaN 방지 및 기본값 설정**
    const memoryTotal = parseFloat(data?.rfc_memory_total) || 0;
    const memoryUsed  = parseFloat(data?.rfc_memory_used) || 0;
    const memoryUsage = memoryTotal > 0 ? ((memoryUsed / memoryTotal) * 100).toFixed(2) : '0';

    const storageTotal = parseFloat(data?.rfc_storage_total) || 0;
    const storageUsed  = parseFloat(data?.rfc_storage_used) || 0;
    const storageUsage = storageTotal > 0 ? ((storageUsed / storageTotal) * 100).toFixed(2) : '0';
    const exampleStationData = {
        name: getStationName(data?.terminal_id),
        devices: {
            통합제어보드		: data?.ctl_board_power 	|| 'OFF',
            스마트스크린		: data?.smartscreen_power 	|| 'OFF',
            재실감지카메라	    : data?.vc_power 			|| 'OFF',
            LED전광판		: data?.led_panel_power 	|| 'OFF',
            공기질표출장치	    : data?.lcd_display_power 	|| 'OFF',
            LTE라우터		: data?.lte_router_power 	|| 'OFF',
            LED전등			: data?.led_light_power 	|| 'OFF',
            FAN				: data?.fan 				|| 'OFF',
        },
        metrics: [data?.rfc_cpu, data?.cpu_temperature, memoryUsage, storageUsage],
    };
    // terminalId 를 키로 저장
    if (data?.terminal_id) {
        stationDataMap.set(data.terminal_id, exampleStationData);
    }
    card.onclick = () => openPopup(data.terminal_id);
    card.innerHTML = `
		  <div class="station-header ${headerClass}"></div>
		  <div class="station-content">
			 <div class="station-title">${data.terminal_name}(${data.terminal_id})</div>
			 <div class="metrics">
				<div class="metric">
				  <div class="metric-label"><span>CPU 사용량</span></div>
				  <div class="metric-value">${data?.rfc_cpu || '0%'}</div>
				</div>
				<div class="metric">
				  <div class="metric-label"><span>CPU 온도</span></div>
				  <div class="metric-value">${data?.cpu_temperature || '0°C'}</div>
				</div>
				<div class="metric">
				  <div class="metric-label"><span>메모리 사용량</span></div>
				  <div class="metric-value">${memoryUsage}%</div>
				</div>
				<div class="metric">
				  <div class="metric-label"><span>저장소 사용량</span></div>
				  <div class="metric-value">${storageUsage}%</div>
				</div>
											  
			 </div>
		  </div>
	 `;
    return card;
}

let occupancyChartInstance = null;

function updateOccupancyStats() {
    const year = document.getElementById('yearSelect').value;

    fetch(`/api/occupancy/stats?year=${year}`)
        .then(response => response.json())
        .then(data => {
            // 1월~12월까지 모두 포함
            const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
            const counts = Array(12).fill(0);
            // console.log(data)
            // API에서 받은 데이터 반영
            data.forEach(item => {
                const monthIndex = parseInt(item.month) - 1; // 1월: index 0, 12월: index 11
                counts[monthIndex] = item.statPeopleCount;
            });
            let nonZeroMonths = 0; // 데이터가 있는 월의 개수
            // API에서 받은 데이터 반영 (month 존재 여부 체크)
            data.forEach(item => {
                if (item.month !== null && item.month !== undefined) {
                    const monthIndex = parseInt(item.month, 10) - 1;
                    if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
                        counts[monthIndex] = item.statPeopleCount || 0; // `null` 방지
                        if (counts[monthIndex] > 0) {
                            nonZeroMonths++;
                        }
                    }
                }
            });
            const totalCount = counts.reduce((sum, count) => sum + count, 0);
            const avgCount = Math.floor(totalCount / nonZeroMonths);

            document.getElementById('totalCount').textContent = totalCount.toLocaleString();
            document.getElementById('avgCount').textContent = avgCount.toLocaleString();

            if (occupancyChartInstance) {
                occupancyChartInstance.destroy();
            }

            const ctx = document.getElementById('occupancyChart').getContext('2d');
            occupancyChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: `${year}년 월별 재실 인원`,
                        data: counts,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        })
        .catch(error => console.error('데이터 불러오기 실패:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    // 현재 연도 가져오기
    const currentYear = new Date().getFullYear();

    // 연도 선택 드롭다운 초기화
    const yearSelect = document.getElementById('yearSelect');
    for (let i = 0; i <= 10; i++) {  // 과거 10년까지 선택 가능
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}년`;
        yearSelect.appendChild(option);
    }

    // 현재 연도를 기본 선택
    yearSelect.value = currentYear;

    // 초기 통계 업데이트
    updateOccupancyStats();

    // 이벤트 리스너 추가
    yearSelect.addEventListener('change', updateOccupancyStats);
    // document.getElementById('periodSelect').addEventListener('change', updateOccupancyStats);
});


// 팝업 열기 함수
function openPopup(terminalId) {
    const stationData = stationDataMap.get(terminalId);
    if (!stationData) {
        return;
    }
    $('#popup_frame').addClass('on');
    // 정류장명
    $('#popup_title').text(`${stationData.name}`);

    // 소켓 통신상태 (정류장 상태) (cpu 상태 전달여부로 on/off 체크)
    let power = stationData.metrics[0] !== undefined ? "정상" : "오류";
    $('#popup-status-conn').text(power);
    $('#popup-status-conn').prev('.legend-dot')
        .removeClass('dot-off dot-normal')
        .addClass(power === "정상" ? 'dot-normal' : 'dot-off');

    // 시스템 상태 업데이트
    const statusHtml = Object.keys(stationData.devices)
        .map(key => {
            const statusClass = stationData.devices[key] === 'ON' ? 'dot-normal' : 'dot-off';
            return `
                <div class="popup-status-item">
                    <span class="popup-status-label">${key}</span>
                    <div class="legend-dot ${statusClass}"></div>
                </div>`;
        })
        .join('');
    $('.popup-system-status').html(statusHtml);

    // 시스템 메트릭스 업데이트 (예시 데이터 사용)
    $('.popup-metric').each(function (index, metric) {
        $(metric).find('.popup-metric-value').text(`${stationData.metrics[index] || '-'}`);
    });
}

/* 시설물별 보유 개수 조회 */
function getDevicesCnt(){
    showLoadingSpinner();

    $.ajax({
        url     : '/api/dashboard/devicesCnt',
        method  : 'GET',

        success : function (response){
            if (!response || typeof response !== "object") {
                popupOpenDialog('error', '시설물 데이터 응답 형식 오류 발생', 2000);
                return;
            }
            // 응답을 `dashboardData`의 `title`과 매칭하여 total 값 설정
            Object.entries(response).forEach(([deviceName, count]) => {
                const item = dashboardData.find(d => d.title === deviceName);
                if (item) {
                    item.total  = count; // total 값 설정
                }
            });
            // 차트 다시 렌더링
            renderCharts();

            hideLoadingSpinner();
        },
        error : function (error){
            popupOpenDialog('error', '시설물 개수 확인 실패 : ' + error, 2000);
            hideLoadingSpinner();
        }
    });
}

/* 정류장 리스트 조회 */
function getTerminalList(){
    showLoadingSpinner();

    $.ajax({
        url     : '/api/dashboard/terminalList',
        method  : 'GET',

        success : function (response){
            terminalList  = response.map(terminal => ({
                terminal_id  : terminal.terminal_id,
                terminal_name: terminal.terminal_name
            }));

            terminalTotalCnt = terminalList.length;

            // 아직 소켓 데이터가 없는 초기 정류장 리스트 설정
            initialTerminals = terminalList.map(
                terminal => `${terminal.terminal_name} (${terminal.terminal_id})`
            );

            renderCharts();
            hideLoadingSpinner();
        },
        error   : function (error){
            popupOpenDialog('error', '정류장 조회중 에러 발생: ' + error, 2000);
            hideLoadingSpinner();
        },
        complete:function(){
            funcCard();
        }
    });
}

/* 차트 생성 */
function renderCharts() {
    const dashboardChartContainer = document.querySelector('.dashboard-chart');
    dashboardChartContainer.innerHTML = "";

    dashboardData.forEach((item, index) => {
        const card = createDashboardChart(item, index);
        dashboardChartContainer.appendChild(card);
    });
}

/* terminalId를 기반으로 정류장명을 찾는 함수 */
function getStationName(terminalId) {
    const station = terminalList.find(
        item => String(item.terminal_id) === String(terminalId)
    );

    if (!station) {
        console.warn(
            `[UNKNOWN TERMINAL] id:${terminalId} name:정보 없음`
        );
        return "정보 없음";
    }

    return station.terminal_name;
}

let hidChart;
let peopleCounts;
$(document).ready(function () {
    const ctx = $('#hidChartEl')[0].getContext('2d');
    // Chart.js 인스턴스 생성
    // 정류장명과 기본 값 0으로 초기화
    let stationNames =  stationData.map(entry => `${entry.terminal_id} (${entry.name})`);
    peopleCounts = new Array(stationData.length).fill(0);

    // Chart.js 인스턴스 생성
    hidChart = new Chart(ctx, {
        type: 'line',  // 선 그래프
        data: {
            labels: stationNames, // X축: 정류장 이름
            datasets: [{
                label: '재실 인원',
                data: peopleCounts, // Y축: 인원 수 데이터 (초기값 0)
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointRadius: 5,
                fill: true, // 배경 색상 채우기
                tension: 0.3 // 곡선 효과
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: "#000",
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '정류장명'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '재실 인원 수'
                    },
                    ticks: {
                        stepSize: 5  // Y축을 5 단위로 설정
                    }
                }
            }
        }
    });

    // WebSocket 연결
    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    const stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function () {
        // 데이터 구독
        stompClient.subscribe('/topic/hid', function (message) {
            const parsedData  = JSON.parse(message.body);
            const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
            // 수신된 데이터를 기반으로 peopleCounts 업데이트
            dataArray.forEach(entry => {
                let idx = stationData.findIndex(station => station.terminal_id === entry.terminal_id);
                if (idx !== -1) {
                    peopleCounts[idx] = entry.people_count; // 해당 정류장의 인원 업데이트
                }
            });

            // 차트 업데이트
            updateChart();
        });
    });

    function updateChart() {
        hidChart.data.datasets[0].data = peopleCounts; // 인원 수 (Y축)
        hidChart.update();
    }
});

