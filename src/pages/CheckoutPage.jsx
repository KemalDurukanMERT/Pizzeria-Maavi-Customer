import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Banknote, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        postalCode: '',
        instructions: '',
        deliveryType: 'DELIVERY',
        paymentMethod: 'CARD'
    });

    // Pre-fill form if user is logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                postalCode: user.address?.postalCode || '',
            }));
        }
    }, [user]);

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const orderPayload = {
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                customizations: item.customizations,
                specialInstructions: ''
            })),
            deliveryType: formData.deliveryType,
            deliveryAddress: formData.deliveryType === 'DELIVERY' ? {
                street: formData.street,
                city: formData.city,
                postalCode: formData.postalCode,
                instructions: formData.instructions
            } : undefined,
            paymentMethod: formData.paymentMethod,
            customerNotes: formData.instructions || undefined,
            customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        };

        try {
            // 1. Create Order
            const { data: orderData } = await api.post('/orders', orderPayload);
            const order = orderData.data;

            // 2. Initiate Payment (if not cash)
            if (formData.paymentMethod !== 'CASH') {
                const { data: paymentData } = await api.post('/payments/initiate', { orderId: order.id });

                if (paymentData.data.paymentUrl) {
                    window.location.href = paymentData.data.paymentUrl;
                    return;
                }
            }

            // 3. Save to localStorage for tracking (useful for guest users)
            const recentOrders = JSON.parse(localStorage.getItem('recentOrders') || '[]');
            if (!recentOrders.includes(order.id)) {
                localStorage.setItem('recentOrders', JSON.stringify([order.id, ...recentOrders].slice(0, 5)));
            }

            clearCart();
            navigate(`/track/${order.id}`);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
            setLoading(false);
        }
    };

    const deliveryFee = formData.deliveryType === 'DELIVERY' ? 5.0 : 0;
    const total = cartTotal + deliveryFee;

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{t('checkout.title')}</h1>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Contact Info */}
                <section className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('checkout.contact')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <input
                            type="text" name="firstName" placeholder={t('checkout.firstName')} required
                            value={formData.firstName} onChange={handleChange}
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                        <input
                            type="text" name="lastName" placeholder={t('checkout.lastName')} required
                            value={formData.lastName} onChange={handleChange}
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                        <input
                            type="email" name="email" placeholder={t('checkout.email')} required
                            value={formData.email} onChange={handleChange}
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                        <input
                            type="tel" name="phone" placeholder={t('checkout.phone')} required
                            value={formData.phone} onChange={handleChange}
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>
                </section>

                {/* Delivery Method */}
                <section className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('checkout.delivery')}</h2>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            className={`btn`}
                            style={{
                                flex: 1,
                                border: formData.deliveryType === 'DELIVERY' ? '2px solid hsl(var(--color-primary))' : '1px solid var(--color-border)',
                                backgroundColor: formData.deliveryType === 'DELIVERY' ? 'hsl(var(--color-primary-light))' : 'white'
                            }}
                            onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'DELIVERY' }))}
                        >
                            {t('checkout.method.delivery')} (+€5.00)
                        </button>
                        <button
                            type="button"
                            className={`btn`}
                            style={{
                                flex: 1,
                                border: formData.deliveryType === 'PICKUP' ? '2px solid hsl(var(--color-primary))' : '1px solid var(--color-border)',
                                backgroundColor: formData.deliveryType === 'PICKUP' ? 'hsl(var(--color-primary-light))' : 'white'
                            }}
                            onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'PICKUP' }))}
                        >
                            {t('checkout.method.pickup')} (Free)
                        </button>
                    </div>

                    {formData.deliveryType === 'DELIVERY' && (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <input
                                type="text" name="street" placeholder={t('checkout.street')} required
                                value={formData.street} onChange={handleChange}
                                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 2fr) 1fr', gap: '1rem' }}>
                                <input
                                    type="text" name="city" placeholder={t('checkout.city')} required
                                    value={formData.city} onChange={handleChange}
                                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                />
                                <input
                                    type="text" name="postalCode" placeholder={t('checkout.postalCode')} required
                                    value={formData.postalCode} onChange={handleChange}
                                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                            <textarea
                                name="instructions" placeholder={t('checkout.instructions')}
                                value={formData.instructions} onChange={handleChange}
                                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', minHeight: '80px' }}
                            />
                        </div>
                    )}
                </section>

                {/* Payment Method */}
                <section className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('checkout.payment')}</h2>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {[
                            { id: 'CARD', label: 'Luottokortti (Stripe)', color: '#635bff', icon: CreditCard },
                            { id: 'VERKKOMAKSU', label: 'Verkkomaksu (Paytrail)', color: '#2b2b2b', icon: Wallet },
                            { id: 'LOUNASSETELI', label: 'Lounasseteli (Edenred)', color: '#ff0000', icon: Wallet },
                            { id: 'EPASSI', label: 'ePassi', color: '#59b200', icon: Wallet },
                            { id: 'CASH', label: 'Maksu ovella (Käteinen)', color: '#059669', icon: Banknote },
                        ].map(method => (
                            <label
                                key={method.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.25rem',
                                    border: formData.paymentMethod === method.id ? `2px solid ${method.color}` : '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    backgroundColor: formData.paymentMethod === method.id ? `${method.color}08` : 'white',
                                    transition: 'all 0.2s ease',
                                    boxShadow: formData.paymentMethod === method.id ? `0 4px 12px ${method.color}15` : 'none'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value={method.id}
                                    checked={formData.paymentMethod === method.id}
                                    onChange={handleChange}
                                    style={{ accentColor: method.color }}
                                />
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    backgroundColor: method.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <method.icon size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: 'black' }}>{method.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-secondary))' }}>
                                        {method.id === 'VERKKOMAKSU' ? 'Kaikki suomalaiset pankit' :
                                            method.id === 'CARD' ? 'Visa, Mastercard, AMEX' :
                                                method.id === 'EPASSI' ? 'Epassi-sovellus' :
                                                    method.id === 'LOUNASSETELI' ? 'Edenred, Smartum' : 'Turvallinen maksu'}
                                    </div>
                                </div>
                                {formData.paymentMethod === method.id && (
                                    <CheckCircle size={20} color={method.color} />
                                )}
                            </label>
                        ))}
                    </div>
                </section>

                {/* Total & Submit */}
                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        <span>{t('product.total')}</span>
                        <span>€{total.toFixed(2)}</span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}
                        disabled={loading}
                    >
                        {loading ? t('checkout.processing') : `${t('checkout.submit')} €${total.toFixed(2)}`}
                    </button>
                </div>
            </form>
        </div>
    );
}
