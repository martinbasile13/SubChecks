-- Datos de ejemplo para SubChecks
-- IMPORTANTE: Ejecutar solo después de tener usuarios registrados en la aplicación

-- Ejemplos de aplicaciones/servicios más comunes
-- Estos son los valores que se usarían en el frontend para el campo 'aplicacion'

/*
Aplicaciones sugeridas para el dropdown del frontend:
- spotify
- youtube_premium
- netflix
- disney_plus
- amazon_prime
- hbo_max
- apple_music
- crunchyroll
- twitch_turbo
- canva_pro
- adobe_creative
- github_pro
- figma_pro
- notion_pro
- dropbox_plus
- google_drive
- microsoft_365
- zoom_pro
- chatgpt_plus
- midjourney
- otros
*/

-- Ejemplo de cómo insertar datos (ejecutar solo con usuarios reales)
-- Reemplazar 'UUID_USUARIO_1', etc. con UUIDs reales de usuarios registrados

/*
-- Ejemplo de inserción de pagos
INSERT INTO pagos (aplicacion, monto, usuario_id, descripcion) VALUES
('spotify', 199.00, 'UUID_USUARIO_1', 'Plan familiar Spotify'),
('netflix', 799.00, 'UUID_USUARIO_2', 'Plan Premium Netflix'),
('youtube_premium', 119.00, 'UUID_USUARIO_1', 'YouTube Premium individual'),
('disney_plus', 299.00, 'UUID_USUARIO_3', 'Disney Plus anual'),
('amazon_prime', 149.00, 'UUID_USUARIO_2', 'Amazon Prime mensual');

-- Ejemplo de inserción de saldos iniciales
INSERT INTO saldo (usuario_id, monto, remitente) VALUES
('UUID_USUARIO_1', 500.00, 'deposito_inicial'),
('UUID_USUARIO_2', 750.00, 'transferencia'),
('UUID_USUARIO_3', 300.00, 'efectivo');
*/

-- Scripts para consultas útiles después de tener datos

-- Ver todos los pagos con información de usuario
-- SELECT * FROM vista_pagos_completa;

-- Ver ranking de usuarios
-- SELECT * FROM vista_ranking_usuarios;

-- Ver gastos por aplicación del último mes
-- SELECT * FROM obtener_gastos_por_aplicacion(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE);

-- Ver estadísticas del mes actual
-- SELECT * FROM obtener_estadisticas_mes_actual();

-- Ver balance de un usuario específico
-- SELECT obtener_balance_usuario('UUID_DEL_USUARIO');

-- Ver historial completo de un usuario
-- SELECT * FROM obtener_historial_usuario('UUID_DEL_USUARIO');

-- Agregar saldo a un usuario
-- SELECT agregar_saldo_usuario('UUID_DEL_USUARIO', 1000.00, 'deposito_banco');

-- Consultas útiles para el dashboard

-- Top 5 aplicaciones más caras este mes
/*
SELECT aplicacion, SUM(monto) as total
FROM pagos 
WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM NOW())
AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM NOW())
GROUP BY aplicacion
ORDER BY total DESC
LIMIT 5;
*/

-- Total gastado por todos los usuarios este mes
/*
SELECT SUM(monto) as total_mes
FROM pagos 
WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM NOW())
AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM NOW());
*/

-- Usuarios con saldo negativo (deben dinero)
/*
SELECT u.email, s.monto
FROM saldo s
JOIN auth.users u ON s.usuario_id = u.id
WHERE s.monto < 0
ORDER BY s.monto ASC;
*/

-- Pagos recientes (últimos 10)
/*
SELECT 
    p.aplicacion,
    p.monto,
    p.fecha,
    u.email as usuario
FROM pagos p
JOIN auth.users u ON p.usuario_id = u.id
ORDER BY p.fecha DESC
LIMIT 10;
*/
