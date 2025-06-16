package com.archivsoft.sbms.mapper;

import com.archivsoft.sbms.dto.CommandDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CommandMapper {
    // command 리스트 조회
    List<CommandDTO> getShallList();

    // command 등록
    void addShall(CommandDTO commandDTO);
}

