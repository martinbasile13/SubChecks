'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [conexion, setConexion] = useState<string>('Conectando...');
  const [datos, setDatos] = useState<any>(null);

  useEffect(() => {
    const testConexion = async () => {
      try {
        // Test básico de conexión
        const { data, error } = await supabase.from('saldo').select('count');
        
        if (error) {
          console.error('Error:', error);
          setConexion(`Error: ${error.message}`);
          return;
        }
        
        setConexion('✅ Conexión exitosa');
        
        // Obtener todos los datos sin filtrar para debug
        const { data: saldos } = await supabase.from('saldo').select('*');
        const { data: historial } = await supabase.from('historial_pagos').select('*');
        const { data: pagos } = await supabase.from('pagos').select('*');
        
        setDatos({
          saldos: saldos || [],
          historial: historial || [],
          pagos: pagos || []
        });
        
        console.log('📊 Todos los saldos:', saldos);
        console.log('📋 Todo el historial:', historial);
        console.log('💳 Todos los pagos:', pagos);
        
      } catch (err) {
        console.error('Error de conexión:', err);
        setConexion(`❌ Error: ${err}`);
      }
    };
    
    testConexion();
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test Supabase</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Estado de conexión:</h2>
        <p>{conexion}</p>
      </div>
      
      {datos && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Datos encontrados:</h2>
          
          <div className="mb-4">
            <h3 className="font-medium">Saldos ({datos.saldos.length}):</h3>
            <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(datos.saldos, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">Historial ({datos.historial.length}):</h3>
            <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(datos.historial, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">Pagos ({datos.pagos.length}):</h3>
            <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(datos.pagos, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
