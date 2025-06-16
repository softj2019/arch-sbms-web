/* 전역변수 */
let grid1;               // 그리드
let pagination1;         // 페이지네이션
let hasDeviceList = [];  // 체크된 디바이스 목록
let selectedTerminalId;  // 선택된 terminalId
let facilityList = [];   // 선택된 시설물 목록

/* 페이지 온로드 */
$(document).ready(function(){
    getTerminalList();
    initializeGrid();

    // 조회건수 이벤트
    $('#itemsPerPage').on('change', function () {
        getTerminalList(0);
    });
});

/* 전역변수 초기화 */
function resetSelection(){
    selectedTerminalId = null;
    hasDeviceList = [];
}

// esc 버튼과 닫기버튼으로 팝업닫기
$(document).on('click keydown', function(event) {
    if (
        (event.type === "keydown" && (event.key === "Escape" || event.keyCode === 27))
    ) {
        $('.popup_frame.on').removeClass('on');
    }
});

/* 그리드 */
function initializeGrid() {
    const gridElement = document.getElementById("grid_table");
    if (!gridElement) {
        return;
    }

    grid1 = new tui.Grid({
        el           : gridElement,
        scrollX      : true,
        scrollY      : false,
        minBodyHeight: 50,
        rowHeaders   : ['checkbox'],
        columns      : [
            { name: "no"			, header: "NO"				, sortable: true, align: 'center', width: 80},
            { name: "terminalId"	, header: "정류장ID"			, sortable: true, align: 'center' },
            { name: "terminalNm"	, header: "정류장명"			, sortable: true, align: 'center' },
            { name: "ctlBoard"		, header: "통합제어보드"		, sortable: true, align: 'center' },
            { name: "smartscreen"	, header: "스마트스크린"		, sortable: true, align: 'center' },
            { name: "cv"			, header: "재실감지카메라"	    , sortable: true, align: 'center' },
            { name: "ledPanel"      , header: "승하차알림시스템"	, sortable: true, align: 'center' },
            { name: "lcdDisplay"	, header: "공기질표출장치"	    , sortable: true, align: 'center' },
            { name: "lteRouter"		, header: "LTE라우터"		, sortable: true, align: 'center' },
            { name: "lteRouter2"	, header: "공공WI-FI"		, sortable: true, align: 'center' },
            { name: "ledLight"		, header: "LED전등"			, sortable: true, align: 'center' },
            { name: "fan"			, header: "냉각FAN"			, sortable: true, align: 'center' }
        ],
        columnOptions : {
            resizable   : true,
            minWidth    : 80,
        }
    });
    tuiGridApplyTheme();

    // 이벤트 핸들러 설정
    grid1.on('click'      , handleGridClick);       // 해당 row 의 checkBox control
    grid1.on('dblclick'   , handleGridDoubleClick); // 해당 row 의 detail View open
    grid1.on('check'      , handleCheck);           // 체크박스 클릭
    grid1.on('uncheck'    , handleUncheck);         // 체크박스 해제
    grid1.on('checkAll'   , handleCheckAll);        // 전체선택
    grid1.on('uncheckAll' , handleUncheckAll);      // 전체해제
}

// row data 클릭으로 userId 처리 (클릭)
function handleGridClick(e) {
    if (e.columnName === '_checked') return; // 체크박스 열 제외

    const isChecked = grid1.getCheckedRowKeys().includes(e.rowKey);

    if (!isChecked) {
        grid1.check(e.rowKey); // 체크박스를 체크
    } else {
        grid1.uncheck(e.rowKey); // 체크박스를 해제
    }
}

// 상세보기 팝업 오픈 (더블클릭)
function handleGridDoubleClick(e) {
    if (e.columnName === '_checked') return; // 체크박스 열 제외

    const row = grid1.getRow(e.rowKey);
    if (!row) return;

    $('#no'            ).text(row.no);
    $('#u_tmnId'       ).text(row.terminalId);
    $('#u_tmnNm'       ).val(row.terminalNm);
    $('#u_ctlBoard'    ).val(row.ctlBoard);
    $('#u_smartscreen' ).val(row.smartscreen);
    $('#u_cv'          ).val(row.cv);
    $('#u_ledPanel'    ).val(row.ledPanel);
    $('#u_lcdDisplay'  ).val(row.lcdDisplay);
    $('#u_lteRouter'   ).val(row.lteRouter);
    $('#u_lteRouter2'  ).val(row.lteRouter2);
    $('#u_ledLight'    ).val(row.ledLight);
    $('#u_fan'         ).val(row.fan);

    // 선택된 정류장 ID 전역변수에 할당
    selectedTerminalId = row.terminalId;

    const target = $('#popup_frame');
    target.toggleClass('on');

    return false;
}

// 체크박스 체크
function handleCheck(e) {
    const row        = grid1.getRow(e.rowKey);
    if (!row) return;

    const terminalId = row.terminalId;

    if (!facilityList.includes(terminalId)) {
        facilityList.push(terminalId);
    }
}

// 체크박스 해제
function handleUncheck(e) {
    const row    = grid1.getRow(e.rowKey);
    const terminalId = row.terminalId;

    facilityList = facilityList.filter(id => id !== terminalId); // List에서 제거
}

// 전체 선택 이벤트 핸들러
function handleCheckAll() {
    const rows = grid1.getData();

    rows.forEach(row => {
        if (!facilityList.includes(row.terminalId)) {
            facilityList.push(row.terminalId);
        }
    });
}

// 전체 해제 이벤트 핸들러
function handleUncheckAll() {
    const rows = grid1.getData();
    rows.forEach(row => {
        facilityList = facilityList.filter(id => id !== row.terminalId);
    });
}

/* 시설물 현황 등록 팝업 체크리스트 컨트롤 */
$('table.align_center .check_def').each(function (index) {
    const value = index + 1;

    $(this).on('change', function () {
        if ($(this).is(':checked')) {
            if (!hasDeviceList.includes(value)) {
                hasDeviceList.push(value);
            }
        } else {
            hasDeviceList = hasDeviceList.filter(item => item !== value);
        }
    });
});

// 검색조건 엔터키 감지
$('#s_terminalId, #s_terminalNm').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getTerminalList();
    }
});

/* 정류장ID 중복확인 */
let isDuplicatedId = false;
function checkDuplicate(){
    let tid = $('#c_tmnId').val();

    // 중복일경우 실행중단
    if (isDuplicatedId) return;

    if (!tid){
        popupOpenDialog('error', "정류장ID 는 필수 입력항목입니다.", 2000)
        $('#c_tmnId').focus();
        return;
    }

    const data = {terminalId : tid};

    $.ajax({
        url         : '/api/facility/isDuplicatedId',
        method      : 'POST',
        data        : JSON.stringify(data),
        contentType : 'application/json; charset=utf-8',
        dataType    : 'json',

        success: function (response) {
            const targetBtn = '#duplicateCheckBtn';
            if (response) {
                popupOpenDialog('error', "이미 사용중인 정류장ID 입니다.", 2000);
                isDuplicatedId = false;
                $(targetBtn)
                    .removeClass('btn_gray')
                    .addClass('btn_red_clr')
                    .prop('disabled', false);
            } else {
                popupOpenDialog('info', "사용 가능한 정류장ID 입니다.", 2000);
                isDuplicatedId = true;
                $(targetBtn)
                    .removeClass('btn_red_clr')
                    .addClass('btn_gray')
                    .prop('disabled', true);
            }
        },
        error: function (xhr, status, error){
            popupOpenDialog('error', "정류장 ID 중복확인중 에러 발생", 2000);
            isDuplicatedId = false;
        }
    });
}

/* 아이디 입력값 변경 감지 */
$('#c_tmnId, #u_tmnId').on('input', function () {
    isDuplicatedId = false;

    const targetBtn = $(this).attr('id') === 'c_tmnId'
                                           ? '#duplicateCheckBtn'
                                           : '#duplicateCheckBtn2';

    $(targetBtn)
        .removeClass('btn_gray')
        .addClass('btn_red_clr')
        .prop('disabled', false);
});


/* 시설물 현황 등록 */
function createTerminal(){
    const terminalId    = $('#c_tmnId').val()?.trim() || "";
    const terminalName  = $('#c_tmnNm').val()?.trim() || "";

    // 필수값 입력 확인
    if (!validateForm(terminalId)) {
        popupOpenDialog('error', '정류장 ID 는 필수 입력항목입니다.', 2000);
        $('#c_tmnId').focus();

        return;
    }
    if (!validateForm(terminalName)){
        popupOpenDialog('error', '정류장 명 은 필수 입력항목입니다.', 2000);
        $('#c_tmnNm').focus();

        return;
    }
    if (!isDuplicatedId) {
        popupOpenDialog('error', "정류장 ID 중복확인을 클릭해주세요.", 2000);
        return;
    }

    showLoadingSpinner()
    const data = {
        terminalId       : terminalId,
        terminalName     : terminalName,
        hasDeviceSnoList : hasDeviceList
    }
    $.ajax({
        url              : '/api/facility/create',
        method           : 'POST',
        data             : JSON.stringify(data),
        contentType      : 'application/json; charset=utf-8',
        dataType         : 'json',

        success : function(result){
            if (result.status==="success"){
                popupOpenDialog('info', result.message, 2000);
                getTerminalList();
                $('#create_popup_frame').removeClass("on");
                hideLoadingSpinner();
            } else {
                popupOpenDialog('error', result.message, 2000);
                hideLoadingSpinner();
            }
        },
        error : function (xhr, status, error){
            popupOpenDialog('error', '시설물 현황 등록중 에러 발생 '+error, 2000);
            hideLoadingSpinner();
        },
        complete :  function (){
            hasDeviceList = []; // 전역 체크리스트 초기화
            clearContents();
        },
    });
}

/* 유효성 검사 */
function validateForm(v1){
    return !!v1;
}

/* 입력값 초기화 */
function clearContents(){
    hasDeviceList = [];
    
    // 시설물 등록
    $('#c_tmnId').val('');
    $('#c_tmnNm').val('');
    $('table.align_center .check_def').prop('checked', false);
    
    // 시설물 조회
    $('#s_terminalId').val('');
    $('#s_terminalNm').val('');
}

/* 시설물 현황 조회 */
let isLoading = false;
function getTerminalList(page = 0){
    if (isLoading) return; // 중복 실행 방지
    isLoading = true;

    let s_terminalId = $('#s_terminalId').val().trim();
    let s_terminalNm = $('#s_terminalNm').val().trim();

    // 조회건수
    const size = $('#itemsPerPage').val() || 10;

    showLoadingSpinner()

    const dataList = {
        terminalId : s_terminalId,
        terminalNm : s_terminalNm
    }
    const qryString = $.param(dataList);
    $.ajax({
        url     : `/api/facility/list?page=${page}&size=${size}&${qryString}`,
        method  : 'GET',

        success : function(response){
            const gridData = response.content.map((facility, index) => ({
                no          : index + 1 + page * size,
                terminalId  : facility.terminal_id,
                terminalNm  : facility.terminal_name,
                ctlBoard    : formatDeviceStatus(facility.ctlBoard),
                smartscreen : formatDeviceStatus(facility.smartscreen),
                cv          : formatDeviceStatus(facility.cv),
                ledPanel    : formatDeviceStatus(facility.ledPanel),
                lcdDisplay  : formatDeviceStatus(facility.lcdDisplay),
                lteRouter   : formatDeviceStatus(facility.lteRouter),
                lteRouter2  : formatDeviceStatus(facility.lteRouter2),
                ledLight    : formatDeviceStatus(facility.ledLight),
                fan         : formatDeviceStatus(facility.fan),
            }));

            // TOAST UI Grid 데이터 초기화
            grid1.resetData(gridData);

            // 페이지네이션 초기화
            initializePagination(response.totalElements, size, page);

            // 총 건수 업데이트
            $('.sub_script .num').text(response.totalElements);

            hideLoadingSpinner();
        },
        error : function(xhr, status, error){
            popupOpenDialog('error', "시설물 목록 조회에 실패하였습니다.", 2000);
            console.warn(error);
            hideLoadingSpinner();
        },
        complete : function(){
            resetSelection();
            isLoading = false; // 요청 완료 후 플래그 초기화
        }
    });
}

// 디바이스 보유값 전처리
function formatDeviceStatus(value) {
    return  value === 1 ? "O"
          : value === 0 ? "X"
          : "?";
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
        getTerminalList(newPage);           // 새 페이지 데이터 요청
    });
}

/* 시설물 삭제 */
function deleteFacility(){
    showConfirmModal(
        "선택한 시설물을 삭제하시겠습니까?",
        function () {deleteFacilites();}
    );
}

function deleteFacilites(){
    // 선택한 정류장 ID값과 시설물리스트 값이 다르면서 시설물리스트가 비어있을경우 정류장 ID 할당
    if (!facilityList.includes(selectedTerminalId) && facilityList.length === 0 && selectedTerminalId != null){
        facilityList.push(selectedTerminalId);
    }

    if (!Array.isArray(facilityList) || facilityList.length === 0) {
        popupOpenDialog('error', '삭제 대상 시설물을 선택해주세요.', 2000);
        return;
    }

    const data = {terminalIdList : facilityList};

    showLoadingSpinner()

    $.ajax({
        url         : '/api/facility/delete',
        method      : 'DELETE',
        contentType : 'application/json; charset=utf-8',
        data        : JSON.stringify(data),
        dataType    : 'json',

        success : function(response){
            if (response.status === 'success'){
                popupOpenDialog('info', response.message, 2000);
                getTerminalList();
                $('#popup_frame').removeClass('on');
                hideLoadingSpinner();
            } else {
                popupOpenDialog('error', response.message, 2000);
                hideLoadingSpinner()
            }
        },
        error : function(){
            popupOpenDialog('error', "작업중 에러 발생", 2000);
            hideLoadingSpinner();
        }
    });
}

// 터미널 및 디바이스 수정여부
let isTerminalChange = false;
let isDeviceChange   = false;

// 정류장명 변경 감지
$('#u_tmnNm').on('input', function () {
    isTerminalChange = true;
});

// 디바이스 구비여부 변경 감지
$('#u_ctlBoard, #u_smartscreen, #u_cv, #u_ledPanel, #u_lcdDisplay, #u_lteRouter, #u_lteRouter2, #u_ledLight, #u_fan').on('change', function () {
    isDeviceChange = true;
});

/* 터미널 정보 수정 */
function updateFacility() {
    showConfirmModal(
        "정말로 수정하시겠습니까?",
        function () {
            updateFacilities();
        }
    )
}

function updateFacilities(){
    let u_terminalNm  = $('#u_tmnNm').val().trim();
    let u_ctlBoard    = $('#u_ctlBoard  ').val();
    let u_smartscreen = $('#u_smartscreen').val();
    let u_cv          = $('#u_cv  ').val();
    let u_ledPanel    = $('#u_ledPanel').val();
    let u_lcdDisplay  = $('#u_lcdDisplay').val();
    let u_lteRouter   = $('#u_lteRouter').val();
    let u_lteRouter2  = $('#u_lteRouter2').val();
    let u_ledLight    = $('#u_ledLight').val();
    let u_fan         = $('#u_fan').val();

    // 시설물 구비여부 리스트
    const deviceMap = {
        1: u_ctlBoard,
        2: u_smartscreen,
        3: u_cv,
        4: u_ledPanel,
        5: u_lcdDisplay,
        6: u_lteRouter,
        7: u_lteRouter2,
        8: u_ledLight,
        9: u_fan
    };

    if (!isTerminalChange && !isDeviceChange) {
        popupOpenDialog('info', '변동사항이 없습니다.', 2000)
        $('#popup_frame').removeClass('on');
        return;
    }

    // 시설물 구비여부 리스트화
    hasDeviceList = Object.entries(deviceMap)
        .filter(([_, value]) => value === 'O')
        .map(([key, _]) => Number(key));

    const udtData = {
        terminalId       : selectedTerminalId,
        isTerminalChange : isTerminalChange,
        terminalName     : u_terminalNm,
        isDeviceChange   : isDeviceChange,
        hasDeviceSnoList : hasDeviceList
    }

    showLoadingSpinner();

    $.ajax({
        url         : '/api/facility/update',
        method      : 'PUT',
        contentType : 'application/json; charset=utf-8',
        data        : JSON.stringify(udtData),
        dataType    : 'json',

        success : function (response){
            if (response.status === 'success'){
                popupOpenDialog('info', response.message, 2000);
                getTerminalList();
                $('#popup_frame').removeClass('on');
            } else {
                popupOpenDialog('error', response.message, 2000);
            }
            hideLoadingSpinner();
        },
        error : function(){
            popupOpenDialog('error', "터미널 정보 수정 에러", 2000);
            hideLoadingSpinner();
        },
        complete : function (){
            isTerminalChange = false;
            isDeviceChange   = false;
        }
    });
}