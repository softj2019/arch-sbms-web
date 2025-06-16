package com.archivsoft.sbms.service;

import com.archivsoft.sbms.entity.SystemUserEntity;
import com.archivsoft.sbms.repository.SystemUserRepository;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ArchUserDetailService implements UserDetailsService {
    private final SystemUserRepository systemUserRepository;
    private final MessageSource messageSource;

    public ArchUserDetailService(SystemUserRepository systemUserRepository, MessageSource messageSource) {
        this.systemUserRepository = systemUserRepository;
        this.messageSource = messageSource;
    }

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
        SystemUserEntity user = this.systemUserRepository.findUserByUserId(id);
        if (user == null) {
            // 로케일 기반 예외 메시지 처리
            String errorMessage = messageSource.getMessage(
                    "error.invalid.user.info",
                    null,
                    "User not found with ID: " + id, // 기본 메시지
                    LocaleContextHolder.getLocale()
            );
            throw new UsernameNotFoundException(errorMessage);
        }

        return user;
    }
}
