
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Languages, Menu, X, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
    const { itemCount } = useCart();
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'fi' : 'en');
    };

    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 100 }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🍕 {t('nav.home')}</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Mobile Cart Icon (Always visible next to menu) */}
                    <Link to="/cart" className="mobile-cart-icon" style={{ textDecoration: 'none', color: 'inherit', position: 'relative', display: 'none' }}>
                        <ShoppingCart size={24} />
                        {itemCount > 0 && (
                            <span className="cart-badge">{itemCount}</span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="menu-toggle"
                        style={{ display: 'none', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', zIndex: 100 }}
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/menu" onClick={() => setIsMenuOpen(false)}>{t('nav.menu')}</Link>
                    <Link to="/track" onClick={() => setIsMenuOpen(false)}>{t('nav.track') || 'Track'}</Link>

                    <Link to="/cart" className="desktop-cart-icon" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <ShoppingCart size={24} />
                            {itemCount > 0 && (
                                <span className="cart-badge">{itemCount}</span>
                            )}
                        </div>
                    </Link>

                    <button
                        onClick={toggleLanguage}
                        className="btn-lang"
                        aria-label="Toggle Language"
                    >
                        <span style={{ fontWeight: 'bold' }}>{language.toUpperCase()}</span>
                        <Languages size={18} />
                    </button>

                    {user ? (
                        <>
                            <Link to="/orders" onClick={() => setIsMenuOpen(false)}>{t('nav.orders') || 'Orders'}</Link>
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="profile-link">
                                <User size={20} className="hide-mobile" />
                                {t('nav.profile')}
                            </Link>
                            <button onClick={() => { logout(); setIsMenuOpen(false); }} className="btn btn-secondary logout-btn">{t('nav.logout')}</button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-primary login-btn">{t('nav.login')}</Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

