/* 전역변수 */
let grid1;  // 그리드

$(document).ready(function() {
    initializeGrid();
    getWifi();

    setInterval(getWifi, 600000); //

    const socket= new SockJS('/sockjs-websocket'); // Spring Boot WebSocket 엔드포인트
    const stompClient = Stomp.over(socket);

    // WebSocket 연결 및 STOMP 구독
    stompClient.connect({}, (frame) => {
        stompClient.subscribe('/topic/udp/data', (message) => {
            let receivedData;
            try {
                receivedData = JSON.parse(message.body);

                if (!Array.isArray(receivedData)) {
                    receivedData = [receivedData];
                }

                receivedData.forEach((newRow) => {
                    const rowIndex = getRowIndexByTerminalId(newRow.ctn);
                    if (rowIndex !== -1) {
                        // ✅ 기존 데이터 업데이트
                        grid1.setValue(rowIndex, "device_type", newRow.device_type ?? "-");
                        grid1.setValue(rowIndex, "ctn", newRow.ctn ?? "-");
                        grid1.setValue(rowIndex, "ip_address", newRow.ip_address ?? "-");
                        grid1.setValue(rowIndex, "imei", newRow.imei ?? "-");
                        grid1.setValue(rowIndex, "firmware_version", newRow.firmware_version ?? "-");
                        grid1.setValue(rowIndex, "lte_version", newRow.lte_version ?? "-");
                        grid1.setValue(rowIndex, "apn", newRow.apn ?? "-");
                        grid1.setValue(rowIndex, "lan_ip", newRow.lan_ip ?? "-");
                        grid1.setValue(rowIndex, "wifi_mac", newRow.wifi_mac ?? "-");
                        grid1.setValue(rowIndex, "wifi_enable", newRow.wifi_enable ?? "-");  // ✅ power 컬럼 적용
                    } else {
                        // ✅ 새로운 행 추가 (없는 데이터라면)
                        grid1.appendRow({
                            device_type: newRow.device_type ?? "-",
                            ctn: newRow.ctn ?? "-",
                            ip_address: newRow.ip_address ?? "-",
                            imei: newRow.imei ?? "-",
                            firmware_version: newRow.firmware_version ?? "-",
                            lte_version: newRow.lte_version ?? "-",
                            apn: newRow.apn ?? "-",
                            lan_ip: newRow.lan_ip ?? "-",
                            wifi_mac: newRow.wifi_mac ?? "-",
                            wifi_enable: newRow.wifi_enable ?? "-",
                        });
                    }
                });

            } catch (error) {
                console.error('Invalid JSON format or unexpected data structure:', error);
            }
        });
    });
});

function initializeGrid(){
    const gridElement = document.getElementById("grid_tale");
    if (!gridElement) {
        return;
    }

    grid1 = new tui.Grid({
        el      : gridElement,
        scrollX : true,
        scrollY : false,
        data :[],
        columns : [
            { name: "no"			,header: "NO"		, sortable: true, align: 'center', width: 80 },
            { name: "installLoc"	,header: "설치장소"	,sortable: true	,align: 'center' },
            { name: "ctn"			,header: "CTN"		,sortable: true	,align: 'center' ,hidden:true},
            { name: "ipAddr"		,header: "IP"		,sortable: true	,align: 'center' },
            // { name: "mac_address",	header: "mac_address"	,sortable: true	,align: 'center' },
            // { name: "firmware_version",	header: "firmware_version"	,sortable: true	,align: 'center' },
            // { name: "lte_version",	header: "lte_version"	,sortable: true	,align: 'center' },
            // { name: "apn",	header: "apn"	,sortable: true	,align: 'center' },
            // { name: "lan_ip",	header: "lan_ip"	,sortable: true	,align: 'center' },
            { name: "wifiMac",	header: "WiFi MAC"	,sortable: true	,align: 'center' },
            { name: "wifiEnable",	header: "작동여부"	,sortable: true	,align: 'center' },
        ],
        columnOptions : {
            resizable   : true,
            minWidth    : 80
        }
    });

    tuiGridApplyTheme();
}

function getRowIndexByTerminalId(ctn) {
    const data = grid1.getData();
    return data.findIndex(row => row.ctn === ctn);
}

//wifi 데이터 조회
function getWifi(){
    $.ajax({
        url     : '/api/wifi/list',
        method  : 'GET',

        success : function(response){
            const data = Array.isArray(response) ? response : [];

            if (data.length === 0) {
                popupOpenDialog('error', 'wifi 데이터 조회 실패', 2000);
                return;
            }

            const gridData = data.map((wifi, index) => ({
                no          : index + 1,
                installLoc  : wifi.installLoc ?? "-",
                ctn         : wifi.ctn ?? "-",
                ipAddr      : wifi.ipAddr ?? "-",
                wifiMac     : wifi.wifiMac ?? "-",
                wifiEnable  : wifi.wifiEnabled === "1" ? "ON"
                                                       : wifi.wifiEnabled === "0" ? "OFF"
                                                       : "-"
            }));

            grid1.resetData(gridData);
        },
        error : function(error){
            popupOpenDialog('error', 'wifi 데이터 조회 오류: '+error, 2000);
        }
    });
}