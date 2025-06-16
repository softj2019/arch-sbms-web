/* 전역변수 */
let grid1;

$(document).ready(function(){
    initializeGrid();
    getWeatherData();
});

/* 그리드 */
function initializeGrid() {
    const gridElement = document.getElementById("grid_table");
    if (!gridElement) {
        return;
    }

    grid1 = new tui.Grid({
        el      : document.getElementById("grid_table"),
        scrollX : true,
        scrollY : false,
        // rowHeaders: ['checkbox'],
        columns: [
            { header: 'id'			, name: 'id'				, editor: 'text', align: 'left', hidden:true},
            { header: '표시 이름'	, name: 'displayName'		, editor: 'text', align: 'left' },
            { header: '표시 설명'	, name: 'displayDescription', editor: 'text', align: 'left' },
            {
                header  : '사용 여부',
                name    : 'isActive',
                align   : 'center',
                renderer    : {
                    type    : CustomToggleRenderer
                }
            },
            { header: '현재 값'	, name: 'currentValue', editor: 'text', align: 'center' },
        ],
        columnOptions: {
            resizable: true,
            minWidth: 80
        },
        data: []
    });
    tuiGridApplyTheme();
}

// api 데이터 조회
function getWeatherData(){
    if (!grid1) {
        console.error("그리드가 초기화되지 않았습니다.");
        return;
    }
    $.ajax({
        url: '/api/air/status',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            if (!Array.isArray(data)) {
                console.error('데이터 오류:', data);
                return;
            }

            let gridData = data.map((item) => ({
                id : item.id,
                displayName : item.displayName,
                displayDescription : item.displayDescription,
                isActive : item.isActive,
                currentValue : item.currentValue
            }));

            grid1.resetData(gridData);
        },
        error: function(xhr, status, error) {
            console.error('데이터 로드 오류:', xhr);
            console.error('데이터 로드 오류:', status);
            console.error('데이터 로드 오류:', error);
        }
    });
}

// TUI Grid 커스텀 토글 버튼 렌더러
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

            // API 요청하여 상태 업데이트
            fetch(`/api/air/status/${props.grid.getValue(props.rowKey, 'id')}`, {
                method  : "PUT",
                headers : { "Content-Type": "application/json" },
                body    : JSON.stringify({
                    displayName         : props.grid.getValue(props.rowKey, 'displayName'),
                    displayDescription  : props.grid.getValue(props.rowKey, 'displayDescription'),
                    isActive            : newValue
                })
            })
            .then(response => response.json())
            .then(result => {
                console.log("업데이트 완료:", result.message);
            })
            .catch(error => console.error('업데이트 오류:', error));
        });
    }

    getElement() {
        return this.el;
    }

    render(props) {
        this.el.querySelector('input').checked = props.value;
    }
}