import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useExchangeRate } from '../context/ExchangeRateContext';
import { Check, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { resolveImageUrl } from '../lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialColor = searchParams.get('color');

  const { addToCart, cart } = useCart();
  const { exchangeRate } = useExchangeRate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    async function fetchProduct() {
      const { data: prodData, error: prodError } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

      const { data: varData, error: varError } = await supabase
        .from('productos_variantes')
        .select('*')
        .eq('producto_id', id);

      const { data: imgData, error: imgError } = await supabase
        .from('imagenes')
        .select('*')
        .eq('producto_id', id);

      if (prodData) setProduct(prodData);
      if (varData) setVariants(varData);
      if (imgData) setImages(imgData);
      
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
       <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
       <h2 className="text-2xl font-bold text-slate-700">Producto no encontrado</h2>
    </div>
  );

  const colors = [...new Set(variants.map(v => v.color))];
  const sizes = selectedColor 
    ? [...new Set(variants.filter(v => v.color === selectedColor).map(v => v.talla))]
    : [];

  const currentVariant = variants.find(v => v.color === selectedColor && v.talla === selectedSize);
  const quantityInCart = currentVariant 
    ? (cart.find(item => item.variant.id === currentVariant.id)?.quantity || 0)
    : 0;
  const isOutOfStock = currentVariant && (currentVariant.stock <= 0 || quantityInCart >= currentVariant.stock);

  const displayPrice = currentVariant 
    ? (product.precio + (currentVariant.precio_ajuste || 0))
    : product.precio;

  const displayedImages = images.filter(img => {
    if (!selectedColor) return true; 
    if (!img.atributo_vinculado) return true; 
    return img.atributo_vinculado.toLowerCase().includes(selectedColor.toLowerCase());
  });

  const mainImage = selectedImage || (displayedImages.length > 0 ? displayedImages[0].url_imagen : product.imagen);

  const handleAddToCart = () => {
    if (currentVariant && !isOutOfStock) {
      addToCart({ ...product, imagen_personalizada: mainImage }, currentVariant);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[3rem] p-6 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Image Gallery */}
            <div className="flex flex-col-reverse md:flex-row gap-6 relative">
              {/* Decorative background shape */}
              <div className="absolute inset-0 bg-indigo-50/50 rounded-[2.5rem] -rotate-3 scale-[1.02] -z-10 origin-bottom-left transition-transform"></div>
              
              {/* Thumbnails */}
              {displayedImages.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:w-32 md:h-[600px] scrollbar-hide shrink-0 z-10 py-2 md:py-0">
                  {displayedImages.map((img) => (
                    <div 
                      key={img.id} 
                      className={`flex-shrink-0 w-24 h-28 md:w-28 md:h-32 bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm border-2 transition-all duration-300 ${selectedImage === img.url_imagen ? 'border-indigo-600 scale-105 shadow-md shadow-indigo-600/20' : 'border-transparent hover:border-indigo-200'}`}
                      onClick={() => setSelectedImage(img.url_imagen)}
                    >
                       <img src={resolveImageUrl(img.url_imagen)} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div
                className="flex-1 bg-white aspect-[4/5] rounded-[2rem] overflow-hidden relative cursor-zoom-in shadow-sm border border-slate-100 z-10 group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoomPos({ x, y });
                }}
              >
                {mainImage ? (
                  <img
                    src={resolveImageUrl(mainImage)}
                    alt={product.nombre}
                    className="w-full h-full object-contain p-6 transition-transform duration-200 ease-out"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                    <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
                    <span className="font-medium">Sin Imagen Principal</span>
                  </div>
                )}
                
                {/* Zoom Hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-slate-600 shadow-sm opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none tracking-widest uppercase">
                   Pasa el cursor para hacer zoom
                </div>
              </div>
            </div>

            {/* Details & Actions */}
            <div className="flex flex-col pt-4 lg:pt-8">
              
              <div className="mb-2 flex items-center gap-2">
                 <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">{product.categoria}</span>
                 <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">{product.marca}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">{product.nombre}</h1>
              
              <div className="flex flex-col gap-1 mb-8">
                 <p className="text-4xl font-black text-indigo-600">
                   {exchangeRate > 0 
                     ? `Bs. ${(displayPrice * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                     : 'Bs. —'}
                 </p>
                 <p className="text-sm font-bold text-slate-400">Ref. {displayPrice.toFixed(2)}</p>
              </div>
              
              {product.descripcion && (
                <div className="prose prose-slate text-slate-600 mb-10 text-lg leading-relaxed font-medium">
                  <p>{product.descripcion}</p>
                </div>
              )}

              <hr className="border-slate-100 mb-8" />

              {/* Color Selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Elige Color</h3>
                   <span className="text-sm font-medium text-indigo-600">{selectedColor || 'Ninguno'}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => { 
                        setSelectedColor(color); 
                        setSelectedSize(null); 
                        setSelectedImage(null); 
                      }}
                      className={`
                        px-6 py-3 rounded-full text-sm font-bold border-2 transition-all duration-300
                        ${selectedColor === color 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-600/20' 
                          : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}
                      `}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Elige Talla</h3>
                   <span className="text-sm text-slate-500 underline cursor-pointer hover:text-slate-800">Guía de Tallas</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.length > 0 ? (
                    sizes.map(size => {
                      const variant = variants.find(v => v.color === selectedColor && v.talla === size);
                      const disabled = !variant || variant.stock <= 0;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={disabled}
                          className={`
                            px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border-2
                            ${selectedSize === size 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 translate-y-[-2px]' 
                              : disabled 
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed border-transparent'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'}
                          `}
                        >
                          {size}
                        </button>
                      );
                    })
                  ) : (
                    <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 border border-rose-100 w-full">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                       Selecciona un color primero para ver las tallas
                    </div>
                  )}
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedColor || !selectedSize || isOutOfStock}
                className={`
                  w-full py-5 rounded-[1.5rem] font-extrabold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform
                  ${(!selectedColor || !selectedSize || isOutOfStock) 
                     ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                     : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-600/40'}
                `}
              >
                <ShoppingBag className="w-6 h-6" />
                {isOutOfStock ? 'Agotado Temporalmente' : 
                  exchangeRate > 0 
                    ? `Agregar — Bs. ${(displayPrice * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `Agregar — Ref. ${displayPrice.toFixed(2)}`
                }
              </button>
              
              {/* Stock / Value props */}
              <div className="mt-8 flex flex-col gap-3">
                 {currentVariant && (
                   <p className={`text-sm font-bold flex items-center gap-2 ${currentVariant.stock < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                     <span className={`w-2 h-2 rounded-full ${currentVariant.stock < 5 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                     {currentVariant.stock} unidades disponibles en el inventario.
                   </p>
                 )}
                 <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm font-bold text-slate-500 mt-4 pt-4 border-t border-slate-100">
                    <span className="flex items-center gap-2">
                       <Truck className="w-5 h-5 text-indigo-500" />
                       Envíos Express Disponibles
                    </span>
                    <span className="flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5 text-indigo-500" />
                       Pago Seguro
                    </span>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
