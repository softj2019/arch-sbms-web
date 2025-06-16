/* 전역변수 */
let grid1;           // 그리드
let pagination1;     // 페이지네이션
let selectedUserId;  // 선택된 user ID
let userList = [];   // 선택된 userId List

/* 페이지 온로드 */
$(document).ready(function(){
    getUserList();
    initializeGrid();

    // 조회건수 이벤트
    $('#itemsPerPage').on('change', function () {
        getUserList(0);
    });
});

/* 전역변수 초기화 */
function resetSelection(){
    selectedUserId = null;
    userList = [];
}

/* 그리드 */
function initializeGrid() {
    const gridElement = document.getElementById("grid_tale");
    if (!gridElement) {
        return;
    }

    grid1 = new tui.Grid({
        el           : gridElement,
        scrollX      : true,
        scrollY      : false,
        minBodyHeight: 50,
        columns      : [
            { name: "createdAt" , header: "접속 시간"		, sortable: true, align: 'center' },
            { name: "roleName"  , header: "권한그룹"		, sortable: true, align: 'center' },
            { name: "action"     , header: "접속 이력"     , sortable: true, align: 'center' },
            { name: "userNm"  , header: "이름"			, sortable: true, align: 'center' },
            { name: "userId"    , header: "접속 아이디"	, sortable: true, align: 'center' },
            { name: "clientIp"  , header: "접속 IP"		, sortable: true, align: 'center' },
        ],
        columnOptions   : {
            resizable   : true,
            minWidth    : 80,
        },
    });

    tuiGridApplyTheme();
}

// 검색조건 엔터키 감지
$('#userId, #userNm').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getUserList();
    }
});

/* 사용자 조회 */
let isLoading = false;
function getUserList(page = 0){
    if (isLoading) return; // 중복 실행 방지
    isLoading = true;

    let i_userId    = $('#userId').val() ? $('#userId').val().trim() : '';
    let i_userNm    = $('#userNm').val() ? $('#userNm').val().trim() : '';

    // 조회건수
    const size = $('#itemsPerPage').val() || 10;

    showLoadingSpinner()
    isDuplicateId = false; // 전역변수 초기화

    // 검색 조건(default = '')
    const i_data = {
        userId    : i_userId,
        userNm    : i_userNm,
    }
    const qryString = $.param(i_data);
    $.ajax({
        url     : `/api/system/user/login-history?page=${page}&size=${size}&userId=${i_userId}&userNm=${i_userNm}`,
        method  : 'GET',
        xhrFields: {
            withCredentials: true  // 쿠키 자동 포함
        },

        success: function(response){
            if (!response.content) {
                return;
            }
            const gridData = response.content.map((item, index) => ({
                createdAt : item.createdAt,
                roleName  : item.roleName === "USER"
                    ? "일반사용자"
                    : "관리자",
                userNm    : item.userNm,
                userId    : item.userId,
                clientIp  : item.clientIp,
                action    : item.action
            }));

            // TOAST UI Grid 데이터 초기화
            grid1.resetData(gridData);

            // 페이지네이션 초기화
            initializePagination(response.totalElements, size, page);

            // 총 건수 업데이트
            $('.sub_script .num').text(response.totalElements);
        },
        error: function(xhr, status, error){
            popupOpenDialog('error', "사용자 목록 조회에 실패하였습니다.", 2000);
        },
        complete: function() {
            hideLoadingSpinner();
            resetSelection();
            isLoading = false; // 요청 완료 후 플래그 초기화
        }
    });
}

/* 페이지네이션 초기화 */
function initializePagination(totalItems, itemsPerPage, currentPage = 0) {
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
        getUserList(newPage);               // 새 페이지 데이터 요청
    });
}

/* 아이디 입력값 변경 감지 */
$('#userId').on('input', function () {
    isDuplicateId = false;
    $('#duplicateCheckBtn')
        .removeClass('btn_gray')
        .addClass('btn_red_clr')
        .prop('disabled', false);
});

