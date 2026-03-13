package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.NetworkEventLogDTO;
import com.archivsoft.sbms.dto.NetworkOutageLogDTO;
import com.archivsoft.sbms.dto.TerminalNetworkStatusDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TerminalNetworkMapper {
    void upsertNetworkStatus(TerminalNetworkStatusDTO statusDTO);

    void insertNetworkEvent(NetworkEventLogDTO eventLogDTO);

    void insertNetworkOutageLog(NetworkOutageLogDTO outageLogDTO);

    void deleteOldNetworkOutageLogs(@Param("terminalId") String terminalId, @Param("retainCount") int retainCount);

    List<TerminalNetworkStatusDTO> getNetworkStatusesByTerminalIds(@Param("terminalIds") List<String> terminalIds);

    List<NetworkEventLogDTO> getNetworkEventsByTerminalIds(@Param("terminalIds") List<String> terminalIds);

    List<NetworkEventLogDTO> getNetworkEventsByTerminalId(@Param("terminalId") String terminalId);

    List<NetworkOutageLogDTO> getNetworkOutageLogsByTerminalId(@Param("terminalId") String terminalId);
}
