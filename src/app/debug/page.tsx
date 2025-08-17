'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugSupabase() {
  const [estado, setEstado] = useState('Iniciando...');
  const [datos, setDatos] = useState<any>(null);
  const [errores, setErrores] = useState<any[]>([]);

  useEffect(() => {
    const debug = async () => {
      const logs: any[] = [];
      
      try {
        setEstado('🔍 Verificando configuración...');
        
        // 1. Verificar configuración
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        logs.push({
          paso: 'Configuración',
          resultado: {
            url: supabaseUrl ? 'OK' : 'FALTA',
            key: supabaseKey ? 'OK' : 'FALTA'
          }
        });
        
        setEstado('🔗 Probando conexión básica...');
        
        // 2. Test de conexión más básico posible
        const { data: version, error: versionError } = await supabase.rpc('version');
        
        logs.push({
          paso: 'Conexión básica',
          data: version,
          error: versionError?.message || null
        });
        
        if (versionError) {
          setEstado('❌ Error de conexión básica');
          setErrores(logs);
          return;
        }
        
        setEstado('📊 Probando acceso a tablas...');
        
        // 3. Probar cada tabla individualmente
        const tablas = ['saldo', 'historial_pagos', 'pagos'];
        
        for (const tabla of tablas) {
          try {
            const { data, error, count } = await supabase
              .from(tabla)
              .select('*', { count: 'exact' })
              .limit(5);
            
            logs.push({
              paso: `Tabla ${tabla}`,
              count,
              data: data?.slice(0, 2), // Solo los primeros 2 registros
              error: error?.message || null,
              success: !error
            });
            
          } catch (err: any) {
            logs.push({
              paso: `Tabla ${tabla}`,
              error: err.message,
              success: false
            });
          }
        }
        
        setDatos(logs);
        setEstado('✅ Debug completado');
        
      } catch (error: any) {
        logs.push({
          paso: 'Error general',
          error: error.message
        });
        setErrores(logs);
        setEstado('❌ Error general');
      }
    };
    
    debug();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔧 Debug Supabase</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Estado actual:</h2>
        <div className="text-lg">{estado}</div>
      </div>
      
      {datos && (
        <div className="space-y-6">
          {datos.map((log: any, i: number) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">
                {log.success === false ? '❌' : log.success === true ? '✅' : '🔍'} {log.paso}
              </h3>
              
              {log.error && (
                <div className="text-red-400 mb-2">
                  <strong>Error:</strong> {log.error}
                </div>
              )}
              
              {log.count !== undefined && (
                <div className="text-blue-400 mb-2">
                  <strong>Registros encontrados:</strong> {log.count}
                </div>
              )}
              
              {log.data && (
                <div className="text-green-400">
                  <strong>Datos (muestra):</strong>
                  <pre className="text-xs mt-2 bg-gray-900 p-2 rounded overflow-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {log.resultado && (
                <div className="text-yellow-400">
                  <strong>Resultado:</strong>
                  <pre className="text-xs mt-2 bg-gray-900 p-2 rounded">
                    {JSON.stringify(log.resultado, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {errores.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-red-400">❌ Errores encontrados:</h2>
          <div className="space-y-4">
            {errores.map((error, i) => (
              <div key={i} className="bg-red-900 bg-opacity-50 p-4 rounded">
                <pre className="text-sm">{JSON.stringify(error, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-400">
        <h3 className="font-semibold mb-2">💡 Posibles soluciones si hay errores:</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Verificar variables de entorno (.env.local)</li>
          <li>Deshabilitar RLS en Supabase: <code>ALTER TABLE tabla_name DISABLE ROW LEVEL SECURITY;</code></li>
          <li>Crear políticas públicas de lectura</li>
          <li>Verificar permisos de API en Supabase Dashboard</li>
        </ul>
      </div>
    </div>
  );
}
