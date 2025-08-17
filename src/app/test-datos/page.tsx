'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDatos() {
  const [estado, setEstado] = useState('Iniciando...');
  const [saldos, setSaldos] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const probarDatos = async () => {
      try {
        setEstado('🔄 Conectando a Supabase...');
        
        console.log('=== PROBANDO DATOS ===');
        
        // Probar saldos
        setEstado('📊 Obteniendo saldos...');
        const { data: dataSaldos, error: errorSaldos } = await supabase
          .from('saldo')
          .select('*');
          
        console.log('Respuesta saldos:', { data: dataSaldos, error: errorSaldos });
        
        if (errorSaldos) {
          throw new Error(`Error saldos: ${errorSaldos.message}`);
        }
        
        setSaldos(dataSaldos || []);
        
        // Probar historial
        setEstado('📋 Obteniendo historial...');
        const { data: dataHistorial, error: errorHistorial } = await supabase
          .from('historial_pagos')
          .select('*');
          
        console.log('Respuesta historial:', { data: dataHistorial, error: errorHistorial });
        
        if (errorHistorial) {
          throw new Error(`Error historial: ${errorHistorial.message}`);
        }
        
        setHistorial(dataHistorial || []);
        
        // Probar pagos
        setEstado('💳 Obteniendo pagos...');
        const { data: dataPagos, error: errorPagos } = await supabase
          .from('pagos')
          .select('*');
          
        console.log('Respuesta pagos:', { data: dataPagos, error: errorPagos });
        
        if (errorPagos) {
          throw new Error(`Error pagos: ${errorPagos.message}`);
        }
        
        setPagos(dataPagos || []);
        
        setEstado('✅ Datos obtenidos correctamente');
        
        // Mostrar resumen en consola
        console.log('=== RESUMEN FINAL ===');
        console.log('Total saldos:', dataSaldos?.length || 0);
        console.log('Total historial:', dataHistorial?.length || 0);
        console.log('Total pagos:', dataPagos?.length || 0);
        
        if (dataSaldos?.length) {
          console.log('Aplicaciones en saldos:', [...new Set(dataSaldos.map(s => s.aplicacion))]);
        }
        if (dataHistorial?.length) {
          console.log('Aplicaciones en historial:', [...new Set(dataHistorial.map(h => h.aplicacion))]);
        }
        if (dataPagos?.length) {
          console.log('Aplicaciones en pagos:', [...new Set(dataPagos.map(p => p.aplicacion))]);
        }
        
      } catch (err: any) {
        console.error('❌ ERROR:', err);
        setError(err.message);
        setEstado('❌ Error al obtener datos');
      }
    };
    
    probarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🧪 Test de Datos Supabase</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Estado:</h2>
        <div className="text-lg">{estado}</div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900 bg-opacity-50 rounded">
          <h2 className="text-xl font-semibold text-red-400 mb-2">❌ Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldos */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold mb-3 text-green-400">
            💰 Saldos ({saldos.length})
          </h3>
          {saldos.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-auto">
              {saldos.slice(0, 5).map((saldo, i) => (
                <div key={i} className="text-sm bg-gray-700 p-2 rounded">
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

        {/* Historial */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold mb-3 text-blue-400">
            📋 Historial ({historial.length})
          </h3>
          {historial.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-auto">
              {historial.slice(0, 5).map((hist, i) => (
                <div key={i} className="text-sm bg-gray-700 p-2 rounded">
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

        {/* Pagos */}
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-semibold mb-3 text-purple-400">
            💳 Pagos ({pagos.length})
          </h3>
          {pagos.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-auto">
              {pagos.slice(0, 5).map((pago, i) => (
                <div key={i} className="text-sm bg-gray-700 p-2 rounded">
                  <div><strong>App:</strong> {pago.aplicacion || 'N/A'}</div>
                  <div><strong>Monto:</strong> ${pago.monto}</div>
                  <div><strong>Desc:</strong> {pago.descripcion || 'N/A'}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No hay datos</p>
          )}
        </div>
      </div>
      
      {(saldos.length > 0 || historial.length > 0 || pagos.length > 0) && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-yellow-400">🔍 Aplicaciones encontradas:</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set([
              ...saldos.map(s => s.aplicacion).filter(Boolean),
              ...historial.map(h => h.aplicacion).filter(Boolean),
              ...pagos.map(p => p.aplicacion).filter(Boolean)
            ])).map(app => (
              <span key={app} className="bg-gray-700 px-3 py-1 rounded text-sm">
                {app}
              </span>
            ))}
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">🧪 Test de filtrado:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Para YouTube:</strong>
                <div>Saldos: {saldos.filter(s => s.aplicacion?.toLowerCase() === 'youtube').length}</div>
                <div>Historial: {historial.filter(h => h.aplicacion?.toLowerCase() === 'youtube').length}</div>
                <div>Pagos: {pagos.filter(p => p.aplicacion?.toLowerCase() === 'youtube').length}</div>
              </div>
              <div>
                <strong>Para Crunchyroll:</strong>
                <div>Saldos: {saldos.filter(s => s.aplicacion?.toLowerCase() === 'crunchyroll').length}</div>
                <div>Historial: {historial.filter(h => h.aplicacion?.toLowerCase() === 'crunchyroll').length}</div>
                <div>Pagos: {pagos.filter(p => p.aplicacion?.toLowerCase() === 'crunchyroll').length}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-400">
        💡 También revisa la consola del navegador (F12) para logs detallados
      </div>
    </div>
  );
}
