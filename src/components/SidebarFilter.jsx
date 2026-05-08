import { useState, useMemo } from 'react';
import { X } from 'lucide-react';

export default function SidebarFilter({ filters, setFilters, isOpen, onClose, products = [] }) {
  const categories = [
    'Pantalones/jeans',
    'Camisas/blusas/t-shirts',
    'Vestidos/faldas',
    'Chaquetas/abrigos',
    'Ropa interior',
    'Ropa deportiva',
    'Zapatos',
    'Medias'
  ];
  
  const genders = ['Hombre', 'Mujer', 'Unisex'];
  
  const occasions = ['Casual', 'Formal/Elegante', 'Deportiva'];

  // Extract unique colors from products
  const colors = useMemo(() => {
    const allColors = new Set();
    products.forEach(p => {
      if (p.productos_variantes) {
        p.productos_variantes.forEach(v => {
          if (v.color) {
            // Normalize
            const normalized = v.color.charAt(0).toUpperCase() + v.color.slice(1).toLowerCase();
            allColors.add(normalized);
          }
        });
      }
    });
    return Array.from(allColors).sort();
  }, [products]);

  // Extract unique sizes from products
  const sizes = useMemo(() => {
    const allSizes = new Set();
    products.forEach(p => {
      if (p.productos_variantes) {
        p.productos_variantes.forEach(v => {
          if (v.talla) allSizes.add(v.talla);
        });
      }
    });
    return Array.from(allSizes).sort();
  }, [products]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[320px] bg-white/70 lg:bg-transparent lg:backdrop-blur-none backdrop-blur-xl p-8 overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        lg:border-none border-r border-slate-200/50 shadow-2xl lg:shadow-none lg:w-80 rounded-r-[2.5rem] lg:rounded-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <h2 className="text-2xl font-extrabold text-slate-800">Filtros</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-10">
          {/* Category */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4">Categoría</h3>
            <div className="space-y-3">
              {categories.map(cat => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors duration-200 ${filters.category?.includes(cat) ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-slate-300 group-hover:border-indigo-400'}`}>
                     {filters.category?.includes(cat) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={filters.category?.includes(cat)}
                    onChange={() => handleFilterChange('category', cat)}
                    className="hidden"
                  />
                  <span className={`text-sm font-medium transition-colors ${filters.category?.includes(cat) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4">Género</h3>
            <div className="space-y-3">
              {genders.map(gen => (
                <label key={gen} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${filters.gender?.includes(gen) ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-slate-300 group-hover:border-indigo-400'}`}>
                     {filters.gender?.includes(gen) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={filters.gender?.includes(gen)}
                    onChange={() => handleFilterChange('gender', gen)}
                    className="hidden"
                  />
                  <span className={`text-sm font-medium transition-colors ${filters.gender?.includes(gen) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{gen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4">Ocasión</h3>
            <div className="space-y-3">
              {occasions.map(occ => (
                <label key={occ} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors duration-200 ${filters.occasion?.includes(occ) ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-slate-300 group-hover:border-indigo-400'}`}>
                     {filters.occasion?.includes(occ) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={filters.occasion?.includes(occ)}
                    onChange={() => handleFilterChange('occasion', occ)}
                    className="hidden"
                  />
                  <span className={`text-sm font-medium transition-colors ${filters.occasion?.includes(occ) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{occ}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4">Talla</h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => handleFilterChange('size', size)}
                  className={`
                    py-2 rounded-xl text-sm font-bold transition-all duration-300 border-2
                    ${filters.size?.includes(size) 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 -translate-y-0.5' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-300 hover:text-indigo-600'}
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-10 lg:mb-0">
            <h3 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4">Color</h3>
            <div className="grid grid-cols-2 gap-2">
              {colors.map(color => (
                <label
                  key={color}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 border-2
                    ${filters.color?.includes(color)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={filters.color?.includes(color)}
                    onChange={() => handleFilterChange('color', color)}
                    className="hidden"
                  />
                  <span className="truncate">{color}</span>
                </label>
              ))}
            </div>
          </div>
          
        </div>
      </aside>
    </>
  );
}
