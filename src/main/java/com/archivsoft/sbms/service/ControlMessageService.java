package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.ControlMessageDTO;
import com.archivsoft.sbms.dto.FacilityDTO;
import com.archivsoft.sbms.mapper.ControlMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ControlMessageService {
    private final ControlMessageMapper messageMapper;

    /**
     * 비상메시지 리스트 조회
     * */
    public List<ControlMessageDTO> getMsgList() {
        try{
            ControlMessageDTO messageDTO = new ControlMessageDTO();
            return messageMapper.getMsgList(messageDTO);
        } catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    /**
     * 터미널 등록에 따른 비상메시지 데이터 등록
     * */
    @Transactional(rollbackFor = Exception.class)
    public Boolean createMessage(FacilityDTO facilityDTO, String userId){
        try{
            ControlMessageDTO messageDTO = new ControlMessageDTO();
            messageDTO.setTerminalId(facilityDTO.getTerminalId());
            messageDTO.setTerminalName(facilityDTO.getTerminalName());
            messageDTO.setContent("");
            messageDTO.setEditorId(userId);

            messageMapper.createMessage(messageDTO);
            return true;
        } catch (Exception e){
            throw new RuntimeException("비상메시지 정류장 데이터 등록 실패", e);
        }
    }

    /**
     * 비상메시지 수정
     * */
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateMessage(ControlMessageDTO messageDTO){
        try{
            List<String> tidList = messageDTO.getTerminalIdList();
            if (tidList == null || tidList.isEmpty()){
                return false;
            } else {
                messageMapper.updateMsg(messageDTO);
                return true;
            }
        } catch (Exception e){
            throw new RuntimeException("비상메시지 수정 실패", e);
        }
    }
}