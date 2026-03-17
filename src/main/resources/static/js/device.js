/* 디바이스 관리 */
let deviceGrid;
let logGrid;
let logPagination;
let stompClient;
let selectedTerminals = [];
let pendingCommand = null;
const LOG_PAGE_SIZE = 20;

$(document).ready(function () {
    loadDeviceList();
});

document.addEventListener('DOMContentLoaded', () => {
    initDeviceGrid();
    initLogGrid();
    connectWebSocket();
    setDefaultLogDates();
    loadMaintenanceLogs(0);
});

/* ===== WebSocket ===== */
function connectWebSocket() {
    const socket = new SockJS('/sockjs-websocket');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, () => {
        // 실시간 디바이스 상태 업데이트
        stompClient.subscribe('/topic/dashboard', (message) => {
            try {
                let data = JSON.parse(message.body);
                if (!Array.isArray(data)) data = [data];
                data.forEach(updateDeviceRow);
            } catch (e) {
                console.error('dashboard parse error:', e);
            }
        });

        // 명령 결과 수신
        stompClient.subscribe('/topic/command/result', (message) => {
            try {
                const res = JSON.parse(message.body);
                appendCommandResult(res);
                loadMaintenanceLogs(0);
            } catch (e) {
                console.error('command result parse error:', e);
            }
        });
    });
}

/* ===== 디바이스 헬스 그리드 ===== */
function initDeviceGrid() {
    deviceGrid = new tui.Grid({
        el: document.getElementById('device_grid'),
        scrollX: true,
        scrollY: false,
        rowHeaders: ['checkbox'],
        columns: [
            { name: 'terminal_id', header: 'Terminal ID', sortable: true, align: 'center', width: 100 },
            { name: 'terminal_nm', header: '터미널명', sortable: true, align: 'center', width: 160 },
            {
                name: 'main_ctl_status', header: 'main_ctl', sortable: true, align: 'center', width: 100,
                formatter: ({ value }) => statusBadge(value)
            },
            {
                name: 'cv2_ffmpeg_status', header: 'cv2_ffmpeg', sortable: true, align: 'center', width: 100,
                formatter: ({ value }) => statusBadge(value)
            },
            { name: 'git_version', header: 'Git Ver', sortable: true, align: 'center', width: 90,
                formatter: ({ value }) => value || '-'
            },
            { name: 'last_detection_count', header: '감지 인원', sortable: true, align: 'center', width: 90,
                formatter: ({ value }) => value != null ? value : '-'
            },
            { name: 'last_detection_time', header: '감지 시각', sortable: true, align: 'center', width: 140,
                formatter: ({ value }) => value || '-'
            },
            {
                name: 'stomp_connected', header: 'STOMP', sortable: true, align: 'center', width: 80,
                formatter: ({ value }) => stompBadge(value)
            },
            { name: 'uptime', header: 'Uptime', sortable: true, align: 'center', width: 100,
                formatter: ({ value }) => formatUptime(value)
            },
            {
                name: 'rfc_cpu', header: 'CPU', sortable: true, align: 'center', width: 70,
                formatter: ({ value }) => value || '-'
            },
            {
                name: 'cpu_temperature', header: 'Temp', sortable: true, align: 'center', width: 70,
                formatter: ({ value }) => value || '-'
            },
            {
                name: 'ipaddress', header: 'IP', sortable: true, align: 'center', width: 130,
                formatter: ({ value }) => value || '-'
            },
            {
                name: 'last_overview_at', header: '마지막 통신', sortable: true, align: 'center', width: 150,
                formatter: ({ value }) => value || '-'
            }
        ],
        columnOptions: { resizable: true, minWidth: 60 }
    });

    deviceGrid.on('checkAll', () => updateSelectedTerminals());
    deviceGrid.on('uncheckAll', () => updateSelectedTerminals());
    deviceGrid.on('check', () => updateSelectedTerminals());
    deviceGrid.on('uncheck', () => updateSelectedTerminals());
}

function updateSelectedTerminals() {
    const checkedRows = deviceGrid.getCheckedRows();
    selectedTerminals = checkedRows.map(r => ({
        terminalId: String(r.terminal_id),
        terminalName: r.terminal_nm
    }));

    if (selectedTerminals.length === 0) {
        $('#selected_info').text('디바이스를 선택하세요').css('color', '#e74c3c');
    } else {
        const names = selectedTerminals.map(t => t.terminalName || t.terminalId).join(', ');
        $('#selected_info').text(selectedTerminals.length + '대 선택: ' + names).css('color', '#2c3e50');
    }
}

function loadDeviceList() {
    const params = {
        terminalId: $('#s_terminalId').val(),
        terminalNm: $('#s_terminalNm').val()
    };

    showLoadingSpinner();
    $.ajax({
        url: '/api/device/list?' + $.param(params),
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            if (!Array.isArray(response)) return;

            const rows = response.map(s => ({
                terminal_id: String(s.terminal_id ?? s.terminalId),
                terminal_nm: s.terminal_name ?? s.terminalName,
                main_ctl_status: s.main_ctl_status ?? s.mainCtlStatus ?? '',
                cv2_ffmpeg_status: s.cv2_ffmpeg_status ?? s.cv2FfmpegStatus ?? '',
                git_version: s.git_version ?? s.gitVersion ?? '',
                last_detection_count: s.last_detection_count ?? s.lastDetectionCount ?? null,
                last_detection_time: s.last_detection_time ?? s.lastDetectionTime ?? '',
                stomp_connected: s.stomp_connected ?? s.stompConnected ?? '',
                uptime: s.uptime_seconds ?? s.uptime ?? null,
                rfc_cpu: '',
                cpu_temperature: '',
                ipaddress: '',
                last_overview_at: ''
            }));

            deviceGrid.resetData(rows);
            $('#device_count').text(rows.length);
        },
        error: function (xhr, status, error) {
            popupOpenDialog('error', '디바이스 목록 조회 실패: ' + error, 2000);
        },
        complete: function () {
            hideLoadingSpinner();
        }
    });
}

function updateDeviceRow(newRow) {
    const data = deviceGrid.getData();
    const idx = data.findIndex(r => String(r.terminal_id) === String(newRow.terminal_id));
    if (idx === -1) return;

    deviceGrid.setValue(idx, 'rfc_cpu', newRow.rfc_cpu ?? '-');
    deviceGrid.setValue(idx, 'cpu_temperature', newRow.cpu_temperature ?? '-');
    deviceGrid.setValue(idx, 'ipaddress', newRow.ipaddress ?? '-');

    // Phase 5 필드 (Pi 고도화 후 수신 가능)
    if (newRow.main_ctl_status) deviceGrid.setValue(idx, 'main_ctl_status', newRow.main_ctl_status);
    if (newRow.cv2_ffmpeg_status) deviceGrid.setValue(idx, 'cv2_ffmpeg_status', newRow.cv2_ffmpeg_status);
    if (newRow.git_version) deviceGrid.setValue(idx, 'git_version', newRow.git_version);
    if (newRow.last_detection_count != null) deviceGrid.setValue(idx, 'last_detection_count', newRow.last_detection_count);
    if (newRow.last_detection_time) deviceGrid.setValue(idx, 'last_detection_time', newRow.last_detection_time);
    if (newRow.stomp_connected) deviceGrid.setValue(idx, 'stomp_connected', newRow.stomp_connected);
    if (newRow.uptime_seconds != null) deviceGrid.setValue(idx, 'uptime', newRow.uptime_seconds);

    // 마지막 통신 시각
    const now = new Date();
    const ts = now.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    deviceGrid.setValue(idx, 'last_overview_at', ts);
}

function clearSearch() {
    $('#s_terminalId').val('');
    $('#s_terminalNm').val('');
}

$('#s_terminalId, #s_terminalNm').on('keydown', function (e) {
    if (e.key === 'Enter') loadDeviceList();
});

/* ===== 서비스 제어 ===== */
function sendPresetCommand(actionType, command) {
    if (selectedTerminals.length === 0) {
        popupOpenDialog('error', '디바이스를 선택하세요.', 2000);
        return;
    }
    showConfirm(actionType, command);
}

function sendCustomCommand() {
    const command = $('#custom_command').val().trim();
    if (!command) {
        popupOpenDialog('error', '명령어를 입력해주세요.', 2000);
        return;
    }
    if (selectedTerminals.length === 0) {
        popupOpenDialog('error', '디바이스를 선택하세요.', 2000);
        return;
    }
    showConfirm('CUSTOM_COMMAND', command);
}

function showConfirm(actionType, command) {
    const targetNames = selectedTerminals.map(t => (t.terminalName || t.terminalId)).join(', ');
    $('#confirm_target').text(targetNames);
    $('#confirm_action').text(actionType);
    $('#confirm_command').text(command);

    pendingCommand = { actionType, command };
    $('#confirmModal').addClass('on');
}

function closeConfirmModal() {
    $('#confirmModal').removeClass('on');
    pendingCommand = null;
}

function executeConfirmedCommand() {
    if (!pendingCommand) return;
    closeConfirmModal();

    const { actionType, command } = pendingCommand;

    selectedTerminals.forEach(terminal => {
        $.ajax({
            url: '/api/device/command',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                terminalId: terminal.terminalId,
                actionType: actionType,
                command: command
            }),
            success: function (res) {
                appendCommandResult({
                    terminalId: terminal.terminalId,
                    commandResult: '[전송완료] logId=' + res.logId
                });
            },
            error: function (xhr, status, error) {
                appendCommandResult({
                    terminalId: terminal.terminalId,
                    commandResult: '[전송실패] ' + error
                });
            }
        });
    });
}

function appendCommandResult(res) {
    const area = document.getElementById('command_result_area');
    const now = new Date().toLocaleTimeString('ko-KR');
    const text = `[${now}] [${res.terminalId}] ${res.commandResult ?? res.message ?? ''}\n`;
    if (area.textContent === '명령 실행 결과가 여기에 표시됩니다.') {
        area.textContent = '';
    }
    area.textContent += text;
    area.scrollTop = area.scrollHeight;
}

/* ===== 유지보수 이력 그리드 ===== */
function initLogGrid() {
    logGrid = new tui.Grid({
        el: document.getElementById('log_grid'),
        scrollX: true,
        scrollY: false,
        columns: [
            { name: 'createdAt', header: '일시', sortable: true, align: 'center', width: 150 },
            { name: 'terminalId', header: '터미널ID', sortable: true, align: 'center', width: 100 },
            { name: 'terminalName', header: '터미널명', sortable: true, align: 'center', width: 140 },
            { name: 'actionType', header: '액션', sortable: true, align: 'center', width: 140 },
            { name: 'command', header: '명령', align: 'left', width: 280 },
            { name: 'commandResult', header: '결과', align: 'left', width: 200,
                formatter: ({ value }) => value ? escapeHtml(String(value)).substring(0, 100) : '-'
            },
            {
                name: 'status', header: '상태', sortable: true, align: 'center', width: 90,
                formatter: ({ value }) => logStatusBadge(value)
            },
            { name: 'executedBy', header: '실행자', sortable: true, align: 'center', width: 100 }
        ],
        columnOptions: { resizable: true, minWidth: 60 }
    });

    logPagination = new tui.Pagination(document.getElementById('log_pagination'), {
        totalItems: 0,
        itemsPerPage: LOG_PAGE_SIZE,
        visiblePages: 5,
        centerAlign: true
    });

    logPagination.on('afterMove', (ev) => {
        loadMaintenanceLogs(ev.page - 1);
    });
}

function setDefaultLogDates() {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    $('#log_startDate').val(formatDate(weekAgo));
    $('#log_endDate').val(formatDate(today));
}

function loadMaintenanceLogs(page) {
    const params = {
        terminalId: $('#log_terminalId').val(),
        actionType: $('#log_actionType').val(),
        startDate: $('#log_startDate').val(),
        endDate: $('#log_endDate').val(),
        page: page,
        size: LOG_PAGE_SIZE
    };

    $.ajax({
        url: '/api/device/maintenance-logs?' + $.param(params),
        method: 'GET',
        dataType: 'json',
        success: function (res) {
            logGrid.resetData(res.data || []);
            $('#log_count').text(res.totalCount || 0);
            logPagination.setTotalItems(res.totalCount || 0);
        },
        error: function (xhr, status, error) {
            console.error('maintenance logs load error:', error);
        }
    });
}

/* ===== 유틸 함수 ===== */
function statusBadge(value) {
    if (!value) return '<span class="badge badge-unknown">-</span>';
    if (value === 'active') return '<span class="badge badge-active">active</span>';
    if (value === 'inactive') return '<span class="badge badge-inactive">inactive</span>';
    return '<span class="badge badge-unknown">' + escapeHtml(value) + '</span>';
}

function stompBadge(value) {
    if (value === 'true' || value === true) return '<span class="badge badge-active">ON</span>';
    if (value === 'false' || value === false) return '<span class="badge badge-inactive">OFF</span>';
    return '<span class="badge badge-unknown">-</span>';
}

function logStatusBadge(value) {
    if (!value) return '-';
    const cls = {
        'PENDING': 'badge-pending',
        'SUCCESS': 'badge-success',
        'FAILED': 'badge-failed',
        'TIMEOUT': 'badge-timeout'
    }[value] || 'badge-unknown';
    return '<span class="badge ' + cls + '">' + escapeHtml(value) + '</span>';
}

function formatUptime(seconds) {
    if (seconds == null || seconds === '') return '-';
    const s = parseInt(seconds, 10);
    if (isNaN(s)) return '-';
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return d + 'd ' + h + 'h';
    if (h > 0) return h + 'h ' + m + 'm';
    return m + 'm';
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
