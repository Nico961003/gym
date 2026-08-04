-- Tabla base de usuarios.
-- Idempotente: en bases creadas con db/init/01-schema.sql ya existe y esta
-- migración simplemente se marca como aplicada.

CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)      NOT NULL,
  nombre        VARCHAR(100)     NOT NULL,
  apellido      VARCHAR(100)     NOT NULL,
  edad          TINYINT UNSIGNED NOT NULL,
  peso          DECIMAL(5, 2)    NOT NULL,
  estatura      DECIMAL(3, 2)    NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  created_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_username (username),
  CONSTRAINT chk_usuarios_edad     CHECK (edad BETWEEN 14 AND 120),
  CONSTRAINT chk_usuarios_peso     CHECK (peso BETWEEN 30.00 AND 400.00),
  CONSTRAINT chk_usuarios_estatura CHECK (estatura BETWEEN 1.00 AND 2.60),
  CONSTRAINT chk_usuarios_username CHECK (CHAR_LENGTH(username) >= 3)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
