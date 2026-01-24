import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                    {t('home.hero.title')}
                </h1>
                <p style={{ fontSize: '1.5rem', color: 'hsl(var(--color-text-secondary))', marginBottom: '3rem' }}>
                    {t('home.hero.subtitle')}
                </p>
                <button
                    className="btn btn-primary"
                    style={{ padding: '1rem 2rem', fontSize: '1.25rem' }}
                    onClick={() => navigate('/menu')}
                >
                    {t('nav.menu')}
                </button>
            </div>
        </div>
    );
}
