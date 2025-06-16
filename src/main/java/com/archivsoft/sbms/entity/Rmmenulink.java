package com.archivsoft.sbms.entity;

import lombok.*;
import org.hibernate.annotations.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
//@Comment("메뉴연결정보 : 메뉴 연결 정보를 관리하는 테이블")
@Entity
@Table(name = "tb_rmmenulink")
public class Rmmenulink implements Serializable {
    private static final long serialVersionUID = -8485663337822368076L;
    @Id
    @Comment("메뉴연결대상순번")
    @Column(name = "menu_link_sno", nullable = false)
    private Long id;

    @Comment("메뉴구분코드")
    @Column(name = "menu_div_cd", nullable = false, length = 1)
    private String menuDivCd;

    @Comment("연결명")
    @Column(name = "link_nm", nullable = false, length = 100)
    private String linkNm;

    @Comment("연결이미지상단ON : 1레벨 메뉴의 경우 상단메뉴에 보일 이미지")
    @Column(name = "link_img_top_on", length = 100)
    private String linkImgTopOn;

    @Comment("연결이미지상단OFF:1레벨 메뉴의 경우 상단메뉴에 보일 이미지")
    @Column(name = "link_img_top_off", length = 100)
    private String linkImgTopOff;

    @Comment("연결이미지좌측:2레벨 메뉴의 경우 좌측메뉴에 보일 이미지")
    @Column(name = "link_img_left", length = 100)
    private String linkImgLeft;

    @Comment("연결URL")
    @Column(name = "link_url", length = 100)
    private String linkUrl;

    @Comment("연결CSS")
    @Column(name = "link_css", length = 100)
    private String linkCss;

    @Comment("도움말파일명")
    @Column(name = "help_file_nm", length = 300)
    private String helpFileNm;

}