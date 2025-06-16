/* 전역변수 */
let stompClient;
let grid1; // 그리드
let orderList = []; // 최근 명령어 배열

/* 페이지 온로드 */
$(document).ready(function(){
    connectWebSocket();
    getTerminalList();
    getShallList();
    initializeGrid();

    // 정류장 선택 시 terminalId에 반영
    $('.cmd_slt').on('change', function () {
        const selectedTerminalId = $(this).val();
        $('#terminalId').val(selectedTerminalId);
    });

    // 명령어 선택 시 command에 반영
    $('.cmd_sh').on('change', function () {
        const selectedCommand = $(this).find('option:selected').text();
        $('#command').val(selectedCommand);
    });
});

// 소켓 연결
function connectWebSocket() {
    const socket = new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        stompClient.subscribe('/topic/command', (message) => {
            const res = JSON.parse(message.body);
            const resultText = `[${res.terminalId}]  ` + res.commandResult;
            $('#result').text(resultText);
        });
        stompClient.subscribe("/topic/command/result", (message) => {
            const res = JSON.parse(message.body);
            console.log('request /topic/led/send : ',res)
            const resultText = `[${res.terminalId}]  ` + res.commandResult;

            $('#result').append('<br>' + resultText);
        });
    });
}

// 명령어 전송
function sendCommand() {
    const command = $('#command').val().trim();
    const terminalId = $('#terminalId').val().trim();

    if (!command) {
        popupOpenDialog('error', '명령어를 입력해주세요', 2000);
        $('#command').focus();
        return;
    }

    if (!stompClient || !stompClient.connected) {
        popupOpenDialog('error', 'WebSocket 연결이 되어있지 않습니다', 2000);
        return;
    }

    stompClient.send("/api/iot/command", {}, JSON.stringify({
        command: command,
        terminalId: terminalId || "ALL"
    }));

    // 시간 포맷
    const now = new Date();
    const timestamp = now.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    orderList.unshift({
        timestamp: timestamp,
        terminal: terminalId || "(전체)",
        command: command
    });

    if (orderList.length > 100) {
        orderList.pop();
    }

    // 그리드 갱신
    grid1.resetData(orderList);
}

// 정류장 리스트 가져오기
function getTerminalList(){
    $.ajax({
        url: '/api/facility/listSimple',
        method: 'GET',

        success: function(response){
            if (!Array.isArray(response)) {
                return;
            }

            const select = document.querySelector('.terminal_group select');
            if (!select) return;

            response.sort((a, b) => {
                const nameA = a.terminal_name.toUpperCase();
                const nameB = b.terminal_name.toUpperCase();
                return nameA.localeCompare(nameB);
            });

            response.forEach(terminal => {
                const option = document.createElement('option');
                option.value = terminal.terminal_id;
                option.text = `${terminal.terminal_name}(${terminal.terminal_id})`;
                select.appendChild(option);
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            popupOpenDialog('error', '시설물 조회 실패', 2000);
        }
    });
}

// 입력값 초기화
function clearText(){
    $('#terminalId').val('');
    $('.cmd_txt').val('');
}

// 추가이벤트
$(document).on('click', '.add-shall-btn', function () {
    const command = $(this).data('command');
    addShall(command);
});

// 그리드 초기화
function initializeGrid() {
    grid1 = new tui.Grid({
        el: document.getElementById("grid_tale"),
        scrollX: true,
        scrollY: false,
        columns: [
            {name: "timestamp", header: "전송시간", align: 'center', width: 300},
            {name: "terminal", header: "정류장 리스트", align: 'center', width: 400},
            {name: "command", header: "Shell 명령어", align: 'left'},
            {
                name: "addShall",
                header: "등록",
                align: 'center',
                width: 80,
                formatter: (props) => {
                    const command = props.row.command.replace(/"/g, '&quot;');
                    return `<button class="add-shall-btn btn_def btn_point_clr btn_model" data-command="${command}">등록</button>`;
                }
            }
        ],
        data: orderList,
        columnOptions: {
            resizable: true,
            minWidth: 80
        },
    });

    grid1.on('click', function(ev) {
        grid1.blur();
    });
}

// 쉘 명령어 조회
function getShallList(){
    $.ajax({
        url: '/api/command/shallList',
        method: 'GET',
        success: function(response){
            if (!Array.isArray(response)) {
                return;
            }

            const select = document.querySelector('.cmd_sh');
            if (!select) return;

            select.querySelectorAll('option:not([disabled])').forEach(opt => opt.remove());

            response.forEach(item => {
                const option = document.createElement('option');
                option.value = item.shall;
                option.text = item.shall;
                select.appendChild(option);
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            popupOpenDialog('error', '명령어 조회중 오류 발생');
            console.warn(jqXHR);
            console.warn(textStatus);
            console.warn(errorThrown);
        }
    })
}

// 명령어 추가
function addShall(command){
    if (!command) return;

    $.ajax({
        url: '/api/command/addShall',
        method: 'POST',
        data: {shall : command.trim()},
        success: function(response){
            if (response){
                popupOpenDialog('info', `등록 성공 : ${command}`, 3000);
            } else {
                popupOpenDialog('error', '명령어 등록 실패', 2000);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            popupOpenDialog('error', '명령어 등록중 오류 발생', 2000);
        }
    });
}