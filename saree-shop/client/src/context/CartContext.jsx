import React, { useState, useEffect } from 'react';

// Create CartContext
export const CartContext = React.createContext();

// Cart Provider Component
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  // Add item to cart
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        i => i.sareeId === item.sareeId && i.customerType === item.customerType
      );

      if (existingItem) {
        // Item already in cart, increase quantity
        return prevCart.map(i =>
          i.sareeId === item.sareeId && i.customerType === item.customerType
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        // New item
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (sareeId, customerType) => {
    setCart(prevCart =>
      prevCart.filter(item => !(item.sareeId === sareeId && item.customerType === customerType))
    );
  };

  // Update item quantity
  const updateQuantity = (sareeId, customerType, quantity) => {
    if (quantity <= 0) {
      removeFromCart(sareeId, customerType);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.sareeId === sareeId && item.customerType === customerType
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => {
    const itemPrice = item.price || 0;
    return total + itemPrice * item.quantity;
  }, 0);

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use CartContext
export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
