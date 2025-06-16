/* 전역변수 */
let grid1;  // 그리드
let pagination1; // 페이지네이션

/* 페이지 온로드 */
$(document).ready(function(){
    getHidList();
    initializeGrid();

    // 조회건수 이벤트
    $('#itemsPerPage').on('change', function () {
        getLogList(0);
    });

    // 모달 닫기 이벤트 추가
    $(".btn_close").on("click", function () {
        $("#imageModal").removeClass("on");
    });

    // 모달 배경 클릭 시 닫기
    $("#imageModal").on("click", function (event) {
        if (event.target === this) {
            $(this).removeClass("on");
        }
    });
});

// 검색조건 엔터키 감지
$('#s_terminalId, #s_deviceName, #s_userId').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getLogList();
    }
});

function initializeGrid() {
    const gridElement = document.getElementById("grid_tale");
    if (!gridElement) {
        return;
    }

    grid1 = new tui.Grid({
        el: document.getElementById("grid_tale"),
        scrollX: true,
        scrollY: false,
        minBodyHeight: 50,
        columns: [
            { name: "no"            , header: "NO", sortable: true, align: 'center', width: 20 },
            { name: "terminalId"    , header: "정류장 ID", sortable: true, align: 'center' },
            { name: "terminalNm"    , header: "정류장 명", sortable: true, align: 'center' },
            { name: "peopleCount"   , header: "재실인원", sortable: true, align: 'center' },
            {
                name: "fileName",
                header: "파일명",
                sortable: true,
                align: 'center',
                formatter: function({ row }) {
                    if (row.fileName) {
                        return `<a href="#" class="file-link" data-filename="${row.fileName}">${row.fileName}</a>`;
                    }
                    return "";
                }
            },
            { name: "timestamp"     , header: "등록일자", sortable: true, align: 'center' },
        ],
        columnOptions: {
            resizable: true,
            minWidth: 80
        }
    });

    grid1.on('click', function(ev) {
        const rowKey = ev.rowKey;
        const columnName = ev.columnName;

        if (columnName === 'fileName') {
            const fileName = grid1.getValue(rowKey, 'fileName');
            if (fileName) {
                getImg(fileName);
            }
        }
    });

    tuiGridApplyTheme();
}

/* 입력값 초기화 */
function clearContents(){
    $('#s_terminalId').val('');
    $('#s_terminalNm').val('');
}

// 검색조건 엔터키 감지
$('#s_terminalId, #s_terminalNm').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getHidList();
    }
});

/* HID 조회 */
let isLoading = false;
function getHidList(page = 0) {
    if (isLoading) return; // 중복 실행 방지
    isLoading = true;

    // 검색조건 존재시 변수 할당
    let s_terminalId = $('#s_terminalId').val().trim();
    let s_terminalNm = $('#s_terminalNm').val().trim();

    showLoadingSpinner();

    // 조회건수
    const size = $('#itemsPerPage').val() || 20;

    // 전달데이터
    const dataList = {
        terminalId : s_terminalId,
        terminalNm : s_terminalNm
    }
    const qryString = $.param(dataList);

    $.ajax({
        url : `/api/monitoring/hidList?page=${page}&size=${size}&${qryString}`,
        method : 'GET',

        success : function(response){
            console.log("API Response:", response);  // 응답 데이터 확인
            if (!response || !response.content || !Array.isArray(response.content)) {
                console.error("Invalid response structure:", response);
                popupOpenDialog('error', "서버 응답이 올바르지 않습니다.", 2000);
                hideLoadingSpinner();
                isLoading = false;
                return;
            }

            const totalElements = response.totalElements;
            const gridData = response.content.map((hids, index) => ({
                no              : totalElements - (page * size) - index,
                terminalId      : hids.terminalId,
                terminalNm      : hids.terminalNm,
                peopleCount     : hids.peopleCount,
                fileName        : hids.fileName,
                timestamp       : hids.timestamp
            }));

            // 초기화작업
            grid1.resetData(gridData);
            initializePagination(response.totalElements, size, page);
            $('.sub_script .num').text(response.totalElements);

            hideLoadingSpinner();
        },
        error : function (xhr, status, error){
            popupOpenDialog('error', "HID 조회 실패" + error, 2000);
            hideLoadingSpinner();
        },
        complete : function (){
            hideLoadingSpinner();
            isLoading = false;
        }
    });
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
        getHidList(newPage);           // 새 페이지 데이터 요청
    });
}

/* 이미지 불러오기 */
function getImg(filename) {
    showLoadingSpinner();
    $.ajax({
        url: "/api/upload/image/getImg",
        method: "GET",
        data: { filename: filename },
        xhrFields: {
            responseType: 'blob'
        },
        success: function (blob) {
            const imgUrl = URL.createObjectURL(blob);
            $("#modalImage").attr("src", imgUrl);
            $("#imageModal").addClass("on");
        },
        error: function () {
            popupOpenDialog('error', '이미지 조회 실패', 2000);
        }
        , complete: function () {
            hideLoadingSpinner();
        }
    });
}
