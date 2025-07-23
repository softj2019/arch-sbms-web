/* 전역변수 */
let grid1;           // 그리드
let pagination1;     // 페이지네이션
let selectedUserId;  // 선택된 user ID
let userList = [];   // 선택된 userId List

/* 페이지 온로드 */
$(document).ready(function(){
    getUserList();
    initializeGrid();
    initDatePicker();
    $('#datepicker-input1').val(''); // 시작일자는 빈값으로 초기화

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
        rowHeaders   : ['checkbox'],
        columns      : [
            { name: "no"        , header: "NO"			, sortable: true, align: 'center' , width: 80},
            { name: "userId"    , header: "아이디"		, sortable: true, align: 'center' },
            { name: "userNm"    , header: "이름"			, sortable: true, align: 'center' },
            { name: "userEmail" , header: "EMAIL"		, sortable: true, align: 'center' },
            { name: "userTelno" , header: "휴대전화번호"	, sortable: true, align: 'center' },
            { name: "roleName"  , header: "권한그룹"		, sortable: true, align: 'center' },
            { name: "useYn"     , header: "상태"			, sortable: true, align: 'center' },
            { name: "createdAt" , header: "등록일"		, sortable: true, align: 'center' },
        ],
        columnOptions   : {
            resizable   : true,
            minWidth    : 80,
        },
    });

    tuiGridApplyTheme();

    // 이벤트 핸들러 설정
    grid1.on('click'      , handleGridClick);       // 해당 row 의 checkBox control
    grid1.on('dblclick'   , handleGridDoubleClick); // 해당 row 의 detail View open
    grid1.on('check'      , handleCheck);           // 체크박스 클릭
    grid1.on('uncheck'    , handleUncheck);         // 체크박스 해제
    grid1.on('checkAll'   , handleCheckAll);        // 전체선택
    grid1.on('uncheckAll' , handleUncheckAll);      // 전체해제
}

// row data 클릭으로 userId 처리 (클릭)
function handleGridClick(e) {
    if (e.columnName === '_checked') return; // 체크박스 열 제외

    const isChecked = grid1.getCheckedRowKeys().includes(e.rowKey);

    if (!isChecked) {
        grid1.check(e.rowKey); // 체크박스를 체크
    } else {
        grid1.uncheck(e.rowKey); // 체크박스를 해제
    }
}

// 상세보기 팝업 오픈 (더블클릭)
function handleGridDoubleClick(e) {
    resetSelection();
    if (e.columnName === '_checked') return; // 체크박스 열 제외

    const row = grid1.getRow(e.rowKey);

    $('#no'            ).text(row.no);
    $('#userId'        ).text(row.userId);
    $('#d_i_userNm'    ).val(row.userNm).css('text-align', 'center');
    $('#d_i_userEmail' ).val(row.userEmail).css('text-align', 'center');
    $('#d_i_userTelno' ).val(row.userTelno).css('text-align', 'center');
    $('#createdAt'     ).text(row.createdAt);

    // 권한그룹 값 설정
    $('#d_i_roleNm').val(
        row.roleName === "일반사용자" ? "1" : "2"
    ).css('text-align', 'center');

    // 상태 값 설정
    $('#d_i_useYn').val(
        row.useYn === "Y" ? "Y" : "N"
    ).css('text-align', 'center');

    // 선택된 user ID 전역변수에 할당
    selectedUserId = row.userId;

    const target = $('#popup_frame');
    target.toggleClass('on');

    return false;
}

// 체크박스 체크
function handleCheck(e) {
    const row    = grid1.getRow(e.rowKey);
    const userId = row.userId;

    if (!userList.includes(userId)) {
        // userList에 추가
        userList.push(userId);
    }
}

// 체크박스 해제
function handleUncheck(e) {
    const row    = grid1.getRow(e.rowKey);
    const userId = row.userId;

    userList = userList.filter(id => id !== userId); // userList에서 제거
}

// 전체 선택 이벤트 핸들러
function handleCheckAll() {
    const rows = grid1.getData();

    rows.forEach(row => {
        if (!userList.includes(row.userId)) {
            // userList에 추가
            userList.push(row.userId);
        }
    });
}

// 전체 해제 이벤트 핸들러
function handleUncheckAll() {
    const rows = grid1.getData();
    rows.forEach(row => {
        // userList에서 제거
        userList = userList.filter(id => id !== row.userId);
    });
}

// 검색조건 엔터키 감지
$('#i_userId, #i_userNm, #i_userEmail').on('keydown', function (event) {
    if (event.key === 'Enter') {
        getUserList();
    }
});

// esc 버튼과 닫기버튼으로 팝업닫기
$(document).on('click keydown', function(event) {
    if (
        (event.type === "keydown" && (event.key === "Escape" || event.keyCode === 27))
    ) {
        $('.popup_frame.on').removeClass('on');
    }
});

/* 사용자 조회 */
let isLoading = false;
function getUserList(page = 0){
    if (isLoading) return; // 중복 실행 방지
    isLoading = true;

    let i_userId    = $('#i_userId'         ).val().trim();
    let i_userNm    = $('#i_userNm'         ).val().trim();
    let i_userEmail = $('#i_userEmail'      ).val().trim();
    let i_s_date    = $('#datepicker-input1').val().trim();
    let i_e_date    = $('#datepicker-input2').val().trim();

    // 조회건수
    const size = $('#itemsPerPage').val() || 10;

    showLoadingSpinner()
    isDuplicateId = false; // 전역변수 초기화

    // 검색 조건(default = '')
    const i_data = {
        userId    : i_userId,
        userNm    : i_userNm,
        userEmail : i_userEmail,
        startDate : i_s_date,
        endDate   : i_e_date
    }
    const qryString = $.param(i_data);
    $.ajax({
        url     : `/api/system/user/list?page=${page}&size=${size}&${qryString}`,
        method  : 'GET',

        success: function(response){
            const gridData = response.content.map((user, index) => ({
                no        : index + 1 + page * size,
                userId    : user.userId,
                userNm    : user.userNm,
                userEmail : user.userEmail,
                userTelno : user.userTelno,
                roleName  : user.roleName === "USER"
                                          ? "일반사용자"
                                          : "관리자",
                useYn     : user.useYn,
                createdAt : user.createdAt,
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

/* 사용자 중복확인 */
let isDuplicateId = false;
function checkDuplicate() {
    const loginId = $('#userId').val();

    // 중복확인 되어있다면 코드실행중단
    if (isDuplicateId) return;

    if (!loginId) {
        popupOpenDialog('error', "아이디 는 필수 입력항목입니다.", 2000);
        return;
    }

    const data = { userId: loginId };

    $.ajax({
        url         : '/api/system/user/isDuplicatedId',
        method      : 'POST',
        data        : JSON.stringify(data),
        contentType : 'application/json; charset=utf-8',
        dataType    : 'json',

        success: function (response) {
            if (response) {
                popupOpenDialog('error', "이미 사용중인 아이디입니다.", 2000);
                isDuplicateId = false;
                $('#duplicateCheckBtn')
                    .removeClass('btn_gray')
                    .addClass('btn_red_clr')
                    .prop('disabled', false);
            } else {
                popupOpenDialog('info', "사용 가능한 아이디입니다.", 2000);
                isDuplicateId = true;
                $('#duplicateCheckBtn')
                    .removeClass('btn_red_clr')
                    .addClass('btn_gray')
                    .prop('disabled', true);
            }
        },
        error: function (xhr, status, error) {
            popupOpenDialog('error', "중복확인 도중 에러 발생"+error, 2000);
            isDuplicateId = false;
        }
    });
}

/* 휴대폰번호 유효성 강제 */
$('#userTelno, #d_i_userTelno').on('input', function () {
    let phoneNumber = $(this).val().replace(/[^0-9]/g, ""); // 숫자만 입력 가능하도록 변환

    if (phoneNumber.length > 3 && phoneNumber.length <= 7) {
        phoneNumber = phoneNumber.replace(/(\d{3})(\d+)/, "$1-$2");
    } else if (phoneNumber.length > 7) {
        phoneNumber = phoneNumber.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    }

    $(this).val(phoneNumber);
});


/* 아이디 입력값 변경 감지 */
$('#userId').on('input', function () {
    isDuplicateId = false;
    $('#duplicateCheckBtn')
        .removeClass('btn_gray')
        .addClass('btn_red_clr')
        .prop('disabled', false);
});

// 유효성 검사
function validateForm(formId) {
    let isValid = true; // 폼 유효성 상태

    // 폼 내 모든 `input`, `select` 요소를 순회
    $(`#${formId} input, #${formId} select`).each(function () {
        const $input = $(this);                         // 현재 요소
        const value  = $input.val();                    // 입력값
        const id     = $input.attr("id");               // 요소의 ID
        const $th    = $input.closest("tr").find("th"); // 연관된 <th> 요소
        const thText = $th.text().trim();               // <th> 텍스트 내용

        // 비밀번호 관련 처리 (사용자 수정 전용)
        if (formId === "updateUser" && (id === "u_password" || id === "u_password2")) {
            const nPassword  = $('#u_password').val()  ? $('#u_password' ).val().trim() : "";
            const nPassword2 = $('#u_password2').val() ? $('#u_password2').val().trim() : "";

            // 두 비밀번호 입력값이 없으면 pass
            if (!nPassword && !nPassword2) {
                return;
            }
        }

        // 입력값이 비어 있는 경우
        if (!value || $input.is("select") && $input.prop("selectedIndex") === 0 && value === "") {
            popupOpenDialog('error', `${thText} ${commonValid}`, 2000); // 에러 메시지 출력
            $input.focus();  // 포커스 이동
            isValid = false; // 유효하지 않음
            return false;    // 반복문 종료
        }
    });

    if (!isDuplicateId) {
        popupOpenDialog('error', "아이디 중복확인 필수 항목입니다.", 2000);
        return;
    }

    return isValid; // 유효성 상태 반환
}

/* 사용자 등록 */
function createUser(){
    const userPassword      = $('#userPassword'     ).val(); // 비밀번호
    const userPasswordCheck = $('#userPasswordCheck').val(); // 비밀번호(확인)

    if(!validateForm('createUser')){
        return;
    }
    // 비밀번호 확인 로직
    if (userPassword !== userPasswordCheck) {
        popupOpenDialog('error', '비밀번호와 비밀번호(확인)이 일치하지 않습니다.', 2000);
        $('#userPasswordCheck').focus(); // 비밀번호 확인 필드로 포커스 이동
        return;
    }

    // 등록 데이터 생성
    const data = {
        userNm       : $('#userNm'   ).val(),
        userId       : $('#userId'   ).val(),
        userEmail    : $('#userEmail').val(),
        userPassword : userPassword,
        userRole     : $('#roleId'   ).val(),
        userTelno    : $('#userTelno').val()
    };
    $.ajax({
        url          : '/api/system/user/create',
        method       : 'POST',
        data         : JSON.stringify(data),
        contentType  : 'application/json; charset=utf-8',
        dataType     : 'json',
        success: function (result) {
            if (result.status==="success"){
                popupOpenDialog('info', result.message, 2000);
                getUserList();
                clearFormInputs('createUser')
                $('#regist_popup_frame').removeClass("on");
            } else {
                popupOpenDialog('error', result.message, 2000);
            }
        },
        error: function (xhr, status, error) {
            popupOpenDialog('error', "사용자 등록에 실패하였습니다.", 2000);
        }
    });
}

/* 입력값 초기화 */
function clearContents(){
    isDuplicateId = false;

    // 회원수정
    $('#d_i_userNm'   ).val('');
    $('#u_password'   ).val('');
    $('#u_password2'  ).val('');
    $('#d_i_userEmail').val('');
    $('#d_i_userTelno').val('');
    $('#d_i_roleNm'   ).val('');
    $('#d_i_useYn'    ).val('');

    // 회원등록
    $('#userNm'           ).val('');
    $('#userId'           ).val('');
    $('#userEmail'        ).val('');
    $('#userPassword'     ).val('');
    $('#userPasswordCheck').val('');
    $('#roleId'           ).val('');
    $('#userTelno'        ).val('');

    // 검색조건
    initDatePicker();
    $('#datepicker-input1').val('');
    $('#i_userId'         ).val('');
    $('#i_userNm'         ).val('');
    $('#i_userEmail'      ).val('');
}

/* 사용자 수정 */
function updateUser() {
    showConfirmModal(
        "정말로 수정하시겠습니까?",
        function () {
            updateUsers();
        }
    )
}
function updateUsers() {
    let u_userId    = selectedUserId;
    let u_userNm    = $('#d_i_userNm'   ).val().trim();
    let u_userPw    = $('#u_password'   ).val().trim();
    let u_userPw2   = $('#u_password2'  ).val().trim();
    let u_userEmail = $('#d_i_userEmail').val().trim();
    let u_userTelno = $('#d_i_userTelno').val().trim();
    let u_userRole  = $('#d_i_roleNm'   ).val().trim();
    let u_useYn     = $('#d_i_useYn'    ).val().trim();

    isDuplicateId = true;

    if (u_userPw !== u_userPw2) {
        popupOpenDialog('error', '비밀번호와 비밀번호(확인)이 일치하지 않습니다.', 2000);
        $('#u_password2').focus(); // 비밀번호 확인 필드로 포커스 이동
        return;
    }

    if(!validateForm('updateUser')){
        return;
    }

    const udtData = {
        userId       : u_userId,
        userNm       : u_userNm,
        userPassword : u_userPw,
        userEmail    : u_userEmail,
        userTelno    : u_userTelno,
        userRole     : u_userRole,
        useYn        : u_useYn
    }

    showLoadingSpinner();

    $.ajax ({
        url         : '/api/system/user/updateUser',
        method      : 'PUT',
        contentType : 'application/json; charset=utf-8',
        data        : JSON.stringify(udtData),
        dataType    : 'json',

        success : function(response){
            if (response.status === 'success'){
                // 비밀번호 입력란 초기화
                $('#u_password' ).val('');
                $('#u_password2').val('');

                popupOpenDialog('info', response.message, 2000)
                getUserList();
                $('#popup_frame').removeClass('on');
            } else {
                popupOpenDialog('error', response.message, 2000)
            }

            hideLoadingSpinner();
        },
        error : function(){
            popupOpenDialog('error', "사용자 수정에 실패하였습니다.", 2000)
            hideLoadingSpinner();
        }
    });
}

/* 사용자 삭제 */
function deleteUser() {
    showConfirmModal(
        "정말로 삭제하시겠습니까?",
        function () {
            deleteUsers();
        }
    )
}

function deleteUsers(){
    // selectedUserId 값 포함여부 체크
    if (selectedUserId != null && !userList.includes(selectedUserId) && userList.length === 0) {
        userList.push(selectedUserId);
    }

    if (!userList.length || userList.every(id => id == null)) {
        popupOpenDialog('error', "삭제하실 사용자를 체크해주세요.", 2000);
        return;
    }

    const data = { userIdList: userList };

    showLoadingSpinner();

    $.ajax ({
        url         : '/api/system/user/deleteUser',
        method      : 'DELETE',
        contentType : 'application/json; charset=utf-8',
        data        : JSON.stringify(data),
        dataType    : 'json',

        success : function(response){
            if (response.status === 'success'){
                popupOpenDialog('info', response.message, 2000);
                getUserList();
                hideLoadingSpinner()
                $('#popup_frame').removeClass('on');
            } else {
                popupOpenDialog('error', response.message, 2000);
                hideLoadingSpinner()
            }
        },
        error : function(){
            popupOpenDialog('error', "사용자 삭제에 실패하였습니다.", 2000);
            hideLoadingSpinner()
        }
    });
}