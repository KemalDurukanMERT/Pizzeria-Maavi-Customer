import { useEffect, useState } from 'react';
import { User, Mail, Phone, LogOut, ShoppingBag, MapPin } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAddress, setEditingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        postalCode: user?.address?.postalCode || ''
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (user?.address) {
            setAddressForm({
                street: user.address.street,
                city: user.address.city,
                postalCode: user.address.postalCode
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/my-orders');
                setOrders(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await api.put('/users/profile', {
                address: addressForm
            });
            toast.success('Address updated successfully!');
            // Ideally we'd update the context here, but at least the UI will reflect local change
            // For now, reload or just close
            setTimeout(() => window.location.reload(), 1500); // Quickest way to sync AuthContext user
        } catch (err) {
            console.error(err);
            toast.error('Failed to update address');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{t('nav.profile')}</h1>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* User Info Card */}
                <div className="card" style={{ padding: 'min(2rem, 5vw)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Personal Information</h2>
                        <button onClick={handleLogout} className="btn btn-ghost" style={{ color: '#ef4444', padding: '0.4rem 0.8rem' }}>
                            <LogOut size={18} /> {t('nav.logout')}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                            <User size={20} color="hsl(var(--color-primary))" />
                            <span style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                            <Mail size={20} color="hsl(var(--color-primary))" />
                            <span style={{ wordBreak: 'break-all' }}>{user.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                            <Phone size={20} color="hsl(var(--color-primary))" />
                            <span>{user.phone}</span>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <MapPin size={20} /> Delivery Address
                            </h3>
                            {!editingAddress && (
                                <button onClick={() => setEditingAddress(true)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                    Edit
                                </button>
                            )}
                        </div>

                        {editingAddress ? (
                            <form onSubmit={handleUpdateAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <input
                                        type="text" placeholder="Street" required
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit' }}
                                    />
                                    <input
                                        type="text" placeholder="Postal Code" required
                                        value={addressForm.postalCode}
                                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit' }}
                                    />
                                </div>
                                <input
                                    type="text" placeholder="City" required
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit' }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setEditingAddress(false)} className="btn btn-ghost">Cancel</button>
                                    <button type="submit" disabled={updating} className="btn btn-primary">
                                        {updating ? 'Saving...' : 'Save Address'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ color: user.address ? 'inherit' : 'hsl(var(--color-text-secondary))' }}>
                                {user.address ? (
                                    <>
                                        <div>{user.address.street}</div>
                                        <div>{user.address.postalCode} {user.address.city}</div>
                                    </>
                                ) : (
                                    'No delivery address added yet.'
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Order History Preview */}
                <div className="card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{t('order.history')}</h2>
                        <p style={{ color: 'hsl(var(--color-text-secondary))', fontSize: '0.9rem' }}>View and track your previous orders.</p>
                    </div>
                    <button onClick={() => navigate('/orders')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingBag size={18} /> View All
                    </button>
                </div>
            </div>
        </div>
    );
}
