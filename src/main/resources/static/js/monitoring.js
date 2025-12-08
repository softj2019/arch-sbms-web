/* 전역변수 */
let grid1;  // 그리드
let stationList = []; // 정류장 데이터

/* 페이지 온로드 */
$(document).ready(function(){
    getStationName(); // 정류장 데이터 조회
});

/* 그리드 그리기 */
document.addEventListener('DOMContentLoaded', () => {
    const socket      = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    const stompClient = Stomp.over(socket);
    window.stompClient = stompClient;
    stompClient.debug = null;
    // 그리드 초기화 코드
    grid1 = new tui.Grid({
        el      : document.getElementById("grid_tale"),
        scrollX : true,
        scrollY : false,
        columns : [
            { name: "terminal_id",	header: "정류장ID"	,sortable: true	,align: 'center' },
            { name: "terminal_nm",	header: "정류장명"	,sortable: true	,align: 'center' },
            {   name      : "rfc_cpu",
                header    : "CPU 사용량",
                sortable  : true,
                align     : 'center',
                formatter : ({ row }) => row.rfc_cpu ?? "-"
            },
            {
                name      : "cpu_temperature",
                header    : "CPU 온도",
                sortable  : true,
                align     : 'center',
                formatter : ({ row }) => row.cpu_temperature ?? "-"
            },
            {
                name      : "memory",
                header    : "메모리 (총/사용/가용)",
                sortable  : true,
                align     : 'center',
                formatter : ({ row }) => row.memory ?? "-"
            },
            {
                name      : "storage",
                header    : "디스크 (총/사용/가용)",
                sortable  : true,
                align     : 'center',
                formatter : ({ row }) => row.storage ?? "-"
            },
            {
                name: "ipaddress",
                header: "IP",
                sortable: true,
                align: 'center',
                formatter: ({ row }) => {
                    if (row.ipaddress) {
                        return `<span class="clickable-ip" data-ip="${row.ipaddress}" style="color:blue; text-decoration:underline; cursor:pointer;">${row.ipaddress}</span>`;
                    }
                    return "-";
                }
            }
        ],
        columnOptions : {
            resizable   : true,
            minWidth    : 80
        },
        // data: exampleData
    });
    // 그리드 클릭 이벤트 추가 (특정 컬럼인 경우만 실행)
    grid1.on("click", (ev) => {
        const { columnName, rowKey } = ev;

        // "ipaddress" 컬럼 클릭 시만 동작
        if (columnName === "ipaddress") {
            const rowData = grid1.getRow(rowKey);
            if (rowData && rowData.ipaddress) {
                loginAndRedirect(rowData.ipaddress);
            }
        }
    });
    function loginAndRedirect(wanip) {
        let loginUrl;
        let dashboardUrl;

        // IP가 192.168.10.254일 경우 포트 제외
        if (wanip === "192.168.10.254") {
            loginUrl = `http://${wanip}/status_wanlink.asp`;
            dashboardUrl = `http://${wanip}/`;
        } else {
            loginUrl = `http://${wanip}:8080/status_wanlink.asp`;
            dashboardUrl = `http://${wanip}:8080/`;
        }

        // 새 창을 열어서 로그인 페이지 로드
        const newWindow = window.open(loginUrl, "_blank");

        // 일정 시간 후 대시보드 페이지로 이동
        setTimeout(() => {
            newWindow.location.href = dashboardUrl;
        }, 2000); // 2초 후 대시보드 이동
    }

    // 현재 Grid 데이터 저장
    let gridData = [];

    // WebSocket 연결 및 STOMP 구독
    stompClient.connect({}, (frame) => {
        // 대시보드 데이터 수신
        stompClient.subscribe('/topic/dashboard', (message) => {
            let receivedData;
            try {
                // JSON 데이터 파싱
                receivedData = JSON.parse(message.body);

                // 단일 객체일 경우 배열로 변환
                if (!Array.isArray(receivedData)) {
                    receivedData = [receivedData];
                }

                // terminal_id 기준으로 데이터 업데이트 또는 추가
                receivedData.forEach((newRow) => {
                    const rowIndex = getRowIndexByTerminalId(newRow.terminal_id);
                    if (rowIndex !== -1) {
                        // CPU 값 업데이트
                        grid1.setValue(rowIndex, "rfc_cpu", newRow.rfc_cpu ?? "-");
                        grid1.setValue(rowIndex, "cpu_temperature", newRow.cpu_temperature ?? "-");

                        // 메모리 값 업데이트
                        grid1.setValue(rowIndex, "memory",
                            `${newRow.rfc_memory_total ?? "-"} / ${newRow.rfc_memory_used ?? "-"} / ${newRow.rfc_memory_available ?? "-"}`
                        );

                        // 디스크 값 업데이트
                        grid1.setValue(rowIndex, "storage",
                            `${newRow.rfc_storage_total ?? "-"} / ${newRow.rfc_storage_used ?? "-"} / ${newRow.rfc_storage_available ?? "-"}`
                        );

                        // IP 값 업데이트
                        grid1.setValue(rowIndex, "ipaddress", newRow.ipaddress ?? "-");
                    }
                });

            } catch (error) {
                console.error('Invalid JSON format or unexpected data structure:', error);
            }
        });
    });
});

/* 입력값 초기화 */
function clearContents(){
    $('#s_terminalId').val('');
    $('#s_terminalNm').val('');
}

// 검색조건 엔터키 감지
$('#s_terminalId, #s_terminalNm').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getStationName();
    }
});

/* 정류장 조회 */
let isLoading = false;
function getStationName() {
    if (isLoading) return;
    isLoading = true;

    let s_terminalId = $('#s_terminalId').val();
    let s_terminalNm = $('#s_terminalNm').val();
    let dataList = {
        terminalId : s_terminalId,
        terminalNm : s_terminalNm
    }
    const qryString = $.param(dataList);

    showLoadingSpinner();
    $.ajax({
        url      : `/api/monitoring/list?${qryString}`,
        method   : 'GET',
        dataType : 'json',

        success  : function(response) {
            if (!Array.isArray(response)) {
                return;
            }

            stationList = response.map(station => ({
                terminal_id: String(station.terminal_id),
                terminal_nm: station.terminal_name
            }));

            grid1.resetData(stationList);

            // 조회건수 업데이트
            $('.sub_script .num').text(stationList.length);
        },
        error    : function(xhr, status, error){
            popupOpenDialog('error', '시스템 모니터링 조회에 실패하였습니다 :'+error, 2000);
            hideLoadingSpinner();
        },
        complete : function (){
            isLoading = false;
            hideLoadingSpinner();
        }
    });
}

/* terminal_id 인덱스 찾기 */
function getRowIndexByTerminalId(terminalId) {
    const data = grid1.getData();
    return data.findIndex(row => row.terminal_id === terminalId);
}
