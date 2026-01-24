import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

export default function MenuPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const { t } = useLanguage();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const { data } = await api.get('/menu');
                setCategories(data.data);
            } catch (err) {
                setError(t('menu.error'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [t]);

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p>{t('menu.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'red' }}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'hsl(var(--color-primary))' }}>{t('menu.title')}</h1>
                <p style={{ color: 'hsl(var(--color-text-secondary))' }}>{t('menu.subtitle')}</p>
            </header>

            {/* Category Navigation */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                marginBottom: '2rem',
                justifyContent: 'center'
            }}>
                <button
                    className={`btn ${activeCategory === 'all' ? 'btn-primary' : ''}`}
                    style={{
                        backgroundColor: activeCategory === 'all' ? '' : 'white',
                        border: activeCategory === 'all' ? '' : '1px solid var(--color-border)'
                    }}
                    onClick={() => setActiveCategory('all')}
                >
                    {t('menu.filter.all')}
                </button>
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`btn ${activeCategory === category.id ? 'btn-primary' : ''}`}
                        style={{
                            backgroundColor: activeCategory === category.id ? '' : 'white',
                            border: activeCategory === category.id ? '' : '1px solid var(--color-border)'
                        }}
                        onClick={() => setActiveCategory(category.id)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                {categories.map(category => {
                    if (activeCategory !== 'all' && activeCategory !== category.id) return null;

                    if (category.products.length === 0) return null;

                    return (
                        <section key={category.id} className="animate-fade-in">
                            <h2 style={{
                                fontSize: '2rem',
                                marginBottom: '1.5rem',
                                borderBottom: '2px solid hsl(var(--color-secondary))',
                                display: 'inline-block',
                                paddingBottom: '0.5rem'
                            }}>
                                {category.name}
                            </h2>
                            <div className="grid-menu">
                                {category.products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
