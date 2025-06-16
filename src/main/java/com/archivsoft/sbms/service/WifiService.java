package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.WifiDTO;
import com.archivsoft.sbms.mapper.WifiMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WifiService {
    private final WifiMapper wifiMapper;

    public WifiService(@Qualifier("mysqlSqlSessionTemplate") WifiMapper wifiMapper) {
        this.wifiMapper = wifiMapper;
    }

    /**
     * wifi 조회
     * */
    public List<WifiDTO> getWifi(){
        try{
            return wifiMapper.getWifi();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
