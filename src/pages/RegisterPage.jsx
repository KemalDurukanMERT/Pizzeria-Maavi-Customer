import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, User, Phone } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        postalCode: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            const msg = 'Passwords do not match';
            setError(msg);
            toast.warning(msg);
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/register', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                address: {
                    street: formData.street,
                    city: formData.city,
                    postalCode: formData.postalCode
                }
            });

            // Auto login after register
            await login(formData.email, formData.password);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>{t('auth.register.title')}</h1>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-secondary))' }} />
                            <input
                                type="text" name="firstName" placeholder={t('checkout.firstName')} required
                                value={formData.firstName} onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-secondary))' }} />
                            <input
                                type="text" name="lastName" placeholder={t('checkout.lastName')} required
                                value={formData.lastName} onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Mail size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-secondary))' }} />
                        <input
                            type="email" name="email" placeholder={t('auth.email')} required
                            value={formData.email} onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Phone size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-secondary))' }} />
                        <input
                            type="tel" name="phone" placeholder={t('checkout.phone')} required
                            value={formData.phone} onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <input
                            type="text" name="street" placeholder={t('checkout.address')} required
                            value={formData.street} onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                        <input
                            type="text" name="postalCode" placeholder={t('checkout.postalCode')} required
                            value={formData.postalCode} onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>
                    <input
                        type="text" name="city" placeholder={t('checkout.city')} required
                        value={formData.city} onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    />

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-secondary))' }} />
                        <input
                            type="password" name="password" placeholder={t('auth.password')} required
                            value={formData.password} onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-secondary))' }} />
                        <input
                            type="password" name="confirmPassword" placeholder={t('auth.confirmPassword')} required
                            value={formData.confirmPassword} onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem' }}>
                        {loading ? '...' : t('auth.submit.register')}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    {t('auth.hasAccount')} <Link to="/login" style={{ color: 'hsl(var(--color-primary))' }}>{t('auth.login.title')}</Link>
                </div>
            </div>
        </div>
    );
}
