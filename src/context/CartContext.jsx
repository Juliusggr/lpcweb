import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant, quantity = 1) => {
    const existing = cart.find(item => 
      item.product.id === product.id && item.variant.id === variant.id
    );
    const currentQuantity = existing ? existing.quantity : 0;
    
    if (currentQuantity + quantity > variant.stock) {
      alert("No hay suficiente stock disponible.");
      return;
    }

    setCart(prev => {
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, variant, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, variantId) => {
    setCart(prev => prev.filter(item => 
      !(item.product.id === productId && item.variant.id === variantId)
    ));
  };

  const updateQuantity = (productId, variantId, quantity) => {
    if (quantity < 1) return;
    const item = cart.find(i => i.product.id === productId && i.variant.id === variantId);
    if (item && quantity > item.variant.stock) {
      alert("No hay suficiente stock disponible.");
      return;
    }

    setCart(prev => prev.map(item => 
      item.product.id === productId && item.variant.id === variantId
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      isCartOpen, setIsCartOpen, cartTotal, cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
