package com.fitness.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    @Value("${services.user-service-url}")
    private String userServiceUrl;

    @Value("${services.activity-service-url}")
    private String activityServiceUrl;

    @Value("${services.ai-service-url}")
    private String aiServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {

        return builder.routes()
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .uri(userServiceUrl))
                .route("activity-service", r -> r
                        .path("/api/activities/**")
                        .uri(activityServiceUrl))
                .route("other-service", r -> r
                        .path("/api/recommendations/**")
                        .uri(aiServiceUrl))
                .build();
    }
}
