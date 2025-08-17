-- Script para eliminar todas las funciones, triggers y vistas existentes
-- Ejecutar este script para limpiar la base de datos antes de implementar nuestra lógica

-- 1. Eliminar triggers primero (incluyendo los que pueden existir)
DROP TRIGGER IF EXISTS trigger_limpiar_historial ON pagos;
DROP TRIGGER IF EXISTS trigger_distribuir_costo ON pagos;
DROP TRIGGER IF EXISTS trigger_update_updated_at_pagos ON pagos;
DROP TRIGGER IF EXISTS trigger_update_updated_at_saldo ON saldo;
DROP TRIGGER IF EXISTS trigger_update_updated_at_historial ON historial_pagos;
DROP TRIGGER IF EXISTS update_pagos_updated_at ON pagos;
DROP TRIGGER IF EXISTS update_saldo_updated_at ON saldo;

-- 2. Eliminar funciones (usando CASCADE para las que tienen dependencias)
DROP FUNCTION IF EXISTS obtener_gastos_por_aplicacion(DATE, DATE);
DROP FUNCTION IF EXISTS obtener_balance_usuario(UUID);
DROP FUNCTION IF EXISTS obtener_estadisticas_mes_actual();
DROP FUNCTION IF EXISTS agregar_saldo_usuario(UUID, DECIMAL, VARCHAR);
DROP FUNCTION IF EXISTS obtener_historial_usuario(UUID, INTEGER);
DROP FUNCTION IF EXISTS limpiar_historial_huerfano();
DROP FUNCTION IF EXISTS distribuir_costo_pago();
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. Eliminar vistas
DROP VIEW IF EXISTS vista_pagos_completa;
DROP VIEW IF EXISTS vista_ranking_usuarios;

-- 4. Limpiar datos existentes si es necesario (opcional)
-- TRUNCATE TABLE historial_pagos RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE saldo RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE pagos RESTART IDENTITY CASCADE;

-- Mensaje de confirmación
SELECT 'Todas las funciones, triggers y vistas han sido eliminadas exitosamente' as status;
