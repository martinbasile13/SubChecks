'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useGestionPagos } from '@/hooks/useGestionPagos';
import { useGestionPagosSimple } from '@/hooks/useGestionPagosSimple';

export default function GestionPagos() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const aplicacion = params.aplicacion as string;
  
  // Usar el hook simple para debug
  const { datos, loading, error } = useGestionPagosSimple(aplicacion);
  const saldos = datos.saldos || [];
  const historialPagos = datos.historial || [];
  const pagosWeb = datos.pagos || [];
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [paginaActualPagos, setPaginaActualPagos] = useState(1);
  const itemsPorPagina = 5;
  
  // Configuración según la aplicación
  const config = {
    youtube: {
      nombre: 'YouTube Premium',
      shadowColor: 'shadow-red-500',
      borderColor: 'border-red-500'
    },
    crunchyroll: {
      nombre: 'Crunchyroll',
      shadowColor: 'shadow-orange-500',
      borderColor: 'border-orange-500'
    }
  };
  
  const appConfig = config[aplicacion as keyof typeof config];
  
  if (!appConfig) {
    return <div className="min-h-screen bg-black text-white p-8">Aplicación no encontrada</div>;
  }

  // Funciones para eliminar con manejo de errores y confirmación
  const handleEliminarSaldo = async (id: number) => {
    alert('Función de eliminar temporalmente deshabilitada para debug');
    // if (!user) {
    //   alert('Debes iniciar sesión para realizar esta acción');
    //   return;
    // }
    
    // if (!confirm('¿Estás seguro de que quieres eliminar este saldo?')) return;
    
    // try {
    //   await eliminarSaldo(id);
    //   alert('Saldo eliminado correctamente');
    // } catch (error) {
    //   alert('Error al eliminar el saldo');
    //   console.error(error);
    // }
  };

  const handleEliminarHistorial = async (id: number) => {
    alert('Función de eliminar temporalmente deshabilitada para debug');
    // if (!user) {
    //   alert('Debes iniciar sesión para realizar esta acción');
    //   return;
    // }
    
    // if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;
    
    // try {
    //   await eliminarHistorial(id);
    //   alert('Registro eliminado correctamente');
    // } catch (error) {
    //   alert('Error al eliminar el registro');
    //   console.error(error);
    // }
  };

  const handleEliminarPagoWeb = async (id: number) => {
    alert('Función de eliminar temporalmente deshabilitada para debug');
    // if (!user) {
    //   alert('Debes iniciar sesión para realizar esta acción');
    //   return;
    // }
    
    // if (!confirm('¿Estás seguro de que quieres eliminar este pago?')) return;
    
    // try {
    //   await eliminarPagoWeb(id);
    //   alert('Pago eliminado correctamente');
    // } catch (error) {
    //   alert('Error al eliminar el pago');
    //   console.error(error);
    // }
  };
  
  // Paginación para Historial
  const totalPaginas = Math.ceil(historialPagos.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const historialPaginado = historialPagos.slice(inicio, inicio + itemsPorPagina);

  // Paginación para Pagos Web
  const totalPaginasPagos = Math.ceil(pagosWeb.length / itemsPorPagina);
  const inicioPagos = (paginaActualPagos - 1) * itemsPorPagina;
  const pagosWebPaginados = pagosWeb.slice(inicioPagos, inicioPagos + itemsPorPagina);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" data-theme="dark">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header con botón de volver */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold text-white text-center flex-1">
            Gestión de Pagos - {appConfig.nombre}
          </h1>
          <div className="w-16"></div> {/* Spacer para centrar el título */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tabla de Saldos */}
          <div className={`bg-black border border-gray-800 rounded-lg p-6 shadow-2xl ${appConfig.shadowColor}`}>
            <h2 className="text-2xl font-bold text-white mb-4">Saldos de Usuarios</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-gray-300 py-2">Remitente</th>
                    <th className="text-gray-300 py-2">Saldo</th>
                    <th className="text-gray-300 py-2">Actualizado</th>
                    {user && <th className="text-gray-300 py-2">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {saldos.length > 0 ? (
                    saldos.map((saldo: any) => (
                      <tr key={saldo.id} className="border-b border-gray-800">
                        <td className="text-white py-3">{saldo.remitente}</td>
                        <td className="text-green-400 py-3 font-medium">${saldo.monto.toLocaleString()}</td>
                        <td className="text-gray-400 py-3">
                          {new Date(saldo.updated_at || saldo.created_at || '').toLocaleDateString()}
                        </td>
                        {user && (
                          <td className="py-3">
                            <button
                              onClick={() => handleEliminarSaldo(saldo.id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Eliminar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={user ? 4 : 3} className="text-center text-gray-400 py-8">
                        No hay saldos registrados para {appConfig.nombre}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Pagos a la Web */}
          <div className={`bg-black border border-gray-800 rounded-lg p-6 shadow-2xl ${appConfig.shadowColor}`}>
            <h2 className="text-2xl font-bold text-white mb-4">Pagos a la Web</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-gray-300 py-2">Monto</th>
                    <th className="text-gray-300 py-2">Descripción</th>
                    <th className="text-gray-300 py-2">Fecha</th>
                    {user && <th className="text-gray-300 py-2">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {pagosWebPaginados.length > 0 ? (
                    pagosWebPaginados.map((pago: any) => (
                      <tr key={pago.id} className="border-b border-gray-800">
                        <td className="text-white py-3 font-medium">${pago.monto.toLocaleString()}</td>
                        <td className="text-gray-400 py-3">{pago.descripcion || 'Sin descripción'}</td>
                        <td className="text-gray-400 py-3">
                          {new Date(pago.fecha).toLocaleDateString()}
                        </td>
                        {user && (
                          <td className="py-3">
                            <button
                              onClick={() => handleEliminarPagoWeb(pago.id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Eliminar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={user ? 4 : 3} className="text-center text-gray-400 py-8">
                        {pagosWeb.length === 0 
                          ? `No hay pagos registrados para ${appConfig.nombre}`
                          : 'No hay pagos en esta página'
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Controles de paginación para Pagos Web */}
            {totalPaginasPagos > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setPaginaActualPagos(Math.max(1, paginaActualPagos - 1))}
                  disabled={paginaActualPagos === 1}
                  className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  ← Anterior
                </button>
                
                <span className="text-gray-400">
                  Página {paginaActualPagos} de {totalPaginasPagos}
                </span>
                
                <button
                  onClick={() => setPaginaActualPagos(Math.min(totalPaginasPagos, paginaActualPagos + 1))}
                  disabled={paginaActualPagos === totalPaginasPagos}
                  className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Historial con Paginación */}
        <div className={`mt-8 bg-black border border-gray-800 rounded-lg p-6 shadow-2xl ${appConfig.shadowColor}`}>
          <h2 className="text-2xl font-bold text-white mb-4">Historial de Pagos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-gray-300 py-2">Remitente</th>
                  <th className="text-gray-300 py-2">Monto</th>
                  <th className="text-gray-300 py-2">Fecha</th>
                  <th className="text-gray-300 py-2">Pago ID</th>
                  {user && <th className="text-gray-300 py-2">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {historialPaginado.length > 0 ? (
                  historialPaginado.map((pago: any) => (
                    <tr key={pago.id} className="border-b border-gray-800">
                      <td className="text-white py-3">{pago.remitente_nombre || pago.remitente_id}</td>
                      <td className="text-white py-3 font-medium">${pago.monto.toLocaleString()}</td>
                      <td className="text-gray-400 py-3">
                        {new Date(pago.fecha_creacion).toLocaleDateString()}
                      </td>
                      <td className="text-gray-400 py-3">#{pago.pago_id}</td>
                      {user && (
                        <td className="py-3">
                          <button
                            onClick={() => handleEliminarHistorial(pago.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={user ? 5 : 4} className="text-center text-gray-400 py-8">
                      No hay historial de pagos para {appConfig.nombre}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {historialPagos.length > itemsPorPagina && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-200"
              >
                Anterior
              </button>
              
              <span className="text-gray-400">
                Página {paginaActual} de {totalPaginas}
              </span>
              
              <button
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-200"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
