package com.archivsoft.sbms.repository;

import com.archivsoft.sbms.entity.Rmmenu;
import com.archivsoft.sbms.entity.RmmenuId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface RmmenuRepository extends JpaRepository<Rmmenu, RmmenuId> {
    /* 권한별 상위메뉴 가져오기 */
    @Query("SELECT     r                            " +
           "FROM       Rmmenu r                     " +
           "WHERE      r.useFlag        = :useFlag  " +
           "AND        r.menuDivCd      = '1'       " +
           "AND        r.menuGrantLevl <= :userRole " +
           "ORDER BY   r.menuSortSno                " )
    List<Rmmenu> getUpperMenu(@Param("useFlag") String useFlag, @Param("userRole") String userRole);

    List<Rmmenu> findByUseFlagAndUpperMenuIdOrderByMenuSortSno(String useFlag, String upperMenuId);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END " +
            "FROM tb_rmmenu m " +
            "INNER JOIN tb_rmmenulink l ON m.menu_link_sno = l.menu_link_sno " +
            "WHERE CAST(m.menu_grant_levl AS SIGNED) <= :userRoleId " +
            "AND l.link_url LIKE :currentUri",
            nativeQuery = true)
    Integer myPermissionUrlList(@Param("userRoleId") int userRoleId, @Param("currentUri") String currentUriPattern);
}