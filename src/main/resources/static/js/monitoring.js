let grid1;
let stationList = [];

$(document).ready(function () {
    getStationName();
});

document.addEventListener('DOMContentLoaded', () => {
    const socket = new SockJS('/sockjs-websocket');
    const stompClient = Stomp.over(socket);
    window.stompClient = stompClient;
    stompClient.debug = null;

    grid1 = new tui.Grid({
        el: document.getElementById("grid_tale"),
        scrollX: true,
        scrollY: false,
        columns: [
            { name: "terminal_id", header: "Terminal ID", sortable: true, align: 'center' },
            { name: "terminal_nm", header: "Terminal Name", sortable: true, align: 'center' },
            {
                name: "rfc_cpu",
                header: "CPU",
                sortable: true,
                align: 'center',
                formatter: ({ row }) => row.rfc_cpu ?? "-"
            },
            {
                name: "cpu_temperature",
                header: "CPU Temp",
                sortable: true,
                align: 'center',
                formatter: ({ row }) => row.cpu_temperature ?? "-"
            },
            {
                name: "memory",
                header: "Memory",
                sortable: true,
                align: 'center',
                formatter: ({ row }) => row.memory ?? "-"
            },
            {
                name: "storage",
                header: "Storage",
                sortable: true,
                align: 'center',
                formatter: ({ row }) => row.storage ?? "-"
            },
            {
                name: "ipaddress",
                header: "IP",
                sortable: true,
                align: 'center',
                formatter: ({ row }) => {
                    if (!row.ipaddress) {
                        return "-";
                    }

                    return `<span class="clickable-ip" data-ip="${row.ipaddress}" style="color:blue; text-decoration:underline; cursor:pointer;">${row.ipaddress}</span>`;
                }
            },
            {
                name: "network_retry_count",
                header: "Retry Count",
                sortable: true,
                align: 'center',
                hidden: true,
                formatter: ({ row }) => row.network_retry_count ?? "-"
            },
            {
                name: "network_outage_started_at",
                header: "Outage Started",
                sortable: true,
                align: 'center',
                hidden: true,
                formatter: ({ row }) => row.network_outage_started_at ?? "-"
            },
            {
                name: "network_last_recovered_at",
                header: "Last Recovered",
                sortable: true,
                align: 'center',
                formatter: ({ row }) => row.network_last_recovered_at ?? "-"
            },
            {
                name: "network_last_reboot_requested_at",
                header: "Last Reboot Req",
                sortable: true,
                align: 'center',
                hidden: true,
                formatter: ({ row }) => row.network_last_reboot_requested_at ?? "-"
            },
            {
                name: "network_failure_reason",
                header: "Failure Reason",
                sortable: true,
                align: 'center',
                hidden: true,
                formatter: ({ row }) => row.network_failure_reason ?? "-"
            },
            {
                name: "recent_network_events",
                header: "Recent Events",
                sortable: false,
                align: 'left',
                hidden: true,
                formatter: ({ row }) => row.recent_network_events ?? "-"
            }
        ],
        columnOptions: {
            resizable: true,
            minWidth: 80
        }
    });

    [
        "network_retry_count",
        "network_outage_started_at",
        "network_last_reboot_requested_at",
        "network_failure_reason",
        "recent_network_events"
    ].forEach((columnName) => {
        grid1.hideColumn(columnName);
    });

    grid1.on("click", (ev) => {
        const { columnName, rowKey, targetType } = ev;
        if (targetType !== 'cell' || rowKey === null || rowKey === undefined) {
            return;
        }

        if (columnName !== "ipaddress") {
            const rowData = grid1.getRow(rowKey);
            if (rowData) {
                openNetworkDetailPopup(rowData);
            }
            return;
        }

        const rowData = grid1.getRow(rowKey);
        if (rowData && rowData.ipaddress) {
            loginAndRedirect(rowData.ipaddress);
        }
    });

    stompClient.connect({}, () => {
        stompClient.subscribe('/topic/dashboard', (message) => {
            try {
                let receivedData = JSON.parse(message.body);
                if (!Array.isArray(receivedData)) {
                    receivedData = [receivedData];
                }

                receivedData.forEach((newRow) => {
                    const rowIndex = getRowIndexByTerminalId(String(newRow.terminal_id));
                    if (rowIndex === -1) {
                        return;
                    }

                    grid1.setValue(rowIndex, "rfc_cpu", newRow.rfc_cpu ?? "-");
                    grid1.setValue(rowIndex, "cpu_temperature", newRow.cpu_temperature ?? "-");
                    grid1.setValue(
                        rowIndex,
                        "memory",
                        `${newRow.rfc_memory_total ?? "-"} / ${newRow.rfc_memory_used ?? "-"} / ${newRow.rfc_memory_available ?? "-"}`
                    );
                    grid1.setValue(
                        rowIndex,
                        "storage",
                        `${newRow.rfc_storage_total ?? "-"} / ${newRow.rfc_storage_used ?? "-"} / ${newRow.rfc_storage_available ?? "-"}`
                    );
                    grid1.setValue(rowIndex, "ipaddress", newRow.ipaddress ?? "-");
                    grid1.setValue(rowIndex, "network_retry_count", newRow.network_retry_count ?? "-");
                    grid1.setValue(rowIndex, "network_outage_started_at", newRow.network_outage_started_at ?? "-");
                    grid1.setValue(rowIndex, "network_last_recovered_at", newRow.network_last_recovered_at ?? "-");
                    grid1.setValue(rowIndex, "network_last_reboot_requested_at", newRow.network_last_reboot_requested_at ?? "-");
                    grid1.setValue(rowIndex, "network_failure_reason", newRow.network_failure_reason ?? "-");
                    grid1.setValue(rowIndex, "recent_network_events", formatRecentNetworkEvents(newRow.network_event_logs));
                });
            } catch (error) {
                console.error('Invalid JSON format or unexpected data structure:', error);
            }
        });
    });

    $(document).on('click', '#network_detail_popup .btn_close', function () {
        closeNetworkDetailPopup();
    });

    $(document).on('click', '#network_detail_popup', function (event) {
        if (!$(event.target).closest('.popup_wrap').length) {
            closeNetworkDetailPopup();
        }
    });

    $(document).on('keydown', function (event) {
        if (event.key === 'Escape' && $('#network_detail_popup').hasClass('on')) {
            closeNetworkDetailPopup();
        }
    });
});

function loginAndRedirect(wanip) {
    let loginUrl;
    let dashboardUrl;

    if (wanip === "192.168.10.254") {
        loginUrl = `http://${wanip}/status_wanlink.asp`;
        dashboardUrl = `http://${wanip}/`;
    } else {
        loginUrl = `http://${wanip}:8080/status_wanlink.asp`;
        dashboardUrl = `http://${wanip}:8080/`;
    }

    const newWindow = window.open(loginUrl, "_blank");
    setTimeout(() => {
        newWindow.location.href = dashboardUrl;
    }, 2000);
}

function clearContents() {
    $('#s_terminalId').val('');
    $('#s_terminalNm').val('');
}

$('#s_terminalId, #s_terminalNm').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getStationName();
    }
});

let isLoading = false;
function getStationName() {
    if (isLoading) {
        return;
    }
    isLoading = true;

    const dataList = {
        terminalId: $('#s_terminalId').val(),
        terminalNm: $('#s_terminalNm').val()
    };
    const qryString = $.param(dataList);

    showLoadingSpinner();
    $.ajax({
        url: `/api/monitoring/list?${qryString}`,
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            if (!Array.isArray(response)) {
                return;
            }

            stationList = response.map(station => ({
                terminal_id: String(station.terminal_id ?? station.terminalId),
                terminal_nm: station.terminal_name ?? station.terminalName,
                network_retry_count: station.network_retry_count ?? station.networkRetryCount ?? "-",
                network_outage_started_at: station.network_outage_started_at ?? station.networkOutageStartedAt ?? "-",
                network_last_recovered_at: station.network_last_recovered_at ?? station.networkLastRecoveredAt ?? "-",
                network_last_reboot_requested_at: station.network_last_reboot_requested_at ?? station.networkLastRebootRequestedAt ?? "-",
                network_failure_reason: station.network_failure_reason ?? station.networkFailureReason ?? "-",
                recent_network_events: formatRecentNetworkEvents(station.network_event_logs ?? station.networkEventLogs)
            }));

            grid1.resetData(stationList);
            $('.sub_script .num').text(stationList.length);
        },
        error: function (xhr, status, error) {
            popupOpenDialog('error', 'System monitoring query failed: ' + error, 2000);
            hideLoadingSpinner();
        },
        complete: function () {
            isLoading = false;
            hideLoadingSpinner();
        }
    });
}

function getRowIndexByTerminalId(terminalId) {
    const data = grid1.getData();
    return data.findIndex(row => row.terminal_id === terminalId);
}

function openNetworkDetailPopup(rowData) {
    $('#network_popup_title').text(`네트워크 상세 정보 - ${rowData.terminal_nm} (${rowData.terminal_id})`);
    $('#network_popup_terminal_id').text(rowData.terminal_id ?? "-");
    $('#network_popup_terminal_name').text(rowData.terminal_nm ?? "-");
    $('#network_popup_retry_count').text(rowData.network_retry_count ?? "-");
    $('#network_popup_outage_started_at').text(rowData.network_outage_started_at ?? "-");
    $('#network_popup_last_recovered_at').text(rowData.network_last_recovered_at ?? "-");
    $('#network_popup_last_reboot_requested_at').text(rowData.network_last_reboot_requested_at ?? "-");
    $('#network_popup_failure_reason').text(rowData.network_failure_reason ?? "-");
    renderNetworkPopupEvents([]);
    $('#network_detail_popup').addClass('on');

    $.ajax({
        url: `/api/monitoring/network/${encodeURIComponent(rowData.terminal_id)}/events`,
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            if (Array.isArray(response)) {
                renderNetworkPopupEvents(response);
            } else {
                renderNetworkPopupEvents([]);
            }
        },
        error: function () {
            renderNetworkPopupEvents([]);
        }
    });
}

function closeNetworkDetailPopup() {
    $('#network_detail_popup').removeClass('on');
}

function renderNetworkPopupEvents(events) {
    const $rows = $('#network_popup_event_rows');
    $rows.empty();

    if (!Array.isArray(events) || !events.length) {
        $rows.append('<tr><td colspan="7">네트워크 장애 이력이 없습니다.</td></tr>');
        return;
    }

    events.forEach((event) => {
        const occurredAt = event.occurredAtIso ?? event.occurred_at_iso ?? "-";
        const startedAt = event.failureStartedAtIso ?? event.failure_started_at_iso ?? event.failureStartedAt ?? event.failure_started_at ?? "-";
        const recoveredAt = event.recoveredAtIso ?? event.recovered_at_iso ?? event.recoveredAt ?? event.recovered_at ?? "-";
        const reason = event.failureReason ?? event.failure_reason ?? "-";
        const retryCount = event.retryCount ?? event.retry_count ?? "-";
        const durationSec = event.durationSec ?? event.duration_sec ?? "-";
        const outboundOk = event.outboundOk ?? event.outbound_ok;
        const outboundText = outboundOk === true ? "정상" : outboundOk === false ? "실패" : "-";

        $rows.append(`
            <tr>
                <td>${escapeHtml(occurredAt)}</td>
                <td>${escapeHtml(startedAt)}</td>
                <td>${escapeHtml(recoveredAt)}</td>
                <td>${escapeHtml(reason)}</td>
                <td>${escapeHtml(String(retryCount))}</td>
                <td>${escapeHtml(String(durationSec))}</td>
                <td>${escapeHtml(outboundText)}</td>
            </tr>
        `);
    });
}

function formatRecentNetworkEvents(eventLogs) {
    if (!eventLogs) {
        return "-";
    }

    let parsedEvents = eventLogs;
    if (typeof eventLogs === 'string') {
        try {
            parsedEvents = JSON.parse(eventLogs);
        } catch (error) {
            return eventLogs || "-";
        }
    }

    if (!Array.isArray(parsedEvents)) {
        parsedEvents = [parsedEvents];
    }

    if (!parsedEvents.length) {
        return "-";
    }

    return parsedEvents.slice(0, 5).map((event) => {
        const startedAt = event.failure_started_at_iso ?? event.failureStartedAtIso ?? event.occurred_at_iso ?? event.occurredAtIso ?? "-";
        const recoveredAt = event.recovered_at_iso ?? event.recoveredAtIso ?? "-";
        const reason = event.failure_reason ?? event.failureReason ?? "-";
        const retryCount = event.retry_count ?? event.retryCount ?? "-";
        return `${startedAt} / ${recoveredAt} / ${reason} / retry ${retryCount}`;
    }).join('<br>');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
