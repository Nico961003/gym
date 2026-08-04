-- Roles de usuario. Todo el mundo es CLIENT salvo que se diga lo contrario.
--
-- Nota: MySQL no admite `ADD COLUMN IF NOT EXISTS` (eso es MariaDB). No hace
-- falta: el runner registra cada migración en `schema_migrations` y no la
-- vuelve a ejecutar.

ALTER TABLE usuarios
  ADD COLUMN rol ENUM('ADMIN', 'CLIENT') NOT NULL DEFAULT 'CLIENT'
  AFTER apellido;

CREATE INDEX idx_usuarios_rol ON usuarios (rol);

-- El usuario `admin` que ya existía pasa a ser administrador.
UPDATE usuarios SET rol = 'ADMIN' WHERE username = 'admin';
