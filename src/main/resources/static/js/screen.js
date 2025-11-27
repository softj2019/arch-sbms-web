/* 전역변수 */
let terminalList = []; // 정류장 데이터 배열

/* 페이지 온로드 */
$(document).ready(function(){
    getTerminalList();
});

let reqTerminalList = new Map();

function screenStatus(terminalId, action){
    const stationCard = $(`.station_card[data-terminal-id='${terminalId}']`);
    const iconWrappers = stationCard.find('.icon-wrapper');
    iconWrappers.removeClass('loading');
    iconWrappers.removeClass('stop-loading');
    const parentWrapper = stationCard.find('.ic-'+action.toLowerCase()).parent();
    if (action.toLowerCase() === "stop") {
        // STOP 버튼은 채워진 배경 스타일 적용
        parentWrapper.addClass('stop-loading');
    } else {
        // UP, DOWN 버튼은 기존 로딩 애니메이션 사용
        parentWrapper.addClass('loading');
    }
}

function powerStatus(terminalId, device, status){
    const stationCard = $(`.station_card[data-terminal-id='${terminalId}']`);
    console.log(`${terminalId} : ${status}`);
    if (status == null){
        status = "off";
    }

    const parentWrapper = stationCard.find('.icon-wrapper .'+device);
    parentWrapper.removeClass('ic-power-on');
    parentWrapper.removeClass('ic-power-off');
    parentWrapper.addClass('ic-power-'+status.toLowerCase());
}

function ctlScreen(terminalId,action){
    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
        // /app/dashboard에 JSON 데이터 전송
        stompClient.send('/api/iot/screen/action', {}, JSON.stringify({
            terminalId: terminalId,
            action: action,
            message: 'request screen controll action'
        }));
    });
    screenStatus(terminalId,action)
    addLog(terminalId, "smartscreen", action);
}

function validatePowerControl(terminalId, device, el) {
    if(device==="lte_router" ){
        popupOpenDialog("error","LTE 라우터 전원 은 제어가 불가능합니다.",4000)
        return;
        // const proceed  = confirm("LTE 라우터 전원 OFF 시 해당 정류장의 모든 제어 및 상태 확인이 불가능합니다. 진행하시겠습니까?")
        // if (!proceed) {
        //   popupOpenDialog("error","취소하였습니다",4000)
        //   return; // 취소하면 실행 중단
        // }
    }

    return true; // 모든 검증 통과
}

function ctlPower(terminalId,device,el){
    if(!validatePowerControl(terminalId, device, el)){
        return
    }
    // 아이콘의 부모 `.icon-wrapper`
    const parentWrapper = el.closest('.icon-wrapper');
    // 로딩 클래스 추가
    parentWrapper.addClass('loading');

    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
        // /app/dashboard에 JSON 데이터 전송
        stompClient.send('/api/iot/power/action', {}, JSON.stringify({
            terminalId: terminalId,
            device: device,
            message: 'request power controll action'
        }));
    });

    addLog(terminalId, device, "etc");
}

/* 상태 업테이트 로그 처리 */
function addLog(terminalId, device, action){
    const sendData = {
        terminalId : terminalId,
        deviceName : device,
        action     : action.toLowerCase(),
    }
    $.ajax({
        url         : '/api/control/addLog',
        method      : 'POST',
        data        : JSON.stringify(sendData),
        contentType : 'application/json; charset=utf-8',
        dataType    : 'json',

        success : function(){
            // popupOpenDialog('info', '작업성공', 1500);
        },
        error : function (xhr, status, error){
            // popupOpenDialog('error', '작업실패' + error, 1500);
        }
    });
}

/* 카드 생성 */
function createCard(){
    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    const stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, () => {
        stompClient.subscribe('/topic/dashboard', (message) => {
            const data = JSON.parse(message.body);
            const terminalId = data.terminal_id;
            const smartscreenPower = data.smartscreen_power;
            const statusDiv = $(`.station_card[data-terminal-id="${terminalId}"]`);
            // 안전한 문자열 변환 (대문자 -> 소문자) & 기본값 처리
            const ledPanelPower = typeof data.led_panel_power === "string" ? data.led_panel_power.toLowerCase() : "off";
            const ledLightPower = typeof data.led_light_power === "string" ? data.led_light_power.toLowerCase() : "off";
            const fanPower = typeof data.fan === "string" ? data.fan.toLowerCase() : "off";
            const cvPower = typeof data.vc_power === "string" ? data.vc_power.toLowerCase() : "off";

            // LED Panel
            const panel = statusDiv.find('.led_panel');
            panel.removeClass('ic-power-on ic-power-off');
            panel.addClass(`ic-power-${ledPanelPower}`);

            // LED Light
            const led_light = statusDiv.find('.led_light');
            led_light.removeClass('ic-power-on ic-power-off');
            led_light.addClass(`ic-power-${ledLightPower}`);

            // Fan
            const fan = statusDiv.find('.fan');
            fan.removeClass('ic-power-on ic-power-off');
            fan.addClass(`ic-power-${fanPower}`);

            // CV (Camera or Ventilation)
            const cv = statusDiv.find('.cv');
            cv.removeClass('ic-power-on ic-power-off');
            cv.addClass(`ic-power-${cvPower}`);
            // 중복 체크 후 추가 또는 업데이트
            if (!reqTerminalList.has(terminalId)) {
                reqTerminalList.set(terminalId, data);
            } else {
                reqTerminalList.set(terminalId, data);  // 기존 데이터 업데이트
            }
        });
        
        // 모터 상태 업데이트 구독
        stompClient.subscribe('/topic/screen/action', (message) => {
            const data = JSON.parse(message.body);
            const terminalId = data.terminalId; // 서버에서 전달된 terminalId
            const action = data.action;        // 서버에서 전달된 동작 상태 (UP, DOWN, STOP)
            // terminalId에 해당하는 카드의 상태 업데이트
            const statusDiv = document.querySelector(`.station_card[data-terminal-id="${terminalId}"]`);
            if (statusDiv) {
                screenStatus(terminalId,action)
                // 상태 업데이트 함수 호출
                // addLog(terminalId, "smartscreen", action);
            }
            // console.log('request /topic/screen/action data : ',data)
        });
        
        stompClient.subscribe('/topic/power/action', (message) => {
            const data = JSON.parse(message.body);
            const terminalId = data.terminalId;
            let status = data.status;
            const device = data.device;
            // terminalId에 해당하는 카드의 상태 업데이트
            const statusDiv = document.querySelector(`.station_card[data-terminal-id="${terminalId}"]`);
            if (statusDiv) {
                powerStatus(terminalId,device,status)
                // 상태 업데이트 함수 호출
                if (status == null){
                    status = 'off';
                }
                // addLog(terminalId, device, status);
            }
            // console.log('request /topic/power/action data : ',data)
        });
    });

    const dashboardContainer = document.querySelector(".dashboard_stations");
    dashboardContainer.innerHTML = "";

    /* 카드 그리는부분 */
    terminalList.forEach((list) => {
        const stationCard = document.createElement("div");
        stationCard.className = "station_card";
        stationCard.setAttribute("data-terminal-id", list.terminal_id);
        stationCard.innerHTML = `
        <h3>${list.terminal_name} (${list.terminal_id})</h3>
        <div class="flex-space-between control-screen">
          <p>
            스마트 스크린
          </p>
          <div class="row-flex">
            <div class="icon-wrapper "><i class="ic-up"   onclick="ctlScreen('${list.terminal_id}','UP')"></i><div class="loading-spinner"></div></div>
            <div class="icon-wrapper "><i class="ic-down" onclick="ctlScreen('${list.terminal_id}','DOWN')"></i><div class="loading-spinner"></div></div>
            <div class="icon-wrapper stop-loading"><i class="ic-stop" onclick="ctlScreen('${list.terminal_id}','STOP')"></i><div class="loading-spinner"></div></div>
          </div>
        </div>

        <div class="row-flex-power">
          <div class="flex-space-between-power">
            <p>LTE 라우터</p><div class="icon-wrapper "><i class="ic-power-on lte_router" onclick="ctlPower('${list.terminal_id}','lte_router',$(this))"></i><div class="loading-spinner"></div></div>
          </div>
          <div class="flex-space-between-power">
           <p>공기질표출장치</p><div class="icon-wrapper "><i class="ic-power-on lcd_display" onclick="ctlPower('${list.terminal_id}','lcd_display',$(this))"></i></div>
          </div>
        </div>
        <div class="row-flex-power">
          <div class="flex-space-between-power">
           <p>승하차알림</p><div class="icon-wrapper "><i class="ic-power-on led_panel" onclick="ctlPower('${list.terminal_id}','led_panel',$(this))"></i></div>
          </div>
          <div class="flex-space-between-power">
            <p>재실감지카메라</p><div class="icon-wrapper "><i class="ic-power-on cv" onclick="ctlPower('${list.terminal_id}','cv',$(this))"></i></div>
          </div>
        </div>

        <div class="row-flex-power">
          <div class="flex-space-between-power">
             <p>공공 WI-FI</p><div class="icon-wrapper "><i class="ic-power-on lte_router" onclick="ctlPower('${list.terminal_id}','lte_router',$(this))"></i></div>
          </div>
          <div class="flex-space-between-power">
            <p>LED 전등</p><div class="icon-wrapper "><i class="ic-power-on led_light" onclick="ctlPower('${list.terminal_id}','led_light',$(this))"></i></div>
          </div>

        </div>
        <div class="row-flex-power">
            <div class="flex-space-between-power">
              <p>FAN</p><div class="icon-wrapper "><i class="ic-power-on fan" onclick="ctlPower('${list.terminal_id}','fan',$(this))"></i></div>
            </div>
            <div class="flex-space-between-power">
              <p>카메라재생</p><div class="icon-wrapper "><i class="ic-media cv" onclick="open_stream('${list.terminal_id}','cv',$(this))"></i></div>
            </div>
        </div>
      `;
        dashboardContainer.appendChild(stationCard);
    });
}

/* 정류장 리스트 조회 */
function getTerminalList(){
    showLoadingSpinner();

    let s_terminalId = $('#s_terminalId').val();
    let s_terminalNm = $('#s_terminalNm').val();
    let dataList = {
        terminalId : s_terminalId,
        terminalNm : s_terminalNm
    }
    const qryString = $.param(dataList);

    $.ajax({
        url     : `/api/controlScreen/terminalList?${qryString}`,
        method  : 'GET',

        success : function (response){
            terminalList  = response.map(terminal => ({
                terminal_id  : terminal.terminal_id,
                terminal_name: terminal.terminal_name
            }));

            hideLoadingSpinner();
        },
        error   : function (error){
            popupOpenDialog('error', '정류장 조회중 에러 발생: ' + error, 2000);
            hideLoadingSpinner();
        },
        complete:function(){
            createCard();
        }
    });
}

/* 입력값 초기화 */
function clearContents(){
    $('#s_terminalId').val('');
    $('#s_terminalNm').val('');
}

// 검색조건 엔터키 감지
$('#s_terminalId, #s_terminalNm').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getTerminalList();
    }
});

/* 카메라 스트리밍 */
let cvStartTerminalId; // 스트리밍중인 정류장번호
function open_stream(terminalId){
    if(reqTerminalList.has(terminalId)){
        document.getElementById('streamVideo').src = "";
        const popup = document.getElementById("popup_layer");
        popup.classList.add("active");
        // $('#popup_frame').addClass('on');
        showLoadingSpinner();
        connectWebSocket(terminalId);
        addLog(terminalId, "cv", "ON");
    }else{
        popupOpenDialog("error", "통합제어보드 연결상태를 확인하세요.",4000);
        hideLoadingSpinner();
        addLog(terminalId, "cv", "FAIL");
    }
}

/* 카메라 소켓 통신 */
let cvStompClient = null; // 사용자 연결 통로
let cvConnectTimer = null; // 10초 시간제한
function connectWebSocket(terminalId) {
    const socket = new SockJS('/sockjs-websocket');
    cvStompClient = Stomp.over(socket);
    cvStompClient.debug = null;

    cvConnectTimer = setTimeout(() => {
        hideLoadingSpinner();
        popupOpenDialog("error", "카메라 연결시간이 초과되었습니다.", 4000);
        closePopup();
    }, 10000); // 10초

    cvStompClient.connect({}, function () {
        cvStompClient.send('/api/cv/stream', {}, JSON.stringify({
            terminalId: terminalId,
            action: "start"
        }));
        cvStompClient.subscribe("/topic/cv/stream", function (message) {
            const data = JSON.parse(message.body);
            if (data.status === "fail") {  // RTSP 실패 응답 처리
                hideLoadingSpinner();
                popupOpenDialog("error", "카메라 연결상태를 확인하세요.",4000);
                closePopup();
                return;
            }

            if (data.image) {
                document.getElementById('streamVideo').src = "data:image/jpeg;base64," + data.image;
                hideLoadingSpinner();
            }
        });
    });
    
    cvStartTerminalId =terminalId;
}

/* 팝업닫기(카메라 종료) */
function closePopup() {
    $('#popup_frame').removeClass('on');

    if (cvStompClient) {
        cvStompClient.send("/api/cv/stream", {}, JSON.stringify({
            terminalId: cvStartTerminalId,
            action: "stop"
        }));

        cvStompClient.disconnect();
        cvStompClient = null;
    }

    const popup = document.getElementById("popup_layer");
    popup.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("popup_layer");
    const closeBtn = document.querySelector(".popup_close");
    const header = document.querySelector(".popup_header");

    let isDragging = false;
    let startX, startY, offsetX, offsetY;

    closeBtn.addEventListener("click", function () {
        popup.classList.remove("active");
        closePopup()
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            popup.classList.remove("active");
            closePopup()
        }
    });

    header.addEventListener("mousedown", function (e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        offsetX = popup.offsetLeft;
        offsetY = popup.offsetTop;
        header.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", function (e) {
        if (isDragging) {
            let moveX = e.clientX - startX;
            let moveY = e.clientY - startY;
            popup.style.left = offsetX + moveX + "px";
            popup.style.top = offsetY + moveY + "px";
        }
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
        header.style.cursor = "grab";
    });
});