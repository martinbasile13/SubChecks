-- Script para arreglar la restricción única en la tabla saldo

-- 1. Ver qué datos hay en la tabla saldo
SELECT * FROM saldo WHERE remitente = 'carlos' AND aplicacion = 'YouTube Premium';

-- 2. Eliminar la restricción única problemática (si existe)
ALTER TABLE saldo DROP CONSTRAINT IF EXISTS saldo_usuario_aplicacion_unique;

-- 3. Eliminar todos los registros duplicados de carlos + YouTube Premium (si los hay)
DELETE FROM saldo 
WHERE remitente = 'carlos' 
AND aplicacion = 'YouTube Premium';

-- 4. Ver el estado final de la tabla
SELECT * FROM saldo ORDER BY created_at DESC LIMIT 10;
