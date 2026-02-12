import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { CheckCircle, Clock, Truck, ChefHat, Package, ShoppingBag, ChevronRight, AlertCircle } from 'lucide-react';
import api, { BASE_URL } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function OrderTrackingPage() {
    const { orderId: rawOrderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(rawOrderId && rawOrderId !== 'undefined');
    const [error, setError] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [recentOrders, setRecentOrders] = useState([]);
    const { t } = useLanguage();

    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('payment');

    const orderId = rawOrderId === 'undefined' ? null : rawOrderId;

    const STATUS_STEPS = [
        { id: 'PENDING', label: t('order.status.received'), icon: Clock },
        { id: 'CONFIRMED', label: t('order.status.confirmed'), icon: CheckCircle },
        { id: 'PREPARING', label: t('order.status.preparing'), icon: ChefHat },
        { id: 'READY', label: t('order.status.ready'), icon: Package },
        { id: 'DELIVERING', label: t('order.status.delivering'), icon: Truck },
        { id: 'COMPLETED', label: t('order.status.completed'), icon: CheckCircle },
    ];

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('recentOrders') || '[]');
        setRecentOrders(stored);

        if (!orderId) {
            setLoading(false);
            setOrder(null);
            return;
        }

        // 1. Fetch initial order state
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/orders/${orderId}`);
                if (data.data) {
                    setOrder(data.data);
                    setError(null);
                } else {
                    setError('Order data is empty.');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.response?.data?.message || 'Order not found or access denied.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();

        // 2. Set up Socket.io for real-time updates
        const socket = io(BASE_URL);
        socket.emit('join', orderId);

        socket.on('order:statusChanged', (updatedOrder) => {
            if (updatedOrder.orderId === orderId || updatedOrder.id === orderId) {
                setOrder(prev => prev ? ({ ...prev, status: updatedOrder.status }) : null);
            }
        });

        return () => socket.disconnect();
    }, [orderId]);

    const handleSearch = (e) => {
        e.preventDefault();
        const id = searchId.trim();
        if (id) {
            navigate(`/track/${id}`);
        }
    };

    if (loading) return (
        <div className="container" style={{ padding: '8rem 0', textAlign: 'center', color: 'hsl(var(--color-text-primary))' }}>
            <div className="animate-pulse" style={{ fontSize: '1.2rem' }}>🔍 Tracking your pizza...</div>
        </div>
    );

    if (!orderId || error || !order) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', maxWidth: '600px' }}>
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: 'hsl(var(--color-bg-paper))' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'hsl(var(--color-primary) / 0.1)' }}>
                            <ShoppingBag size={48} style={{ color: 'hsl(var(--color-primary))' }} />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'hsl(var(--color-text-primary))' }}>Track Your Order</h1>
                    <p style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '2rem' }}>
                        Enter your Order ID (from your confirmation) to check its real-time status.
                    </p>

                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                        <input
                            type="text"
                            placeholder="e.g. 65b..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            style={{
                                flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                                border: '2px solid var(--color-border)', backgroundColor: 'transparent',
                                color: 'inherit', fontSize: '1rem'
                            }}
                            required
                        />
                        <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-md)' }}>Track</button>
                    </form>

                    {error && (
                        <div style={{
                            padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fee2e2',
                            color: '#b91c1c', marginBottom: '2rem', fontSize: '0.9rem'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {recentOrders.length > 0 && (
                        <div style={{ textAlign: 'left', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--color-text-primary))' }}>
                                <Clock size={16} /> Recent Orders
                            </h3>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {recentOrders.map((id) => (
                                    <button
                                        key={id}
                                        onClick={() => navigate(`/track/${id}`)}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'hsl(var(--color-bg-base) / 0.5)',
                                            border: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left', width: '100%',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'hsl(var(--color-primary))'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'hsl(var(--color-text-primary))' }}>
                                                Order ID: #{id.slice(-6).toUpperCase()}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-secondary))' }}>Click to track now</span>
                                        </div>
                                        <ChevronRight size={20} style={{ color: 'hsl(var(--color-text-secondary))' }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const rawIndex = STATUS_STEPS.findIndex(s => s.id === order.status);
    const currentStepIndex = rawIndex === -1 ? 0 : rawIndex;

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            {/* Payment Alerts */}
            {paymentStatus === 'success' && (
                <div style={{ padding: '1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}>
                    <CheckCircle size={20} /> Payment Successful! Your order is being processed.
                </div>
            )}

            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'hsl(var(--color-text-primary))' }}>Order #{order.orderNumber}</h1>
                <p style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '2.5rem' }}>
                    {t('order.estimated')}: {order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>

                {/* Progress Tracker */}
                <div className="tracking-wrapper">
                    <div className="status-steps-container">
                        {/* Connecting Line */}
                        <div className="status-line-bg" />
                        <div className="status-line-progress" style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }} />

                        {STATUS_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const Icon = step.icon;

                            return (
                                <div key={step.id} className={`status-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                    <div className="status-icon-wrapper">
                                        <Icon size={24} />
                                    </div>
                                    <span className="status-label">
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 'min(2rem, 5vw)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--color-text-primary))' }}>
                    <Package size={24} /> {t('order.details')}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(order.items || []).map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: 'min(1.1rem, 4.5vw)', color: 'hsl(var(--color-text-primary))' }}>
                                    {item.quantity}x {item.productName || 'Pizza'}
                                </div>
                                {item.customizations && item.customizations.length > 0 && (
                                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-secondary))', marginTop: '0.25rem' }}>
                                        {item.customizations.map(c => `${t(`customization.${c.action}`) || c.action}: ${c.name}`).join(', ')}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'hsl(var(--color-text-primary))', whiteSpace: 'nowrap' }}>
                                €{(item.totalPrice || 0).toFixed(2)}
                            </div>
                        </div>
                    ))}

                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-secondary))' }}>Subtotal: €{(order.subtotal || 0).toFixed(2)}</div>
                        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-secondary))' }}>Tax (14%): €{(order.tax || 0).toFixed(2)}</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', width: '100%', textAlign: 'right', color: 'hsl(var(--color-text-primary))' }}>
                            {t('product.total')}: €{(order.total || 0).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button onClick={() => navigate('/menu')} className="btn btn-outline">Order Something Else</button>
            </div>
        </div>
    );
}
