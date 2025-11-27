/* 전역변수 */
let grid1;               // 그리드
let pagination1;         // 페이지네이션

/* 페이지 온로드 */
$(document).ready(function(){
    getLogList();
    initializeGrid();

    // 조회건수 이벤트
    $('#itemsPerPage').on('change', function () {
        getLogList(0);
    });
});

// 검색조건 엔터키 감지
$('#s_terminalId, #s_deviceName, #s_userId').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getLogList();
    }
});

function initializeGrid() {
    const gridElement = document.getElementById("grid_tale");
    if (!gridElement) {
        return;
    }

    grid1 = new tui.Grid({
        el: document.getElementById("grid_tale"),
        scrollX: true,
        scrollY: false,
        minBodyHeight: 50,
        rowHeaders: ['checkbox'],
        columns: [
            { name: "no"            , header: "NO"        , sortable: true, align: 'center', width: 20 },
            { name: "userId"    , header: "작업자 ID"  , sortable: true, align: 'center' },
            { name: "terminalName"  , header: "정류장 이름" , sortable: true, align: 'center' },
            { name: "terminalId"    , header: "정류장 ID"  , sortable: true, align: 'center' },
            { name: "deviceName"    , header: "시설물"     , sortable: true, align: 'center' },
            { name: "action"        , header: "작업내용"   , sortable: true, align: 'center' },
            { name: "os"            , header: "OS"        , sortable: true, align: 'center' },
            { name: "browser"       , header: "브라우저"    , sortable: true, align: 'center' },
            { name: "ip"            , header: "IP"        , sortable: true, align: 'center' },
            { name: "createdAt"     , header: "작업일자"    , sortable: true, align: 'center' },
        ],
        columnOptions: {
            resizable: true,
            minWidth: 80
        }
    });
    tuiGridApplyTheme();
}

/* 로그 조회 */
let isLoading = false;
function getLogList(page = 0){
    if (isLoading) return; // 중복 실행 방지
    isLoading = true;

    // 검색조건 존재시 변수 할당
    let s_terminalId = $('#s_terminalId').val().trim();
    let s_deviceName = $('#s_deviceName').val();
    let s_userId     = $('#s_userId'    ).val().trim();

    showLoadingSpinner();

    // 조회건수
    const size = $('#itemsPerPage').val() || 10;

    // 전달데이터
    const dataList = {
        terminalId : s_terminalId,
        deviceName : s_deviceName,
        userId     : s_userId
    }
    const qryString = $.param(dataList);
    $.ajax({
        url : `/api/controlLog/getLogList?page=${page}&size=${size}&${qryString}`,
        method : 'GET',

        success : function(response){
            const totalElements = response.totalElements;
            const gridData = response.content.map((logs, index) => ({
                no              : totalElements - (page * size) - index,
                terminalName    : logs.terminalName,
                terminalId      : logs.terminalId,
                deviceName      : transChar(logs.deviceName),
                action          : transChar(logs.action),
                userId          : logs.userId,
                os              : logs.os,
                browser         : logs.browser,
                ip              : logs.ip,
                createdAt       : logs.createdAt,
            }));

            // 초기화작업
            grid1.resetData(gridData);
            initializePagination(response.totalElements, size, page);
            $('.sub_script .num').text(response.totalElements);

            hideLoadingSpinner();
        },
        error : function (xhr, status, error){
            popupOpenDialog('error', "통합제어이력 조회 실패" + error, 2000);
            hideLoadingSpinner();
        },
        complete : function (){
            hideLoadingSpinner();
            isLoading = false;
        }
    });
}

// 로그 전처리 1
function transChar(char){
    if (!char) {
        return "확인불가";
    }

    const charMap = {
        // 장비 전처리
        "smartscreen" : "스마트스크린",
        "lte_router"  : "LTE 라우터",
        "lcd_display" : "공기질표출장치",
        "led_panel"   : "승하차알림",
        "cv"          : "재실감지카메라",
        // "lte_router"  : "공공 WI-FI",
        "led_light"   : "LED 전등",
        "fan"         : "FAN",
        
        // 작업내용 전처리
        "on"          : "전원 ON",
        "off"         : "전원 OFF",
        "stop"        : "고정",
        "up"          : "위로 이동",
        "down"        : "아래로 이동",
        "fail"        : "제어 실패",
        "etc"         : "수동 제어"
    };

    return charMap[char.toLowerCase()] || "확인 불가";
}

/* 페이지네이션 초기화 */
function initializePagination(totalItems, itemsPerPage, currentPage = 0){
    // 페이지네이션 객체가 존재하면 삭제 후 재설정
    if (pagination1) {
        $('#grid_pagination').empty(); // 기존 페이지네이션 DOM 제거
        pagination1 = null;            // 객체 초기화
    }

    // 새 페이지네이션 생성
    pagination1 = new tui.Pagination('grid_pagination', {
        totalItems  : totalItems,    // 총 데이터 개수
        itemsPerPage: itemsPerPage,  // 한 페이지당 아이템 개수
        visiblePages: 5,             // 보이는 페이지 개수
        page: currentPage + 1,       // 현재 페이지 설정
    });

    // 페이지 이동 이벤트 핸들러
    pagination1.on('afterMove', function (eventData) {
        const newPage = eventData.page - 1; // 현재 페이지
        getLogList(newPage);           // 새 페이지 데이터 요청
    });
}

/* 입력값 초기화 */
function clearContents(){
    $('#s_terminalId').val('');
    $('#s_deviceName').val('');
    $('#s_userId'    ).val('');
}