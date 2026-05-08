import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../lib/utils';
import { useExchangeRate } from '../context/ExchangeRateContext';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { exchangeRate } = useExchangeRate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden font-sans" style={{ zIndex: 9999 }}>
      {/* Dynamic blurred backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsCartOpen(false)} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white/80 backdrop-blur-2xl shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-l-[2.5rem] border-l border-white/50">

        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tu Bolsa</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <p className="font-semibold text-lg text-slate-500">No hay prendas aquí aún.</p>
              <button onClick={() => setIsCartOpen(false)} className="text-indigo-600 font-bold hover:underline">Continuar comprando</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.product.id}-${item.variant.id}`} className="flex gap-5 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                <div className="w-24 h-28 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 relative">
                  {item.product.imagen_personalizada || item.product.imagen ? (
                    <img src={resolveImageUrl(item.product.imagen_personalizada || item.product.imagen)} alt={item.product.nombre} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-300">Img</div>
                  )}
                </div>

                <div className="flex-1 flex flex-col pt-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-800 leading-tight pr-4">{item.product.nombre}</h3>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.variant.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2 text-xs font-bold text-slate-500 mt-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">Talla {item.variant.talla}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                      Color: {item.variant.color}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    {/* Quantity Control */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-0.5 shadow-inner">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:shadow-none text-slate-600 font-bold transition-all"
                      >
                        <Minus className="w-3 h-3" strokeWidth={3} />
                      </button>
                      <span className="w-8 text-center text-sm font-extrabold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stock}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-indigo-50 disabled:hover:bg-white text-indigo-600 disabled:text-slate-400 disabled:opacity-50 disabled:shadow-none font-bold transition-all"
                      >
                        <Plus className="w-3 h-3" strokeWidth={3} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {exchangeRate > 0 ? (
                        <>
                          <p className="font-extrabold text-lg text-slate-900">Bs. {(item.product.precio * item.quantity * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className="text-xs text-slate-400 font-semibold">Ref. {(item.product.precio * item.quantity).toFixed(2)}</p>
                        </>
                      ) : (
                        <p className="font-extrabold text-lg text-slate-900">Ref. {(item.product.precio * item.quantity).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 md:p-8 border-t border-slate-200/50 bg-white/50 backdrop-blur-xl">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="font-medium text-slate-500 uppercase tracking-widest text-xs mb-1 block">Total Estimado</span>
            </div>
            <div className="text-right">
              {exchangeRate > 0 ? (
                <>
                  <p className="text-3xl font-black text-indigo-600">Bs. {(cartTotal * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-sm font-bold text-slate-400">Ref. {cartTotal.toFixed(2)}</p>
                </>
              ) : (
                <p className="text-3xl font-black text-indigo-600">Ref. {cartTotal.toFixed(2)}</p>
              )}
            </div>
          </div>

          <Link
            to="/checkout"
            onClick={() => setIsCartOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            style={{ pointerEvents: cart.length === 0 ? 'none' : 'auto', opacity: cart.length === 0 ? 0.6 : 1 }}
          >
            Proceder al Pago
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
