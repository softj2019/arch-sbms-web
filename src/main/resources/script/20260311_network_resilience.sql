ALTER TABLE tb_monitoring ADD COLUMN network_retry_count INT NULL;
ALTER TABLE tb_monitoring ADD COLUMN network_outage_started_at VARCHAR(40) NULL;
ALTER TABLE tb_monitoring ADD COLUMN network_last_recovered_at VARCHAR(40) NULL;
ALTER TABLE tb_monitoring ADD COLUMN network_last_reboot_requested_at VARCHAR(40) NULL;
ALTER TABLE tb_monitoring ADD COLUMN network_pending_event_count INT NULL;
ALTER TABLE tb_monitoring ADD COLUMN network_retry_interval_sec INT NULL;
ALTER TABLE tb_monitoring ADD COLUMN network_reboot_threshold INT NULL;
ALTER TABLE tb_monitoring ADD COLUMN network_failure_reason VARCHAR(255) NULL;
ALTER TABLE tb_monitoring ADD COLUMN network_event_logs_raw LONGTEXT NULL;
ALTER TABLE tb_monitoring ADD COLUMN network_outage_logs_raw LONGTEXT NULL;

CREATE TABLE tb_terminal_network_status (
    id BIGINT NOT NULL AUTO_INCREMENT,
    terminal_id VARCHAR(10) NOT NULL,
    network_retry_count INT NULL,
    network_outage_started_at VARCHAR(40) NULL,
    network_last_recovered_at VARCHAR(40) NULL,
    network_last_reboot_requested_at VARCHAR(40) NULL,
    network_pending_event_count INT NULL,
    network_retry_interval_sec INT NULL,
    network_reboot_threshold INT NULL,
    network_failure_reason VARCHAR(255) NULL,
    network_event_logs_raw LONGTEXT NULL,
    network_outage_logs_raw LONGTEXT NULL,
    last_overview_received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_terminal_network_status_terminal_id (terminal_id),
    KEY idx_terminal_network_status_updated_at (updated_at)
);

CREATE TABLE tb_terminal_network_event (
    id BIGINT NOT NULL AUTO_INCREMENT,
    terminal_id VARCHAR(10) NOT NULL,
    event_hash CHAR(64) NOT NULL,
    occurred_at_iso VARCHAR(40) NULL,
    failure_reason VARCHAR(255) NULL,
    retry_count INT NULL,
    failure_started_at VARCHAR(40) NULL,
    failure_started_at_iso VARCHAR(40) NULL,
    recovered_at VARCHAR(40) NULL,
    recovered_at_iso VARCHAR(40) NULL,
    duration_sec INT NULL,
    router_wan_ip VARCHAR(64) NULL,
    public_ip VARCHAR(64) NULL,
    outbound_ok TINYINT(1) NULL,
    raw_json LONGTEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_terminal_network_event_hash (event_hash),
    KEY idx_terminal_network_event_terminal_id_created_at (terminal_id, created_at)
);

CREATE TABLE tb_terminal_network_outage_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    terminal_id VARCHAR(10) NOT NULL,
    log_hash CHAR(64) NOT NULL,
    occurred_at VARCHAR(40) NULL,
    occurred_at_iso VARCHAR(40) NULL,
    level VARCHAR(32) NULL,
    logger VARCHAR(255) NULL,
    message LONGTEXT NULL,
    raw_json LONGTEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_terminal_network_outage_log_hash (log_hash),
    KEY idx_terminal_network_outage_terminal_id_occurred_at (terminal_id, occurred_at_iso, id)
);
