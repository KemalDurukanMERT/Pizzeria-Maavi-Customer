import { useEffect, useState } from 'react';
import { ShoppingBag, Clock, ChevronRight, Package, Truck, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function MyOrdersPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/my-orders');
                setOrders(data.data.orders || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    if (!user) {
        navigate('/login');
        return null;
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'hsl(35 90% 50%)';
            case 'CONFIRMED': return 'hsl(200 90% 40%)';
            case 'PREPARING': return 'hsl(220 90% 56%)';
            case 'READY': return 'hsl(150 60% 45%)';
            case 'DELIVERING': return 'hsl(260 80% 60%)';
            case 'COMPLETED': return 'hsl(150 60% 30%)';
            case 'CANCELLED': return 'hsl(0 80% 50%)';
            default: return 'hsl(0 0% 50%)';
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <ShoppingBag size={32} color="hsl(var(--color-primary))" />
                <h1 style={{ fontSize: '2rem' }}>{t('order.history') || 'My Orders'}</h1>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading your orders...</div>
            ) : orders.length === 0 ? (
                <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '1.5rem' }}>You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/menu')} className="btn btn-primary">Go to Menu</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                            }}
                            onClick={() => navigate(`/track/${order.id}`)}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: `${getStatusColor(order.status)}15`,
                                    color: getStatusColor(order.status),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {order.status === 'DELIVERING' ? <Truck size={24} /> :
                                        order.status === 'COMPLETED' ? <CheckCircle size={24} /> :
                                            <Package size={24} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{order.orderNumber}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-secondary))', marginBottom: '0.5rem' }}>
                                        {new Date(order.createdAt).toLocaleDateString('fi-FI', {
                                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '100px',
                                        backgroundColor: `${getStatusColor(order.status)}15`,
                                        color: getStatusColor(order.status),
                                        textTransform: 'uppercase'
                                    }}>
                                        {t(`order.status.${order.status.toLowerCase()}`) || order.status}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>€{order.total.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-secondary))' }}>
                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </div>
                                </div>
                                <ChevronRight size={20} color="hsl(var(--color-border))" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
