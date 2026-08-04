-- Membresías y asistencias ficticias para los usuarios que ya existían,
-- de modo que el área de cliente tenga algo que enseñar.

INSERT IGNORE INTO membresias
  (usuario_id, plan, estado, fecha_inicio, fecha_proximo_pago, importe_mensual)
SELECT
  u.id,
  CASE WHEN u.rol = 'ADMIN' THEN 'PREMIUM' ELSE 'PLUS' END,
  'ACTIVA',
  CURRENT_DATE - INTERVAL 8 MONTH,
  CURRENT_DATE + INTERVAL 12 DAY,
  CASE WHEN u.rol = 'ADMIN' THEN 75.00 ELSE 45.00 END
FROM usuarios u;

-- Una asistencia por cada uno de los últimos días laborables (hasta 24).
INSERT INTO asistencias (usuario_id, fecha, hora_entrada, hora_salida, actividad)
SELECT
  u.id,
  CURRENT_DATE - INTERVAL d.n DAY,
  SEC_TO_TIME(3600 * (7 + (d.n % 12))),
  SEC_TO_TIME(3600 * (7 + (d.n % 12)) + 4500),
  ELT(1 + (d.n % 5), 'Sala de musculación', 'Spinning', 'CrossTraining',
      'Yoga y movilidad', 'Boxeo')
FROM usuarios u
CROSS JOIN (
  SELECT 0 AS n UNION ALL SELECT 1  UNION ALL SELECT 2  UNION ALL SELECT 4
  UNION ALL SELECT 5 UNION ALL SELECT 7  UNION ALL SELECT 9  UNION ALL SELECT 11
  UNION ALL SELECT 12 UNION ALL SELECT 14 UNION ALL SELECT 16 UNION ALL SELECT 18
  UNION ALL SELECT 19 UNION ALL SELECT 21 UNION ALL SELECT 23 UNION ALL SELECT 25
  UNION ALL SELECT 26 UNION ALL SELECT 28 UNION ALL SELECT 30 UNION ALL SELECT 33
  UNION ALL SELECT 35 UNION ALL SELECT 38 UNION ALL SELECT 40 UNION ALL SELECT 44
) AS d
WHERE NOT EXISTS (
  SELECT 1 FROM asistencias a WHERE a.usuario_id = u.id
);
