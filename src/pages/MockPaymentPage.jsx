import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, XCircle, CheckCircle, CreditCard, Wallet, Banknote } from 'lucide-react';
import api from '../services/api';

export default function MockPaymentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);

    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const provider = searchParams.get('provider');

    const formattedAmount = new Intl.NumberFormat('fi-FI', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount || 0);

    const getProviderConfig = () => {
        const p = provider?.toLowerCase();
        if (p === 'epassi') return { color: '#59b200', name: 'ePassi', icon: CreditCard };
        if (p === 'lounasseteli') return { color: '#ff0000', name: 'Edenred / Lounasseteli', icon: CreditCard };
        if (p === 'verkkomaksu') return { color: '#2b2b2b', name: 'Paytrail Verkkomaksu', icon: ShieldCheck };
        return { color: '#0284c7', name: 'Secure Payment', icon: ShieldCheck };
    };

    const config = getProviderConfig();

    const handlePayment = async (status) => {
        setProcessing(true);
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call backend webhook
            const endpoint = provider?.toLowerCase() || 'mock';
            await api.post(`/payments/webhook/${endpoint}`, {
                orderId,
                status: status === 'success' ? 'ok' : 'fail',
                transactionId: `${endpoint.toUpperCase()}-${Date.now()}`
            });

            if (status === 'success') {
                navigate(`/track/${orderId}?payment=success`);
            } else {
                navigate(`/checkout?error=payment_cancelled`);
            }
        } catch (err) {
            console.error('Payment simulation failed', err);
            alert('Simulation failed. Check console.');
            setProcessing(false);
        }
    };

    if (!orderId || !amount) {
        return <div>Invalid payment parameters</div>;
    }

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '2rem'
        }}>
            <div className="card" style={{
                maxWidth: '500px',
                width: '100%',
                padding: '2.5rem',
                textAlign: 'center',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                borderTop: `5px solid ${config.color}`
            }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: `${config.color}15`, padding: '1rem', borderRadius: '50%' }}>
                        <config.icon size={48} color={config.color} />
                    </div>
                </div>

                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                    {config.name}
                </h1>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                    This is a simulated payment page for demonstration purposes.
                </p>

                <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Amount to Pay</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a' }}>{formattedAmount}</div>
                </div>

                {processing ? (
                    <div style={{ color: config.color, fontWeight: 600 }}>Processing secure transaction...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => handlePayment('failed')}
                            style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                color: '#ef4444',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <XCircle size={20} /> Cancel
                        </button>
                        <button
                            onClick={() => handlePayment('success')}
                            style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                background: config.color,
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <CheckCircle size={20} /> Pay Now
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Secure Mock Payment Gateway - Pizzeria Mavi
                </div>
            </div>
        </div>
    );
}
