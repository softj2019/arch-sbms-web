$(document).ready(function () {
    // 로그인 버튼 클릭이벤트
    $(".login_btn").on("click", function (event) {
        event.preventDefault(); // 기본 a 태그 동작 방지
        login();
    });

    // 로그인 엔터키 감지
    $('#userId, #password').on('keydown', function (event) {
        if (event.key === 'Enter') {
            login();
        }
    });
});

/* 로그인 */
function login(){
    const userId = $("#userId").val();
    const password = $("#password").val();

    if (!userId || !password) {
        popupOpenDialog('error','아이디와 비밀번호를 모두 입력해주세요',2000)
        return;
    }
    showLoadingSpinner()
    // 로그인 요청
    $.ajax({
        url: "/api/auth/login",
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: {
            username: userId,
            password: password,
        },
        // beforeSend: function () {
        //     $(".login_btn").text("Logging in...").addClass("disabled");
        // },
        success: function (response) {
            if (response.status === "success") {
                window.location.href = "/dashboard"; // 대시보드로 이동
            } else {
                popupOpenDialog('error',response.message,2000)
                if(response.message == null || response.message == "") {
                    popupOpenDialog('error', '접근권한이없습니다.', 2000);
                }
            }
        },
        error: function (xhr, error, status) {
            popupOpenDialog('error',xhr.responseJSON.message,2000);
        },
        complete: function () {
            hideLoadingSpinner()
        },
    });
}
