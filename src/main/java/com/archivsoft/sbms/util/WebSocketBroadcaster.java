package com.archivsoft.sbms.util;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
@Component
public class WebSocketBroadcaster {
    private static SimpMessagingTemplate messagingTemplate;

    public WebSocketBroadcaster(SimpMessagingTemplate template) {
        messagingTemplate = template;
    }

    public static void broadcast(String message) {
        messagingTemplate.convertAndSend("/topic/udp/data", message);
    }
}
