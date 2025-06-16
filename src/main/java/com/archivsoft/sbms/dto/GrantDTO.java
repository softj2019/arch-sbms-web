package com.archivsoft.sbms.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class GrantDTO {
    private String recordCenterId;      // 기록관 ID
    private String menuId;              // 메뉴 ID
    private String menuNm;              // 메뉴명
    private String upperMenuId;         // 상위메뉴 ID
    private int    menuSortSno;         // 미뉴정렬순서
    private String useFlag;             // 사용여부(0:미사용, 1:사용)
    private String menuGrantLevl;       // 메뉴권한레벨

    private String menuDivCd;           // 메뉴구분코드
    private MenuLinkSnoDTO menuLinkSno; // 메뉴연결대상순번

    private String linkNm;              // 연결명
    private String linkImgTopOn;        // 연결이미지 상단 On  (on : level1 메뉴의 경우 상단 메뉴에 보일 이미지)
    private String linkImgTopOff;       // 연결이미지 상단 Off (off: level1 메뉴의 경우 상단 메뉴에 보일 이미지)
    private String linkImgLeft;         // 연결이미지 좌측     (level2 메뉴의 경우 좌측 메뉴에 보일 이미지)
    private String linkUrl;             // 연결url
    private String linkCss;             // 연결css
    private String helpFileNm;          // 도움말파일명

    private List<GrantDTO> submenuSeq;  // 서브메뉴 리스트

    @Setter
    @Getter
    private static class MenuLinkSnoDTO {
        private String recordCenterId;
        private String menuId;
    }

}
