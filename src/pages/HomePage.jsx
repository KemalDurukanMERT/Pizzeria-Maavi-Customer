import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: '800px', width: '100%' }} >
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.2', fontWeight: '800' }}>
                    {t('home.hero.title')}
                </h1>
                <p style={{ fontSize: '1.5rem', color: 'hsl(var(--color-text-secondary))', marginBottom: '3rem' }}>
                    {t('home.hero.subtitle')}
                </p>
                <button
                    className="btn btn-primary"
                    style={{ padding: '1.2rem 2.5rem', fontSize: '1.25rem' }}
                    onClick={() => navigate('/menu')}
                >
                    {t('nav.menu')}
                </button>
            </div>
        </div>
    );
}
