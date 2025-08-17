'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const { user, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [showSaldoForm, setShowSaldoForm] = useState(false);
  
  // Estados para el formulario de pago
  const [aplicacion, setAplicacion] = useState('');
  const [nuevaAplicacion, setNuevaAplicacion] = useState('');
  const [mostrarNuevaAplicacion, setMostrarNuevaAplicacion] = useState(false);
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para el formulario de saldo
  const [aplicacionSaldo, setAplicacionSaldo] = useState('');
  const [usuarioDestinatario, setUsuarioDestinatario] = useState('');
  const [montoSaldo, setMontoSaldo] = useState('');
  const [usuarios, setUsuarios] = useState<unknown[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [nuevoUsuarioNombre, setNuevoUsuarioNombre] = useState('');

  // Aplicaciones predefinidas
  const aplicacionesPredefinidas = [
    'YouTube Premium',
    'Crunchyroll'
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  // Función para cargar usuarios disponibles
  const loadUsuarios = async () => {
    try {
      // Obtener usuarios únicos desde la tabla saldo usando la columna remitente
      // No filtramos por aplicación aquí, solo obtenemos nombres únicos de remitentes
      const { data, error } = await supabase
        .from('saldo')
        .select('remitente')
        .not('remitente', 'is', null);
      
      if (error) {
        console.error('Error cargando usuarios:', error);
        setUsuarios([]);
      } else {
        // Obtener nombres únicos de remitentes (sin importar la aplicación)
        const uniqueNames = [...new Set(data?.map(s => s.remitente) || [])];
        
        // Crear lista de usuarios con nombres
        const usuariosConInfo = uniqueNames.map((nombre, index) => ({
          id: `user_${index}`,
          email: nombre as string // Usar el campo email para mostrar el nombre
        }));
        
        setUsuarios(usuariosConInfo);
      }
    } catch (err) {
      console.error('Error inesperado cargando usuarios:', err);
      setUsuarios([]);
    }
  };

  // Función para agregar un usuario manualmente
  const handleAddUser = () => {
    if (!nuevoUsuarioNombre.trim()) return;
    
    const newUser = {
      id: `manual_${Date.now()}`, // ID temporal para usuarios manuales
      email: nuevoUsuarioNombre.trim() // Usar nombre en lugar de email
    };
    
    setUsuarios(prev => [...prev, newUser]);
    setNuevoUsuarioNombre('');
    setShowAddUser(false);
  };

  const handleSaldoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    if (!usuarioDestinatario) {
      setError('Debe seleccionar quién hizo el pago');
      setLoading(false);
      return;
    }

    try {
      // Si es un usuario manual (empieza con 'manual_'), usar el nombre como identificador
      let usuarioNombre = usuarioDestinatario;
      
      if (usuarioDestinatario.startsWith('manual_')) {
        // Para usuarios manuales, usar el nombre
        const usuario = usuarios.find(u => (u as Record<string, unknown>).id === usuarioDestinatario);
        usuarioNombre = (usuario as Record<string, unknown>)?.email as string || usuarioDestinatario; // email contiene el nombre
      } else {
        // Para usuarios existentes, obtener el nombre desde la lista de usuarios
        const usuario = usuarios.find(u => (u as Record<string, unknown>).id === usuarioDestinatario);
        usuarioNombre = (usuario as Record<string, unknown>)?.email as string || usuarioDestinatario;
      }

      // 1. Solo agregar a historial_pagos (NO a la tabla pagos)
      const { data: historialData, error: historialError } = await supabase
        .from('historial_pagos')
        .insert([
          {
            remitente_id: user.id, // Usuario que está registrando
            remitente_nombre: usuarioNombre, // Nombre de quien realmente hizo el pago
            aplicacion: aplicacionSaldo,
            monto: parseFloat(montoSaldo)
          }
        ])
        .select()
        .single();

      if (historialError) {
        setError(historialError.message);
        return;
      }

      // 2. Verificar si ya existe un saldo para este usuario Y aplicación específica
      const { data: saldoExistente, error: saldoError } = await supabase
        .from('saldo')
        .select('*')
        .eq('remitente', usuarioNombre)
        .eq('aplicacion', aplicacionSaldo)
        .single();

      if (saldoError && saldoError.code !== 'PGRST116') {
        setError(saldoError.message);
        return;
      }

      if (saldoExistente) {
        // 3a. Si existe el usuario para esa aplicación, sumar el monto al saldo existente
        const { error: updateError } = await supabase
          .from('saldo')
          .update({ 
            monto: saldoExistente.monto + parseFloat(montoSaldo)
          })
          .eq('id', saldoExistente.id);

        if (updateError) {
          setError(updateError.message);
          return;
        }
      } else {
        // 3b. Si no existe, intentar crear nuevo registro 
        // Si falla por restricción única, actualizar el existente
        try {
          const { error: insertError } = await supabase
            .from('saldo')
            .insert([
              {
                usuario_id: user.id,
                monto: parseFloat(montoSaldo),
                remitente: usuarioNombre,
                aplicacion: aplicacionSaldo
              }
            ]);

          if (insertError) {
            // Si es error de restricción única, buscar y actualizar el registro existente
            console.log('Insertando falló, buscando registro existente...');
            
            const { data: saldoExistente2, error: findError2 } = await supabase
              .from('saldo')
              .select('*')
              .eq('remitente', usuarioNombre)
              .eq('aplicacion', aplicacionSaldo)
              .single();

            if (saldoExistente2) {
              const { error: updateError2 } = await supabase
                .from('saldo')
                .update({ 
                  monto: saldoExistente2.monto + parseFloat(montoSaldo)
                })
                .eq('id', saldoExistente2.id);

              if (updateError2) {
                setError('Error al actualizar saldo: ' + updateError2.message);
                return;
              }
            } else {
              setError('Error: ' + insertError.message);
              return;
            }
          }
        } catch (err) {
          setError('Error inesperado: ' + err);
          return;
        }
      }

      setSuccess('Pago agregado exitosamente');
      // Limpiar formulario
      setAplicacionSaldo('');
      setUsuarioDestinatario('');
      setMontoSaldo('');
      setShowAddUser(false);
      setNuevoUsuarioNombre('');
      // Volver al modal principal después de 2 segundos
      setTimeout(() => {
        setShowSaldoForm(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Error inesperado al agregar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handlePagoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    // Determinar qué aplicación usar
    const aplicacionFinal = mostrarNuevaAplicacion ? nuevaAplicacion : aplicacion;

    if (!aplicacionFinal) {
      setError('Debe seleccionar o ingresar una aplicación');
      setLoading(false);
      return;
    }

    try {
      // 1. Registrar el pago en la tabla pagos
      const { error: pagoError } = await supabase
        .from('pagos')
        .insert([
          {
            aplicacion: aplicacionFinal,
            monto: parseFloat(monto),
            usuario_id: user.id
          }
        ]);

      if (pagoError) {
        setError(pagoError.message);
        return;
      }

      // 2. Buscar todos los usuarios que tienen saldo para esta aplicación
      const { data: todosLosSaldos, error: saldoError } = await supabase
        .from('saldo')
        .select('*')
        .eq('aplicacion', aplicacionFinal);

      if (saldoError) {
        setError('Error al buscar los saldos: ' + saldoError.message);
        return;
      }

      // 3. Si hay usuarios con saldo para esta aplicación, dividir el pago entre todos
      if (todosLosSaldos && todosLosSaldos.length > 0) {
        const montoPorUsuario = parseFloat(monto) / todosLosSaldos.length;
        let usuariosActualizados = 0;

        // Actualizar el saldo de cada usuario
        for (const saldo of todosLosSaldos) {
          const nuevoSaldo = saldo.monto - montoPorUsuario;
          
          const { error: updateError } = await supabase
            .from('saldo')
            .update({ monto: nuevoSaldo })
            .eq('id', saldo.id);

          if (updateError) {
            setError(`Error al actualizar el saldo de ${saldo.remitente}: ` + updateError.message);
            return;
          }
          
          usuariosActualizados++;
        }

        setSuccess(`Pago registrado y dividido entre ${usuariosActualizados} usuarios. Descuento por usuario: $${montoPorUsuario.toFixed(2)}`);
      } else {
        // Si no hay usuarios con saldo para esta aplicación, solo registrar el pago
        setSuccess('Pago registrado exitosamente (no hay usuarios con saldo previo para esta aplicación)');
      }

      // Limpiar formulario
      setAplicacion('');
      setNuevaAplicacion('');
      setMostrarNuevaAplicacion(false);
      setMonto('');
      
      // Volver al modal principal después de 3 segundos
      setTimeout(() => {
        setShowPagoForm(false);
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError('Error inesperado al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setShowPagoForm(false);
    setShowSaldoForm(false);
    setError('');
    setSuccess('');
    // Formulario de pago
    setAplicacion('');
    setNuevaAplicacion('');
    setMostrarNuevaAplicacion(false);
    setMonto('');
    // Formulario de saldo
    setAplicacionSaldo('');
    setMontoSaldo('');
    setUsuarioDestinatario('');
    setShowAddUser(false);
    setNuevoUsuarioNombre('');
  };

  return (
    <>
      {/* Header minimalista negro/blanco */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-12">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div>
              <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
                SubChecks
              </Link>
            </div>

            {/* Usuario logueado o botones de auth */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Botón Pagos minimalista */}
                  <button 
                    onClick={() => setShowModal(true)}
                    className="text-white hover:text-gray-300 border border-gray-700 hover:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Pagos
                  </button>
                  
                  {/* Botón Cerrar Sesión */}
                  <button 
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-white px-4 py-2 text-sm transition-colors duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <a 
                    href="/auth/login" 
                    className="text-gray-300 hover:text-white px-4 py-2 text-sm transition-colors duration-200"
                  >
                    Iniciar Sesión
                  </a>
                  <a 
                    href="/auth/register" 
                    className="text-white hover:text-gray-300 border border-gray-700 hover:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Registrarse
                  </a>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Modal minimalista negro/blanco */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">
                {showPagoForm ? 'Registrar Pago a App' : 
                 showSaldoForm ? 'Agregar Pago al Historial' : 
                 'Gestión de Pagos'}
              </h2>
              <button 
                onClick={resetModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-900 text-gray-400 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              
              {/* Vista principal con opciones */}
              {!showPagoForm && !showSaldoForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card Pago a App - minimalista */}
                  <div 
                    onClick={() => setShowPagoForm(true)}
                    className="border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 border border-gray-800 rounded-lg flex items-center justify-center mr-4 group-hover:border-gray-700 transition-colors duration-200">
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white">Pago a App</h3>
                    </div>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                      Registra un pago que hiciste a una aplicación como Spotify, YouTube Premium, Netflix, etc.
                    </p>
                    <button className="w-full border border-gray-700 hover:border-gray-600 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:bg-gray-900">
                      Registrar Pago
                    </button>
                  </div>

                  {/* Card Agregar Pago - minimalista */}
                  <div 
                    onClick={() => {
                      setShowSaldoForm(true);
                      loadUsuarios(); // Cargar usuarios al abrir
                    }}
                    className="border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 border border-gray-800 rounded-lg flex items-center justify-center mr-4 group-hover:border-gray-700 transition-colors duration-200">
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white">Agregar Pago</h3>
                    </div>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                      Registra un pago que hizo otro usuario del grupo para mantener el historial actualizado.
                    </p>
                    <button className="w-full border border-gray-700 hover:border-gray-600 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:bg-gray-900">
                      Agregar Pago
                    </button>
                  </div>
                </div>
              )}

              {/* Formulario de Pago a App */}
              {showPagoForm && (
                <div className="space-y-6">
                  
                  {/* Mensajes de error y éxito */}
                  {error && (
                    <div className="border border-red-800 bg-red-900/20 rounded-lg p-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {success && (
                    <div className="border border-green-800 bg-green-900/20 rounded-lg p-4">
                      <p className="text-green-400 text-sm">{success}</p>
                    </div>
                  )}

                  <form onSubmit={handlePagoSubmit} className="space-y-6">
                    
                    {/* Campo Aplicación con DaisyUI */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Aplicación o Servicio</span>
                      </label>
                      
                      {!mostrarNuevaAplicacion ? (
                        <div className="space-y-3">
                          <select 
                            value={aplicacion}
                            onChange={(e) => setAplicacion(e.target.value)}
                            className="select select-bordered w-full"
                            required
                          >
                            <option value="">Selecciona una aplicación</option>
                            {aplicacionesPredefinidas.map((app) => (
                              <option key={app} value={app}>{app}</option>
                            ))}
                          </select>
                          <label className="label cursor-pointer justify-start">
                            <span 
                              className="label-text-alt link link-hover"
                              onClick={() => setMostrarNuevaAplicacion(true)}
                            >
                              ¿No encuentras tu aplicación? Agregar nueva
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={nuevaAplicacion}
                            onChange={(e) => setNuevaAplicacion(e.target.value)}
                            placeholder="Nombre de la nueva aplicación"
                            className="input input-bordered w-full"
                            required
                          />
                          <label className="label cursor-pointer justify-start">
                            <span 
                              className="label-text-alt link link-hover"
                              onClick={() => {
                                setMostrarNuevaAplicacion(false);
                                setNuevaAplicacion('');
                              }}
                            >
                              Volver a opciones predefinidas
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Campo Monto con DaisyUI */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Monto (USD)</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder="0.00"
                        className="input input-bordered w-full"
                        required
                      />
                    </div>

                    {/* Botones con DaisyUI */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowPagoForm(false)}
                        className="btn btn-outline flex-1"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`btn btn-primary flex-1 ${loading ? 'loading' : ''}`}
                      >
                        {loading ? 'Registrando...' : 'Registrar Pago'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Formulario de Agregar Pago */}
              {showSaldoForm && (
                <div className="space-y-6">
                  
                  {/* Mensajes de error y éxito */}
                  {error && (
                    <div className="border border-red-800 bg-red-900/20 rounded-lg p-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {success && (
                    <div className="border border-green-800 bg-green-900/20 rounded-lg p-4">
                      <p className="text-green-400 text-sm">{success}</p>
                    </div>
                  )}

                  <form onSubmit={handleSaldoSubmit} className="space-y-6">

                    {/* Aplicación */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Aplicación</span>
                      </label>
                      <select 
                        value={aplicacionSaldo}
                        onChange={(e) => setAplicacionSaldo(e.target.value)}
                        className="select select-bordered w-full"
                        required
                      >
                        <option value="">Selecciona la aplicación</option>
                        {aplicacionesPredefinidas.map((app) => (
                          <option key={app} value={app}>{app}</option>
                        ))}
                      </select>
                    </div>

                    {/* Usuario que hizo el pago */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Usuario que hizo el pago</span>
                      </label>
                      
                      {!showAddUser ? (
                        <div className="space-y-3">
                          <select 
                            value={usuarioDestinatario}
                            onChange={(e) => setUsuarioDestinatario(e.target.value)}
                            className="select select-bordered w-full"
                            required
                          >
                            <option value="">Selecciona quién hizo el pago</option>
                            {usuarios.map((usuario) => (
                              <option key={(usuario as Record<string, unknown>).id as string} value={(usuario as Record<string, unknown>).id as string}>
                                {(usuario as Record<string, unknown>).email as string}
                              </option>
                            ))}
                          </select>
                          
                          {usuarios.length === 0 ? (
                            <div className="text-center py-4 border border-gray-700 rounded-lg">
                              <p className="text-gray-400 mb-2">No hay usuarios disponibles</p>
                              <button
                                type="button"
                                onClick={() => setShowAddUser(true)}
                                className="btn btn-sm btn-outline"
                              >
                                Agregar Usuario
                              </button>
                            </div>
                          ) : (
                            <label className="label cursor-pointer justify-start">
                              <span 
                                className="label-text-alt link link-hover"
                                onClick={() => setShowAddUser(true)}
                              >
                                ¿No encuentras el usuario? Agregar nuevo
                              </span>
                            </label>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={nuevoUsuarioNombre}
                              onChange={(e) => setNuevoUsuarioNombre(e.target.value)}
                              placeholder="Nombre del usuario"
                              className="input input-bordered flex-1"
                              required
                            />
                            <button
                              type="button"
                              onClick={handleAddUser}
                              className="btn btn-primary"
                              disabled={!nuevoUsuarioNombre.trim()}
                            >
                              Agregar
                            </button>
                          </div>
                          <label className="label cursor-pointer justify-start">
                            <span 
                              className="label-text-alt link link-hover"
                              onClick={() => {
                                setShowAddUser(false);
                                setNuevoUsuarioNombre('');
                              }}
                            >
                              Volver a lista de usuarios
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Monto */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Monto pagado (USD)</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={montoSaldo}
                        onChange={(e) => setMontoSaldo(e.target.value)}
                        placeholder="0.00"
                        className="input input-bordered w-full"
                        required
                      />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowSaldoForm(false)}
                        className="btn btn-outline flex-1"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`btn btn-primary flex-1 ${loading ? 'loading' : ''}`}
                      >
                        {loading ? 'Agregando...' : 'Agregar Pago'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

            {/* Footer del modal - solo mostrar en vista principal */}
            {!showPagoForm && !showSaldoForm && (
              <div className="p-6 border-t border-gray-800">
                <button 
                  onClick={resetModal}
                  className="w-full border border-gray-700 hover:border-gray-600 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:bg-gray-900"
                >
                  Cerrar
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
