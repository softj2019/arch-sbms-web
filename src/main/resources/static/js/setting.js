/* 전역변수 */
let grid1; // 그리드
const colors = [
    { 번호: "00", 글자색: "흰색", 색상코드: "#FFFFFF", 테두리색상: "#FFFFFF",back: "#000000" },
    { 번호: "01", 글자색: "파랑", 색상코드: "#0000ff", 테두리색상: "#0000ff" ,back: "#000000"},
    { 번호: "02", 글자색: "청록", 색상코드: "#00FFFF", 테두리색상: "#00FFFF" ,back: "#000000"},
    { 번호: "03", 글자색: "녹색", 색상코드: "#008000", 테두리색상: "#008000" ,back: "#000000"},
    { 번호: "04", 글자색: "노랑", 색상코드: "#FFFF00", 테두리색상: "#FFFF00" ,back: "#000000"},
    { 번호: "05", 글자색: "빨강", 색상코드: "#FF0000", 테두리색상: "#FF0000" ,back: "#000000"},
    { 번호: "06", 글자색: "분홍", 색상코드: "#FFC0CB", 테두리색상: "#FFC0CB" ,back: "#000000"},
];

/* 페이지 온로드 */
$(document).ready(function(){
    getSetting();
    initializeGrid([]);

    $(document).on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // 기본 엔터 동작 방지
            saveAndUpdateSettings();
        }
    });
});

/* 엔터키 누르면 저장 및 업데이트 */
function saveAndUpdateSettings() {
    if (grid1) {
        grid1.finishEditing(); // 편집 중인 셀 저장
    }
    updateSetting(); // 설정 업데이트 실행
}

/* 그리드 초기화 */
function initializeGrid(data=[]) {
    const gridElement = document.getElementById("grid_tale");
    if (!gridElement) {
        return;
    }

    grid1 = new tui.Grid({
        el       : gridElement,
        scrollX  : true,
        scrollY  : false,
        data     : data,
        rowHeight: 60,
        columns  : [
            { name: "id"         , hidden: true },
            { name: "description", header: "설정 대상", align: "center", rowSpan:true, width: 300 },
            { name: "setting"    , header: "설정 내용", align: "center", width: 300 },
            {
                name    : "value",
                header  : "설정값",
                align   : "center",
                formatter: function ({ row, value }) {
                    let backgroundColor = "#FFF";
                    if (row.setting === "글자색상") {
                        if (value) {
                            const selectedColor = colors.find(c => c.번호 === value);
                            if (selectedColor) {
                                return `<span class="hover-effect" style="
                                        border-radius :4px;
                                        background    :${selectedColor.back};
                                        display       :inline-block;
                                        padding       :2px 1px;
                                        height        :40px; 
                                        color         :${selectedColor.색상코드};
                                        width         :90%;
                                        align-content :center;
                                        border        :2px solid ${selectedColor.테두리색상};
                                    " onmouseover="this.style.cursor='pointer'"
                                      onmouseenter="this.style.backgroundColor='#f2f8fc'"
                                      onmouseleave="this.style.backgroundColor='${selectedColor.back}'">
                                    ${selectedColor.글자색}
                                </span>`;
                            }
                        }
                        return `<span class="cell-hover-effect" style="
                                display: inline-block;
                                width: 90%;
                                height: 40px;
                                line-height: 40px;
                                text-align: center;
                                background: #FFF;
                                border: 2px solid #CCC;
                                border-radius: 4px;
                                ">
                                색상 선택
                            </span>`;
                    }
                    return `<span class="cell-hover-effect" style="
                            display: inline-block;
                            width: 100%;
                            height: 100%;
                            line-height: 40px;
                            text-align: center;
                            background: ${backgroundColor};
                            border-radius: 4px;
                        ">
                        ${value || ""}
                    </span>`;
                },
                editor: {
                    type: CustomTextEditor,
                    options: {
                        maxLength: 100
                    }
                }
            },
            { name   : "optionKey", hidden: true },
        ],
        columnOptions: {
            resizable   : true,
            minWidth    : 80,
            sortable    : false
        },
        editingEvent: "click"
    });

    tuiGridApplyTheme();
}

/* CSS 스타일 추가 */
const style = document.createElement("style");
style.innerHTML = `
    .cell-hover-effect:hover {
        cursor: pointer;
        background-color: #f2f8fc !important;
    }
`;
document.head.appendChild(style);

class CustomTextEditor {
    constructor(props) {
        const rowKey = props.rowKey;
        const row = grid1.getRow(rowKey);

        if (!row) {
            this.el = document.createElement('input');
            return;
        }

        // 부모 div 생성 (수직 중앙 정렬용)
        const wrapper = document.createElement('div');
        wrapper.style.justifyContent = "center";
        wrapper.style.alignItems = "center";
        wrapper.style.display = "flex";
        wrapper.style.height = "100%";

        if (row.setting === '글자색상') {
            const el = document.createElement('select');
            el.style.textAlignLast = "center";
            el.style.borderRadius = "4px";
            el.style.lineHeight = "normal";
            el.style.background = "#000";
            el.style.appearance = "auto";
            el.style.textAlign = "center";
            el.style.padding = "5px";
            el.style.display = "block";
            el.style.height = "40px";
            el.style.width = "90%";

            const selectedColor = colors.find(color => color.번호 === String(props.value));
            el.style.border = selectedColor
                            ? `2px solid ${selectedColor.테두리색상}`
                            : "2px solid #000";
            el.style.color = selectedColor
                           ? `${selectedColor.색상코드}`
                           : "#000";

            el.addEventListener("change", function() {
                const newSelectedColor = colors.find(color => color.번호 === el.value);

                if (newSelectedColor) {
                    el.style.border = `2px solid ${newSelectedColor.테두리색상}`;
                    el.style.color = newSelectedColor.색상코드;
                    el.style.borderRadius = "4px";
                } else {
                    el.style.border = "2px solid #000";
                    el.style.color = "#000"; // 기본값
                    el.style.borderRadius = "4px";
                }
            });

            // 옵션 추가
            colors.forEach(color => {
                const option = document.createElement('option');
                option.style.background = color.back;
                option.style.color = color.색상코드;
                option.textContent = color.글자색;
                option.value = color.번호;

                el.appendChild(option);
            });

            // 현재 값 설정
            el.value = String(props.value);
            wrapper.appendChild(el);

        } else if (row.id === 1){
            const hourSelect = document.createElement('select');
            hourSelect.style.height = "30px";
            hourSelect.style.width = "100px";
            hourSelect.style.textAlign = "center";
            hourSelect.style.lineHeight = "normal";

            for (let i = 0; i < 24; i++) {
                const option = document.createElement('option');
                option.value = String(i).padStart(2, '0');
                option.textContent = String(i).padStart(2, '0');
                hourSelect.appendChild(option);
            }

            // 콜론 (":")
            const colon = document.createElement('span');
            colon.textContent = " : ";
            colon.style.fontSize = "16px";
            colon.style.fontWeight = "bold";
            colon.style.marginLeft = "5px";
            colon.style.marginRight = "5px";

            // 분 select 박스 (00, 15, 30, 45)
            const minuteSelect = document.createElement('select');
            minuteSelect.style.height = "30px";
            minuteSelect.style.width = "100px";
            minuteSelect.style.textAlign = "center";
            minuteSelect.style.lineHeight = "normal";

            [0, 15, 30, 45].forEach(min => {
                const option = document.createElement('option');
                option.value = String(min).padStart(2, '0');
                option.textContent = String(min).padStart(2, '0');
                minuteSelect.appendChild(option);
            });

            // 현재 값 설정
            if (props.value) {
                const [selectedHour, selectedMinute] = props.value.split(":");
                hourSelect.value = selectedHour;
                minuteSelect.value = selectedMinute;
            }

            wrapper.appendChild(hourSelect);
            wrapper.appendChild(colon);
            wrapper.appendChild(minuteSelect);

        } else {
            // Input box 생성
            const {maxLength} = props.columnInfo.editor.options;
            const el = document.createElement('input');

            el.style.textAlign = "center";
            el.maxLength = maxLength;
            el.value = String(props.value);
            el.type = 'text';

            wrapper.appendChild(el);
        }
        this.el = wrapper;
    }

    getElement() {
        return this.el;
    }

    getValue() {
        const selects = this.el.querySelectorAll("select");
        if (selects.length === 2) {
            return `${selects[0].value}:${selects[1].value}`;
        }
        return this.el.querySelector("select, input").value;
    }

    mounted() {
        const inputEl = this.el.querySelector("input");
        if (inputEl) {
            inputEl.select();
        }
    }
}

/* 기본 설정값 조회 */
let isLoading = false;
function getSetting() {
    if (isLoading) return;
    isLoading = true;
    showLoadingSpinner();

    $.ajax({
        url: '/api/setting/list',
        method: 'GET',

        success: function(response) {
            const gridData = response.map((settings, index, arr) => {
                // 같은 ID를 가진 행의 개수를 계산하여 병합 설정
                let rowSpanCount = 1;
                if (index === 0 || settings.id !== arr[index - 1].id) {
                    rowSpanCount = arr.filter(item => item.id === settings.id).length;
                }

                return {
                    id          : settings.id,
                    description : settings.description,
                    setting     : settings.setting,
                    value       : settings.value,
                    optionKey   : settings.optionKey,
                    _attributes : {
                        rowSpan : rowSpanCount > 1
                                               ? { id: rowSpanCount, description: rowSpanCount }
                                               : {}
                    }
                };
            });

            // 데이터를 먼저 적용하고 나서 병합 처리
            grid1.resetData(gridData);

            hideLoadingSpinner();
        },
        error: function(xhr, status, error) {
            popupOpenDialog('error', "기본설정 조회에 실패하였습니다 : "+error, 2000);
            hideLoadingSpinner();
        },
        complete: function() {
            isLoading = false;
            hideLoadingSpinner();
        }
    });
}

/* 일반설정 수정 */
function updateSetting() {
    showConfirmModal(
        "정말로 수정하시겠습니까?",
        function () {
            updateSet();
        }
    )
}
function updateSet(){
    grid1.finishEditing();

    const updateData = grid1.store.data.rawData.map((row, index) => ({
        id          : row.id,
        description : row.target,
        option      : row.setting,
        value       : row.value,
        optionKey   : row.optionKey || row['optionKey'],
    }));

    /* if(id=2) 숫자 유효성 검사 */
    const invalidNumberData = updateData.find(row => row.id === 2 && (!/^\d+$/.test(row.value) || Number(row.value) <= 10));

    if (invalidNumberData) {
        let rowIndex     = invalidNumberData.rowIndex;
        const columnName = "value";

        let row = grid1.getRow(rowIndex);
        if (!row) return;

        let rowKey = row.rowKey;

        popupOpenDialog('error', "숫자로 입력해야 하며, 10보다 큰 값만 가능합니다.", 2000);

        grid1.focus(rowKey, columnName, true);
        grid1.startEditing(rowKey, columnName);

        return;
    }

    $.ajax({
        url         : '/api/setting/update',
        method      : 'PUT',
        contentType : 'application/json; charset=utf-8',
        data        : JSON.stringify(updateData),
        dataType    : 'json',

        success : function(response){
            if (response.status === 'success'){
                getSetting();
                popupOpenDialog('info', "설정 적용 성공", 2000);
            } else {
                popupOpenDialog('error', "설정 적용 실패", 2000);
            }
            hideLoadingSpinner();
        },
        error : function (error, xhr, status){
            popupOpenDialog('error', "설정 적용중 에러 발생" + error, 2000);
            hideLoadingSpinner();
        },
        complete : function (){
            hideLoadingSpinner();
        }
    });
}