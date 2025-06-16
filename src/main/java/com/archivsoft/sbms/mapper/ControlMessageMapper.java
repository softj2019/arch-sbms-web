package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.ControlMessageDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface ControlMessageMapper {
    // 비상메시지 리스트 조회
    List<ControlMessageDTO> getMsgList(ControlMessageDTO messageDTO);

    // 비상메시지 데이터 등록
    void createMessage(ControlMessageDTO messageDTO);

    // 비상메시지 수정
    void updateMsg(ControlMessageDTO messageDTO);
}
