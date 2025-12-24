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
        clearContentsForPopup();
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
            { name: "ctlBoard"		, header: "통합제어보드"		, sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            },
            { name: "smartscreen"	, header: "스마트스크린"		, sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            },
            { name: "cv"			, header: "재실감지카메라"	    , sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            },
            { name: "ledPanel"      , header: "승하차알림시스템"	, sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            },
            { name: "lcdDisplay"	, header: "공기질표출장치"	    , sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            },
            { name: "lteRouter"		, header: "LTE라우터"		, sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            },
            { name: "lteRouter2"	, header: "공공WI-FI"		, sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            },
            { name: "ledLight"		, header: "LED전등"			, sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            },
            { name: "fan"			, header: "냉각FAN"			, sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            }
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

// TUI Grid 커스텀 토글 버튼 렌더러
class CustomToggleRenderer {
    constructor(props) {

        const el = document.createElement("div");
        el.className = "rowbox check_box";
        el.style = "display: initial";

        // input id와 label for 의 값을 맞추고, 각 체크박스 셀마다 고유하게 가져야 addEventListener 에서 선택된 각 셀을 인지가능
        el.innerHTML = `
                    <input type="checkbox" id='c_ctlBoard_${props.rowKey}_${props.columnInfo["name"]}' class="check_def" ${props.value ? "checked" : ""} style="pointer-events: none;">
                    <label for="c_ctlBoard_${props.rowKey}_${props.columnInfo["name"]}" style="pointer-events: none;"></label>
        `;

        this.el = el;

        // 이벤트 리스너 추가
        this.el.querySelector('input').addEventListener('change', (e) => {
            const newValue = e.target.checked ? 1 : 0;
            props.grid.setValue(props.rowKey, props.columnInfo.name, newValue);
        });
    }

    getElement() {
        return this.el;
    }

    render(props) {
        this.el.querySelector('input').checked = props.value;
    }
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
    //선택 정보 관련 전역 변수 초기화
    resetSelection();
    if (e.columnName === '_checked') return; // 체크박스 열 제외

    const row = grid1.getRow(e.rowKey);
    if (!row) return;

    // 로우 데이터로 상세페이지 각 필드값 직접 넣어 세팅
    $('#no'            ).text(row.no);
    $('#u_tmnId'       ).text(row.terminalId);
    $('#u_tmnNm'       ).val(row.terminalNm);
    $('#u_ctlBoard').prop('checked', row.ctlBoard === 1);
    $('#u_smartscreen' ).prop('checked', row.smartscreen === 1);
    $('#u_cv'          ).prop('checked',row.cv === 1);
    $('#u_ledPanel'    ).prop('checked',row.ledPanel === 1);
    $('#u_lcdDisplay'  ).prop('checked',row.lcdDisplay === 1);
    $('#u_lteRouter'   ).prop('checked',row.lteRouter === 1);
    $('#u_lteRouter2'  ).prop('checked',row.lteRouter2 === 1);
    $('#u_ledLight'    ).prop('checked',row.ledLight === 1);
    $('#u_fan'         ).prop('checked',row.fan === 1);

    // 임시 변수에 모든값 세팅
    const tempHasDeviceList = {
        1 : row.ctlBoard,
        2 : row.smartscreen,
        3 : row.cv,
        4 : row.ledPanel,
        5 : row.lcdDisplay,
        6 : row.lteRouter,
        7 : row.lteRouter2,
        8 : row.ledLight,
        9 : row.fan
    }
    // 상세페이지 정류장이 가진 기기 정보 전역변수에 저장
    hasDeviceList = Object.entries(tempHasDeviceList)
        .filter(([_, value]) => value !== 0)
        .map(([key]) => Number(key));

    // 선택된 정류장 ID 전역변수에 할당
    selectedTerminalId = row.terminalId;

    // 수정을 위한 상세 팝업 ON
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
$('#create_popup_frame .check_def').each(function (index) {
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

/* 시설물 현황 수정 팝업 체크리스트 컨트롤 */
$('#popup_frame .check_def').each(function (index) {
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

    // 정류장이 가진 기기 리스트 전역 변수 초기화
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
                ctlBoard    : facility.ctlBoard,
                smartscreen : facility.smartscreen,
                cv          : facility.cv,
                ledPanel    : facility.ledPanel,
                lcdDisplay  : facility.lcdDisplay,
                lteRouter   : facility.lteRouter,
                lteRouter2  : facility.lteRouter2,
                ledLight    : facility.ledLight,
                fan         : facility.fan
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

// 디바이스 보유값 전처리 (미사용됨)
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

/* 시설물 삭제 요청 */
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

/* 시설물 수정 요청 */
function updateFacilities(){
    let u_terminalNm  = $('#u_tmnNm').val().trim();

    // 변동 유무 체크
    if (!isTerminalChange && !isDeviceChange) {
        popupOpenDialog('info', '변동사항이 없습니다.', 2000)
        $('#popup_frame').removeClass('on');
        return;
    }

    // 업데이트 데이터 세팅
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

/* 팝업을 위한 전용 초기화 함수, 기존 clearContents는 팝업을 닫을때 사용하기엔 기존 페이지에 영향이 미치므로 별도 생성 */
function clearContentsForPopup() {

    // 등록과 수정시 필요한 정류장 관련 기기 전역 변수 초기화
    hasDeviceList = [];

    // 시설물 등록 팝업에 사용되는 ID, 이름 필드 초기화, 수정 팝업 클로즈시 초기화 되도 상관 없음
    $('#c_tmnId').val('');
    $('#c_tmnNm').val('');

    // 체크된 체크박스들 모두 초기화
    $('table.align_center .check_def').prop('checked', false);

    // 변경 감지를 위한 전역 변수 초기화
    isTerminalChange = false;
    isDeviceChange   = false;

    // 기존 clearContent에 있는 시설물 조회 관련 필드 초기화 제외
}