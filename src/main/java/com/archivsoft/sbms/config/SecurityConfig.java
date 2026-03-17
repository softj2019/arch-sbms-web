package com.archivsoft.sbms.config;

import com.archivsoft.sbms.service.ArchUserDetailService;
import com.archivsoft.sbms.service.CommonService;
import com.archivsoft.sbms.service.MenuService;
import com.archivsoft.sbms.util.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Autowired
    private JwtBlacklistService jwtBlacklistService;
    @Autowired
    private CommonService commonService;
    @Autowired
    private IpMacSecurityFilter ipMacSecurityFilter;

    private final ArchUserDetailService userDetailService;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(ArchUserDetailService userDetailService, JwtTokenUtil jwtTokenUtil, UserDetailsService userDetailsService, JwtBlacklistService jwtBlacklistService) {
        this.userDetailService = userDetailService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers(
                "/css/**",
                "/js/**",
                "/lib/**",
                "/images/**",
                "/font/**",
                "/favicon.ico",
                "/webjars/**",
                "/static/**",
                "/**/*.css",
                "/**/*.js",
                "/**/*.woff2",
                "/**/*.ttf",
                "/**/*.map"
        );
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.headers()
                .cacheControl().disable()
                .and()
                .cors().configurationSource(corsConfigurationSource())
                .and()
                .csrf().disable()
                .authorizeRequests()
                .antMatchers("/webjars/**").permitAll()
                .antMatchers("/weather").permitAll()
                .antMatchers("/login").permitAll()
                .antMatchers("/denied").permitAll()
                .antMatchers("/api/**").permitAll()
                .antMatchers("/uploads/**").permitAll()
                .antMatchers("/monitoring/hid/**").permitAll()
                .antMatchers("/monitoring/command/**").permitAll()
                .antMatchers("/websocket/**", "/sockjs-websocket/**").permitAll()
                .antMatchers("/topic/**").permitAll()
                .anyRequest().authenticated()
                .and()
                .exceptionHandling()
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendRedirect("/login");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"status\":\"unauthorized\"}");
                })
                .and()
                .headers().frameOptions().disable()
                .and()
                .addFilterBefore(ipMacSecurityFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenUtil, userDetailService, jwtBlacklistService),
                        UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedHeader("*"); // 모든 헤더 허용
//        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8099", "http://175.45.215.53"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // 특정 HTTP 메서드만 허용
        configuration.addAllowedOrigin("*"); // 모든 출처 허용. 필요에 따라 변경
//        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true); // 자격 증명 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 엔드포인트에 대해 적용
        return source;
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}