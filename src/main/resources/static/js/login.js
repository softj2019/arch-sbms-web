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
                window.location.href = "/dashboard";
            } else if (response.status === "ip_denied") {
                var ip = response.clientIp || '알 수 없음';
                popupOpenDialog('error', '접근이 제한된 IP(' + ip + ')입니다. 관리자에게 해당 IP를 전달하여 등록을 요청하세요.', 5000);
            } else {
                var msg = response.message || '접근권한이 없습니다.';
                popupOpenDialog('error', msg, 2000);
            }
        },
        error: function (xhr) {
            var msg = '로그인 중 오류가 발생했습니다.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                msg = xhr.responseJSON.message;
            }
            popupOpenDialog('error', msg, 2000);
        },
        complete: function () {
            hideLoadingSpinner()
        },
    });
}
