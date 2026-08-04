-- Auditoría de acciones de los administradores.
--
-- Cinco decisiones para que la tabla no se dispare de tamaño:
--
--   1. Solo se registran ESCRITURAS (crear/editar/borrar) y el inicio de
--      sesión. Las lecturas son el 90% del tráfico de un panel y no aportan
--      nada a la auditoría.
--   2. `accion` y `entidad` son ENUM (1 byte cada uno) en vez de VARCHAR.
--   3. `cambios` guarda SOLO los campos que cambiaron, no el registro
--      entero, y el backend lo trunca a 2 KB. Las contraseñas nunca entran.
--   4. La IP se guarda como VARBINARY(16) vía INET6_ATON: 16 bytes en vez de
--      los 45 de un VARCHAR con formato IPv6.
--   5. Un evento de MySQL borra cada noche lo que pase de 180 días, en lotes
--      para no bloquear la tabla.
--
-- Con ~200 acciones de escritura al día son unos 25 MB en 180 días.

CREATE TABLE IF NOT EXISTS admin_logs (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  -- Se pone a NULL si el administrador se borra, pero el log se conserva.
  admin_id       INT UNSIGNED    NULL,
  -- Desnormalizado a propósito: el registro debe seguir siendo legible
  -- aunque el usuario ya no exista.
  admin_username VARCHAR(50)     NOT NULL,

  accion         ENUM('CREAR', 'ACTUALIZAR', 'BORRAR', 'LOGIN') NOT NULL,
  entidad        ENUM('PROMOCION', 'PRODUCTO', 'USUARIO', 'SESION') NOT NULL,
  entidad_id     INT UNSIGNED    NULL,

  -- Solo los campos modificados: {"precio":{"antes":10,"despues":12}}
  cambios        JSON            NULL,

  ip             VARBINARY(16)   NULL,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_admin_logs_admin  (admin_id, created_at DESC),
  KEY idx_admin_logs_entidad (entidad, entidad_id),
  KEY idx_admin_logs_fecha  (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Purga automática: cada noche borra lo que pase de 180 días.
-- Requiere event_scheduler=ON (activado en docker-compose.yml).
CREATE EVENT IF NOT EXISTS ev_purga_admin_logs
  ON SCHEDULE EVERY 1 DAY
  STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 4 HOUR)
  COMMENT 'Retención de 180 días en admin_logs'
  DO
    DELETE FROM admin_logs
     WHERE created_at < NOW() - INTERVAL 180 DAY
     LIMIT 5000;
