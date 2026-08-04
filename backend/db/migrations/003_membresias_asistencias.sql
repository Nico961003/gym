-- Membresías y asistencias del área de cliente.

CREATE TABLE IF NOT EXISTS membresias (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id     INT UNSIGNED NOT NULL,
  plan           ENUM('BASICA', 'PLUS', 'PREMIUM') NOT NULL DEFAULT 'BASICA',
  estado         ENUM('ACTIVA', 'PENDIENTE_PAGO', 'CANCELADA') NOT NULL
                   DEFAULT 'ACTIVA',
  fecha_inicio   DATE           NOT NULL,
  -- Fecha del próximo cobro; el histórico de cobros iría en otra tabla.
  fecha_proximo_pago DATE       NOT NULL,
  importe_mensual DECIMAL(6, 2) NOT NULL,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_membresias_usuario (usuario_id),
  CONSTRAINT fk_membresias_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT chk_membresias_importe CHECK (importe_mensual >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS asistencias (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED    NOT NULL,
  fecha       DATE            NOT NULL,
  hora_entrada TIME           NOT NULL,
  hora_salida TIME            NULL,
  actividad   VARCHAR(80)     NULL,
  PRIMARY KEY (id),
  KEY idx_asistencias_usuario_fecha (usuario_id, fecha DESC),
  CONSTRAINT fk_asistencias_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
