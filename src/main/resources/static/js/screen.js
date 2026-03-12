/* ?꾩뿭蹂??*/
let terminalList = []; // ?뺣쪟???곗씠??諛곗뿴

/* ?섏씠吏 ?⑤줈??*/
$(document).ready(function(){
    getTerminalList();
});

let reqTerminalList = new Map();

function screenStatus(terminalId, action){
    const stationCard = $(`.station_card[data-terminal-id='${terminalId}']`);
    const iconWrappers = stationCard.find('.icon-wrapper');
    iconWrappers.removeClass('loading');
    iconWrappers.removeClass('stop-loading');
    if (!action) {
        return;
    }
    const parentWrapper = stationCard.find('.ic-'+action.toLowerCase()).parent();
    if (action.toLowerCase() === "stop") {
        // STOP 踰꾪듉? 梨꾩썙吏?諛곌꼍 ?ㅽ????곸슜
        parentWrapper.addClass('stop-loading');
    } else {
        // UP, DOWN 踰꾪듉? 湲곗〈 濡쒕뵫 ?좊땲硫붿씠???ъ슜
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
    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket ?붾뱶?ъ씤??
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
        // /app/dashboard??JSON ?곗씠???꾩넚
        stompClient.send('/api/iot/screen/action', {}, JSON.stringify({
            terminalId: terminalId,
            action: action,
            message: 'request screen controll action'
        }));
    });
    addLog(terminalId, "smartscreen", action);
}

function validatePowerControl(terminalId, device, el) {
    if(device==="lte_router" ){
        popupOpenDialog("error","LTE ?쇱슦???꾩썝 ? ?쒖뼱媛 遺덇??ν빀?덈떎.",4000)
        return;
        // const proceed  = confirm("LTE ?쇱슦???꾩썝 OFF ???대떦 ?뺣쪟?μ쓽 紐⑤뱺 ?쒖뼱 諛??곹깭 ?뺤씤??遺덇??ν빀?덈떎. 吏꾪뻾?섏떆寃좎뒿?덇퉴?")
        // if (!proceed) {
        //   popupOpenDialog("error","痍⑥냼?섏??듬땲??,4000)
        //   return; // 痍⑥냼?섎㈃ ?ㅽ뻾 以묐떒
        // }
    }

    return true; // 紐⑤뱺 寃利??듦낵
}

function ctlPower(terminalId,device,el){
    if(!validatePowerControl(terminalId, device, el)){
        return
    }
    // ?꾩씠肄섏쓽 遺紐?`.icon-wrapper`
    const parentWrapper = el.closest('.icon-wrapper');
    // 濡쒕뵫 ?대옒??異붽?
    parentWrapper.addClass('loading');

    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket ?붾뱶?ъ씤??
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
        // /app/dashboard??JSON ?곗씠???꾩넚
        stompClient.send('/api/iot/power/action', {}, JSON.stringify({
            terminalId: terminalId,
            device: device,
            message: 'request power controll action'
        }));
    });

    addLog(terminalId, device, "etc");
}

/* ?곹깭 ?낇뀒?댄듃 濡쒓렇 泥섎━ */
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
            // popupOpenDialog('info', '?묒뾽?깃났', 1500);
        },
        error : function (xhr, status, error){
            // popupOpenDialog('error', '?묒뾽?ㅽ뙣' + error, 1500);
        }
    });
}

/* 移대뱶 ?앹꽦 */
function createCard(){
    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket ?붾뱶?ъ씤??
    const stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, () => {
        stompClient.subscribe('/topic/dashboard', (message) => {
            const data = JSON.parse(message.body);
            const terminalId = data.terminal_id;
            const smartscreenPower = data.smartscreen_power;
            const screenActionStatus = typeof data.screen_action_status === "string"
                ? data.screen_action_status.toUpperCase()
                : "";
            const statusDiv = $(`.station_card[data-terminal-id="${terminalId}"]`);
            // ?덉쟾??臾몄옄??蹂??(?臾몄옄 -> ?뚮Ц?? & 湲곕낯媛?泥섎━
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
            screenStatus(terminalId, screenActionStatus);
            // 以묐났 泥댄겕 ??異붽? ?먮뒗 ?낅뜲?댄듃
            if (!reqTerminalList.has(terminalId)) {
                reqTerminalList.set(terminalId, data);
            } else {
                reqTerminalList.set(terminalId, data);  // 湲곗〈 ?곗씠???낅뜲?댄듃
            }
        });
        
        // 紐⑦꽣 ?곹깭 ?낅뜲?댄듃 援щ룆
        stompClient.subscribe('/topic/screen/action', (message) => {
            const data = JSON.parse(message.body);
            const terminalId = data.terminalId; // ?쒕쾭?먯꽌 ?꾨떖??terminalId
            const action = data.action;        // ?쒕쾭?먯꽌 ?꾨떖???숈옉 ?곹깭 (UP, DOWN, STOP)
            const status = typeof data.status === "string" ? data.status.toUpperCase() : "";
            if (status && status !== "SUCCESS") {
                return;
            }
            if (!status) {
                return;
            }
            // terminalId???대떦?섎뒗 移대뱶???곹깭 ?낅뜲?댄듃
            const statusDiv = document.querySelector(`.station_card[data-terminal-id="${terminalId}"]`);
            if (statusDiv) {
                screenStatus(terminalId,action)
                // ?곹깭 ?낅뜲?댄듃 ?⑥닔 ?몄텧
                // addLog(terminalId, "smartscreen", action);
            }
            // console.log('request /topic/screen/action data : ',data)
        });
        
        stompClient.subscribe('/topic/power/action', (message) => {
            const data = JSON.parse(message.body);
            const terminalId = data.terminalId;
            let status = data.status;
            const device = data.device;
            // terminalId???대떦?섎뒗 移대뱶???곹깭 ?낅뜲?댄듃
            const statusDiv = document.querySelector(`.station_card[data-terminal-id="${terminalId}"]`);
            if (statusDiv) {
                powerStatus(terminalId,device,status)
                // ?곹깭 ?낅뜲?댄듃 ?⑥닔 ?몄텧
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

    /* 移대뱶 洹몃━?붾?遺?*/
    terminalList.forEach((list) => {
        const stationCard = document.createElement("div");
        stationCard.className = "station_card";
        stationCard.setAttribute("data-terminal-id", list.terminal_id);
        stationCard.innerHTML = `
        <h3>${list.terminal_name} (${list.terminal_id})</h3>
        <div class="flex-space-between control-screen">
          <p>
            ?ㅻ쭏???ㅽ겕由?
          </p>
          <div class="row-flex">
            <div class="icon-wrapper "><i class="ic-up"   onclick="ctlScreen('${list.terminal_id}','UP')"></i><div class="loading-spinner"></div></div>
            <div class="icon-wrapper "><i class="ic-down" onclick="ctlScreen('${list.terminal_id}','DOWN')"></i><div class="loading-spinner"></div></div>
            <div class="icon-wrapper stop-loading"><i class="ic-stop" onclick="ctlScreen('${list.terminal_id}','STOP')"></i><div class="loading-spinner"></div></div>
          </div>
        </div>

        <div class="row-flex-power">
          <div class="flex-space-between-power">
            <p>LTE ?쇱슦??/p><div class="icon-wrapper "><i class="ic-power-on lte_router" onclick="ctlPower('${list.terminal_id}','lte_router',$(this))"></i><div class="loading-spinner"></div></div>
          </div>
          <div class="flex-space-between-power">
           <p>怨듦린吏덊몴異쒖옣移?/p><div class="icon-wrapper "><i class="ic-power-on lcd_display" onclick="ctlPower('${list.terminal_id}','lcd_display',$(this))"></i></div>
          </div>
        </div>
        <div class="row-flex-power">
          <div class="flex-space-between-power">
           <p>?뱁븯李⑥븣由?/p><div class="icon-wrapper "><i class="ic-power-on led_panel" onclick="ctlPower('${list.terminal_id}','led_panel',$(this))"></i></div>
          </div>
          <div class="flex-space-between-power">
            <p>?ъ떎媛먯?移대찓??/p><div class="icon-wrapper "><i class="ic-power-on cv" onclick="ctlPower('${list.terminal_id}','cv',$(this))"></i></div>
          </div>
        </div>

        <div class="row-flex-power">
          <div class="flex-space-between-power">
             <p>怨듦났 WI-FI</p><div class="icon-wrapper "><i class="ic-power-on lte_router" onclick="ctlPower('${list.terminal_id}','lte_router',$(this))"></i></div>
          </div>
          <div class="flex-space-between-power">
            <p>LED ?꾨벑</p><div class="icon-wrapper "><i class="ic-power-on led_light" onclick="ctlPower('${list.terminal_id}','led_light',$(this))"></i></div>
          </div>

        </div>
        <div class="row-flex-power">
            <div class="flex-space-between-power">
              <p>FAN</p><div class="icon-wrapper "><i class="ic-power-on fan" onclick="ctlPower('${list.terminal_id}','fan',$(this))"></i></div>
            </div>
            <div class="flex-space-between-power">
              <p>移대찓?쇱옱??/p><div class="icon-wrapper "><i class="ic-media cv" onclick="open_stream('${list.terminal_id}','cv',$(this))"></i></div>
            </div>
        </div>
      `;
        dashboardContainer.appendChild(stationCard);
    });
}

/* ?뺣쪟??由ъ뒪??議고쉶 */
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
            popupOpenDialog('error', '?뺣쪟??議고쉶以??먮윭 諛쒖깮: ' + error, 2000);
            hideLoadingSpinner();
        },
        complete:function(){
            createCard();
        }
    });
}

/* ?낅젰媛?珥덇린??*/
function clearContents(){
    $('#s_terminalId').val('');
    $('#s_terminalNm').val('');
}

// 寃?됱“嫄??뷀꽣??媛먯?
$('#s_terminalId, #s_terminalNm').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getTerminalList();
    }
});

/* 移대찓???ㅽ듃由щ컢 */
let cvStartTerminalId; // ?ㅽ듃由щ컢以묒씤 ?뺣쪟?λ쾲??
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
        popupOpenDialog("error", "?듯빀?쒖뼱蹂대뱶 ?곌껐?곹깭瑜??뺤씤?섏꽭??",4000);
        hideLoadingSpinner();
        addLog(terminalId, "cv", "FAIL");
    }
}

/* 移대찓???뚯폆 ?듭떊 */
let cvStompClient = null; // ?ъ슜???곌껐 ?듬줈
let cvConnectTimer = null; // ?쒓컙?쒗븳
function connectWebSocket(terminalId) {
    const socket = new SockJS('/sockjs-websocket');
    cvStompClient = Stomp.over(socket);
    cvStompClient.debug = null;

    cvConnectTimer = setTimeout(() => {
        hideLoadingSpinner();
        popupOpenDialog("error", "移대찓???곌껐?쒓컙??珥덇낵?섏뿀?듬땲??", 4000);
        closePopup();
    }, 1000 * 15); // 15珥?

    cvStompClient.connect({}, function () {
        cvStompClient.send('/api/cv/stream', {}, JSON.stringify({
            terminalId: terminalId,
            action: "start"
        }));
        cvStompClient.subscribe("/topic/cv/stream", function (message) {
            const data = JSON.parse(message.body);
            if (data.status === "fail") {  // RTSP ?ㅽ뙣 ?묐떟 泥섎━
                clearTimeout(cvConnectTimer);
                hideLoadingSpinner();
                popupOpenDialog("error", "移대찓???곌껐?곹깭瑜??뺤씤?섏꽭??",4000);
                closePopup();
                return;
            }

            if (data.image) {
                clearTimeout(cvConnectTimer);
                document.getElementById('streamVideo').src = "data:image/jpeg;base64," + data.image;
                hideLoadingSpinner();
            }
        });
    });
    
    cvStartTerminalId =terminalId;
}

/* ?앹뾽?リ린(移대찓??醫낅즺) */
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

