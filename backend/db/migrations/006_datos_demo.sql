-- Datos ficticios de arranque (promociones y productos).
-- Idempotente gracias a INSERT IGNORE sobre claves únicas.

INSERT IGNORE INTO promociones
  (titulo, descripcion, tipo, valor, codigo, fecha_inicio, fecha_fin, activa, destacada)
VALUES
  ('Matrícula gratis en septiembre',
   'Date de alta este mes y te quitamos los 40 € de matrícula. Sin permanencia.',
   'IMPORTE_FIJO', 40.00, 'VUELTA40',
   CURRENT_DATE - INTERVAL 10 DAY, CURRENT_DATE + INTERVAL 50 DAY, TRUE, TRUE),

  ('2x1 para ti y un amigo',
   'Trae a alguien contigo y los dos entrenáis un mes al precio de uno.',
   'PORCENTAJE', 50.00, 'AMIGO2X1',
   CURRENT_DATE - INTERVAL 5 DAY, CURRENT_DATE + INTERVAL 40 DAY, TRUE, TRUE),

  ('3 meses al precio de 2',
   'Contrata el trimestre por adelantado en la cuota Plus y te regalamos un mes.',
   'MESES_GRATIS', 1.00, 'TRIMESTRE3',
   CURRENT_DATE - INTERVAL 20 DAY, CURRENT_DATE + INTERVAL 70 DAY, TRUE, FALSE),

  ('Descuento estudiantes',
   'Un 20% de descuento en cualquier cuota presentando el carné de estudiante.',
   'PORCENTAJE', 20.00, 'ESTUDIA20',
   CURRENT_DATE - INTERVAL 60 DAY, CURRENT_DATE + INTERVAL 200 DAY, TRUE, FALSE);

INSERT IGNORE INTO productos (id, nombre, precio, stock, fecha_registro) VALUES
  (1, 'Proteína whey 1 kg (chocolate)', 24.90, 35, CURRENT_DATE - INTERVAL 30 DAY),
  (2, 'Camiseta técnica Rodriguez Gym', 15.00, 60, CURRENT_DATE - INTERVAL 25 DAY),
  (3, 'Botella térmica 750 ml',          12.50, 48, CURRENT_DATE - INTERVAL 20 DAY),
  (4, 'Cinturón de fuerza de cuero',     34.00,  12, CURRENT_DATE - INTERVAL 15 DAY),
  (5, 'Guantes de entrenamiento',         9.90,  25, CURRENT_DATE - INTERVAL 10 DAY),
  (6, 'Barrita energética (caja de 12)', 18.00,   0, CURRENT_DATE - INTERVAL 5 DAY);
