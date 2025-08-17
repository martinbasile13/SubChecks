-- Migración para agregar columna 'aplicacion' a la tabla saldo
-- Esto permite trackear saldo específico por aplicación para cada usuario

-- 1. Agregar la columna 'aplicacion' a la tabla saldo
ALTER TABLE saldo ADD COLUMN aplicacion VARCHAR(100);

-- 2. Eliminar la restricción UNIQUE actual que solo consideraba usuario_id
ALTER TABLE saldo DROP CONSTRAINT IF EXISTS saldo_usuario_id_key;

-- 3. Crear nueva restricción UNIQUE que considere usuario_id + aplicacion
ALTER TABLE saldo ADD CONSTRAINT saldo_usuario_aplicacion_unique UNIQUE (usuario_id, aplicacion);

-- 4. Agregar índice para mejorar rendimiento en consultas por aplicacion
CREATE INDEX idx_saldo_aplicacion ON saldo(aplicacion);
CREATE INDEX idx_saldo_usuario_aplicacion ON saldo(usuario_id, aplicacion);

-- 5. Actualizar la función de distribución de costos para considerar aplicaciones específicas
CREATE OR REPLACE FUNCTION distribuir_costo_pago()
RETURNS TRIGGER AS $$
DECLARE
    total_usuarios INTEGER;
    costo_por_usuario DECIMAL(10,2);
BEGIN
    -- Contar total de usuarios con saldo para esta aplicación específica
    SELECT COUNT(*) INTO total_usuarios 
    FROM saldo 
    WHERE aplicacion = NEW.aplicacion OR aplicacion IS NULL;
    
    -- Si no hay usuarios con saldo para esta aplicación, crear entrada para el usuario que paga
    IF total_usuarios = 0 THEN
        INSERT INTO saldo (usuario_id, monto, remitente, aplicacion) 
        VALUES (NEW.usuario_id, -NEW.monto, 'sistema', NEW.aplicacion)
        ON CONFLICT (usuario_id, aplicacion) 
        DO UPDATE SET 
            monto = saldo.monto - NEW.monto,
            updated_at = NOW();
    ELSE
        -- Calcular costo por usuario
        costo_por_usuario := NEW.monto / (total_usuarios + 1); -- +1 para incluir al usuario que paga
        
        -- Restar el costo prorrateado a todos los usuarios existentes para esta aplicación
        UPDATE saldo 
        SET monto = monto - costo_por_usuario,
            updated_at = NOW()
        WHERE aplicacion = NEW.aplicacion OR aplicacion IS NULL;
        
        -- Crear o actualizar saldo para el usuario que paga (le sumamos el monto menos su parte)
        INSERT INTO saldo (usuario_id, monto, remitente, aplicacion) 
        VALUES (NEW.usuario_id, NEW.monto - costo_por_usuario, 'pago_realizado', NEW.aplicacion)
        ON CONFLICT (usuario_id, aplicacion) 
        DO UPDATE SET 
            monto = saldo.monto + NEW.monto - costo_por_usuario,
            updated_at = NOW();
        
        -- Crear entrada en historial_pagos
        INSERT INTO historial_pagos (remitente_id, aplicacion, monto, pago_id)
        VALUES (NEW.usuario_id, NEW.aplicacion, NEW.monto, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Actualizar comentarios para documentar los cambios
COMMENT ON COLUMN saldo.aplicacion IS 'Aplicación específica para la que se mantiene este saldo (spotify, youtube, netflix, etc.)';

-- 7. Datos de prueba para verificar la funcionalidad (opcional)
-- Estos se pueden ejecutar después de la migración para probar
-- INSERT INTO saldo (usuario_id, monto, remitente, aplicacion) VALUES 
-- ('user-uuid-1', 0.00, 'inicial', 'YouTube Premium'),
-- ('user-uuid-2', 0.00, 'inicial', 'YouTube Premium'),
-- ('user-uuid-1', 0.00, 'inicial', 'Crunchyroll');
