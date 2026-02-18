import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(formData.email, formData.password);
            toast.success(t('auth.success') || 'Logged in successfully!');
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid credentials';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>{t('auth.login.title')}</h1>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-secondary))' }} />
                        <input
                            type="email"
                            placeholder={t('auth.email')}
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-secondary))' }} />
                        <input
                            type="password"
                            placeholder={t('auth.password')}
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem' }}>
                        {loading ? '...' : t('auth.submit.login')}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    {t('auth.noAccount')} <Link to="/register" style={{ color: 'hsl(var(--color-primary))' }}>{t('auth.register.title')}</Link>
                </div>
            </div>
        </div>
    );
}
