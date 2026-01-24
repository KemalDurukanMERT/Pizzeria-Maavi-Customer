import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BASE_URL } from '../services/api';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div
            className="card"
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ position: 'relative', paddingTop: '60%', overflow: 'hidden' }}>
                <img
                    src={product.imageUrl ? product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_URL}${product.imageUrl}` : 'https://placehold.co/400x300?text=No+Image'}
                    alt={product.name}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                {product.isCustomizable && (
                    <span style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                    }}>
                        {t('product.customizable')}
                    </span>
                )}
            </div>

            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{product.name}</h3>
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'hsl(var(--color-primary))'
                    }}>
                        €{product.basePrice.toFixed(2)}
                    </span>
                </div>

                <p style={{
                    color: 'hsl(var(--color-text-secondary))',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    flex: 1
                }}>
                    {product.description}
                </p>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', gap: '0.5rem' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                    }}
                >
                    <Plus size={18} />
                    {product.isCustomizable ? t('product.customize') : t('product.addToCart')}
                </button>
            </div>
        </div>
    );
}
