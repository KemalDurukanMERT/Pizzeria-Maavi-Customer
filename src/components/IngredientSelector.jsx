import { Plus, Minus, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function IngredientSelector({
    product,
    customizations,
    onCustomizationChange
}) {
    const { t } = useLanguage();

    // Group ingredients by modification type
    // Default ingredients that can be removed
    const defaults = product.defaultIngredients.filter(pi =>
        pi.isRemovable && pi.ingredient.isAvailable
    );

    // Extra ingredients that can be added
    const extras = product.customizableIngredients.filter(ci =>
        ci.action === 'ADD' && ci.ingredient.isAvailable
    );

    const isRemoved = (ingredientId) => {
        return customizations.some(c =>
            c.ingredientId === ingredientId && c.action === 'REMOVE'
        );
    };

    const isAdded = (ingredientId) => {
        return customizations.some(c =>
            c.ingredientId === ingredientId && c.action === 'ADD'
        );
    };

    const handleToggleDefault = (ingredient) => {
        if (isRemoved(ingredient.ingredientId)) {
            // It was removed, so remove the 'REMOVE' action (add it back)
            onCustomizationChange(
                customizations.filter(c => !(c.ingredientId === ingredient.ingredientId && c.action === 'REMOVE'))
            );
        } else {
            // It exists, so add a 'REMOVE' action
            onCustomizationChange([
                ...customizations,
                {
                    ingredientId: ingredient.ingredientId,
                    action: 'REMOVE',
                    priceModifier: 0,
                    name: ingredient.ingredient.name // useful for UI
                }
            ]);
        }
    };

    const handleToggleExtra = (option) => {
        if (isAdded(option.ingredientId)) {
            // Already added, so remove the 'ADD' action
            onCustomizationChange(
                customizations.filter(c => !(c.ingredientId === option.ingredientId && c.action === 'ADD'))
            );
        } else {
            // Add 'ADD' action
            onCustomizationChange([
                ...customizations,
                {
                    ingredientId: option.ingredientId,
                    action: 'ADD',
                    priceModifier: option.priceModifier,
                    name: option.ingredient.name
                }
            ]);
        }
    };

    return (
        <div className="ingredient-selector">
            {defaults.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('product.ingredients.included')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                        {defaults.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleToggleDefault(item)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: isRemoved(item.ingredientId)
                                        ? '1px dashed var(--color-border)'
                                        : '1px solid hsl(var(--color-primary))',
                                    backgroundColor: isRemoved(item.ingredientId)
                                        ? 'transparent'
                                        : 'hsl(var(--color-primary-light))',
                                    color: isRemoved(item.ingredientId)
                                        ? 'hsl(var(--color-text-secondary))'
                                        : 'hsl(var(--color-primary-dark))',
                                    cursor: 'pointer',
                                    opacity: isRemoved(item.ingredientId) ? 0.7 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isRemoved(item.ingredientId) ? <Minus size={16} /> : <Check size={16} />}
                                <span style={{ fontSize: '0.9rem', textDecoration: isRemoved(item.ingredientId) ? 'line-through' : 'none' }}>
                                    {item.ingredient.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {extras.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('product.ingredients.extra')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                        {extras.map(option => (
                            <button
                                key={option.id}
                                onClick={() => handleToggleExtra(option)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: isAdded(option.ingredientId)
                                        ? '1px solid hsl(var(--color-secondary))'
                                        : '1px solid var(--color-border)',
                                    backgroundColor: isAdded(option.ingredientId)
                                        ? 'hsl(35 100% 95%)'
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
                                    color: isAdded(option.ingredientId) ? 'hsl(var(--color-secondary-dark))' : 'inherit'
                                }}>
                                    {isAdded(option.ingredientId) ? <Check size={16} /> : <Plus size={16} />}
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{option.ingredient.name}</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-secondary))' }}>
                                    +€{option.priceModifier.toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
