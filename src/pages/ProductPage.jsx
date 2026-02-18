import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, ShoppingCart, Clock } from 'lucide-react';
import api, { BASE_URL } from '../services/api';
import { useCart } from '../context/CartContext';
import IngredientSelector from '../components/IngredientSelector';
import { useLanguage } from '../context/LanguageContext';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { t } = useLanguage();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [customizations, setCustomizations] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/menu/products/${id}`);
                setProduct(data.data);
                setTotalPrice(data.data.basePrice);
            } catch (err) {
                setError(t('menu.error'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, t]);

    useEffect(() => {
        if (product) {
            const extrasCost = customizations.reduce((sum, c) => sum + c.priceModifier, 0);
            setTotalPrice((product.basePrice + extrasCost) * quantity);
        }
    }, [product, customizations, quantity]);

    const handleAddToCart = () => {
        addToCart(product, quantity, customizations);
        toast.success(t('cart.added') || `${product.name} added to cart!`);
        navigate('/menu');
    };

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
    if (error || !product) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'red' }}>{error || 'Product not found'}</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <button
                onClick={() => navigate('/menu')}
                className="btn"
                style={{
                    backgroundColor: 'transparent',
                    color: 'hsl(var(--color-text-secondary))',
                    padding: 0,
                    marginBottom: '2rem'
                }}
            >
                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> {t('product.back')}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '3rem', alignItems: 'start' }} className="product-layout">
                {/* Product Image */}
                <div style={{ position: 'relative' }}>
                    <img
                        src={product.imageUrl ? product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_URL}${product.imageUrl}` : 'https://placehold.co/400x300?text=No+Image'}
                        alt={product.name}
                        style={{
                            width: '100%',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    />
                </div>

                {/* Details & Customization */}
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.name}</h1>
                    <p style={{ color: 'hsl(var(--color-text-secondary))', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        {product.description}
                    </p>

                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--color-text-secondary))' }}>
                            <Clock size={20} />
                            <span>{product.preparationTime} {t('product.prepTime')}</span>
                        </div>
                        {product.allergens.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {product.allergens.map(allergen => (
                                    <span key={allergen} style={{
                                        backgroundColor: 'hsl(var(--color-bg-base))',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.85rem'
                                    }}>
                                        {allergen.toLowerCase()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {product.isCustomizable && (
                        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('product.customize.title')}</h2>
                                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-secondary))' }}>
                                    {t('product.customize.desc')}
                                </p>
                            </div>

                            <IngredientSelector
                                product={product}
                                customizations={customizations}
                                onCustomizationChange={setCustomizations}
                            />
                        </div>
                    )}

                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        backgroundColor: 'hsl(var(--color-bg-base))',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    className="btn"
                                    style={{ border: '1px solid var(--color-border)', width: '36px', height: '36px', padding: 0 }}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    -
                                </button>
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{quantity}</span>
                                <button
                                    className="btn"
                                    style={{ border: '1px solid var(--color-border)', width: '36px', height: '36px', padding: 0 }}
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'hsl(var(--color-primary))' }}>
                                €{totalPrice.toFixed(2)}
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', gap: '0.75rem' }}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart size={24} /> {t('product.add')} {quantity} {t('product.total').toLowerCase()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
