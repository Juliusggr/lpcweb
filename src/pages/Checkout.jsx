import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useExchangeRate } from '../context/ExchangeRateContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, CreditCard, Landmark, Smartphone, AlertTriangle, X, CheckCircle } from 'lucide-react';

const VisaLogo = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="20" rx="3" fill="#1434CB" />
    <text x="16" y="14" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif" textAnchor="middle" letterSpacing="0.5">VISA</text>
  </svg>
);

const MastercardLogo = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="20" rx="3" fill="#141413" />
    <circle cx="11.5" cy="10" r="6.5" fill="#EB001B" />
    <circle cx="20.5" cy="10" r="6.5" fill="#F79E1B" />
    <path fillRule="evenodd" clipRule="evenodd" d="M16 14.7073C17.4338 13.6823 18.363 11.9472 18.363 10C18.363 8.05286 17.4338 6.31767 16 5.29269C14.5662 6.31767 13.637 8.05286 13.637 10C13.637 11.9472 14.5662 13.6823 16 14.7073Z" fill="#FF5F00" />
  </svg>
);

const BANCOS_VENEZUELA = [
  { codigo: '0172', nombre: '100% Banco' },
  { codigo: '0114', nombre: 'Bancaribe' },
  { codigo: '0172', nombre: 'Bancamiga' },
  { codigo: '0134', nombre: 'Banesco' },
  { codigo: '0174', nombre: 'Banplus' },
  { codigo: '0175', nombre: 'Banco Activo' },
  { codigo: '0166', nombre: 'Banco Agrícola de Venezuela' },
  { codigo: '0175', nombre: 'Banco Bicentenario del Pueblo' },
  { codigo: '0128', nombre: 'Banco Caroní' },
  { codigo: '0102', nombre: 'Banco de Venezuela' },
  { codigo: '0163', nombre: 'Banco del Tesoro' },
  { codigo: '0115', nombre: 'Banco Exterior' },
  { codigo: '0105', nombre: 'Banco Mercantil' },
  { codigo: '0191', nombre: 'Banco Nacional de Crédito (BNC)' },
  { codigo: '0138', nombre: 'Banco Plaza' },
  { codigo: '0108', nombre: 'Banco Provincial (BBVA Provincial)' },
  { codigo: '0137', nombre: 'Banco Sofitasa' },
  { codigo: '0168', nombre: 'Bancrecer' },
  { codigo: '0177', nombre: 'Banfanb' },
  { codigo: '0146', nombre: 'Bangente' },
  { codigo: '0170', nombre: 'Citybank' },
  { codigo: '0101', nombre: 'Consorcio Credicard' },
  { codigo: '0101', nombre: 'Delta Banco' },
  { codigo: '0151', nombre: 'Fondo Común (BFC)' },
  { codigo: '0169', nombre: 'Instituto Municipal de Crédito Popular' },
  { codigo: '0100', nombre: 'Mi Banco' },
  { codigo: '0171', nombre: 'Novobanco' },
  { codigo: '0104', nombre: 'Venezolano de Crédito' }
];

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { exchangeRate } = useExchangeRate();
  const [loading, setLoading] = useState(false);
  const [sucursales, setSucursales] = useState([]);
  const [selectedSucursal, setSelectedSucursal] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('pago_movil');
  const [paymentDetails, setPaymentDetails] = useState({
    cedula: '',
    banco: '',
    telefono: '',
    referencia: '',
    comprobante: null,
    ccNumero: '',
    ccTitular: '',
    ccVencimiento: '',
    ccCvv: ''
  });

  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const showToast = (msg, type = 'error') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), type === 'error' ? 5000 : 3000);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchSucursales() {
      const { data } = await supabase
        .from('sucursales')
        .select('id, nombre, ciudad, direccion, telefono')
        .eq('activo', true)
        .order('nombre');
      if (data) setSucursales(data);
    }

    fetchSucursales();
  }, [navigate, user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="bg-white p-12 rounded-[2rem] shadow-xl border border-emerald-100 text-center max-w-lg mx-4">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">¡Compra Completada!</h1>
          <p className="text-slate-500 font-medium mb-8 text-lg">Tu pedido ha sido procesado de manera exitosa. Prepárate para vestirte con lo mejor.</p>
          <div className="w-8 h-8 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Redirigiendo al inicio...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-slate-100 text-center max-w-lg">
          <svg className="w-20 h-20 text-slate-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-4">Tu bolsa está vacía</h1>
          <button onClick={() => navigate('/')} className="text-indigo-600 font-bold hover:underline">Continuar Explorando</button>
        </div>
      </div>
    );
  }

  const iva = cartTotal * 0.16;
  const totalUSD = cartTotal + iva;
  const totalBs = totalUSD * exchangeRate;

  const uploadComprobante = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('comprobantes')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('comprobantes')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    if (!selectedSucursal) {
      showToast('Por favor selecciona la sucursal donde retirarás tu pedido.');
      setLoading(false);
      return;
    }

    try {
      let comprobanteUrl = null;

      if (paymentMethod === 'pago_movil' && paymentDetails.comprobante) {
        try {
          comprobanteUrl = await uploadComprobante(paymentDetails.comprobante);
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          showToast(`Error al subir el comprobante: ${uploadErr.message || 'Error desconocido'}`);
          setLoading(false);
          return;
        }
      } else if (paymentMethod === 'pago_movil' && !paymentDetails.comprobante) {
        showToast('Por favor sube el comprobante de pago.');
        setLoading(false);
        return;
      }

      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          cliente_id: user.id,
          usuario_id: 1,
          subtotal: cartTotal,
          iva: iva,
          igtf: 0,
          total: totalUSD,
          metodo_pago: paymentMethod === 'pago_movil' ? 'Pago Móvil' : paymentMethod === 'transferencia' ? 'Transferencia' : 'Tarjeta de Crédito',
          estado: paymentMethod === 'pago_movil' ? 'pendiente' : 'completado',
          sucursal_id: parseInt(selectedSucursal)
        }])
        .select()
        .single();

      if (ventaError) throw ventaError;

      for (const item of cart) {
        const { error: detalleError } = await supabase.from('detalles_venta').insert([{
          venta_id: venta.id,
          producto_id: item.product.id,
          variante_id: item.variant.id,
          cantidad: item.quantity,
          precio_unitario: item.product.precio
        }]);

        if (detalleError) {
          console.error('Error creating detail:', detalleError);
          throw detalleError;
        }

        const { data: currentVariant } = await supabase
          .from('productos_variantes')
          .select('stock')
          .eq('id', item.variant.id)
          .single();

        if (currentVariant) {
          const { error: stockError } = await supabase
            .from('productos_variantes')
            .update({ stock: currentVariant.stock - item.quantity })
            .eq('id', item.variant.id);

          if (stockError) console.error('Error updating stock:', stockError);
        }
      }

      let pagoInsert = {
        venta_id: venta.id,
        tipo: paymentMethod,
        banco: paymentMethod === 'tarjeta_credito' ? 'VISA/MASTERCARD' : paymentDetails.banco,
        telefono: paymentMethod === 'tarjeta_credito' ? null : paymentDetails.telefono,
        numero_referencia: paymentMethod === 'tarjeta_credito' ? `****${paymentDetails.ccNumero.slice(-4)}` : paymentDetails.referencia,
        cedula: paymentMethod === 'tarjeta_credito' ? paymentDetails.ccTitular : (paymentDetails.cedula || user.cedula),
        comprobante_url: comprobanteUrl
      };

      const { error: pagoError } = await supabase.from('pagos_electronicos').insert([pagoInsert]);

      if (pagoError) {
        console.error('Error creating payment record:', pagoError);
        throw pagoError;
      }

      setIsSuccess(true);
      clearCart();

      if (paymentMethod === 'pago_movil') {
        showToast('¡Pedido realizado! Tu compra está en espera de validación del pago.', 'success');
      } else {
        showToast('¡Pedido realizado con éxito!', 'success');
      }

      setTimeout(() => {
        navigate('/');
      }, 3500);

    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err.message || err.details || err.hint || JSON.stringify(err);
      showToast(`Error al realizar el pedido. Motivo: ${errorMessage}`);
    }
    setLoading(false);
  };

  const InputLabel = ({ children }) => <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{children}</label>;

  const modernInputClass = "w-full bg-slate-50/50 border border-slate-200 text-slate-800 p-3.5 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans overflow-hidden">

      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${toast.type === 'error' ? 'bg-white border-rose-200 text-rose-700' : 'bg-slate-900 border-slate-800 text-white'}`}>
          {toast.type === 'error' ? <AlertTriangle className="w-6 h-6 text-rose-500" /> : <CheckCircle className="w-6 h-6 text-emerald-400" />}
          <p className="font-bold text-sm tracking-wide max-w-sm">{toast.message}</p>
          <button onClick={() => setToast(t => ({ ...t, show: false }))} className={`ml-4 p-1.5 rounded-full ${toast.type === 'error' ? 'hover:bg-rose-50 text-rose-400' : 'hover:bg-slate-800 text-slate-400'} transition-colors`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

        <div className="flex items-center gap-4 mb-10">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pago Seguro</h1>
            <p className="text-slate-500 font-medium text-sm">Completa tu pago. Tus datos están encriptados.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Order Summary Form (Left side) */}
          <div className="lg:col-span-4 bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[2.5rem] p-8 lg:order-last sticky top-8">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center justify-between">
              Resumen
              <span className="bg-slate-200 text-slate-600 text-xs py-1 px-3 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)} artículos</span>
            </h2>

            <div className="space-y-5 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.variant.id}`} className="flex justify-between items-center text-sm group">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full font-bold text-xs">{item.quantity}</span>
                    <div>
                      <span className="font-bold text-slate-700 block line-clamp-1">{item.product.nombre}</span>
                      <span className="text-xs font-semibold text-slate-400">{item.variant.color} - {item.variant.talla}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {exchangeRate > 0 ? (
                      <>
                        <span className="font-extrabold text-slate-700 block">Bs. {(item.product.precio * item.quantity * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-xs text-slate-400">Ref. {(item.product.precio * item.quantity).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-extrabold text-slate-700">Ref. {(item.product.precio * item.quantity).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-200/60 bg-slate-50/50 -mx-8 -mb-8 p-8 rounded-b-[2.5rem]">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-semibold text-slate-500">Subtotal</span>
                <div className="text-right">
                  {exchangeRate > 0 && <span className="font-bold text-slate-700 block">Bs. {(cartTotal * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
                  <span className="text-xs text-slate-400">Ref. {cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="font-semibold text-slate-500">IVA (16%)</span>
                <div className="text-right">
                  {exchangeRate > 0 && <span className="font-bold text-slate-700 block">Bs. {(iva * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
                  <span className="text-xs text-slate-400">Ref. {iva.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-2 pt-4 border-t border-slate-200/60">
                <span className="text-base font-extrabold text-slate-800">Total a Pagar</span>
                <div className="text-right">
                  {exchangeRate > 0 ? (
                    <>
                      <span className="text-2xl font-black text-indigo-600 block">Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="text-sm font-bold text-slate-400">Ref. {totalUSD.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-black text-indigo-600">Ref. {totalUSD.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form (Right side) */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit}>

              {/* Pickup location */}
              <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[2.5rem] p-8 mb-6 transition-all hover:shadow-2xl">
                <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">1</div>
                  Punto de Retiro
                </h2>
                <div>
                  <InputLabel>Sucursal de Despacho <span className="text-rose-500">*</span></InputLabel>
                  <select
                    required
                    className={modernInputClass}
                    value={selectedSucursal}
                    onChange={e => setSelectedSucursal(e.target.value)}
                  >
                    <option value="" disabled>Selecciona la tienda más cercana a ti...</option>
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} — {s.ciudad}
                      </option>
                    ))}
                  </select>
                  {sucursales.length === 0 && (
                    <p className="text-xs font-bold text-amber-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      No hay sucursales disponibles en este momento.
                    </p>
                  )}
                  {selectedSucursal && (() => {
                    const active = sucursales.find(s => s.id.toString() === selectedSucursal.toString());
                    if (!active) return null;
                    return (
                      <div className="mt-5 p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-4">
                        <div className="mt-0.5 bg-indigo-100 p-2.5 rounded-xl text-indigo-600 shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 tracking-tight">Dirección de Retiro</p>
                          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                            {active.direccion || 'Calle Libertad, Edif La Princesa Linda PB 01, Centro, Puerto La Cruz, Edo. Anzoátegui.'}
                          </p>
                          <p className="text-sm font-semibold text-slate-600 mt-2.5 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {active.telefono || '0281- 2652970'}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[2.5rem] p-8 mb-6 transition-all hover:shadow-2xl">
                <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">2</div>
                  Método de Pago
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {/* Radio Choice: Pago Movil */}
                  <label className={`relative flex flex-col p-5 cursor-pointer rounded-2xl border-2 transition-all duration-300 ${paymentMethod === 'pago_movil' ? 'bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                    <input type="radio" name="paymentMethod" value="pago_movil" className="sr-only" checked={paymentMethod === 'pago_movil'} onChange={() => setPaymentMethod('pago_movil')} />
                    <Smartphone className={`w-6 h-6 mb-3 ${paymentMethod === 'pago_movil' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className={`font-bold ${paymentMethod === 'pago_movil' ? 'text-indigo-900' : 'text-slate-600'}`}>Pago Móvil</span>
                    {paymentMethod === 'pago_movil' && <div className="absolute top-4 right-4 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" strokeWidth={3} /></div>}
                  </label>

                  {/* Radio Choice: Transferencia */}
                  <label className={`relative flex flex-col p-5 cursor-pointer rounded-2xl border-2 transition-all duration-300 ${paymentMethod === 'transferencia' ? 'bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                    <input type="radio" name="paymentMethod" value="transferencia" className="sr-only" checked={paymentMethod === 'transferencia'} onChange={() => setPaymentMethod('transferencia')} />
                    <Landmark className={`w-6 h-6 mb-3 ${paymentMethod === 'transferencia' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className={`font-bold ${paymentMethod === 'transferencia' ? 'text-indigo-900' : 'text-slate-600'}`}>Transferencia</span>
                    {paymentMethod === 'transferencia' && <div className="absolute top-4 right-4 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" strokeWidth={3} /></div>}
                  </label>

                  {/* Radio Choice: CC */}
                  <label className={`relative flex flex-col p-5 cursor-pointer rounded-2xl border-2 transition-all duration-300 ${paymentMethod === 'tarjeta_credito' ? 'bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                    <input type="radio" name="paymentMethod" value="tarjeta_credito" className="sr-only" checked={paymentMethod === 'tarjeta_credito'} onChange={() => setPaymentMethod('tarjeta_credito')} />
                    <CreditCard className={`w-6 h-6 mb-3 ${paymentMethod === 'tarjeta_credito' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className={`font-bold ${paymentMethod === 'tarjeta_credito' ? 'text-indigo-900' : 'text-slate-600'}`}>Tarjeta Crédito</span>
                    {paymentMethod === 'tarjeta_credito' && <div className="absolute top-4 right-4 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" strokeWidth={3} /></div>}
                  </label>
                </div>

                {/* Form dynamic fields */}
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-6 transition-all">

                  {paymentMethod === 'pago_movil' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <InputLabel>Cédula de Identidad del Pago</InputLabel>
                        <input
                          type="text"
                          placeholder="V-12345678"
                          required
                          className={modernInputClass}
                          value={paymentDetails.cedula}
                          onChange={e => setPaymentDetails({ ...paymentDetails, cedula: e.target.value })}
                        />
                      </div>
                      <div>
                        <InputLabel>Teléfono Origen</InputLabel>
                        <input
                          type="text"
                          placeholder="0412 1234567"
                          required
                          className={modernInputClass}
                          value={paymentDetails.telefono}
                          onChange={e => setPaymentDetails({ ...paymentDetails, telefono: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod !== 'tarjeta_credito' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <InputLabel>Banco Emisor</InputLabel>
                        <select
                          required
                          className={modernInputClass}
                          value={paymentDetails.banco}
                          onChange={e => setPaymentDetails({ ...paymentDetails, banco: e.target.value })}
                        >
                          <option value="" disabled>Seleccionar Banco...</option>
                          {BANCOS_VENEZUELA.map(banco => (
                            <option key={banco.codigo} value={`${banco.nombre} (${banco.codigo})`}>
                              {banco.nombre} ({banco.codigo})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <InputLabel>Referencia Bancaria</InputLabel>
                        <input
                          type="text"
                          placeholder="Últimos 4 o 6 dígitos"
                          required
                          className={modernInputClass}
                          value={paymentDetails.referencia}
                          onChange={e => setPaymentDetails({ ...paymentDetails, referencia: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'tarjeta_credito' && (
                    <div className="space-y-6">
                      <div>
                        <InputLabel>Número de Tarjeta</InputLabel>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength="19"
                            placeholder="0000 0000 0000 0000"
                            required
                            className={`${modernInputClass} pr-14 text-lg tracking-widest`}
                            value={paymentDetails.ccNumero}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                              setPaymentDetails({ ...paymentDetails, ccNumero: formatted })
                            }}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            {paymentDetails.ccNumero?.replace(/\s/g, '').startsWith('4') && <VisaLogo />}
                            {(paymentDetails.ccNumero?.replace(/\s/g, '').match(/^5[1-5]/) || paymentDetails.ccNumero?.replace(/\s/g, '').match(/^2[2-7]/)) && <MastercardLogo />}
                          </div>
                        </div>
                      </div>

                      <div>
                        <InputLabel>Nombre en la Tarjeta</InputLabel>
                        <input
                          type="text"
                          placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                          required
                          className={modernInputClass}
                          value={paymentDetails.ccTitular}
                          onChange={e => setPaymentDetails({ ...paymentDetails, ccTitular: e.target.value.toUpperCase() })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <InputLabel>Expiración (MM/YY)</InputLabel>
                          <input
                            type="text"
                            maxLength="5"
                            placeholder="12/26"
                            required
                            className={`${modernInputClass} text-center tracking-widest`}
                            value={paymentDetails.ccVencimiento}
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                              setPaymentDetails({ ...paymentDetails, ccVencimiento: val })
                            }}
                          />
                        </div>
                        <div>
                          <InputLabel>Código CVV</InputLabel>
                          <input
                            type="password"
                            maxLength="4"
                            placeholder="***"
                            required
                            className={`${modernInputClass} text-center tracking-widest`}
                            value={paymentDetails.ccCvv}
                            onChange={e => setPaymentDetails({ ...paymentDetails, ccCvv: e.target.value.replace(/\D/g, '') })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'pago_movil' && (
                    <div>
                      <InputLabel>Subir el Comprobante (Captura de pantalla)</InputLabel>
                      <div className="mt-2 text-center rounded-2xl border-2 border-dashed border-slate-300 p-8 hover:bg-slate-100 hover:border-indigo-400 transition-colors">
                        <div className="flex flex-col items-center">
                          <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          <label className="cursor-pointer text-indigo-600 font-bold hover:underline mb-1">
                            <input
                              type="file"
                              accept="image/*"
                              required
                              className="hidden"
                              onChange={e => setPaymentDetails({ ...paymentDetails, comprobante: e.target.files[0] })}
                            />
                            Buscar Archivo
                          </label>
                          <p className="text-xs text-slate-500 font-medium">PNG, JPG hasta 5MB {paymentDetails.comprobante ? <span className="block mt-1 text-emerald-600 font-bold">✓ Archivo Seleccionado: {paymentDetails.comprobante.name}</span> : ''}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-extrabold text-xl hover:bg-black hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-slate-900/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando Datos...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    Pagar Ahora
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
