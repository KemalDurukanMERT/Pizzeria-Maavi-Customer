
import { Link } from 'react-router-dom';
import { ShoppingCart, Languages } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
    const { itemCount } = useCart();
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'fi' : 'en');
    };

    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🍕 {t('nav.home')}</span>
                </Link>

                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/menu" style={{ textDecoration: 'none', color: 'inherit', fontWeight: '500' }}>{t('nav.menu')}</Link>
                    <Link to="/track" style={{ textDecoration: 'none', color: 'inherit', fontWeight: '500' }}>{t('nav.track') || 'Track'}</Link>

                    <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <ShoppingCart size={24} />
                            {itemCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    backgroundColor: 'hsl(var(--color-primary))',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {itemCount}
                                </span>
                            )}
                        </div>
                    </Link>

                    <button
                        onClick={toggleLanguage}
                        className="btn"
                        style={{ padding: '0.5rem', border: '1px solid currentColor', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'inherit' }}
                        aria-label="Toggle Language"
                    >
                        <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>{language.toUpperCase()}</span>
                        <Languages size={20} />
                    </button>

                    {user ? (
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <Link to="/orders" style={{ fontWeight: '500', color: 'inherit', textDecoration: 'none' }}>{t('nav.orders') || 'Orders'}</Link>
                            <Link to="/profile" style={{ fontWeight: '500', color: 'inherit', textDecoration: 'none' }}>{t('nav.profile')}</Link>
                            <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>{t('nav.logout')}</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn btn-primary">{t('nav.login')}</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
