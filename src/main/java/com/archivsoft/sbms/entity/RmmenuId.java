package com.archivsoft.sbms.entity;

import lombok.*;
import org.hibernate.Hibernate;
import org.hibernate.annotations.Comment;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Embeddable
public class RmmenuId implements Serializable {
    private static final long serialVersionUID = 8092339019611269208L;
    @Comment("기록관ID")
    @Column(name = "record_center_id", nullable = false, length = 7)
    private String recordCenterId;

    @Comment("메뉴ID")
    @Column(name = "menu_id", nullable = false, length = 10)
    private String menuId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        RmmenuId entity = (RmmenuId) o;
        return Objects.equals(this.menuId, entity.menuId) &&
                Objects.equals(this.recordCenterId, entity.recordCenterId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(menuId, recordCenterId);
    }

}