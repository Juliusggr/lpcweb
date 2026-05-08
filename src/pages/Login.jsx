import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, user, loading: authLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Login State
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanCedula = cedula.trim().toUpperCase();
      const user = await login(cleanCedula, password);
      if (user) {
        navigate('/');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanData = {
        ...regData,
        cedula: regData.cedula.trim().toUpperCase()
      };
      const user = await register(cleanData);
      if (user) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error en el registro. El usuario podría ya existir.');
    }
    setLoading(false);
  };

  const inputClasses = "w-full px-4 py-3.5 bg-white/60 backdrop-blur-sm border-2 border-slate-200/60 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white/80 focus:shadow-lg focus:shadow-indigo-500/10 transition-all duration-300";

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50/50 to-purple-50/50">

      {/* --- Animated Background Orbs --- */}
      <div className="absolute top-[-8rem] left-[-6rem] w-[30rem] h-[30rem] bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse pointer-events-none" style={{ animationDuration: '7s' }}></div>
      <div className="absolute bottom-[-10rem] right-[-8rem] w-[36rem] h-[36rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse pointer-events-none" style={{ animationDuration: '9s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-[22rem] h-[22rem] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" style={{ animationDuration: '11s' }}></div>
      <div className="absolute bottom-1/4 left-[-4rem] w-[18rem] h-[18rem] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }}></div>

      {/* --- Left Panel (Desktop) --- */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 opacity-90"></div>
        
        {/* Decorative shapes in left panel */}
        <div className="absolute top-12 left-12 w-24 h-24 border-2 border-white/20 rounded-3xl rotate-12 animate-spin pointer-events-none" style={{ animationDuration: '30s' }}></div>
        <div className="absolute bottom-20 right-16 w-16 h-16 border-2 border-white/15 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
        <div className="absolute top-1/3 right-20 w-10 h-10 bg-white/10 rounded-xl rotate-45 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/3 left-16 w-8 h-8 bg-white/10 rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
        
        {/* Glassmorphic accent card */}
        <div className="absolute bottom-24 left-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span className="text-white/90 font-semibold text-sm">Moda exclusiva a tu alcance</span>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">Descubre colecciones curadas, envío rápido y atención personalizada.</p>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-white text-5xl font-bold mb-4" style={{ fontFamily: '"Petit Formal Script", cursive' }}>
            La Princesa Linda
          </h1>
          <p className="text-white/70 text-lg max-w-sm mx-auto font-medium leading-relaxed">
            Tu destino favorito para encontrar estilo, elegancia y las últimas tendencias.
          </p>
        </div>
      </div>

      {/* --- Right Panel - Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 mx-auto bg-indigo-600/10 backdrop-blur-md border border-indigo-200/50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: '"Petit Formal Script", cursive' }}>
              La Princesa Linda
            </h1>
          </div>

          {/* Glassmorphic Card */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/70 shadow-2xl shadow-indigo-500/5 rounded-[2rem] p-8 sm:p-10 relative overflow-hidden">
            
            {/* Subtle animated gradient border on top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-[2rem]" 
              style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }}></div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isRegister ? 'bg-purple-100 rotate-0' : 'bg-indigo-100 rotate-0'}`}>
                  {isRegister ? (
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                    {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
                  </h2>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium ml-[3.25rem]">
                {isRegister ? 'Regístrate para empezar a comprar.' : 'Ingresa tus datos para continuar.'}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-red-100/50 animate-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                {error}
              </div>
            )}

            {/* Toggle Pills */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-8 border border-slate-200/50">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  !isRegister 
                    ? 'bg-white text-indigo-600 shadow-md shadow-indigo-500/10 border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isRegister 
                    ? 'bg-white text-purple-600 shadow-md shadow-purple-500/10 border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Forms */}
            {isRegister ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cédula"
                      required
                      className={inputClasses}
                      value={regData.cedula}
                      onChange={e => setRegData({ ...regData, cedula: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Teléfono"
                      className={inputClasses}
                      value={regData.telefono}
                      onChange={e => setRegData({ ...regData, telefono: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre"
                    required
                    className={inputClasses}
                    value={regData.nombre}
                    onChange={e => setRegData({ ...regData, nombre: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Apellido"
                    required
                    className={inputClasses}
                    value={regData.apellido}
                    onChange={e => setRegData({ ...regData, apellido: e.target.value })}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Dirección"
                  required
                  className={inputClasses}
                  value={regData.direccion}
                  onChange={e => setRegData({ ...regData, direccion: e.target.value })}
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    required
                    className={inputClasses + ' pr-12'}
                    value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-base hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      Crear Cuenta
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cédula"
                    required
                    className={inputClasses + ' pl-12'}
                    value={cedula}
                    onChange={e => setCedula(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    required
                    className={inputClasses + ' pl-12 pr-12'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-base hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {isRegister ? '¿Ya tienes cuenta?' : '¿Eres nuevo?'}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            </div>

            {/* Toggle Link */}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="w-full py-3.5 rounded-2xl text-sm font-bold border-2 border-slate-200/60 bg-white/40 hover:bg-white/80 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/5"
            >
              {isRegister ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
            </button>
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-slate-400 mt-6 font-medium">
            © 2026 La Princesa Linda · Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* CSS Keyframe for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
