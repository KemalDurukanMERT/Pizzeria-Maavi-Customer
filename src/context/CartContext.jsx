import React from "react";
import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.items.findIndex(
                item => item.productId === action.payload.productId &&
                    JSON.stringify(item.customizations) === JSON.stringify(action.payload.customizations)
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists with same customizations
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += action.payload.quantity;
                return { ...state, items: newItems };
            }

            return { ...state, items: [...state.items, action.payload] };
        }

        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter((_, index) => index !== action.payload)
            };

        case 'UPDATE_QUANTITY': {
            const newItems = [...state.items];
            if (action.payload.quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter((_, index) => index !== action.payload.index)
                };
            }
            newItems[action.payload.index].quantity = action.payload.quantity;
            return { ...state, items: newItems };
        }

        case 'CLEAR_CART':
            return { items: [], total: 0 };

        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [cart, dispatch] = useReducer(cartReducer, { items: [] }, (initial) => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : initial;
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity, customizations = []) => {
        const price = product.basePrice + customizations.reduce((sum, c) => sum + c.priceModifier, 0);

        dispatch({
            type: 'ADD_ITEM',
            payload: {
                productId: product.id,
                name: product.name,
                image: product.imageUrl,
                basePrice: product.basePrice,
                price,
                quantity,
                customizations,
                product // Store full product logic if needed
            }
        });
    };

    const removeFromCart = (index) => {
        dispatch({ type: 'REMOVE_ITEM', payload: index });
    };

    const updateQuantity = (index, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const cartTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart: cart.items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            itemCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
