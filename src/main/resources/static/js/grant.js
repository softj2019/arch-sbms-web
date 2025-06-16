/* 전역변수 */
let grid1;  // 그리드

/* 페이지 온로드 */
$(function () {
    getMenuTree();
});

// 서브메뉴 처리
function ensureTreeStructure(data) {
    return data.map((item) => {
        const newItem = { ...item };
        if (!newItem.menuNm) {
            newItem.menuNm = "메뉴 이름 없음"; // 기본값 설정
        }
        if (!newItem._children) {
            newItem._children = item.subMenus || []; // _children이 없으면 submenus 사용
        }
        return newItem;
    });
}

let menuData = /*[[${menuSeq}]]*/ [];

/* 그리드 초기화 */
function initializeGrid(){
    // 기존 그리드 삭제
    if (grid1) {
        grid1.destroy();
    }

    const treeData = ensureTreeStructure(menuData);
    let grantLevelMapping = {
        "1": "일반사용자",
        "2": "관리자"
    };

    let useFlagMapping = {
        "1": "사용",
        "0": "미사용"
    };

    // 그리드 초기화
    grid1 = new tui.Grid({
        el                : document.getElementById("grid_tale"),
        data              : treeData,
        treeColumnOptions : {
            name             : "menuNm", // 트리 열의 이름
            useIcon          : false,    // 아이콘 사용
            childrenProperty : "_children",
        },
        columns             : [
            {name: "menuId", header: "ID"       , width		: 1		, align: 'left', hidden: true},
            {name: "menuNm", header: "메뉴 이름"	, minWidth	: 500	, align: 'left'},
            {
                name    : "useFlag",
                header  : "사용여부",
                align   : 'left',
                formatter: function (item) {
                    return useFlagMapping[item.value] || item.value;
                },
                editor: {
                    type: 'select',
                    options: {
                        listItems: [
                            {text: "사용"	, value: "1"},
                            {text: "미사용"	, value: "0"}
                        ]
                    }
                }
            },
            {
                name    : "menuGrantLevl",
                header  : "권한그룹",
                minWidth: 250,
                align   : 'left',
                formatter: function (item) {
                    return grantLevelMapping[item.value] || item.value;
                },
                editor: {
                    type    : 'select',
                    options : {
                        listItems: [
                            {text: "일반사용자"	, value: "1"},
                            {text: "관리자"		, value: "2"}
                        ]
                    }
                }
            }
        ],
        columnOptions: {
            resizable: true,
            minWidth : 250
        },

        editingEvent : 'click'
    });

    tuiGridApplyTheme();
}

let originData = [];

/* 변경사항 저장 */
function update() {
    grid1.finishEditing(); // 편집중인 셀 강제저장
    const rows = grid1.getData();

    showLoadingSpinner();

    $.ajax({
        url         : '/api/grant/update',
        type        : 'PUT',
        contentType : 'application/json',
        data        : JSON.stringify(rows),
        dataType    : 'json',

        success : function (response){
            if (response > 0) {
                popupOpenDialog('info', response + "개 메뉴 작업 성공", 1000);
            } else {
                popupOpenDialog('error', "변동사항이 없습니다.", 1000);
            }
        },
        error : function (){
            popupOpenDialog('error', '권한정보 수정 에러', 2000);
        },
        complete : function (){
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        }
    });
}

/* 권환관리 메뉴 조회 */
function getMenuTree(){
    showLoadingSpinner();

    $.ajax({
        url     : '/api/grant/list',
        method  : 'GET',

        success : function(response){
            menuData = response.menuSeq || [];

            // 트리 구조로 변환한 데이터로 그리드를 초기화
            initializeGrid();

            hideLoadingSpinner();
        },
        error : function (xhr, status, error){
            popupOpenDialog('error', '권한관리 메뉴 조회에 실패하였습니다.', 2000);
            hideLoadingSpinner();
        },
        complete : function(){
            hideLoadingSpinner();
        }
    });
}