/** CSS VAR */
clr_main        = getStyleRootVar('--clr_main');
// clr_point       = getStyleRootVar('--clr_point');
// clr_darkgray    = getStyleRootVar('--clr_darkgray');
// clr_gray        = getStyleRootVar('--clr_gray');
// clr_red         = getStyleRootVar('--clr_red');
// clr_bg_gray     = getStyleRootVar('--clr_bg_gray');
clr_bg_point    = getStyleRootVar('--clr_bg_point');
clr_font        = getStyleRootVar('--clr_font');
// clr_bg_gray     = getStyleRootVar('--clr_bg_gray');

function getStyleRootVar(name, defaultValue){
    return getStyleVar(document.documentElement, name, defaultValue);
}

function getStyleVar(element, name, defaultValue){
    const value = getComputedStyle(element).getPropertyValue(name).trim();
    return value == '' ? defaultValue : value;
}

/**
 * @link: https://nhn.github.io/tui.grid/latest/Grid#applyTheme
 * @param {*} _theme 
 * @returns 
 */
function getCustomExtOpts(_theme){
    const extOpts = {
        // // 그리드 바깥 선
        outline: {
            border: clr_main,
            borderTop: 2,
            borderBottom: 0,
            // 바깥 세로 선 여부
            //showVerticalBorder: true,
        },
        // // 선택된 영역
        // selection: {
        //   background: "#1eed11",
        //   border: '#bbbbbb', 
        // },
        // // 스크롤바
        scrollbar:{
          //border: 'transparent',
          //background: 'transparent',
          // 스크롤 빈 부분 색상
          //emptySpace: 'transparent',
          // 스크롤 부분 색상
          //thumb: 'rgba(170,170,170,.5)',
          // 마우스오버, 클릭할 때 색상
          //active: 'transparent'
        },
        // 고정 컬럼
        // frozenBorder:{
        //   border: 'rgb(233,233,233)',
        // },
        // // 열
        // row: {
        //   // 마우스 호버
        //   hover: {
        //     background: '#e9f8e8',
        //   },
        //   // 비활성화
        //   dummy: {
        //     background: '#f5d1ba',
        //   },
        // },
        // 각셀
        cell: {
            // 상단 제목 열
            header: {
                background: clr_bg_point,
                border: 'rgb(170, 170, 170)',
                
                // text: 'black',
                showVerticalBorder: true,
                showHorizontalBorder: true,
            },
            normal: {
                background: 'white',
                border: 'rgb(222, 222, 222)',
                text: 'black',
                showVerticalBorder: true,
                showHorizontalBorder: true,
            },
            // // 선택한 제목 색상
            // selectedHeader: {
            //   background: 'rgb(233, 233, 233)',
            // },
            // // 좌측 제목 행
            rowHeader: {
              background: clr_bg_point,
              border: 'rgb(222, 222, 222)',
              text: 'red',
              showVerticalBorder: true,
              showHorizontalBorder: true,
            },
            // // 선택한 열 색상
            // selectedRowHeader: {
            //   background: 'rgb(233, 233, 233)',
            // },
            // // 선택한 셀
            // focused: {
            //   background: "#f5d1ba",
            //   border: "#bbbbbb",   
            // },
            // // 선택 후 표 바깥을 선택하면 나타나는 색상
            // focusedInactive: {
            //     border: "#bbbbbb"
            // },
            // // 요약 열
            // summary: {
            //   background: '#f1f5ff',
            //   border: '#bbbbbb',
            //   text: 'black',
            //   showVerticalBorder: true,
            //   showHorizontalBorder: true,
            // }
        }
    }
    return extOpts;
}

/**
 * tui gird 테마를 적용
 * @param {*} extOpts 
 * @param {*} theme 
 */
function tuiGridApplyTheme(extOpts, theme){
    if(!theme){
        theme = 'default';
    }
    var grid = tui.Grid;
    var defaultOpts = getCustomExtOpts(theme);
    var mergedOpts = { ...defaultOpts, ...extOpts };
    grid.applyTheme(theme , mergedOpts);
    appendStyles(mergedOpts);
}

/**
 * tui grid class 임의 수정
 * - 각 영역 boder를 full 설정만 가능하고 개별 설정은 안됨(ex. boder-top, border-bottom)
 * - tui grid 의 css는 style 태그에 강제 삽입되는 방식
 * - tui grid border 들이 full 설정으로만 가능하고 개별설정은 안됨
 * - 관리 통일을 위해서 style 강제 추가
 * @param {*} extOpts 
 */
function appendStyles(extOpts){
    var text = '';
    const borderTop = parseInt(extOpts?.outline?.borderTop);
    const borderBottom = parseInt(extOpts?.outline?.borderBottom);
    if(!isNaN(borderTop)){
        text = text + `.tui-grid-border-line-top { border-top-width: ${borderTop}px !important; }`;
    }
    if(!isNaN(borderBottom)){
        text = text + `.tui-grid-border-line-bottom { border-bottom-width: ${borderBottom}px !important; }`;
    }
    if(text && text != ''){
        addStyleElement(text);
    } else {
        console.debug('pass');
    }
}

function addStyleElement(text) {
    const elStyle = document.createElement('style');
    elStyle.setAttribute('type', 'text/css');
    elStyle.innerHTML = text;
    
    const styles = document.getElementsByTagName('style');
    if (styles.length > 0) {
        styles[styles.length-1].after(elStyle);
    } else {
        const heads = document.getElementsByTagName('head');
        // <head>가 없으면 <html>에 <style> 직접 추가
        heads.appendChild(elStyle);
    }
}