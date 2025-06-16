/* 전역변수 */
let grid1; // 그리드
let terminalIdList = []; // 체크된 정류장 ID 목록

/* 페이지 온로드 */
$(document).ready(function(){
    initializeGrid(); // 그리드 초기화
    getMsgList(); // 그리드 데이터 조회
    previewUdt(); // 메세지 preview 동적처리
});

/* 그리드 */
function initializeGrid(){
    const gridElement = document.getElementById("grid_tale");
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
            { name: "no"           , header: "NO"		, sortable: true, align: 'center', width: 80},
            { name: "terminalId"   , header: "정류장ID"	, sortable: true, align: 'center', width: 200},
            { name: "terminalName" , header: "정류장명"	, sortable: true, align: 'center', width: 250},
            {
                name: "content",
                header: "메시지",
                sortable: false,
                align: 'center',
                editor: 'text'
            },
        ],
        columnOptions: {
            resizable: true,
            minWidth: 80
        }
    });

    tuiGridApplyTheme();

    // 이벤트 핸들러 설정
    grid1.on('click'      , handleGridClick);       // 해당 row 의 checkBox control
    grid1.on('check'      , handleCheck);           // 체크박스 클릭
    grid1.on('uncheck'    , handleUncheck);         // 체크박스 해제
    grid1.on('checkAll'   , handleCheckAll);        // 전체선택
    grid1.on('uncheckAll' , handleUncheckAll);      // 전체해제

    // 편집모드 후 저장 처리 로직
    grid1.on('editingFinish', function(e) {
        if (e.columnName === 'content') {
            updateMsg(1);
        }
    });
}

// row data 클릭으로 userId 처리 (클릭)
function handleGridClick(e) {
    // 특정 열 제외
    if (e.columnName === '_checked' || e.columnName === 'content') return;
    if (document.activeElement.tagName === "INPUT") return; // 포커스가 input 창이면 이벤트 무시

    const isChecked = grid1.getCheckedRowKeys().includes(e.rowKey);
    if (!isChecked) {
        grid1.check(e.rowKey); // 체크박스를 체크
    } else {
        grid1.uncheck(e.rowKey); // 체크박스를 해제
    }
}

// 체크박스 체크
function handleCheck(e) {
    // 특정 열 제외
    if (e.columnName === '_checked' || e.columnName === 'content') return;

    const row    = grid1.getRow(e.rowKey);
    const terminalId = row.terminalId;

    if (!terminalIdList.includes(terminalId)) {
        terminalIdList.push(terminalId);
    }
}

// 체크박스 해제
function handleUncheck(e) {
    // 특정 열 제외
    if (e.columnName === '_checked' || e.columnName === 'content') return;

    const row        = grid1.getRow(e.rowKey);
    const terminalId = row.terminalId;

    terminalIdList = terminalIdList.filter(id => id !== terminalId); // List에서 제거
}

// 전체 선택 이벤트 핸들러
function handleCheckAll() {
    const rows = grid1.getData();

    rows.forEach(row => {
        if (!terminalIdList.includes(row.terminalId)) {
            terminalIdList.push(row.terminalId);
        }
    });
}

// 전체 해제 이벤트 핸들러
function handleUncheckAll() {
    const rows = grid1.getData();
    rows.forEach(row => {
        terminalIdList = terminalIdList.filter(id => id !== row.terminalId);
    });
}

/* 비상메시지 리스트 조회 */
let isLoading = false;
function getMsgList() {
    if (isLoading) return; // 중복 실행 방지
    isLoading = true;

    handleUncheckAll();
    showLoadingSpinner();

    $.ajax({
        url     : '/api/controlMessage/msgList',
        method  : 'GET',

        success : function(response){
            const gridData = response.map((msg, index) => ({
                no           : index + 1,
                terminalId   : msg.terminalId,
                terminalName : msg.terminalName,
                content      : msg.content
            }));

            // TOAST UI Grid 데이터 초기화
            grid1.resetData(gridData);
            hideLoadingSpinner();
        },
        error : function (status, xhr, error){
            popupOpenDialog('error', "비상메시지 목록 조회에 실패하였습니다.", 2000);
            hideLoadingSpinner();
        },
        complete : function () {
            isLoading = false;
            clearContents();
            hideLoadingSpinner();
        }
    });
}

/* 비상메시지 일괄수정 */
function updateMsg(v) {
    let content = "";
    let tIdList = [];
    if (v === 0){
        if (terminalIdList.length < 1){
            popupOpenDialog('error', "메시지 적용 대상 정류장을 체크해주세요", 2000);
            return;
        }
        tIdList = terminalIdList;
        content = $('#s_content_all').val().trim();
    } else if (v === 1){
        tIdList.push(grid1.getRow(grid1.getFocusedCell().rowKey).terminalId);
        content = grid1.getValue(grid1.getFocusedCell().rowKey, "content");
    } else {
        popupOpenDialog('error', "비상메시지 적용버튼 동작 오류", 2000);
        return;
    }

    showLoadingSpinner();

    const data = {
        content         : content,
        terminalIdList  : tIdList
    }
    $.ajax({
        url         : '/api/controlMessage/updateMsg',
        method      : 'PUT',
        contentType : 'application/json; charset=utf-8',
        data        : JSON.stringify(data),
        dataType    : 'json',

        success : function (response){
            if (response.status === 'success'){
                getMsgList();
                popupOpenDialog('info', "비상메시지 적용 성공", 2000);
            } else {
                popupOpenDialog('error', "비상메시지 적용 실패", 2000);
            }
            hideLoadingSpinner();
        },
        error   : function (error, xhr, status){
            popupOpenDialog('error', "비상메시지 적용중 에러 발생", 2000);
            hideLoadingSpinner();
        },
        complete : function (){
            hideLoadingSpinner();
            clearContents();
        }
    });
}

// 비상메시지 입력창에서 엔터 입력 시 저장 버튼 실행
$('#s_content_all').on('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        updateMsg(0);
    }
});

/* 초기화 */
function clearContents(){
    $('#s_content_all').val("");
    handleUncheckAll();
    terminalIdList = [];
}
$(document).ready(function () {

    const colors = [
        { 번호: "00", 글자색: "흰색", 색상코드: "#FFFFFF", 테두리색상: "#FFFFFF",back: "#000000" },
        { 번호: "01", 글자색: "파랑", 색상코드: "#0000ff", 테두리색상: "#0000ff" ,back: "#000000"},
        { 번호: "02", 글자색: "청록", 색상코드: "#00FFFF", 테두리색상: "#00FFFF" ,back: "#000000"},
        { 번호: "03", 글자색: "녹색", 색상코드: "#008000", 테두리색상: "#008000" ,back: "#000000"},
        { 번호: "04", 글자색: "노랑", 색상코드: "#FFFF00", 테두리색상: "#FFFF00" ,back: "#000000"},
        { 번호: "05", 글자색: "빨강", 색상코드: "#FF0000", 테두리색상: "#FF0000" ,back: "#000000"},
        { 번호: "06", 글자색: "분홍", 색상코드: "#FFC0CB", 테두리색상: "#FFC0CB" ,back: "#000000"},
        // { 번호: "07", 글자색: "혼합", 색상코드: "#FFFFFF", 테두리색상: "#FFFFFF" ,back: "#000000"},
        // { 번호: "08", 글자색: "흰색", 색상코드: "#FFFFFF", 테두리색상: "#008000" ,back: "#000000"},
        // { 번호: "09", 글자색: "흰색", 색상코드: "#FFFFFF", 테두리색상: "#FFFF00" ,back: "#000000"},
        // { 번호: "10", 글자색: "흰색", 색상코드: "#FFFFFF", 테두리색상: "#0000FF" ,back: "#000000"},
        // { 번호: "11", 글자색: "흰색", 색상코드: "#FFFFFF", 테두리색상: "#FFC0CB" ,back: "#000000"},
        // { 번호: "12", 글자색: "흰색", 색상코드: "#FFFFFF", 테두리색상: "#00FFFF" ,back: "#000000"},
        // { 번호: "13", 글자색: "빨강", 색상코드: "#FF0000", 테두리색상: "#00FFFF" ,back: "#000000"},
        // { 번호: "14", 글자색: "녹색", 색상코드: "#008000", 테두리색상: "#FFC0CB" ,back: "#000000"},
        // { 번호: "15", 글자색: "노랑", 색상코드: "#FFFF00", 테두리색상: "#0000FF" ,back: "#000000"},
        // { 번호: "16", 글자색: "파랑", 색상코드: "#0000FF", 테두리색상: "#FFFF00" ,back: "#000000"},
        // { 번호: "17", 글자색: "분홍", 색상코드: "#FFC0CB", 테두리색상: "#008000" ,back: "#000000"},
        // { 번호: "18", 글자색: "청록", 색상코드: "#00FFFF", 테두리색상: "#FF0000" ,back: "#000000"},
        // { 번호: 19, 글자색: "네온1", 색상코드: "#FFF100", 테두리색상: "#000000" },
        // { 번호: 20, 글자색: "네온2", 색상코드: "#FF0099", 테두리색상: "#000000" },
        // { 번호: 21, 글자색: "네온3", 색상코드: "#00FF00", 테두리색상: "#000000" },
        // { 번호: 22, 글자색: "네온4", 색상코드: "#0099FF", 테두리색상: "#000000" },
        // { 번호: 23, 글자색: "네온5", 색상코드: "#FF6600", 테두리색상: "#000000" },
        // { 번호: 24, 글자색: "네온6", 색상코드: "#FF0000", 테두리색상: "#000000" },
        // { 번호: 25, 글자색: "네온7", 색상코드: "#9900FF", 테두리색상: "#000000" },
        // { 번호: 26, 글자색: "네온8", 색상코드: "#FF0099", 테두리색상: "#000000" },
        // { 번호: 27, 글자색: "네온9", 색상코드: "#00FFFF", 테두리색상: "#000000" }
    ];

    // Select 박스에 옵션 추가 (색상이 표시됨)
    colors.forEach(color => {
        $("#color").append(
            `<option value="${color.번호}" style="background:${color.back}; color:${color.색상코드}"  data-back="${color.back}" data-id="${color.색상코드}">
                ${color.글자색}
            </option>`
        );
    });

    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        stompClient.subscribe('/topic/led/send', (message) => {
            const data = JSON.parse(message.body);
            const terminalId = data.terminalId;
            // let status = data.status;
            // const device = data.device;
            // // terminalId에 해당하는 카드의 상태 업데이트
            // const statusDiv = document.querySelector(`.station_card[data-terminal-id="${terminalId}"]`);

            console.log('request /topic/led/send : ',data)
        });
    });
});
function sendMessage(emergencyMessageStatus){
    const checkedRows = grid1.getCheckedRows();
    // if (!checkedRows || checkedRows.length === 0) {
    //     popupOpenDialog("error","체크된 데이터가 없습니다!","4000"); // 🚨 경고창 표시
    //     return [];
    // }
    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    const stompClient = Stomp.over(socket);

    // checkedRows.forEach(row=>{
    //     const terminalId = row.terminalId;
    const eff           = $("#eff_start").val() +$("#eff_wait").val()+$("#eff_end").val();
    const sendMessage   = $("#s_content_all").val();
    const weight        = $("#weight").val();
    const color         = $("#color").val();
    const font          = $("#font").val();
    const ysz           = $("#ysz").val();
    const fix           = $("#fix").val();

    // const dly_interval= 10000000000;
    stompClient.connect({}, () => {
        // /app/dashboard에 JSON 데이터 전송
        stompClient.send('/api/iot/led/send', {}, JSON.stringify({
            // terminalId: terminalId,
            sendMessage : sendMessage,
            weight      : weight,
            color       : color,
            font        : font,
            eff         : eff,
            ysz         : ysz,
            fix         : fix,
            dly_interval:10000000000,
            emergencyMessageStatus:emergencyMessageStatus
            // message: 'request led display send'
        }));
    });
    // });
}

/* 메시지 미리보기 동적처리 */
function previewUdt(){
    // 메세지 입력시 해당 값이 preview 에 같이 입력됨
    $("#s_content_all").on("input", function () {
        $("#preview").text($(this).val());
    });

    // 색상, 글꼴 스타일 등도 실시간으로 반영
    $("#color").on("change", function () {
        updatePreview();
    });

    // 초기 상태 설정
    $("#preview").css({
        "border"           : "2px solid #FFFFFF",
        "background-color" : "#000000",
        "color"            : "#FFFFFF",
        "text-align"       : 'center',
        "max-width"        : '205px',
        "height"           : "25px",
    });

    // 한글 조합 시작 시 플래그 설정
    $("#s_content_all").on("compositionstart", function () {
        isComposing = true;
    });

    // 한글 조합 완료 시 플래그 해제 후 글자수 제한 적용
    $("#s_content_all").on("compositionend", function () {
        isComposing = false;
        enforceTextLimit();
    });

    // 일반 입력 시 글자수 제한 적용 (IME 입력 중이 아닐 때만)
    $("#s_content_all").on("input", function () {
        if (!isComposing) {
            enforceTextLimit();
        }
    });

    // 글자 수 제한 함수 (15자 초과 시 자름)
    function enforceTextLimit() {
        let text = $("#s_content_all").val();
        if (text.length > 14) {
            text = text.substring(0, 14);
            $("#s_content_all").val(text);
        }
        $("#preview").text(text);
    }
}

/* 글자색상 css 가져오기 */
function updatePreview() {
    const backColor     = $("#color").find("option:selected").attr("data-back");
    const selectedColor = $("#color").find("option:selected").attr("data-id");
    const borderColor   = $("#color").find("option:selected").css("color");

    $("#preview").css({
        "border"           : `2px solid ${borderColor}`,
        "color"            : selectedColor,
        "background-color" : backColor,
        "text-align"       : 'center',
        "max-width"        : '205px',
        "height"           : '25px'
    });
}

