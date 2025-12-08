function updateTime() {
    const now = new Date();
    const formattedTime = now.toLocaleDateString('ko-KR', {
        month: '2-digit', day: '2-digit', weekday: 'short',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).replace(/\./g, '').replace(' ', '.');

    $("#currentTime").text(formattedTime);

    // 현재 시간 기준으로 낮/밤 모드 적용
    const hour = now.getHours();
    if (hour >= 6 && hour < 18) {
        $("body").removeClass("bg-night").addClass("bg-day"); // 낮 모드
    } else {
        $("body").removeClass("bg-day").addClass("bg-night"); // 밤 모드
    }
}

// 페이지 로드 시 실행 & 1초마다 자동 갱신
$(document).ready(function () {
    updateTime();
    setInterval(updateTime, 1000); // 1초마다 갱신
});
const windDirectionMap = {
    "N": "북",
    "NNE": "북북동",
    "NE": "북동",
    "ENE": "동북동",
    "E": "동",
    "ESE": "동남동",
    "SE": "남동",
    "SSE": "남남동",
    "S": "남",
    "SSW": "남남서",
    "SW": "남서",
    "WSW": "서남서",
    "W": "서",
    "WNW": "서북서",
    "NW": "북서",
    "NNW": "북북서"
};
function getWindDirection(degree) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    const index = Math.round(degree / 22.5) % 16;
    return windDirectionMap[directions[index]];
}
$(document).ready(function () {
    function fetchWeatherData() {
        $.ajax({
            url: "/api/air/recent",
            type: "GET",
            dataType: "json",
            success: function (data) {
                if (data) {
                    // $("#currentTime").text(new Date().toLocaleString() + " 현재");

                    // 기온 업데이트
                    $(".text-6xl").text(data.t1H + "°C");

                    $(".reh").text(data.reh);
                    // console.log(getWindDirection(data.vec),data.wsd);
                    $("#vec").text(getWindDirection(data.vec));
                    // 바람 업데이트
                    $(".wsd").text(data.wsd);

                    // 1시간 강수량 업데이트
                    $(".rn1").text(data.rn1);

                    // 초미세먼지 업데이트 (게이지 반영)
                    updateGauge(".pm10Grade-gauge", data.pm10Grade, data.pm10Value);
                    // 미세먼지 업데이트
                    updateGauge(".khaiGrade-gauge", data.khaiGrade, data.khaiValue);
                    // 오존 업데이트
                    updateGauge(".o3Grade-gauge", data.o3Grade, data.o3Value);
                    updateGauge(".no2Grade-gauge", data.no2Grade, data.no2Value);
                    updateGauge(".coGrade-gauge", data.coGrade, data.coValue);
                    updateGauge(".so2Grade-gauge", data.so2Grade, data.so2Value);
                }

                getWeatherStatusList();
            },
            error: function (xhr, status, error) {
                console.error("날씨 데이터 로드 오류:", error);
            }
        });
    }

    // 등급 (Grade) 변환 함수
    function getGradeText(grade) {
        switch (grade) {
            case 0: return "좋음";
            case 1: return "좋음";
            case 2: return "보통";
            case 3: return "나쁨";
            case 4: return "매우 나쁨";
            default: return "정보 없음";
        }
    }
    function updateGauge(selector, grade,value) {
        // 1~4 등급에 따른 게이지 비율 설정 (0% ~ 100%)
        const gradeOffsets = {
            1: 220,  // 좋음 (게이지 약 25% 채움)
            2: 160,  // 보통 (게이지 약 50% 채움)
            3: 100,  // 나쁨 (게이지 약 75% 채움)
            4: 40    // 매우 나쁨 (게이지 거의 꽉참)
        };

        const strokeDashoffset = gradeOffsets[grade] || 283; // 기본값(비어있음)

        // 등급별 색상 매핑
        const colorMap = {
            0: { color: "#ffffff", textClass: "" }, // 좋음 (파란색)
            1: { color: "#ffffff", textClass: "" }, // 좋음 (파란색)
            2: { color: "#22C55E", textClass: "text-green-500" }, // 보통 (초록색)
            3: { color: "#F97316", textClass: "text-orange-500" }, // 나쁨 (주황색)
            4: { color: "#DC2626", textClass: "text-red-500" } // 매우 나쁨 (빨간색)
        };

        const selectedColor = colorMap[grade] || colorMap[4]; // 기본값: 매우 나쁨

        // console.log(`${selector} / Grade: ${grade} / Offset: ${strokeDashoffset}`);

        // 게이지 및 색상 업데이트
        $(selector).attr("stroke-dashoffset", strokeDashoffset);
        $(selector).attr("stroke", selectedColor.color);

        // 값 및 상태 업데이트
        $(`${selector}-value`).text(value);
        $(`${selector}-text`).removeClass().addClass(`text-2xl ${selectedColor.textClass}`).text(getGradeText(grade));
    }
    // 페이지 로드 시 데이터 가져오기
    fetchWeatherData();

    // 1초 * 60 * 30 = 30분
    setInterval(fetchWeatherData, 1000 * 60 * 30);
});

function getWeatherStatusList() {
    $.ajax({
        url: '/api/air/status',
        method: 'GET',
        success: function (result) {
            if (result) {
                result.forEach(item => {
                    let selector = `#${item.displayName}_data`;
                    if (item.isActive === 0) {
                        $(selector).css("display", "none");
                    } else {
                        $(selector).css("display", "");
                    }
                });
            }
        },
        error: function (error) {
            console.error("연계정보 데이터 로드 오류:", error);
        }
    });
}
