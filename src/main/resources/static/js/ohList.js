var contextPath = $('#contextPathHolder').attr('data-contextPath') ? $('#contextPathHolder').attr('data-contextPath') : '';
function showLoading() {
    document.getElementById('loading').style.display = '';
}
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}
function formatDate(dateString) {
    if (dateString == '99991231') {
        return '현재';
    } else {
        // 8자리 문자열에서 연도, 월, 일을 분리
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);

        // 형식에 맞게 조합하여 반환
        return `${year}-${month}-${day}`;
    }
}
function addSelectClass (element, deptSn) {
    // 모든 선택된 항목에서 'selected' 클래스를 제거
    const selectedItems = document.querySelectorAll('.tree li span.selected');
    selectedItems.forEach(item => {
        item.classList.remove('selected');
    });

    if (element) {
        // 클릭한 항목에 'selected' 클래스를 추가
        element.classList.add('selected');
    } else {
        const items = document.querySelectorAll('.tree li span');
        items.forEach(item => {
            if (item.getAttribute('dept-sn') == deptSn) item.classList.add('selected');
        });
    }
}
function callDeptList(selectedDeptSn) {
    $.ajax({
        url: '/dept/list/v2',
        type: 'POST',
        data: {
            year: $('.year-select').val(),
            month: $('.month-select').val()
        },
        success: function(response) {

            const {deptList, upperDeptList} = response;
            let html = '<div class="org-chart"><ul class="level-0">';

            // 최상위 조직 찾기
            function findTopDepartments(upperDeptList) {
                return upperDeptList.filter(dept => !dept.hisDeptUpperCode);
            }

            // 특정 상위 조직에 소속된 하위 부서 찾기
            function findChildDepartments(parentId, deptList) {
                return deptList.filter(dept => dept.hisDeptUpperCode === parentId);
            }

            // 특정 상위 조직에 소속된 상위 부서 찾기
            function findChildUpperDepartments(parentId, upperDeptList) {
                return upperDeptList.filter(dept => dept.hisDeptUpperCode === parentId);
            }

            // 재귀적으로 조직도를 구성하는 함수
            function buildChart(parentId, level = 1) {
                let upperNodes = findChildUpperDepartments(parentId, upperDeptList);
                let childNodes = findChildDepartments(parentId, deptList);

                if (upperNodes.length > 0 || childNodes.length > 0) {
                    html += `<ul class="level-${level}">`;

                    for (const upperNode of upperNodes) {
                        html += `<li><div class="node">${upperNode.deptName}</div>`;
                        buildChart(upperNode.deptSn, level + 1);
                        html += '</li>';
                    }

                    for (const childNode of childNodes) {
                        html += `<li>
                                    <div class="node" 
                                          onClick="clickShowContent(this, '${childNode.deptSn}', '${childNode.hisDeptName.replace(/'/g, "\\'")}', '${childNode.hisDeptUpperName.replace(/'/g, "\\'")}', '${encodeURIComponent(childNode.hisDeptWork)}', '${childNode.hisDeptStartDate}', '${childNode.hisDeptEndDate}', '${childNode.hisIdx}')">
                                         ${childNode.hisDeptName}
                                    </div>
                                 </li>`;
                    }

                    html += '</ul>';
                }
            }


            // 최상위 부서부터 시작
            const topDepartments = findTopDepartments(upperDeptList);
            for (const topDept of topDepartments) {
                html += `<li><div class="node">${topDept.deptName}</div>`;
                buildChart(topDept.deptSn);
                html += '</li>';
            }

            html += '</ul></div>';

            // 결과 렌더링

            const ohDataList = document.getElementById("ohDataList")
            if(ohDataList){
                ohDataList.innerHTML = html;
            }

            let htmlO = '';
            for (const upperDept of upperDeptList) {
                htmlO += "<li>";
                htmlO += "<span class=\"first-child\">"+upperDept.deptName+"</span>";
                htmlO += "<ul>";
                for (const dept of deptList) {
                    if (dept.hisDeptUpperCode == upperDept.deptSn) {
                        //const work = dept.hisDeptWork.replaceAll('\n', '<br>');
                        const work = encodeURIComponent(dept.hisDeptWork);
                        htmlO += "<li>";
                        htmlO += "<span dept-sn="+dept.deptSn+" onClick=\"showContent(this, '"+dept.deptSn+"', '"+dept.hisDeptName+"','"+dept.hisDeptUpperName+"','"+work+"','"+dept.hisDeptStartDate+"','"+dept.hisDeptEndDate+"', '"+dept.hisIdx+"')\">"+dept.hisDeptName+"</span>"
                        htmlO += "</li>";
                    }
                }
                htmlO += "</ul>";
                htmlO += "</li>";
            }
            clearContent();
            const deptTree = document.getElementById("dept-tree")
            if(deptTree){
                deptTree.innerHTML = htmlO;
            }
            let firstDept = deptList[0];

            if (selectedDeptSn) {
                firstDept = deptList.find(item => item.deptSn == selectedDeptSn);
            }
            const firtDeptWork = encodeURIComponent(firstDept.hisDeptWork);

            showContent(null, firstDept.deptSn, firstDept.hisDeptName, firstDept.hisDeptUpperName, firtDeptWork
                , firstDept.hisDeptStartDate
                , firstDept.hisDeptEndDate
                , firstDept.hisIdx) // 처음 부서 선택하기

        },
        error: function (xhr, status, error) {
            console.error('Error:', error); // 오류 처리
        },
        beforeSend: function (xhr) {
            showLoading();
        },
        complete: function () {
            hideLoading();
        }
    });
}
function removeSelectClass () {
    // 모든 선택된 항목에서 'selected' 클래스를 제거
    const selectedItems = document.querySelectorAll('.tree li span.selected');
    selectedItems.forEach(item => {
        item.classList.remove('selected');
    });
}
function clearContent() {

    $('#actionIdx').val("");
    $('#actionDeptSn').val("");
    document.getElementById("actionType").value = '';

    removeSelectClass();

    document.getElementById("pdept1").innerHTML = '';
    document.getElementById("pdept2").innerHTML = '';
    document.getElementById("cdeptName").value = '';
    //document.getElementById("cdeptDate").innerHTML = '';
    document.getElementById("cdeptWork").value = '';
}
let originalNameStr = "";
let originalWorkStr = "";

function ableModify() {
    originalNameStr = document.getElementById("cdeptName").value;
    originalWorkStr = document.getElementById("cdeptWork").value;

    document.getElementById("cdeptName").removeAttribute('disabled');
    document.getElementById("cdeptWork").removeAttribute('disabled');

    document.getElementById("cdeptName").focus();

    //document.getElementById("cdeptWork").focus();
    document.getElementById("btnModify").style.display = 'none';
    document.getElementById("btnModifyOk").style.display = 'block';
    document.getElementById("btnModifyCancel").style.display = 'block';
}
function cancelModify() {

    // 기존데이터로 원복
    document.getElementById("cdeptName").value = originalNameStr;
    document.getElementById("cdeptWork").value = originalWorkStr;

    document.getElementById("cdeptName").setAttribute('disabled', '');
    document.getElementById("cdeptWork").setAttribute('disabled', '');

    document.getElementById("btnModify").style.display = 'block';
    document.getElementById("btnModifyOk").style.display = 'none';
    document.getElementById("btnModifyCancel").style.display = 'none';
}
function togglePopup() {

    const popUp = document.getElementById("popupOveray");
    const popupOverlay = document.querySelector('.popup_frame');
    if (popUp.style.display === "none" || popUp.style.display === "") {
        if (popupOverlay) {
            openPopup()
        }
    } else {
        if (popupOverlay) {
            closePopup()
        }
    }
}
function showContent(element, deptSn, deptName, uppername, work, deptStartDate, deptEndDate, hisIdx) {

    cancelModify();
    $('#actionIdx').val(hisIdx);
    $('#actionDeptSn').val(deptSn);

    callDeptNameList(deptSn);

    addSelectClass(element, deptSn);

    document.getElementById("pdept1").innerHTML = uppername;
    document.getElementById("pdept2").innerHTML = deptName;
    document.getElementById("cdeptName").value = deptName;
    //document.getElementById("cdeptDate").innerHTML = formatDate(deptStartDate) +" ~ "+ formatDate(deptEndDate);
    //document.getElementById("cdeptWork").value = work.replaceAll('\n', '<br>');
    document.getElementById("cdeptWork").value = decodeURIComponent(work);
}
function clickShowContent(element, deptSn, deptName, uppername, work, deptStartDate, deptEndDate, hisIdx) {
    console.log(element)
    togglePopup();
    cancelModify();
    $('#actionIdx').val(hisIdx);
    $('#actionDeptSn').val(deptSn);

    callDeptNameList(deptSn);

    addSelectClass(element, deptSn);

    document.getElementById("pdept1").innerHTML = uppername;
    document.getElementById("pdept2").innerHTML = deptName;
    document.getElementById("cdeptName").value = deptName;
    //document.getElementById("cdeptDate").innerHTML = formatDate(deptStartDate) +" ~ "+ formatDate(deptEndDate);
    //document.getElementById("cdeptWork").value = work.replaceAll('\n', '<br>');
    document.getElementById("cdeptWork").value = decodeURIComponent(work);
}
let currentDeptPage = 1; // 현재 페이지
const itemsPerPage = 10; // 페이지 당 항목 수
function callDeptNameList (selDeptSn) {

    $.ajax({
        url: contextPath + '/dept/name/list',
        type: 'GET',
        data: {
            deptSn: selDeptSn
        },
        success: function(response) {
            const deptNameList = response;
            renderDeptNameHistory(deptNameList, currentDeptPage);
            renderDeptPagination(deptNameList.length, currentDeptPage);

        },
        error: function(xhr, status, error) {
            console.error('Error:', error); // 오류 처리
        },
        beforeSend: function( xhr ) {
            showLoading();
        },
        complete: function() {
            hideLoading();
        }
    });
}

function renderDeptNameHistory(deptNameList, page) {
    let startIdx = (page - 1) * itemsPerPage;
    let endIdx = startIdx + itemsPerPage;
    let paginatedList = deptNameList.slice(startIdx, endIdx);

    let html = '';
    for (let i = 0; i < paginatedList.length; i++) {
        const dept = paginatedList[i];

        html += "<tr>";
        html += `<td>${startIdx + i + 1}</td>`;
        html += `<td>${dept.hisDeptName}</td>`;
        html += `<td>${formatDate(dept.hisDeptStartDate)}</td>`;
        html += `<td>${formatDate(dept.hisDeptEndDate)}</td>`;
        html += "</tr>";
    }

    document.getElementById("cdeptNameHistory").innerHTML = html;
}

function renderDeptPagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let paginationHtml = `<div class="pagination">`;

    if (currentPage > 1) {
        paginationHtml += `<button onclick="changeDeptPage(${currentPage - 1})">이전</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button onclick="changeDeptPage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }

    if (currentPage < totalPages) {
        paginationHtml += `<button onclick="changeDeptPage(${currentPage + 1})">다음</button>`;
    }

    paginationHtml += `</div>`;

    const paginationContainer = document.getElementById("deptPagination");
    if (paginationContainer) {
        paginationContainer.innerHTML = paginationHtml;
    }
}

function changeDeptPage(page) {
    currentDeptPage = page;
    callDeptNameList($('#actionDeptSn').val());
}
$(document).ready(function() {

    callDeptList(); // 초기 호출

    $('#dateForm').on('submit', function(e) {
        e.preventDefault(); // 기본 폼 제출 막기

        callDeptList();
    });
})
document.addEventListener("click", function (event) {
    // 클릭된 요소가 closePopupButton인지 확인
    if (event.target && event.target.id === "closePopupButton") {
        closePopup();
    }
});
function openPopup() {
    const popupOverlay = document.querySelector('.popup_frame');
    if (popupOverlay) {
        popupOverlay.classList.add('on');

    }
}
function closePopup() {
    const popupOverlay = document.querySelector('.popup_frame');
    if (popupOverlay) {
        popupOverlay.classList.remove('on');
    }
}