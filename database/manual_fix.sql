-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR

-- 1. Ver todos los registros de la tabla saldo
SELECT * FROM saldo;

-- 2. Eliminar registros duplicados de carlos + YouTube Premium
DELETE FROM saldo 
WHERE remitente = 'carlos' 
AND aplicacion = 'YouTube Premium';

-- 3. Eliminar la restricción única si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'saldo_usuario_aplicacion_unique'
    ) THEN
        ALTER TABLE saldo DROP CONSTRAINT saldo_usuario_aplicacion_unique;
    END IF;
END $$;

-- 4. Ver el resultado final
SELECT * FROM saldo ORDER BY created_at DESC;
