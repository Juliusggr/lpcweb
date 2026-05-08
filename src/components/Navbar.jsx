import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Home, Layers } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.02)]" style={{ zIndex: 1000 }}>
      {/* Decorative top line */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
      
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center gap-8 lg:gap-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                 <div className="absolute inset-0 bg-indigo-500 blur-md opacity-0 group-hover:opacity-10 transition-duration-500"></div>
                 <span className="text-3xl font-bold text-slate-800" style={{ fontFamily: '"Petit Formal Script", cursive' }}>
                   La Princesa Linda
                 </span>
              </div>
            </Link>
            
            <div className="hidden md:flex space-x-2 bg-slate-50/80 p-1.5 rounded-[1.25rem] border border-slate-100/50 shadow-inner">
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/') ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
              >
                <Home className={`w-4 h-4 ${isActive('/') ? 'text-indigo-500' : 'text-slate-400'}`} />
                Inicio
              </Link>
              <Link 
                to="/catalog" 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isActive('/catalog') ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
              >
                <Layers className={`w-4 h-4 ${isActive('/catalog') ? 'text-indigo-500' : 'text-slate-400'}`} />
                Catálogo
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to={user ? "/profile" : "/login"} 
              className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-full transition-all duration-300 group shadow-sm hover:shadow"
            >
              <User className={`w-5 h-5 transition-colors ${user ? 'text-indigo-600 fill-indigo-100' : 'text-slate-500 group-hover:text-indigo-600'}`} />
            </Link>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-3 bg-slate-900 hover:bg-black text-white rounded-full transition-all duration-300 relative shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}
