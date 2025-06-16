package com.archivsoft.sbms.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class UdpListenerService {
    private static final Logger logger = LoggerFactory.getLogger(UdpListenerService.class);
    private static final int PORT = 55010;
    private final ObjectMapper objectMapper = new ObjectMapper(); // ✅ Jackson ObjectMapper 추가
    public void startUdpListener() {
        new Thread(() -> {
            try (DatagramSocket socket = new DatagramSocket(PORT)) {
                logger.info("UDP 서버가 {} 포트에서 리스닝 중...", PORT);

                byte[] buffer = new byte[1024];

                while (true) {
                    DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                    socket.receive(packet);

                    byte[] receivedBytes = new byte[packet.getLength()];
                    System.arraycopy(packet.getData(), 0, receivedBytes, 0, packet.getLength());

                    // 🔹 라우터 패킷 파싱
                    Map<String, String> parsedData = parseRouterPacket(receivedBytes);

                    // 🔹 JSON 형식으로 변환 후 WebSocket으로 브로드캐스트
                    try {
                        String jsonData = objectMapper.writeValueAsString(parsedData); // ✅ JSON 변환
                        WebSocketBroadcaster.broadcast(jsonData); // ✅ JSON 포맷으로 WebSocket 브로드캐스트
                        logger.info("✅ WebSocket 전송 데이터: {}", jsonData);
                    } catch (Exception e) {
                        logger.error("❌ JSON 변환 오류", e);
                    }
                }
            } catch (Exception e) {
                logger.error("UDP 서버 오류 발생", e);
            }
        }).start();
    }

    /**
     * 라우터에서 수신한 UDP 패킷을 파싱하는 함수
     */
    private Map<String, String> parseRouterPacket(byte[] data) {
        Map<String, String> parsedData = new HashMap<>();
        ByteBuffer buffer = ByteBuffer.wrap(data);

        try {
            int index = 0;

            // 1️⃣ HEAD (1 byte)
            byte head = buffer.get(index++);
            parsedData.put("head", String.format("0x%02X", head));

            // 2️⃣ COMMAND (1 byte)
            byte command = buffer.get(index++);
            if (command != 0x40) {
                parsedData.put("error", "Invalid command received");
                return parsedData;
            }
            parsedData.put("command", String.format("0x%02X", command));

            // 3️⃣ DATA SIZE (2 bytes)
            short dataSize = buffer.getShort(index);
            index += 2;
            parsedData.put("data_size", String.valueOf(dataSize));

            // 4️⃣ S/N (TEXT, ','로 구분)
            int snEnd = index;
            while (buffer.get(snEnd) != ',') {
                snEnd++;
            }
            String deviceType = new String(data, index, snEnd - index, StandardCharsets.UTF_8).trim();
            parsedData.put("device_type", deviceType);
            index = snEnd + 1;

            // 5️⃣ CTN (4 bytes → Little-endian 변환)
            byte[] ctnBytes = new byte[4];
            System.arraycopy(data, index, ctnBytes, 0, 4);
            index += 4;

            // Little-endian으로 변환
            int ctn = ByteBuffer.wrap(ctnBytes).order(ByteOrder.LITTLE_ENDIAN).getInt();
            parsedData.put("ctn", "0" + String.format("%010d", ctn));

            // 6️⃣ IP 주소 (4 bytes)
            index += 1;
            byte[] ipBytes = new byte[4];
            System.arraycopy(data, index, ipBytes, 0, 4);
            String ipAddress = (ipBytes[0] & 0xFF) + "." + (ipBytes[1] & 0xFF) + "." + (ipBytes[2] & 0xFF) + "." + (ipBytes[3] & 0xFF);
            parsedData.put("ip_address", ipAddress);
            index += 4;

            // 7️⃣ MAC 주소 (6 bytes) → **Python 코드 기준 31번 인덱스**
            index += 1;
            byte[] macBytes = new byte[6];
            System.arraycopy(data, index, macBytes, 0, 6);
            StringBuilder macAddress = new StringBuilder();
            for (byte b : macBytes) {
                macAddress.append(String.format("%02X:", b));
            }
            parsedData.put("mac_address", macAddress.substring(0, macAddress.length() - 1));
            index += 6;

            // 8️⃣ IMEI (8 bytes) → **Python 코드 기준 38번 인덱스**
            index += 1;
            byte[] imeiBytes = new byte[8];
            System.arraycopy(data, index, imeiBytes, 0, 8);
            long imei = ByteBuffer.wrap(imeiBytes).getLong();
            parsedData.put("imei", String.valueOf(imei).substring(0, 15));
            index += 8;

            // 9️⃣ Firmware 버전 (TEXT, ','까지) → **Python 코드 기준 47번 인덱스**
            index += 1;
            int fwEnd = index;
            while (buffer.get(fwEnd) != ',') {
                fwEnd++;
            }
            String firmwareVersion = new String(data, index, fwEnd - index, StandardCharsets.UTF_8).trim();
            parsedData.put("firmware_version", firmwareVersion);
            index = fwEnd + 1;

            // 🔟 LTE 버전 (TEXT, ','까지)
            int lteEnd = index;
            while (buffer.get(lteEnd) != ',') {
                lteEnd++;
            }
            String lteVersion = new String(data, index, lteEnd - index, StandardCharsets.UTF_8).trim();
            parsedData.put("lte_version", lteVersion);
            index = lteEnd + 1;

            // 11️⃣ APN (TEXT, ','까지)
            int apnEnd = index;
            while (buffer.get(apnEnd) != ',') {
                apnEnd++;
            }
            String apn = new String(data, index, apnEnd - index, StandardCharsets.UTF_8).trim();
            parsedData.put("apn", apn);
            index = apnEnd + 1;

            // 12️⃣ LAN IP (4 bytes)
            byte[] lanIpBytes = new byte[4];
            System.arraycopy(data, index, lanIpBytes, 0, 4);
            String lanIp = (lanIpBytes[0] & 0xFF) + "." + (lanIpBytes[1] & 0xFF) + "." + (lanIpBytes[2] & 0xFF) + "." + (lanIpBytes[3] & 0xFF);
            parsedData.put("lan_ip", lanIp);
            index += 4;

            // 13️⃣ WiFi MAC (6 bytes)
            index += 1;
            byte[] wifiMacBytes = new byte[6];
            System.arraycopy(data, index, wifiMacBytes, 0, 6);
            StringBuilder wifiMacAddress = new StringBuilder();
            for (byte b : wifiMacBytes) {
                wifiMacAddress.append(String.format("%02X:", b));
            }
            parsedData.put("wifi_mac", wifiMacAddress.substring(0, wifiMacAddress.length() - 1));
            index += 6;
            index += 1;
            // 14️⃣ WiFi Enable (1 byte)
            byte wifiEnable = data[index]; // 1 바이트 값 가져오기
//            byte wifiEnable = buffer.get();
            parsedData.put("wifi_enable", wifiEnable == 0x01 ? "ON" : "OFF");
            return parsedData;

        } catch (Exception e) {
            parsedData.put("error", "Parsing failed: " + e.getMessage());
        }

        return parsedData;
    }
}
