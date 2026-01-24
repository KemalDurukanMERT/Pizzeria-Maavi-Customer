import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function PaymentSimulatePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('pending'); // pending, success, error

    const orderId = searchParams.get('orderId');
    const provider = searchParams.get('provider');
    const amount = searchParams.get('amount');
    const transactionId = searchParams.get('transactionId');

    const handlePayment = async (success) => {
        setLoading(true);
        try {
            if (success) {
                // In a real app, the provider would call our webhook.
                // For simulation, we call it ourselves or tell the backend to complete it.
                await api.post(`/payments/webhook/${provider}`, {
                    orderId,
                    transactionId,
                    status: 'ok',
                    message: 'Simulated payment successful'
                });
                setStatus('success');
                setTimeout(() => navigate(`/track/${orderId}`), 3000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', textAlign: 'center' }}>
                {status === 'pending' && (
                    <>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            backgroundColor: 'hsl(var(--color-primary-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem', color: 'hsl(var(--color-primary))'
                        }}>
                            <CreditCard size={32} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                            Simulated {provider?.toUpperCase()} gateway
                        </h1>
                        <p style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '2rem' }}>
                            You are paying <strong>€{amount}</strong> for order <strong>#{orderId}</strong>.
                            This is a test environment simulation.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => handlePayment(true)}
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '1rem' }}
                            >
                                {loading ? 'Processing...' : 'Simulate Success'}
                            </button>
                            <button
                                onClick={() => handlePayment(false)}
                                disabled={loading}
                                className="btn btn-outline"
                                style={{ flex: 1, padding: '1rem' }}
                            >
                                Simulate Failure
                            </button>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <div style={{ padding: '2rem 0' }}>
                        <CheckCircle size={64} color="#166534" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ color: '#166534', marginBottom: '1rem' }}>Payment Successful!</h2>
                        <p>Redirecting you back to your order track page...</p>
                        <button onClick={() => navigate(`/track/${orderId}`)} className="btn btn-ghost" style={{ marginTop: '1rem' }}>
                            Click here if not redirected <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ padding: '2rem 0' }}>
                        <AlertCircle size={64} color="#991b1b" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ color: '#991b1b', marginBottom: '1rem' }}>Payment Failed</h2>
                        <p>The transaction was cancelled or declined.</p>
                        <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                            Return to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
