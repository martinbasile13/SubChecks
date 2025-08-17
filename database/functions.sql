-- Funciones SQL útiles para SubChecks

-- 1. Función para obtener el resumen de gastos por aplicación
CREATE OR REPLACE FUNCTION obtener_gastos_por_aplicacion(fecha_inicio DATE DEFAULT NULL, fecha_fin DATE DEFAULT NULL)
RETURNS TABLE (
    aplicacion VARCHAR(100),
    total_pagos BIGINT,
    monto_total DECIMAL(10,2),
    ultimo_pago TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.aplicacion,
        COUNT(p.id)::BIGINT as total_pagos,
        SUM(p.monto) as monto_total,
        MAX(p.fecha) as ultimo_pago
    FROM pagos p
    WHERE 
        (fecha_inicio IS NULL OR p.fecha::DATE >= fecha_inicio) AND
        (fecha_fin IS NULL OR p.fecha::DATE <= fecha_fin)
    GROUP BY p.aplicacion
    ORDER BY monto_total DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para obtener el balance total de un usuario
CREATE OR REPLACE FUNCTION obtener_balance_usuario(usuario_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    balance DECIMAL(10,2);
BEGIN
    SELECT COALESCE(monto, 0.00) INTO balance
    FROM saldo 
    WHERE usuario_id = usuario_uuid;
    
    IF balance IS NULL THEN
        RETURN 0.00;
    END IF;
    
    RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- 3. Función para obtener estadísticas del mes actual
CREATE OR REPLACE FUNCTION obtener_estadisticas_mes_actual()
RETURNS TABLE (
    total_pagos BIGINT,
    monto_total DECIMAL(10,2),
    aplicacion_mas_usada VARCHAR(100),
    promedio_por_pago DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(p.id)::BIGINT as total_pagos,
        COALESCE(SUM(p.monto), 0.00) as monto_total,
        (
            SELECT aplicacion 
            FROM pagos 
            WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM NOW())
            AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM NOW())
            GROUP BY aplicacion 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as aplicacion_mas_usada,
        COALESCE(AVG(p.monto), 0.00) as promedio_por_pago
    FROM pagos p
    WHERE EXTRACT(MONTH FROM p.fecha) = EXTRACT(MONTH FROM NOW())
    AND EXTRACT(YEAR FROM p.fecha) = EXTRACT(YEAR FROM NOW());
END;
$$ LANGUAGE plpgsql;

-- 4. Función para agregar saldo manual a un usuario
CREATE OR REPLACE FUNCTION agregar_saldo_usuario(usuario_uuid UUID, cantidad DECIMAL(10,2), remitente_nombre VARCHAR(100) DEFAULT 'manual')
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar si el usuario ya tiene registro de saldo
    IF EXISTS (SELECT 1 FROM saldo WHERE usuario_id = usuario_uuid) THEN
        -- Actualizar saldo existente
        UPDATE saldo 
        SET monto = monto + cantidad,
            remitente = remitente_nombre,
            updated_at = NOW()
        WHERE usuario_id = usuario_uuid;
    ELSE
        -- Crear nuevo registro de saldo
        INSERT INTO saldo (usuario_id, monto, remitente)
        VALUES (usuario_uuid, cantidad, remitente_nombre);
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 5. Vista para obtener resumen de pagos con información del usuario
CREATE OR REPLACE VIEW vista_pagos_completa AS
SELECT 
    p.id,
    p.aplicacion,
    p.monto,
    p.fecha,
    p.descripcion,
    p.usuario_id,
    u.email as usuario_email,
    u.raw_user_meta_data->>'name' as usuario_nombre,
    p.created_at
FROM pagos p
LEFT JOIN auth.users u ON p.usuario_id = u.id
ORDER BY p.fecha DESC;

-- 6. Vista para obtener el ranking de usuarios por contribuciones
CREATE OR REPLACE VIEW vista_ranking_usuarios AS
SELECT 
    u.id as usuario_id,
    u.email,
    u.raw_user_meta_data->>'name' as nombre,
    COUNT(p.id) as total_pagos,
    COALESCE(SUM(p.monto), 0.00) as total_contribuido,
    COALESCE(s.monto, 0.00) as saldo_actual
FROM auth.users u
LEFT JOIN pagos p ON u.id = p.usuario_id
LEFT JOIN saldo s ON u.id = s.usuario_id
GROUP BY u.id, u.email, u.raw_user_meta_data->>'name', s.monto
ORDER BY total_contribuido DESC;

-- 7. Función para obtener historial de un usuario específico
CREATE OR REPLACE FUNCTION obtener_historial_usuario(usuario_uuid UUID, limite INTEGER DEFAULT 50)
RETURNS TABLE (
    fecha TIMESTAMP WITH TIME ZONE,
    tipo VARCHAR(20),
    aplicacion VARCHAR(100),
    monto DECIMAL(10,2),
    descripcion TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Pagos realizados por el usuario
    SELECT 
        p.fecha,
        'PAGO'::VARCHAR(20) as tipo,
        p.aplicacion,
        p.monto,
        COALESCE(p.descripcion, 'Pago realizado') as descripcion
    FROM pagos p
    WHERE p.usuario_id = usuario_uuid
    
    UNION ALL
    
    -- Deducciones del historial (cuando otros pagan)
    SELECT 
        hp.fecha_creacion as fecha,
        'DEDUCCION'::VARCHAR(20) as tipo,
        hp.aplicacion,
        -(hp.monto / (SELECT COUNT(*) FROM saldo)) as monto, -- Monto deducido
        'Deducción por pago compartido' as descripcion
    FROM historial_pagos hp
    WHERE hp.remitente_id != usuario_uuid
    AND EXISTS (SELECT 1 FROM saldo WHERE usuario_id = usuario_uuid)
    
    ORDER BY fecha DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger adicional para limpiar datos huérfanos
CREATE OR REPLACE FUNCTION limpiar_historial_huerfano()
RETURNS TRIGGER AS $$
BEGIN
    -- Eliminar entradas de historial cuando se elimina un pago
    DELETE FROM historial_pagos WHERE pago_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_limpiar_historial
    AFTER DELETE ON pagos
    FOR EACH ROW 
    EXECUTE FUNCTION limpiar_historial_huerfano();

-- Comentarios para las funciones
COMMENT ON FUNCTION obtener_gastos_por_aplicacion IS 'Obtiene un resumen de gastos agrupados por aplicación en un rango de fechas';
COMMENT ON FUNCTION obtener_balance_usuario IS 'Obtiene el balance actual de un usuario específico';
COMMENT ON FUNCTION obtener_estadisticas_mes_actual IS 'Obtiene estadísticas del mes actual';
COMMENT ON FUNCTION agregar_saldo_usuario IS 'Agrega saldo manual a un usuario específico';
COMMENT ON VIEW vista_pagos_completa IS 'Vista completa de pagos con información del usuario';
COMMENT ON VIEW vista_ranking_usuarios IS 'Ranking de usuarios por contribuciones';
COMMENT ON FUNCTION obtener_historial_usuario IS 'Obtiene el historial completo de transacciones de un usuario';
