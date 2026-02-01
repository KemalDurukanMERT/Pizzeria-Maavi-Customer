import { Plus, Minus, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function IngredientSelector({
    product,
    customizations,
    onCustomizationChange
}) {
    const { t } = useLanguage();

    // Customizeable options (ADD, EXTRA, REMOVE)
    const customizations_available = product.customizableIngredients.filter(ci =>
        ci.ingredient.isAvailable
    );

    const toggleCustomization = (option) => {
        const existing = customizations.find(c =>
            c.ingredientId === option.ingredientId && c.action === option.action
        );

        if (existing) {
            onCustomizationChange(
                customizations.filter(c => !(c.ingredientId === option.ingredientId && c.action === option.action))
            );
        } else {
            onCustomizationChange([
                ...customizations,
                {
                    ingredientId: option.ingredientId,
                    action: option.action,
                    priceModifier: option.priceModifier,
                    name: option.ingredient.name
                }
            ]);
        }
    };

    const isSelected = (ingredientId, action) => {
        return customizations.some(c =>
            c.ingredientId === ingredientId && c.action === action
        );
    };

    return (
        <div className="ingredient-selector">
            {customizations_available.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('product.customize.title')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                        {customizations_available.map(option => {
                            const selected = isSelected(option.ingredientId, option.action);
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => toggleCustomization(option)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: selected
                                            ? `1px solid ${option.action === 'REMOVE' ? '#ef4444' : 'hsl(var(--color-primary))'}`
                                            : '1px solid var(--color-border)',
                                        backgroundColor: selected
                                            ? (option.action === 'REMOVE' ? '#fee2e2' : 'hsl(var(--color-primary-light))')
                                            : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: selected
                                            ? (option.action === 'REMOVE' ? '#991b1b' : 'hsl(var(--color-primary-dark))')
                                            : 'inherit'
                                    }}>
                                        {selected ? <Check size={16} /> : (option.action === 'REMOVE' ? <Minus size={16} /> : <Plus size={16} />)}
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                            {option.action}: {option.ingredient.name}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-secondary))' }}>
                                        {option.priceModifier > 0 ? `+€${option.priceModifier.toFixed(2)}` : 'Free'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
