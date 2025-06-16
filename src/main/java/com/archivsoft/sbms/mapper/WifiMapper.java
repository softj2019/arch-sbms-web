package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.WifiDTO;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
@Qualifier("mysqlSqlSessionTemplate")
public interface WifiMapper {

//    wifi 조회
    List<WifiDTO> getWifi();
}

