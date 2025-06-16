package com.archivsoft.sbms.entity;

import lombok.*;
import org.hibernate.annotations.Comment;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
//@Comment("메뉴관리")
@Entity
@Table(name = "tb_rmmenu")
public class Rmmenu implements Serializable {
    private static final long serialVersionUID = -3434275590188604894L;
    @EmbeddedId
    private RmmenuId id;

    @Comment("메뉴명")
    @Column(name = "menu_nm", nullable = false, length = 100)
    private String menuNm;

    @Comment("상위메뉴ID")
    @Column(name = "upper_menu_id", length = 10)
    private String upperMenuId;

    @Comment("메뉴구분코드")
    @Column(name = "menu_div_cd", nullable = false, length = 1)
    private String menuDivCd;

    @Comment("메뉴정렬순서")
    @Column(name = "menu_sort_sno", nullable = false)
    private Short menuSortSno;

    @Comment("사용여부(0:미사용,1:사용)")
    @Column(name = "use_flag", nullable = false, length = 1)
    private String useFlag;

    @OneToOne(fetch = FetchType.EAGER)
    @Comment("메뉴연결대상순번")
    @JoinColumn(name = "menu_link_sno")
    private Rmmenulink menuLinkSno;

    @Comment("메뉴권한레벨")
    @Column(name = "menu_grant_levl", length = 1)
    private String menuGrantLevl;

    @Comment("등록일자")
    @Column(name = "work_dtime", length = 14)
    private String workDtime;

    @Transient
    private List<Rmmenu> subMenus;

    public String getMenuId() {
        return this.id != null ? this.id.getMenuId() : null;
    }
}