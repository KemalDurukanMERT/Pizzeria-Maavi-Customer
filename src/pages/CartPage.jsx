import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { BASE_URL } from '../services/api';

export default function CartPage() {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { t } = useLanguage();

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem', color: 'hsl(var(--color-text-secondary))' }}>
                    <ShoppingBag size={64} />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t('cart.empty')}</h1>
                <p style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '2rem' }}>
                    {t('cart.empty.subtitle')}
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/menu')}>
                    {t('cart.browse')}
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{t('cart.title')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Cart Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map((item, index) => (
                        <div key={`${item.productId}-${index}`} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                                <img
                                    src={item.image ? item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}` : 'https://placehold.co/400x300?text=No+Image'}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                />
                            </div>

                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{item.name}</h3>
                                    <span style={{ fontWeight: '600' }}>€{(item.price * item.quantity).toFixed(2)}</span>
                                </div>

                                {item.customizations.length > 0 && (
                                    <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-secondary))', marginBottom: '0.5rem' }}>
                                        {item.customizations.map((c, i) => (
                                            <span key={i}>
                                                {c.action === 'ADD' ? '+' : '-'}{c.name}
                                                {i < item.customizations.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <button
                                            className="btn"
                                            style={{ border: '1px solid var(--color-border)', padding: '0.4rem', background: 'transparent', color: 'inherit' }}
                                            onClick={() => updateQuantity(index, item.quantity - 1)}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                                        <button
                                            className="btn"
                                            style={{ border: '1px solid var(--color-border)', padding: '0.4rem', background: 'transparent', color: 'inherit' }}
                                            onClick={() => updateQuantity(index, item.quantity + 1)}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <button
                                        className="btn"
                                        style={{ color: '#ef4444', padding: '0.4rem', background: 'transparent' }}
                                        onClick={() => removeFromCart(index)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={clearCart}
                        style={{
                            alignSelf: 'flex-start',
                            background: 'none',
                            border: 'none',
                            color: 'hsl(var(--color-text-secondary))',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        {t('cart.clear')}
                    </button>
                </div>

                {/* Order Summary */}
                <div className="card" style={{ padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '100px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('cart.summary')}</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'hsl(var(--color-text-secondary))' }}>{t('cart.subtotal')}</span>
                            <span>€{cartTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'hsl(var(--color-text-secondary))' }}>{t('cart.delivery')}</span>
                            <span>€5.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                            <span>{t('product.total')}</span>
                            <span>€{(cartTotal + 5.0).toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
                        onClick={() => navigate('/checkout')}
                    >
                        {t('cart.checkout')} <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
