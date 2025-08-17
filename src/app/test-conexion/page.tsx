'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TestData {
  saldos: any[];
  historial: any[];
  pagos: any[];
  error: string | null;
  loading: boolean;
}

export default function TestConexion() {
  const [data, setData] = useState<TestData>({
    saldos: [],
    historial: [],
    pagos: [],
    error: null,
    loading: true
  });

  useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log('🔄 Iniciando test de conexión...');
        
        // Test de conexión básica
        const { data: testData, error: testError } = await supabase
          .from('saldo')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.error('❌ Error de conexión:', testError);
          throw testError;
        }
        
        console.log('✅ Conexión OK, obteniendo datos...');
        
        // Obtener todos los datos
        const [saldosResult, historialResult, pagosResult] = await Promise.all([
          supabase.from('saldo').select('*'),
          supabase.from('historial_pagos').select('*'),
          supabase.from('pagos').select('*')
        ]);
        
        console.log('📊 Resultados:', {
          saldos: saldosResult,
          historial: historialResult,
          pagos: pagosResult
        });
        
        // Verificar errores
        if (saldosResult.error) throw saldosResult.error;
        if (historialResult.error) throw historialResult.error;
        if (pagosResult.error) throw pagosResult.error;
        
        setData({
          saldos: saldosResult.data || [],
          historial: historialResult.data || [],
          pagos: pagosResult.data || [],
          error: null,
          loading: false
        });
        
      } catch (error: any) {
        console.error('❌ Error:', error);
        setData(prev => ({
          ...prev,
          error: error.message || 'Error desconocido',
          loading: false
        }));
      }
    };
    
    testSupabase();
  }, []);

  if (data.loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">🔄 Probando conexión...</div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-400">❌ Error de Conexión</h1>
        <div className="bg-red-900 text-red-100 p-4 rounded">
          {data.error}
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Revisa:
          <ul className="list-disc ml-6 mt-2">
            <li>Variables de entorno (.env.local)</li>
            <li>Políticas RLS en Supabase</li>
            <li>Permisos de las tablas</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">✅ Conexión Exitosa</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-3 text-green-400">💰 Saldos ({data.saldos.length})</h2>
          {data.saldos.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-auto">
              {data.saldos.map((saldo, i) => (
                <div key={i} className="text-sm border-l-2 border-green-500 pl-2">
                  <div><strong>ID:</strong> {saldo.id}</div>
                  <div><strong>App:</strong> {saldo.aplicacion || 'N/A'}</div>
                  <div><strong>Monto:</strong> ${saldo.monto}</div>
                  <div><strong>Remitente:</strong> {saldo.remitente}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No hay datos</p>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-3 text-blue-400">📋 Historial ({data.historial.length})</h2>
          {data.historial.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-auto">
              {data.historial.map((hist, i) => (
                <div key={i} className="text-sm border-l-2 border-blue-500 pl-2">
                  <div><strong>ID:</strong> {hist.id}</div>
                  <div><strong>App:</strong> {hist.aplicacion || 'N/A'}</div>
                  <div><strong>Monto:</strong> ${hist.monto}</div>
                  <div><strong>Remitente:</strong> {hist.remitente_nombre || hist.remitente_id}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No hay datos</p>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-3 text-purple-400">💳 Pagos ({data.pagos.length})</h2>
          {data.pagos.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-auto">
              {data.pagos.map((pago, i) => (
                <div key={i} className="text-sm border-l-2 border-purple-500 pl-2">
                  <div><strong>ID:</strong> {pago.id}</div>
                  <div><strong>App:</strong> {pago.aplicacion || 'N/A'}</div>
                  <div><strong>Monto:</strong> ${pago.monto}</div>
                  <div><strong>Descripción:</strong> {pago.descripcion || 'N/A'}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No hay datos</p>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">🔍 Aplicaciones encontradas:</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set([
            ...data.saldos.map(s => s.aplicacion).filter(Boolean),
            ...data.historial.map(h => h.aplicacion).filter(Boolean),
            ...data.pagos.map(p => p.aplicacion).filter(Boolean)
          ])).map(app => (
            <span key={app} className="bg-gray-700 px-3 py-1 rounded text-sm">
              {app}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
