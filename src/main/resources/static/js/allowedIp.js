/* 전역변수 */
let grid1;                  // 그리드
let pagination1;            // 페이지네이션
let selectedRow;            // 선택된 로우 저장
let ORIGINAL_IP_MAP = []; // 허용 IP list 원본

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
    getAllowedIpList(true, 0);
    initializeGrid();

    // 조회건수 이벤트
    $('#itemsPerPage').on('change', function () {
        getAllowedIpList(true, 0);
    });

    // 키업 액션 발생시
    $(document).on("keyup", function (event) {
        if (event.key === "Enter" || event.keyCode === 13) {

            // 현재 선택어진 컬럼이 존재하다면 해당 로우 update
            if(selectedRow !== null && selectedRow !== undefined) {
                confirmUpdateAllowedIp(selectedRow);
            }
        }
    });

    // 키다운 액션 발생시
    $(document).on("keydown", function (event) {
        if (event.key === "Escape" || event.keyCode === 27) {
            const delModal = $('#deleteConfirmModal');

            // 현재 띄워진 모달이 존재하는 경우
            if(delModal.length > 0) {
                delModal.remove();
            }
        }
    });
});

/* 그리드 */
function initializeGrid() {
    const gridElement = document.getElementById("grid_table");
    if (!gridElement) {
        return;
    }
    grid1 = new tui.Grid({
        el           : gridElement,
        scrollX      : true,
        scrollY      : false,
        minBodyHeight: 50,
        // ,rowHeaders   : ['checkbox'],
        columns      : [
            { name: "no"			, header: "NO"				, sortable: true, align: 'center', width: 80},
            { name: "seq"			, header: "시퀀스"				, hidden: true, sortable: true, align: 'center', width: 80},
            {
                name: "description"	,
                header: "설명"			,
                sortable: true, align: 'center',
                editor: {
                    type: CustomTextEditor,
                    options: {
                        maxLength: 500
                    }
                } ,
                formatter: function ({ row, value }) {
                    return  `<span class="cell-hover-effect" style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                        ">
                        ${value || ""}
                    </span>`;
                }
            },
            {
                name: "ip"	, header: "접근허용IP"			,
                sortable: true,
                align: 'center',
                editor: {
                    type: CustomTextEditor,
                    options: {
                        maxLength: 500
                    }
                } ,
                formatter: function ({ row, value }) {
                    return  `<span class="cell-hover-effect" style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                        ">
                        ${value || ""}
                    </span>`;
                }
            },
            {
                name: "useFlag"		,
                header: "사용여부"		,
                sortable: true, align: 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }},
            { name: "createUserId"	, header: "등록자 ID"		, sortable: true, align: 'center' },
            { name: "createdAt"			, header: "등록 일자"	    , sortable: true, align: 'center' },
            { name: "updateUserId"      , header: "수정자 ID"	, sortable: true, align: 'center' },
            { name: "updatedAt"	, header: "수정 일자"	    , sortable: true, align: 'center' },
            {
                name: "update_btn",
                header: "수정",
                align: "center",
                width: 80,
                formatter: () => '<button type="button" class="btn_def btn_point_clr">수정</button>'
            },
            {
                name: "delete_btn",
                header: "삭제",
                align: "center",
                width: 80,
                formatter: () => '<button type="button" class="btn_def btn_red_clr btn_delete">삭제</button>'
            }
        ],
        columnOptions : {
            resizable   : true,
            minWidth    : 80,
        }
        ,
        editingEvent: "click"
    });
    tuiGridApplyTheme();
    grid1.on('click'      , handleOneClickBtn);
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

/* 그리드 한번 클릭 핸들러 */
function handleOneClickBtn(e){

    // 그리드 헤더 클릭시 버튼 처리 제외
    if(e.targetType !== "cell") return;
    if(e.rowKey == null) return;
    
    const rowKey = e.rowKey;

    switch (e.columnName) {
        case "update_btn":
            confirmUpdateAllowedIp(rowKey);
            break;
        case "delete_btn":
            confirmDeleteAllowedIp(rowKey);
            break;
        default:
            selectedRow = rowKey;
            break;
    }
}

/* 허용 IP 등록 */
function createAllowedIp(){

    const description    = $('#ip_description').val()?.trim() || "";
    const ip  = $('#allowed_ip').val()?.trim() || "";

    // 필수값 입력 확인
    if (!validateForm(description)) {
        popupOpenDialog('error', 'ip 설명 은 필수 입력항목입니다.', 2000);
        $('#ip_description').focus();
        isLoading = false;
        return;
    }

    // 필수값 입력 확인
    if (!validateForm(ip)){
        popupOpenDialog('error', 'ip 는 필수 입력항목입니다.', 2000);
        $('#allowed_ip').focus();
        isLoading = false;
        return;
    }

    // IPv4 형식 검증
    if(!validateIpv4(ip)) {
        popupOpenDialog('error', '옳바르지 않은 IP 형식입니다.', 2000);
        $('#allowed_ip').focus();
        isLoading = false;
        return;
    }

    const data = {
        description       : description,
        ip     : ip
    }

    showLoadingSpinner();
    $.ajax({
        url              : '/api/control/allowedIp/create',
        method           : 'POST',
        data             : JSON.stringify(data),
        contentType      : 'application/json; charset=utf-8',
        dataType         : 'json',

        success : function(result){
            if (result.status==="success"){
                popupOpenDialog('info', result.message, 2000);
                getAllowedIpList(false ,0);
                $('#create_popup_frame').removeClass("on");
                hideLoadingSpinner();
            } else {
                popupOpenDialog('error', result.message, 2000);
                hideLoadingSpinner();
            }
        },
        error : function (xhr, status, error){
            const res = JSON.parse(xhr.responseText);
            const message = res.message || "";

            // 서버측의 에러 메세지 그대로 팝업처리
            popupOpenDialog('error', message, 2000);
            hideLoadingSpinner();
        },
        complete :  function (){
            clearContents();
            clearSearchContents();
        },
    });
}

/* 유효성 검사 */
function validateForm(v1){
    return !!v1;
}

let isLoading = false;

/* 기존 IP 정보 저장 */
function saveOriginData(item) {
    ORIGINAL_IP_MAP.push({
        seq  : item.seq,
        description  : item.description,
        ip    : item.ip,
        useFlag    : item.useFlag,
        createUserId : item.createUserId,
        createdAt : item.createdAt,
        updateUserId : item.updateUserId,
        updatedAt : item.updatedAt
    });
}

/* 허용 IP 리스트 조회 */
function getAllowedIpList(search = true, page = 0){

    // 조회건수
    const size = $('#itemsPerPage').val() || 10;

    showLoadingSpinner();

    // 조회조건
    const s_ip_description = search ? $('#s_ip_description').val().trim() : null;
    const s_allowed_ip = search ? $('#s_allowed_ip').val().trim() : null;
    const s_create_user_id = search ? $('#s_create_user_id').val().trim() : null;
    const s_update_user_id = search ? $('#s_update_user_id').val().trim() : null;

    const s_data = {
        sIpDescription    : s_ip_description,
        sAllowedIp    : s_allowed_ip,
        sCreateUserId : s_create_user_id,
        sUpdateUserId : s_update_user_id
    }

    // 쿼리파라미터 값들을 직렬화 (null값은 ""값으로 치환)
    const qryString = $.param(s_data);

    $.ajax({
        url     : `/api/control/allowedIp/list?page=${page}&size=${size}&${qryString}`,
        method  : 'GET',

        success : function(response){
            const content = Array.isArray(response.content) ? response.content : [];

            // 초기 데이터 초기화
            ORIGINAL_IP_MAP = [];
            
            const gridData = content.map(function (ipInfo, index) {

                // ORIGINAL_PLA
                saveOriginData(ipInfo);

                return {
                    no          : index + 1 + page * size,
                    seq  : ipInfo.seq,
                    description  : ipInfo.description,
                    ip    : ipInfo.ip,
                    useFlag    : ipInfo.useFlag,
                    createUserId : ipInfo.createUserId,
                    createdAt : ipInfo.createdAt,
                    updateUserId : ipInfo.updateUserId,
                    updatedAt : ipInfo.updatedAt
                }
            });

            // TOAST UI Grid 데이터 초기화
            grid1.resetData(gridData);

            // 페이지네이션 초기화
            initializePagination(response.totalElements, size, page);
            // 총 건수 업데이트
            $('.sub_script .num').text(response.totalElements);

            hideLoadingSpinner();
        },
        error : function(xhr, status, error){
            popupOpenDialog('error', "접근허용 IP 목록 조회에 실패하였습니다.", 2000);
            hideLoadingSpinner();
        },
        complete : function(){
            clearContents();
            isLoading = false; // 요청 완료 후 플래그 초기화
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
        getAllowedIpList(true , newPage);           // 새 페이지 데이터 요청
    });
}

/* IP 정보 수정 팝업 */
function confirmUpdateAllowedIp(selRow) {
    const no = grid1.getValue(selRow, 'no');

    // 그리드 편집 모드 강제 종료
    exitGridFocus();

    showConfirmModal(
        ` ${no} 번 IP를 정말로 수정하시겠습니까?`,
        function () {
            updateAllowedIp(selRow);
        }
    )
}

/* IP 정보 수정 */
function updateAllowedIp(selRow){
    if (isLoading) return; // 중복 실행 방지
    isLoading = true;

    const no = grid1.getValue(selRow, 'no');
    const seq = grid1.getValue(selRow, 'seq');
    const description = grid1.getValue(selRow, 'description');
    const ip = grid1.getValue(selRow, 'ip');
    const useFlag = grid1.getValue(selRow, 'useFlag');

    // 초기 데이터 변경 감지
    const beforeData = ORIGINAL_IP_MAP.find(function (item, index) {
        return item.seq === seq;
    });

    // 변경값과 이전값 체크
    if(
        `${beforeData.description}`     ===     description &&
        `${beforeData.ip}`              ===     ip  &&
        `${beforeData.useFlag}`         ===     String(useFlag)
    ) {
        popupOpenDialog('error', '변동사항이 없습니다.', 2000);
        isLoading = false;
        return;
    }

    // 필수값 입력 확인
    if (!validateForm(description)) {
        popupOpenDialog('error', 'ip 설명 은 필수 입력항목입니다.', 2000);
        $('#ip_description').focus();
        isLoading = false;
        return;
    }

    // 필수값 입력 확인
    if (!validateForm(ip)){
        popupOpenDialog('error', 'ip 는 필수 입력항목입니다.', 2000);
        $('#allowed_ip').focus();
        isLoading = false;
        return;
    }

    // IPv4 형식 검증
    if(!validateIpv4(ip)) {
        popupOpenDialog('error', '옳바르지 않은 IP 형식입니다.', 2000);
        $('#allowed_ip').focus();
        isLoading = false;
        return;
    }

    const udtData = {
        no : no,
        seq : seq,
        description : description,
        ip : ip,
        useFlag : useFlag
    }

    showLoadingSpinner();
    $.ajax({
        url         : '/api/control/allowedIp/update',
        method      : 'PUT',
        contentType : 'application/json; charset=utf-8',
        data        : JSON.stringify(udtData),
        dataType    : 'json',

        success : function (response){
            if (response.status === 'success'){
                popupOpenDialog('info', response.message, 2000);
                getAllowedIpList(false, 0);
                $('#popup_frame').removeClass('on');
            } else {
                popupOpenDialog('error', response.message, 2000);
            }
            hideLoadingSpinner();
        },
        error : function(xhr, status, error){
            const res = JSON.parse(xhr.responseText);
            const message = res.message || "";

            // 서버측의 에러 메세지 그대로 팝업처리
            popupOpenDialog('error', message, 2000);
            hideLoadingSpinner();
        },
        complete : function (){
            clearContents();
            clearSearchContents();
            isLoading = false;
        }
    });
}

/* IP 정보 삭제 팝업 */
function confirmDeleteAllowedIp(selRow) {
    showConfirmModal(
        "정말로 삭제하시겠습니까?",
        function () {
            deleteAllowedIp(selRow);
        }
    )
}

/* IP 정보 삭제 */
function deleteAllowedIp(selRow){
    if (isLoading) return; // 중복 실행 방지
    isLoading = true;

    const no = grid1.getValue(selRow, 'no');
    const seq = grid1.getValue(selRow, 'seq');
    const description = grid1.getValue(selRow, 'description');
    const ip = grid1.getValue(selRow, 'ip');
    const useFlag = grid1.getValue(selRow, 'useFlag');

    const delData = {
        no : no,
        seq : seq,
        description : description,
        ip : ip,
        useFlag : useFlag
    }

    showLoadingSpinner();
    $.ajax({
        url         : '/api/control/allowedIp/delete',
        method      : 'DELETE',
        contentType : 'application/json; charset=utf-8',
        data        : JSON.stringify(delData),
        dataType    : 'json',

        success : function (response){
            if (response.status === 'success'){
                popupOpenDialog('info', response.message, 2000);
                getAllowedIpList(false, 0);
                $('#popup_frame').removeClass('on');
            } else {
                popupOpenDialog('error', response.message, 2000);
            }
            hideLoadingSpinner();
        },
        error : function(xhr, status, error){
            const res = JSON.parse(xhr.responseText);
            const message = res.message || "";

            // 서버측의 에러 메세지 그대로 팝업처리
            popupOpenDialog('error', message, 2000);
            hideLoadingSpinner();
        },
        complete : function (){
            clearContents();
            clearSearchContents();
            isLoading = false;
        }
    });
}

/* 초기화 */
function clearContents(){
    $('#ip_description').val('');
    $('#allowed_ip').val('');
    selectedRow = undefined;
}

/* 검색 관련 초기화 */
function clearSearchContents(){
    $('#s_ip_description').val('');
    $('#s_allowed_ip').val('');
    $('#s_create_user_id').val('');
    $('#s_update_user_id').val('');
}

/* 사용자 토글 렌더 */
class CustomToggleRenderer {
    constructor(props) {
        const el = document.createElement('label');
        el.className = "switch";
        el.innerHTML = `
            <input type="checkbox" ${props.value ? 'checked' : ''}>
            <span class="slider round"></span>
        `;

        this.el = el;

        // 이벤트 리스너 추가
        this.el.querySelector('input').addEventListener('change', (e) => {
            const newValue = e.target.checked ? 1 : 0;
            props.grid.setValue(props.rowKey, props.columnInfo.name, newValue);
        });
    }

    getElement() {
        return this.el;
    }

    render(props) {
        this.el.querySelector('input').checked = props.value;
    }
}

/* 사용자 정의 에디터박스 */
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

        // Input box 생성
        const {maxLength} = props.columnInfo.editor.options;
        const el = document.createElement('input');

        el.style.textAlign = "center";
        el.maxLength = maxLength;
        el.value = String(props.value);
        el.type = 'text';

        wrapper.appendChild(el);
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

/* 그리드 편집 모드 강제 종료 */
function exitGridFocus() {
    grid1.finishEditing();  // 에디터 모드 종료
    grid1.blur();           // 포커스까지 제거
}

/* IP ipv4 형식인지 유효성 검증 */
function validateIpv4(ip) {
    const SIMPLE_IP_REGEX = /^\d+(\.\d+){3}$/;
    return SIMPLE_IP_REGEX.test(String(ip).trim());
}