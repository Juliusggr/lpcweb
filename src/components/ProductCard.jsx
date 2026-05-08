import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../lib/utils';
import { useExchangeRate } from '../context/ExchangeRateContext';

export default function ProductCard({ product, selectedColor }) {
  const variants = product.productos_variantes || [];
  const colors = [...new Set(variants.map(v => v.color))];
  const minPrice = product.precio;
  const { exchangeRate } = useExchangeRate();
  const minPriceBs = exchangeRate > 0 ? (minPrice * exchangeRate) : null;

  let displayImage = product.imagen;
  if (selectedColor && product.imagenes) {
    const colorImage = product.imagenes.find(img => 
      img.atributo_vinculado && img.atributo_vinculado.toLowerCase().includes(selectedColor.toLowerCase())
    );
    if (colorImage) {
      displayImage = colorImage.url_imagen;
    }
  }

  const linkTo = selectedColor 
    ? `/product/${product.id}?color=${encodeURIComponent(selectedColor)}`
    : `/product/${product.id}`;

  return (
    <Link to={linkTo} className="group block bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className="aspect-[3/4] w-full overflow-hidden bg-slate-100 rounded-2xl relative shadow-inner">
        {displayImage ? (
          <img
            src={resolveImageUrl(displayImage)}
            alt={product.nombre}
            className="h-full w-full object-contain p-2 group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium">
            Sin Imagen
          </div>
        )}
        
        {/* Minimalist Hover Overlay */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors duration-500"></div>
      </div>
      
      <div className="mt-5 px-2 flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base text-slate-800 font-bold truncate tracking-tight">
            {product.nombre}
          </h3>
          <p className="mt-1 text-sm font-semibold text-indigo-500/80 uppercase tracking-widest truncate">{product.marca}</p>
        </div>
        <div className="text-right shrink-0">
          {minPriceBs !== null ? (
            <p className="text-lg font-extrabold text-slate-900">Bs. {minPriceBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          ) : (
            <p className="text-lg font-extrabold text-slate-900">Bs. —</p>
          )}
          <p className="text-xs font-semibold text-slate-400">Ref. {minPrice.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="mt-4 px-2 pb-2 flex gap-1.5 flex-wrap">
        {colors.map((color, idx) => (
          <span 
            key={idx} 
            className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider"
          >
            {color}
          </span>
        ))}
      </div>
    </Link>
  );
}
