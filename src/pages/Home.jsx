import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewArrivals() {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          productos_variantes (color, talla, stock)
        `)
        .order('id', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchNewArrivals();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 relative font-sans overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* Hero Section */}
        <section className="mb-20 text-center bg-white/40 backdrop-blur-md border border-white/50 shadow-xl rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
           <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-800 drop-shadow-sm">Nueva Colección</h1>
           <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium mb-10">
             Descubre lanzamientos exclusivos. Diseños minimalistas, materiales premium y estilo vanguardista que eleva tu día a día.
           </p>
           <Link 
              to="/catalog" 
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105"
            >
              Explorar Catálogo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </Link>
        </section>

        {/* New Arrivals Section */}
        <div className="flex items-center justify-between mb-10">
           <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Últimos Lanzamientos</h2>
           <div className="h-px bg-slate-300 flex-1 ml-6 rounded-full hidden sm:block"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/50 backdrop-blur-md p-4 rounded-3xl shadow-sm">
                <div className="bg-slate-200 aspect-[3/4] rounded-2xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded-full w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link 
            to="/catalog" 
            className="inline-block bg-white/60 backdrop-blur-md border-2 border-slate-200 text-slate-800 px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            Ver Todo El Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
