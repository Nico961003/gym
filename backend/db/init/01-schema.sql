-- Esquema inicial de la base de datos `gym`.
-- Docker ejecuta este archivo una única vez, cuando el volumen de datos está
-- vacío. Si lo modificas después, hay que recrear el volumen:
--   docker compose down -v && docker compose up -d

CREATE DATABASE IF NOT EXISTS gym
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gym;

CREATE TABLE IF NOT EXISTS usuarios (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  username     VARCHAR(50)     NOT NULL,
  nombre       VARCHAR(100)    NOT NULL,
  apellido     VARCHAR(100)    NOT NULL,
  edad         TINYINT UNSIGNED NOT NULL,
  -- kilogramos, un decimal es suficiente (p. ej. 78.5)
  peso         DECIMAL(5, 2)   NOT NULL,
  -- metros (p. ej. 1.78)
  estatura     DECIMAL(3, 2)   NOT NULL,
  -- SOLO el hash bcrypt. La contraseña en claro no se almacena nunca.
  password_hash VARCHAR(255)   NOT NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_username (username),

  CONSTRAINT chk_usuarios_edad     CHECK (edad BETWEEN 14 AND 120),
  CONSTRAINT chk_usuarios_peso     CHECK (peso BETWEEN 30.00 AND 400.00),
  CONSTRAINT chk_usuarios_estatura CHECK (estatura BETWEEN 1.00 AND 2.60),
  CONSTRAINT chk_usuarios_username CHECK (CHAR_LENGTH(username) >= 3)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
