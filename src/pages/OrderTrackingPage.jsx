import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { CheckCircle, Clock, Truck, ChefHat, Package } from 'lucide-react';
import api, { BASE_URL } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function OrderTrackingPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useLanguage();

    const STATUS_STEPS = [
        { id: 'PENDING', label: t('order.status.received'), icon: Clock },
        { id: 'CONFIRMED', label: t('order.status.confirmed'), icon: CheckCircle },
        { id: 'PREPARING', label: t('order.status.preparing'), icon: ChefHat },
        { id: 'READY', label: t('order.status.ready'), icon: Package },
        { id: 'DELIVERING', label: t('order.status.delivering'), icon: Truck },
        { id: 'COMPLETED', label: t('order.status.completed'), icon: CheckCircle },
    ];

    useEffect(() => {
        // 1. Fetch initial order state
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${orderId}`);
                setOrder(data.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load order.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();

        // 2. Set up Socket.io for real-time updates
        const socket = io(BASE_URL);

        socket.emit('join', orderId); // Join room for this order

        socket.on('order:statusChanged', (updatedOrder) => {
            setOrder(prev => ({ ...prev, status: updatedOrder.status }));
        });

        return () => {
            socket.disconnect();
        };
    }, [orderId]);

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading status...</div>;
    if (error) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'red' }}>{error}</div>;

    const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status) || 0;

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Order #{order.orderNumber}</h1>
                <p style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '2rem' }}>
                    {t('order.estimated')}: {new Date(new Date().getTime() + 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Progress Tracker */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                    {/* Visual Steps */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
                        {/* Connecting Line */}
                        <div style={{
                            position: 'absolute',
                            top: '24px',
                            left: '0',
                            width: '100%',
                            height: '4px',
                            backgroundColor: 'var(--color-border)',
                            zIndex: 0
                        }}>
                            <div style={{
                                width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                                height: '100%',
                                backgroundColor: 'hsl(var(--color-primary))',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>

                        {STATUS_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const Icon = step.icon;

                            // Mobile responsive hiding of labels could be added here
                            return (
                                <div key={step.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        backgroundColor: isCompleted ? 'hsl(var(--color-primary))' : 'hsl(var(--color-bg-base))',
                                        border: isCompleted ? 'none' : '2px solid var(--color-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isCompleted ? 'white' : 'hsl(var(--color-text-secondary))',
                                        transition: 'all 0.5s ease'
                                    }}>
                                        <Icon size={24} />
                                    </div>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: isCurrent ? 'bold' : 'normal',
                                        color: isCompleted ? 'hsl(var(--color-text-primary))' : 'hsl(var(--color-text-secondary))',
                                        textAlign: 'center',
                                        maxWidth: '80px'
                                    }}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('order.details')}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                            <div>
                                <div style={{ fontWeight: '600' }}>{item.quantity}x {item.productName}</div>
                                {item.customizations && item.customizations.length > 0 && (
                                    <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-secondary))' }}>
                                        {item.customizations.map(c => c.name).join(', ')}
                                    </div>
                                )}
                            </div>
                            <div>€{item.price.toFixed(2)}</div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', paddingTop: '1rem' }}>
                        <span>{t('product.total')}</span>
                        <span>€{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
