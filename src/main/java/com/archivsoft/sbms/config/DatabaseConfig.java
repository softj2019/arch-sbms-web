package com.archivsoft.sbms.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {
    private final ApplicationContext context;

    @Value("${mybatis.config-location}")
    private String configLocation;

    @Value("${mybatis.mapper-locations}")
    private String mapperLocations;

    @Autowired
    public DatabaseConfig(final ApplicationContext context) {
        this.context = context;
    }

    @Bean(name = "sqlSession")
    public SqlSessionFactory sqlSession(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(dataSource);
        bean.setConfigLocation(context.getResource(configLocation));
        bean.setMapperLocations(context.getResources(mapperLocations));
        return bean.getObject();
    }
}