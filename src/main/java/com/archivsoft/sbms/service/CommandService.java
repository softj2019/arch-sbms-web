package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.CommandDTO;
import com.archivsoft.sbms.mapper.CommandMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommandService {
    private final CommandMapper commandMapper;

    // command 리스트 조회
    public List<CommandDTO> getShallList(){
        return commandMapper.getShallList();
    }

    // command 등록
    public void addShall(CommandDTO commandDTO) {
        commandMapper.addShall(commandDTO);
    }
}
