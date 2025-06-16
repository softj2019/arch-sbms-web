package com.archivsoft.sbms.controller.api;

import com.archivsoft.sbms.dto.CommandDTO;
import com.archivsoft.sbms.service.CommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/command")
public class CommandRestController {
    private final CommandService commandService;

    // command 명령어 조회
    @GetMapping("shallList")
    public List<CommandDTO> getShallList(){
        return commandService.getShallList();
    };

    // command 등록
    @PostMapping("addShall")
    public boolean addShall(CommandDTO commandDTO) {
        try{
            commandService.addShall(commandDTO);
            return true;
        } catch (Exception e){
            return false;
        }
    };
}
