let grid1;

$(document).ready(function () {
    initializeGrid();
    getVisitStats();
});

/* 그리드 초기화 */
function initializeGrid() {
    const gridElement = document.getElementById("grid_table");
    if (!gridElement) {
        return;
    }

    grid1 = new tui.Grid({
        el: gridElement,
        scrollX: false,
        scrollY: false,
        minBodyHeight: 100,
        columns: [
            { name: "period", header: "구분", align: "center" },
            { name: "count", header: "접속자 수", align: "center" }
        ],
        columnOptions: {
            resizable: true,
            minWidth: 100,
        }
    });

    tuiGridApplyTheme();
}

/* 방문자 통계 조회 */
function getVisitStats() {
    $.ajax({
        url: "/api/system/user/visit-stats",
        method: "GET",
        xhrFields: { withCredentials: true },

        success: function (data) {
            if (!data) return;

            const gridData = [
                { period: "오늘", count: data.today ?? 0 },
                { period: "이번 주", count: data.week ?? 0 },
                { period: "이번 달", count: data.month ?? 0 }
            ];

            grid1.resetData(gridData);
        },
        error: function () {
            popupOpenDialog('error', "접속 통계 조회에 실패하였습니다.", 2000);
        }
    });
}
