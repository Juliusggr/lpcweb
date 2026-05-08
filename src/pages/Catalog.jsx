import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import SidebarFilter from '../components/SidebarFilter';
import { Filter } from 'lucide-react';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    gender: [],
    size: [],
    color: []
  });

  const catalogTopRef = useRef(null);
  const isFirstRender = useRef(true);
  const previousFiltersCount = useRef(0);

  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          productos_variantes (color, talla, stock),
          imagenes (url_imagen, atributo_vinculado)
        `);

      if (error) {
        console.error('Error fetching catalog:', error);
      } else {
        setAllProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = allProducts;

    if (filters.category.length > 0) {
      filtered = filtered.filter(p => filters.category.includes(p.categoria));
    }
    if (filters.gender.length > 0) {
      filtered = filtered.filter(p => filters.gender.includes(p.genero));
    }
    if (filters.size.length > 0) {
      filtered = filtered.filter(p => 
        p.productos_variantes.some(v => filters.size.includes(v.talla))
      );
    }
    if (filters.color.length > 0) {
      filtered = filtered.filter(p => 
        p.productos_variantes.some(v => filters.color.some(c => c.toLowerCase() === (v.color || '').toLowerCase()))
      );
    }

    setProducts(filtered);

    const currentFiltersCount = filters.category.length + filters.gender.length + filters.size.length + filters.color.length;

    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (catalogTopRef.current && currentFiltersCount > previousFiltersCount.current) {
      // Scroll to top of catalog section smoothly only if a filter was added
      const yOffset = -100;
      const y = catalogTopRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    previousFiltersCount.current = currentFiltersCount;
  }, [filters, allProducts]);

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8 bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-slate-200/60">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Catálogo Exclusivo</h1>
            <p className="text-slate-500 font-medium mt-1">Encuentra los mejores estilos para cada ocasión.</p>
          </div>
          <button 
            className="lg:hidden flex items-center gap-2 text-sm font-bold bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        <div className="flex gap-8" ref={catalogTopRef}>
          <SidebarFilter 
            filters={filters} 
            setFilters={setFilters} 
            isOpen={isFilterOpen} 
            onClose={() => setIsFilterOpen(false)} 
            products={allProducts}
          />

          <div className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white/50 backdrop-blur-md p-3 rounded-[2rem] shadow-sm">
                    <div className="bg-slate-200 aspect-[3/4] rounded-2xl mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded-full w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-[2.5rem] p-16 text-center shadow-sm">
                 <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Filter className="w-10 h-10" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-700 mb-2">Sin resultados</h2>
                 <p className="text-slate-500 font-medium max-w-md mx-auto">
                    No encontramos productos que coincidan con la configuración de tus filtros actuales. Intenta eliminando algunos.
                 </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    selectedColor={filters.color.length === 1 ? filters.color[0] : null}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
