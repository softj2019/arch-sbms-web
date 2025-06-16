
$(function(){
  $('.btn_left_tgl').click(function(){
    let body = $('body');
    if(body.hasClass('folding')){
        body.removeClass('folding');
        // $(this).text('<<');
    } else {
        body.addClass('folding');
        // $(this).text('>>');
    }
    return false;
  });

  // 모바일 메뉴 열기
  $('.m_btn_menu').click(function(){
    $('.top_frame .m_menu').addClass('open');
  });

  // 모바일 메뉴 닫기
  $('.m_btn_x').click(function(){
    $('.top_frame .m_menu').removeClass('open');
  })

  // 모바일 메뉴 토글 (애니메이션 효과를 위해 slide 효과용)
  $('.m_gnb a').click(function(){
    var me = $(this);
    var href = me.attr('href');
    if(href == '' || href == '#'){
      var target = me.siblings('ul');
      if(target.is(":visible")){
        target.parent().removeClass('actived').find('.actived').removeClass('actived').find('ul').hide();
        target.slideUp('fast');
      } else {
        if(target.hasClass('m_gnb_dp2')){
          var prev = $('.m_gnb .m_gnb_dp2');
          prev.parent().removeClass('actived').find('.actived').removeClass('actived').find('ul').hide();
          prev.hide(); // or prev.slideUp('fast');
        }
        target.parent().addClass('actived') 
        target.slideDown();
      }
      return false;
    }
  })

  
  $('.btn_model[model_target]').click(function(){
    var model_target = $(this).attr('model_target');
    if(model_target != ''){
      const target = $(model_target);
      target.toggleClass('on');
      return false;
    }
  });

  $('.popup_frame .btn_close').click(function(){
    $(this).closest('.popup_frame').removeClass('on');
  });  

  $('.dialog_pop .btn_close').click(function(){
    $(this).closest('.dialog').addClass('hide');
  });

  $('.card_box [control-area]').click(function(){
    const button = $(this);
    const control_area_id = button.attr('control-area');
    if(control_area_id == ''){
      return false;
    }
    if(!button.hasClass('on')){
      const card_box = button.closest('.card_box');
      const control_area = $('#'+control_area_id);
      
      card_box.find('.card_tab button.on').removeClass('on');
      card_box.find('.tab_content.on').removeClass('on');

      button.addClass('on');
      control_area.addClass('on');

      
    } 
    return false;
    
  });

  updateHeaderMenu();
  updateLeftbMenu();
  updateGnbMenu();

  if ($('.slider_for').length > 0) {
    // img slider
    $('.slider_for').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      fade: true,
      autoplay: true,
      autoplaySpeed: 3000,
      asNavFor: '.slider_nav',
      responsive: [
        {
          breakpoint: 430,
          settings: {
            fade: false
          }
        }
      ]
    });
  }
  if ($('.slider_nav').length > 0) {
    $('.slider_nav').slick({
      slidesToShow: 6,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      asNavFor: '.slider_for',
      focusOnSelect: true,
      arrows: true
    });
  }
})

/**
 * 
 * @param {*} target 
 * @param {*} path 
 * @returns 
 */
function findChildLink(target, path){
  const me = $(target);
  var selector = me.find('a[href]');
  var target = $(selector).filter((_,el)=> {
    var finded = el && el.href != '' 
      && !el.getAttribute('href').startsWith('#')
      //&& el.pathname == path;
      && path.startsWith(el.pathname);
    // console.debug(el);
    // console.debug(`${el.getAttribute('href')} : ${finded}`);
    return finded;
  });
  // if(target.length == 0){
  //   target = me.find(selector).filter((_,el)=>el.pathname == path).first();
  // }
  return target;
}

/**
 * Header 메뉴 업데이트
 */
function updateHeaderMenu(){
  let targetLink = findChildLink('.gnb', location.pathname);
  if(targetLink.length){
    let closest = targetLink.closest('li');
    closest.addClass('on');
  } else {
    console.debug('haeder menu not found.')
  }
}

/**
 * Left 메뉴 업데이트
 */
function updateLeftbMenu(){
  let targetLink = findChildLink('.left_frame ul li', location.pathname);
  if(targetLink.length){
    targetLink.addClass('on');
    let closest = targetLink.closest('.m_gnb');
    targetLink.parentsUntil(closest).filter('li').addClass('on');
  } else {
    console.debug('left menu not found.')
  }
}

/**
 * GNB 메뉴 업데이트
 */
function updateGnbMenu(){
  let targetLink = findChildLink('.m_gnb ul li', location.pathname);
  if(targetLink.length){
    let closest = targetLink.closest('.m_gnb');
    targetLink.parentsUntil(closest).filter('li').addClass('actived').children('ul').show();
  } else {
    console.debug('gnb menu not found.')
  }
}
function getStationNameById(terminalId) {
  const station = stationData.find(station => station.terminal_id === terminalId);
  return station ? station.name : "알 수 없는 정류장"; // 매칭되지 않으면 기본값 반환
}
const stationData = [
  {
    name: "철쭉동산",
    terminal_id: "26019",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "OFF",
      재실감지카메라: "ON",
      LED전광판: "ON",
      공기질표출장치: "OFF",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "OFF"
    }
  },
  {
    name: "사무실",
    terminal_id: "26176000",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "OFF",
      재실감지카메라: "ON",
      LED전광판: "ON",
      공기질표출장치: "OFF",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "OFF"
    }
  },
  {
    name: "복합화물터미널후문·가족센터",
    terminal_id: "26063",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "OFF",
      재실감지카메라: "ON",
      LED전광판: "ON",
      공기질표출장치: "OFF",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "OFF"
    }
  },
  {
    name: "5단지517동앞",
    terminal_id: "26176",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "ON",
      재실감지카메라: "ON",
      LED전광판: "OFF",
      공기질표출장치: "ON",
      LTE라우터: "OFF",
      공공Wifi: "ON",
      LED전등바: "ON"
    }
  },
  {
    name: "군포역2번출구",
    terminal_id: "26257",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "ON",
      재실감지카메라: "OFF",
      LED전광판: "ON",
      공기질표출장치: "ON",
      LTE라우터: "ON",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  },
  {
    name: "군포첨단산업단지",
    terminal_id: "26225",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "ON",
      LED전광판: "ON",
      공기질표출장치: "OFF",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "ON"
    }
  },
  {
    name: "신기초등학교후문",
    terminal_id: "26243",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "ON",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "ON",
      LTE라우터: "ON",
      공공Wifi: "OFF",
      LED전등바: "ON"
    }
  },
  {
    name: "군포첨단산업단지2",
    terminal_id: "26227",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "ON",
      공기질표출장치: "ON",
      LTE라우터: "OFF",
      공공Wifi: "ON",
      LED전등바: "OFF"
    }
  },
  {
    name: "군포국민체육센터",
    terminal_id: "26073",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "ON",
      재실감지카메라: "ON",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "ON"
    }
  },
  {
    name: "군포시장",
    terminal_id: "26399",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "ON",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "ON",
      LTE라우터: "ON",
      공공Wifi: "OFF",
      LED전등바: "ON"
    }
  },
  {
    name: "천지사입구",
    terminal_id: "26219",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "ON",
      LED전광판: "ON",
      공기질표출장치: "OFF",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "OFF"
    }
  },
  {
    name: "군포국민체육센터",
    terminal_id: "26074",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "ON",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "ON",
      LTE라우터: "ON",
      공공Wifi: "OFF",
      LED전등바: "ON"
    }
  },
  {
    name: "부곡3단지아파트",
    terminal_id: "26201",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "OFF",
      재실감지카메라: "ON",
      LED전광판: "ON",
      공기질표출장치: "OFF",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "OFF"
    }
  },
  {
    name: "신한애자",
    terminal_id: "26249",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "ON",
      공기질표출장치: "ON",
      LTE라우터: "OFF",
      공공Wifi: "ON",
      LED전등바: "OFF"
    }
  },
  {
    name: "부곡3단지아파트",
    terminal_id: "26200",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "OFF",
      재실감지카메라: "ON",
      LED전광판: "ON",
      공기질표출장치: "OFF",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "OFF"
    }
  },
  {
    name: "5단지가야아파트",
    terminal_id: "26384",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "ON",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "ON",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "ON"
    }
  },
  {
    name: "신기초등학교정문",
    terminal_id: "26240",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "ON",
      재실감지카메라: "ON",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "ON",
      공공Wifi: "OFF",
      LED전등바: "ON"
    }
  },
  {
    name: "삼성마을5단지아파트입구",
    terminal_id: "26238",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "ON",
      재실감지카메라: "OFF",
      LED전광판: "ON",
      공기질표출장치: "ON",
      LTE라우터: "ON",
      공공Wifi: "ON",
      LED전등바: "OFF"
    }
  },
  {
    name: "당동주공아파트",
    terminal_id: "26082",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "OFF",
      재실감지카메라: "ON",
      LED전광판: "OFF",
      공기질표출장치: "ON",
      LTE라우터: "ON",
      공공Wifi: "OFF",
      LED전등바: "ON"
    }
  },
  {
    name: "송정마을",
    terminal_id: "26023",
    devices: {
      통합제어보드: "ON",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "ON",
      공기질표출장치: "ON",
      LTE라우터: "OFF",
      공공Wifi: "ON",
      LED전등바: "ON"
    }
  },
  {
    name: "신기초등학교후문",
    terminal_id: "26243",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "OFF",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  },
  {
    name: "신협앞",
    terminal_id: "26249",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "OFF",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  },
  {
    name: "문화예술회관",
    terminal_id: "26037",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "OFF",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  },
  {
    name: "송정지구 입구",
    terminal_id: "26416",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "OFF",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  },
  {
    name: "남천병원,남부교육기술원",
    terminal_id: "26030",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "OFF",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  },
  {
    name: "문화예술회관",
    terminal_id: "26039",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "OFF",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  },
  {
    name: "산본도서관",
    terminal_id: "26366",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "OFF",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  },
  {
    name: "13단지아파트입구",
    terminal_id: "26058",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "OFF",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  },
  {
    name: "당정지구입구",
    terminal_id: "26417",
    devices: {
      통합제어보드: "OFF",
      스마트스크린: "OFF",
      재실감지카메라: "OFF",
      LED전광판: "OFF",
      공기질표출장치: "OFF",
      LTE라우터: "OFF",
      공공Wifi: "OFF",
      LED전등바: "OFF"
    }
  }
];
// terminal_id를 기반으로 정류장명을 찾는 함수
function getStationNameById(terminalId) {
  const station = stationData.find(item => item.terminal_id === terminalId);
  return station ? station.name : "정보 없음";
}

function popupOpenDialog(type, message,timeout) {
  const $dialog = $('.dialog');
  $dialog.removeClass('hide').css('display', 'flex');

  // 기존 클래스 변경
  const $dialogPop = $dialog.find('.dialog_pop');
  if ($dialogPop.length) {
    // 모든 type_ 클래스를 제거하고 새 클래스를 추가
    $dialogPop.attr('class', 'dialog_pop'); // 기본 클래스 설정
    $dialogPop.addClass(`type_${type}`); // 입력받은 type에 따른 클래스 추가
  }

  // 메시지 설정 (옵션)
  const $errorMessageEl = $dialog.find('#error_message'); // 메시지를 표시할 요소 선택
  const $messageElement = $dialog.find('#success_message'); // 메시지를 표시할 요소 선택
  if ($errorMessageEl.length) {
    $errorMessageEl.text(message); // 전달받은 메시지 설정
  }
  if ($messageElement.length) {
    $messageElement.text(message); // 전달받은 메시지 설정
  }


  setTimeout(() => {
    $dialog.css('display', 'none');
  }, timeout);
}

$(document).on("click", ".btn_logout", function (event) {
  event.preventDefault();

  $.ajax({
    url: "/api/auth/logout",
    method: "POST",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token") // JWT 포함
    },
    success: function (response) {
      if (response.status === "success") {
        // 클라이언트에서 JWT 삭제
        document.cookie = "JWT_TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        window.location.href = "/login"; // 로그인 페이지로 이동
      }
    },
    error: function (xhr, status, error) {
      console.error("Logout failed:", error);
    },
  });
});

function showLoadingSpinner() {
  $('.spinner-background').show();
  $('.loadingio-spinner-spin-2by998twmg8').show();
}

function hideLoadingSpinner() {
  $('.spinner-background').hide();
  $('.loadingio-spinner-spin-2by998twmg8').hide();
}
function initDatePicker(){
  var currentDate = new Date();
  var oneWeekAgo = new Date();
  oneWeekAgo.setDate(currentDate.getDate() - 7);
  var datepicker = new tui.DatePicker('#datepicker-input1-container', {
    date: oneWeekAgo,
    input: {
      element: '#datepicker-input1',
      format: 'yyyy-MM-dd'
    }
  });
  var datepicker2 = new tui.DatePicker('#datepicker-input2-container', {
    date: new Date(),
    input: {
      element: '#datepicker-input2',
      format: 'yyyy-MM-dd'
    }
  });
}
function clearFormInputs(formId) {
  // formId로 지정된 form 내의 모든 input, select, textarea 초기화
  $(`#${formId}`).find('input, select, textarea').each(function () {
    const inputType = $(this).attr('type');

    if (inputType === 'text' || inputType === 'password' || inputType === 'email') {
      $(this).val(''); // 텍스트, 패스워드, 이메일 초기화
    } else if (inputType === 'checkbox' || inputType === 'radio') {
      $(this).prop('checked', false); // 체크박스 및 라디오 버튼 초기화
    } else {
      $(this).val(''); // 기타 input 및 textarea 초기화
    }
  });

  // Select 요소 기본값 설정
  $(`#${formId}`).find('select').each(function () {
    $(this).val($(this).find('option:first').val()); // 첫 번째 옵션으로 초기화
  });
}
$(document).ready(function () {
  $(".go_url").on("click", function (event) {
    event.preventDefault(); // 기본 동작 막기 (필수)

    const newUrl = "http://gunpo.irootelwindbreak.com"; // data-url 속성에서 URL 가져오기
    window.open(newUrl, "_blank");
    // if (newUrl) {
    //
    //   // URL 접근 가능 여부 확인 (HEAD 요청)
    //   $.ajax({
    //     url: newUrl,
    //     type: "HEAD",
    //     timeout: 5000, // 5초 내 응답 없으면 실패
    //     success: function () {
    //       window.location.href = newUrl; // 정상적인 경우 이동
    //     },
    //     error: function () {
    //       popupOpenDialog("error","해당 URL이 응답하지 않습니다. 잠시후 다시 시도해주세요",4000)
    //     }
    //   });
    // } else {
    //   console.warn("❌ 이동할 URL이 없습니다.");
    // }
  });
});

/* 삭제 컨펌 모달 */
function showConfirmModal(message, onConfirm) {
  // 기존 모달이 있으면 제거
  $('#deleteConfirmModal').remove();

  // 삭제 컨펌 모달 HTML 동적 생성
  const modalHtml = `
        <div id="deleteConfirmModal" class="delete-confirm-modal">
            <div class="delete-confirm-content">
                <h2>삭제 확인</h2>
                <br>
                <p>${message}</p>
                <br>
                <br>
                <div class="delete-confirm-buttons">
                    <button id="deleteConfirmNo" class="delete-confirm-btn delete-confirm-no">아니요</button>
                    <button id="deleteConfirmYes" class="delete-confirm-btn delete-confirm-yes">네</button>
                </div>
            </div>
        </div>
    `;

  // `body`에 추가
  $('body').append(modalHtml);

  // ✅ 삭제 버튼 클릭 시 실행할 콜백 함수
  $('#deleteConfirmYes').on('click', function () {
    $('#deleteConfirmModal').remove();
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  });

  // ❌ 취소 버튼 클릭 시 모달 닫기
  $('#deleteConfirmNo').on('click', function () {
    $('#deleteConfirmModal').remove();
  });
}
