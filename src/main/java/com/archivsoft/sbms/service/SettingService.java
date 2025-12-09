package com.archivsoft.sbms.service;

import com.archivsoft.sbms.dto.SettingDTO;
import com.archivsoft.sbms.mapper.SettingMapper;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.ExecutorType;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingService {
    private final SettingMapper settingMapper;
    @Autowired
    private SqlSessionFactory sqlSessionFactory;
    
    
    // kyh서비스, 수정 불필요로 보임, 그대로 리턴만 하는 방식으로 컨트롤러단에서 처리 함
    /**
     * 기본 설정값 조회
     * */
    public List<SettingDTO> getSetting() {
        try{
            return settingMapper.getSetting();
        } catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    // kyh서비스, 추가, 모델링 되는 테이블의 허용 IP 가져와서 List<SettingDTO> getSetting() 와 같이 반환하는 메소드 추가 필요할지 검토

    // kyh서비스, 수정 필요, 불필요한 코드 제거, 화면단에서 허용 IP 로우 자체를 빼버리면 로직에는 문제 없을듯
    /**
     * 기본 설정값 수정
     * */
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateSetting(List<Map<String,Object>> settingMapList) {
        Map<Long, SettingDTO> settingMap = new HashMap<>();
        String lastDescription = null;

        try (SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH)) { // Open session in BATCH mode
            SettingMapper mapper = session.getMapper(SettingMapper.class);
            for (Map<String, Object> setting : settingMapList) {
                Long id = Long.parseLong(setting.get("id").toString());
                String optionKey = setting.get("optionKey").toString();
                String value = setting.get("value") != null
                                                     ? setting.get("value").toString()
                                                     : null;

                // ID 기준으로 기존 객체 가져오기 (없으면 새로 생성)
                SettingDTO settingDTO = settingMap.getOrDefault(id, new SettingDTO());
                settingDTO.setId(id);

                // description 처리 (null이면 이전 값 사용)
                String description = setting.get("description") != null
                                                                 ? setting.get("description").toString()
                                                                 : lastDescription;

                settingDTO.setDescription(description);
                lastDescription = description;

                // optionKey에 따라 option1, option2, option3 값 설정
                switch (optionKey) {
                    case "option1":
                        settingDTO.setOption1(setting.get("option").toString());
                        settingDTO.setValue1(value);
                        break;
                    case "option2":
                        settingDTO.setOption2(setting.get("option").toString());
                        settingDTO.setValue2(value);
                        break;
                    case "option3":
                        settingDTO.setOption3(setting.get("option").toString());
                        settingDTO.setValue3(value);
                        break;
                }
                settingMapper.updateSetting(settingDTO);
            }

            return true;
        } catch (Exception e) {
            throw new RuntimeException("일반 설정 매핑 에러", e);
        }
    }

    // kyh서비스, 수정 필요, 리턴방식은 그대로 split 로직 제거
    // 접근가능 ip 가져오기
    public List<String> getIp() {
        String ipString = settingMapper.getIp();
        if (ipString == null || ipString.trim().isEmpty()) {
            return Arrays.asList(); // 빈 리스트 반환
        }
        return Arrays.stream(ipString.split("\\s*,\\s*"))
                .collect(Collectors.toList());
    }
}
