-- Promociones y productos de la tienda (CRUD del panel de administración).

CREATE TABLE IF NOT EXISTS promociones (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  titulo       VARCHAR(120)  NOT NULL,
  descripcion  VARCHAR(500)  NOT NULL,
  -- Qué tipo de descuento aplica, para poder calcularlo sin parsear texto.
  tipo         ENUM('PORCENTAJE', 'IMPORTE_FIJO', 'MESES_GRATIS', 'OTRO')
                 NOT NULL DEFAULT 'PORCENTAJE',
  -- % si tipo=PORCENTAJE, € si IMPORTE_FIJO, nº de meses si MESES_GRATIS.
  valor        DECIMAL(8, 2) NOT NULL DEFAULT 0,
  codigo       VARCHAR(30)   NULL,
  fecha_inicio DATE          NOT NULL,
  fecha_fin    DATE          NOT NULL,
  activa       BOOLEAN       NOT NULL DEFAULT TRUE,
  -- Se muestra en portada, no solo en el listado.
  destacada    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_promociones_codigo (codigo),
  KEY idx_promociones_vigencia (activa, fecha_inicio, fecha_fin),
  CONSTRAINT chk_promociones_fechas CHECK (fecha_fin >= fecha_inicio),
  CONSTRAINT chk_promociones_valor  CHECK (valor >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(120)  NOT NULL,
  precio           DECIMAL(8, 2) NOT NULL,
  stock            INT UNSIGNED  NOT NULL DEFAULT 0,
  fecha_registro   DATE          NOT NULL,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_productos_nombre (nombre),
  CONSTRAINT chk_productos_precio CHECK (precio >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
