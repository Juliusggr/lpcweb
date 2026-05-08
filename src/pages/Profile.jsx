import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { resolveImageUrl } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading, updateSessionUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedOrderForClaim, setSelectedOrderForClaim] = useState(null);
  const [claimReason, setClaimReason] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchOrders(user.id);
  }, [user, authLoading, navigate]);

  const fetchOrders = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          detalles_venta (
            *,
            productos (nombre, imagen),
            productos_variantes (talla, color)
          ),
          reclamos (id, motivo, estado, respuesta)
        `)
        .eq('cliente_id', userId)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openClaimModal = (order) => {
    setSelectedOrderForClaim(order);
    setClaimReason('');
    setClaimModalOpen(true);
  };

  const openEditProfile = () => {
    setEditProfileForm({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      telefono: user.telefono || '',
      direccion: user.direccion || ''
    });
    setEditProfileOpen(true);
  };

  const submitEditProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nombre: editProfileForm.nombre,
          apellido: editProfileForm.apellido,
          telefono: editProfileForm.telefono,
          direccion: editProfileForm.direccion
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      updateSessionUser({
        nombre: editProfileForm.nombre,
        apellido: editProfileForm.apellido,
        telefono: editProfileForm.telefono,
        direccion: editProfileForm.direccion
      });
      alert('Perfil actualizado correctamente');
      setEditProfileOpen(false);
    } catch (err) {
      console.error('Error updating profile', err);
      alert('Hubo un error al actualizar tu perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const submitClaim = async (e) => {
     e.preventDefault();
     if (!claimReason.trim()) return;
     setSubmittingClaim(true);
     try {
        const { error } = await supabase.from('reclamos').insert([{
           cliente_id: user.id,
           venta_id: selectedOrderForClaim.id,
           motivo: claimReason
        }]);

        if (error) throw error;
        alert('Reclamo enviado correctamente. Un administrador lo revisará pronto.');
        setClaimModalOpen(false);
        // Refresh orders locally
        fetchOrders(user.id);
     } catch(err) {
        console.error('Error enviando reclamo:', err);
        alert('Hubo un error al enviar tu reclamo. Asegúrate de tener conexión y de permitir guardar datos.');
     } finally {
        setSubmittingClaim(false);
     }
  };

  const printReceiptLetter = async (order) => {
    // Obtener la tasa BCV del sistema
    let tasaBCV = 0;
    try {
      const { data } = await supabase.from('configuracion').select('valor').eq('clave', 'tasa_bcv').single();
      if (data) tasaBCV = parseFloat(data.valor) || 0;
    } catch(e) {
      console.error('Error fetching tasa_bcv', e);
    }
    
    // Si no logramos conectarnos o es 0, usamos al menos 1 para que matemáticamente se vea el campo
    const tasa = tasaBCV || 1;

    const printWin = window.open('', '_blank', 'width=800,height=900');
    
    let itemsHtml = '';
    order.detalles_venta?.forEach(item => {
      itemsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productos?.nombre} ${item.productos_variantes?.talla || ''} ${item.productos_variantes?.color || ''}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.precio_unitario || 0).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(Number(item.precio_unitario || 0) * item.cantidad).toFixed(2)}</td>
        </tr>
      `;
    });

    const subtotalUSD = Number(order.subtotal || order.total).toFixed(2);
    const ivaUSD = Number(order.iva || 0).toFixed(2);
    const totalUSD = Number(order.total).toFixed(2);
    const totalBs = (Number(order.total) * tasa).toFixed(2);
    const valorTasaStr = tasaBCV ? `(Tasa BCV del día: Bs. ${tasa.toFixed(2)})` : `(Bolívares calculados a tasa referencial)`;

    printWin.document.write(`
      <html>
        <head>
          <title>Factura de Compra - ${order.id}</title>
          <link href="https://fonts.googleapis.com/css2?family=Petit+Formal+Script&display=swap" rel="stylesheet">
          <style>
             body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
             .header { text-align: center; margin-bottom: 40px; }
             .logo-text { font-family: 'Petit Formal Script', cursive; font-size: 42px; color: #4338ca; margin: 0; }
             .business-info { font-size: 14px; color: #666; margin-top: 5px; line-height: 1.5; }
             .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #4338ca; padding-bottom: 20px;}
             .client-info h4 { margin: 0 0 10px 0; color: #4338ca; }
             .client-info p { margin: 5px 0; font-size: 14px; }
             .order-info { text-align: right; }
             .order-info h3 { margin: 0 0 10px 0; color: #333; }
             .order-info p { margin: 5px 0; font-size: 14px; }
             table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
             th { background-color: #f8fafc; padding: 12px 10px; text-align: left; font-weight: bold; color: #334155; border-bottom: 2px solid #e2e8f0; }
             .totals { width: 320px; float: right; }
             .totals-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;}
             .totals-row.grand-total { font-size: 18px; font-weight: bold; color: #4338ca; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 10px; }
             .totals-row.grand-total-bs { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;}
             .tasa-info { text-align: right; font-size: 12px; color: #64748b; margin-top: 5px; font-style: italic; }
             .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; clear: both;}
             @media print {
               .no-print { display: none !important; }
             }
          </style>
        </head>
        <body>
          <div class="header">
             <h1 class="logo-text">La Princesa Linda</h1>
             <div class="business-info">
               RIF: J-29460091-3<br>
               Calle Libertad, Edif La Princesa Linda PB 01, Centro, Puerto La Cruz, Edo. Anzoátegui.<br>
               Teléfono: 0281- 2652970 | Email: contacto@princesalinda.com
             </div>
             <h2 style="margin-top: 20px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-size: 18px;">Factura Formato Libre</h2>
          </div>
          
          <div class="invoice-details">
             <div class="client-info">
                <h4>FACTURAR A:</h4>
                <p><strong>${user.nombre} ${user.apellido}</strong></p>
                <p>C.I. / RIF: ${user.cedula}</p>
                <p>Teléfono: ${user.telefono || 'N/A'}</p>
                <p>Dirección: ${user.direccion || 'N/A'}</p>
             </div>
             <div class="order-info">
                <h3>Factura N° ${String(order.id).padStart(6, '0')}</h3>
                <p><strong>Fecha:</strong> ${new Date(order.fecha).toLocaleDateString()}</p>
                <p><strong>Método de Pago:</strong> ${order.metodo_pago.replace('_', ' ')}</p>
             </div>
          </div>

          <table>
             <thead>
                <tr>
                   <th>Descripción del Producto</th>
                   <th style="text-align: center;">Cantidad</th>
                   <th style="text-align: right;">Precio Unit.</th>
                   <th style="text-align: right;">Total</th>
                </tr>
             </thead>
             <tbody>
                ${itemsHtml}
             </tbody>
          </table>

          <div class="totals">
             <div class="totals-row">
                <span>Subtotal:</span>
                <span>$${subtotalUSD}</span>
             </div>
             <div class="totals-row">
                <span>IVA (16%):</span>
                <span>$${ivaUSD}</span>
             </div>
             <div class="totals-row grand-total">
                <span>TOTAL A PAGAR (USD):</span>
                <span>$${totalUSD}</span>
             </div>
             <div class="totals-row grand-total-bs">
                <span>TOTAL A PAGAR (Bs.):</span>
                <span>Bs. ${totalBs}</span>
             </div>
             <div class="tasa-info">${valorTasaStr}</div>
          </div>

          <div class="footer">
             Documento no fiscal. Gracias por su compra en La Princesa Linda.
             <br>Para reclamos o devoluciones conserve este recibo.
          </div>
          <div class="no-print" style="text-align: center; margin-top: 40px;">
             <button onclick="window.print()" style="background: #4338ca; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(67, 56, 202, 0.2);">Imprimir Factura</button>
          </div>
        </body>
      </html>
    `);
    
    printWin.document.close();
    printWin.focus();
  };

  if (authLoading || !user || loadingOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper for generating initials
  const initials = `${user.nombre?.charAt(0) || ''}${user.apellido?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 relative py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* Header / Profile Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center md:items-center justify-between gap-8 transition-all hover:shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center text-4xl font-extrabold shadow-lg shrink-0 transform hover:scale-105 transition-transform duration-300">
              {initials}
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{user.nombre} {user.apellido}</h1>
              <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-slate-600 font-medium translate-y-1">
                <span className="flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>
                  C.I. {user.cedula}
                </span>
                <span className="flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  {user.telefono || 'Sin Teléfono'}
                </span>
              </div>
              {user.direccion && (
                  <p className="text-slate-500 text-sm mt-3 flex items-start justify-center md:justify-start gap-2">
                     <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                     <span className="max-w-md">{user.direccion}</span>
                  </p>
              )}
            </div>
          </div>
          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3 shrink-0">
            <button 
              onClick={openEditProfile}
              className="px-6 py-3 font-semibold text-indigo-700 bg-indigo-50 border-2 border-indigo-100 rounded-full hover:bg-indigo-100 hover:border-indigo-200 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              Editar Perfil
            </button>
            <button 
              onClick={handleLogout}
              className="px-6 py-3 font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Salir
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Historial de Compras</h2>
            <div className="h-px bg-slate-300 flex-1 ml-4 rounded-full"></div>
          </div>
          
          {orders.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-sm border border-white/50 rounded-3xl p-12 text-center shadow-sm">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
               </div>
               <h3 className="text-xl font-bold text-slate-700">Tu bolsa está vacía</h3>
               <p className="text-slate-500 mt-2">Aún no has realizado ningún pedido en nuestra tienda.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => (
                <div key={order.id} className="bg-white/80 backdrop-blur-md border border-white/60 shadow-lg hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden group">
                  
                  {/* Card Header */}
                  <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-indigo-600 tracking-wider uppercase">Pedido #{order.id}</p>
                      <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                         {new Date(order.fecha).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex flex-col sm:items-end w-full sm:w-auto">
                      <p className="text-2xl font-extrabold text-slate-800">${order.total.toFixed(2)}</p>
                      <p className="text-xs font-semibold text-slate-500 bg-slate-200/50 px-3 py-1 rounded-md capitalize mt-1.5 w-max">
                        {order.metodo_pago.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status row */}
                  <div className="bg-white px-8 py-4 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-semibold text-slate-500">Pago:</span>
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-bold rounded-full shadow-sm ${
                             order.estado === 'completado' ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-green-700 border border-green-200/50' :
                             order.estado === 'pendiente' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200/50' :
                             'bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 border border-rose-200/50'
                           }`}>
                             {order.estado === 'completado' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}
                             {order.estado === 'pendiente' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                             {order.estado === 'rechazado' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>}
                             {order.estado ? order.estado.charAt(0).toUpperCase() + order.estado.slice(1) : 'Completado'}
                           </span>
                        </div>
                        
                        <div className="flex items-center gap-2 border-l-0 sm:border-l border-slate-200 pl-0 sm:pl-6">
                           <span className="text-sm font-semibold text-slate-500">Entrega:</span>
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-bold rounded-full shadow-sm ${
                             order.estatus_entrega === 'Entregado' ? 'bg-emerald-100 text-green-700 border border-green-200/50' :
                             'bg-indigo-100 text-indigo-700 border border-indigo-200/50'
                           }`}>
                             {order.estatus_entrega === 'Entregado' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                             ) : (
                                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                             )}
                             {order.estatus_entrega || 'Pendiente'}
                           </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button
                           onClick={() => printReceiptLetter(order)}
                           className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-500 hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 border border-indigo-100 hover:border-transparent hover:shadow-lg hover:shadow-indigo-500/30 w-full md:w-auto"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                           Factura
                        </button>
                        <button
                           onClick={() => openClaimModal(order)}
                           className="flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 border border-rose-100 hover:border-transparent hover:shadow-lg hover:shadow-rose-500/30 w-full md:w-auto"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                           Reclamar
                        </button>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {order.detalles_venta.map((item) => (
                        <div key={item.id} className="flex items-center gap-5 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                          <div className="w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                            {item.productos?.imagen ? (
                              <img 
                                src={resolveImageUrl(item.productos.imagen)} 
                                alt={item.productos.nombre} 
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">Sin Img</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 text-lg leading-tight">{item.productos?.nombre || 'Producto Mutilado'}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm">
                               <span className="text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md font-medium">Talla: {item.productos_variantes?.talla}</span>
                               <span className="text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md font-medium flex items-center gap-1.5">
                                  Color: {item.productos_variantes?.color}
                               </span>
                            </div>
                            <p className="text-sm font-bold text-indigo-500 mt-2">
                               {item.cantidad} unidad{item.cantidad > 1 ? 'es' : ''} × ${(item.precio_unitario || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Claims Section */}
                    {order.reclamos && order.reclamos.length > 0 && (
                       <div className="mt-8 pt-8 border-t border-slate-200/60">
                          <h4 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                             <span className="bg-rose-100 text-rose-500 p-1.5 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                             </span>
                             Historial de Reclamos
                          </h4>
                          <div className="space-y-4">
                            {order.reclamos.map(reclamo => (
                               <div key={reclamo.id} className="bg-white border rounded-2xl p-5 shadow-sm overflow-hidden relative">
                                  {/* Color bar indicator */}
                                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                      reclamo.estado === 'resuelto' ? 'bg-green-500' :
                                      reclamo.estado === 'rechazado' ? 'bg-red-500' : 'bg-yellow-500'
                                  }`}></div>
                                  
                                  <div className="pl-4">
                                     <div className="flex justify-between items-start gap-4 mb-3">
                                        <div className="flex-1">
                                           <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Tu Motivo:</span>
                                           <p className="text-slate-800 font-medium">{reclamo.motivo}</p>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                          reclamo.estado === 'resuelto' ? 'bg-green-100 text-green-700' :
                                          reclamo.estado === 'rechazado' ? 'bg-red-100 text-red-700' :
                                          'bg-yellow-100 text-yellow-700'
                                        }`}>
                                          {reclamo.estado ? reclamo.estado.charAt(0).toUpperCase() + reclamo.estado.slice(1) : 'Pendiente'}
                                        </span>
                                     </div>
                                     
                                     {reclamo.respuesta && (
                                        <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                                           <div className="absolute -top-3 left-4 bg-slate-50 px-2">
                                              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                                                 Respuesta Soporte
                                              </span>
                                           </div>
                                           <p className="text-slate-700 italic pt-1">"{reclamo.respuesta}"</p>
                                        </div>
                                     )}
                                  </div>
                               </div>
                            ))}
                          </div>
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => setEditProfileOpen(false)}></div>
            <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl transform transition-all border border-slate-100">
               <div className="absolute top-6 right-6">
                  <button onClick={() => setEditProfileOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-2 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
               </div>
               
               <div className="mb-6 flex space-x-3 items-center text-indigo-500">
                  <div className="bg-indigo-100 p-3 rounded-2xl">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800">Editar Perfil</h3>
               </div>

               <form onSubmit={submitEditProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                        <input
                           required
                           type="text"
                           className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                           value={editProfileForm.nombre}
                           onChange={(e) => setEditProfileForm({...editProfileForm, nombre: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido</label>
                        <input
                           type="text"
                           className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                           value={editProfileForm.apellido}
                           onChange={(e) => setEditProfileForm({...editProfileForm, apellido: e.target.value})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                     <input
                        required
                        type="tel"
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                        value={editProfileForm.telefono}
                        onChange={(e) => setEditProfileForm({...editProfileForm, telefono: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Dirección</label>
                     <textarea
                        required
                        rows="2"
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 font-medium resize-none"
                        value={editProfileForm.direccion}
                        onChange={(e) => setEditProfileForm({...editProfileForm, direccion: e.target.value})}
                     ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-8 pt-4">
                     <button
                        type="button"
                        onClick={() => setEditProfileOpen(false)}
                        className="px-6 py-3 font-bold text-slate-500 bg-transparent hover:bg-slate-100 rounded-xl transition-colors"
                     >
                        Cancelar
                     </button>
                     <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                     >
                        {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Modern Modal */}
      {claimModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => setClaimModalOpen(false)}></div>
            
            {/* Modal Dialog */}
            <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl transform transition-all transition-transform duration-300 scale-100 border border-slate-100">
               <div className="absolute top-6 right-6">
                  <button onClick={() => setClaimModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-2 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
               </div>
               
               <div className="mb-6 flex space-x-3 items-center text-rose-500">
                  <div className="bg-rose-100 p-3 rounded-2xl">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800">Generar Reclamo</h3>
               </div>

               <p className="text-slate-600 mb-6 font-medium">
                  Estás a punto de abrir un caso para el pedido <strong className="text-indigo-600">#{selectedOrderForClaim?.id}</strong>. 
                  Por favor detalla tu problema para que nuestro equipo lo evalúe.
               </p>
               
               <form onSubmit={submitClaim}>
                  <div className="relative group">
                     <textarea
                        required
                        rows={5}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 resize-none font-medium"
                        placeholder="Ej. Realicé el pago por Zelle pero el comprobante fue rechazado..."
                        value={claimReason}
                        onChange={(e) => setClaimReason(e.target.value)}
                     />
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-8">
                     <button
                        type="button"
                        onClick={() => setClaimModalOpen(false)}
                        className="px-6 py-3 font-bold text-slate-500 bg-transparent hover:bg-slate-100 rounded-xl transition-colors"
                     >
                        Cancelar
                     </button>
                     <button
                        type="submit"
                        disabled={submittingClaim}
                        className="px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                     >
                        {submittingClaim ? (
                           <>
                              <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              Enviando...
                           </>
                        ) : 'Enviar a Soporte'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
