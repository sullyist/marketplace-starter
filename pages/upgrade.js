import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { DEALER_SUBSCRIPTION, formatPrice } from '../lib/pricing';

const benefits = [
  { title: 'Dealer badge', body: 'Your listings show a trusted-dealer badge that buyers notice first.' },
  { title: 'Priority in search', body: 'Dealer listings surface above other sellers within the same filter.' },
  { title: 'Unlimited listings', body: 'Post as many motorcycles as your lot can carry — no per-ad fees.' },
  { title: 'Cancel any time', body: 'Manage or cancel your subscription in one click. Pro-rated refunds via Stripe.' },
];

export default function Upgrade() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!session) {
      router.push('/login?callbackUrl=/upgrade');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout-dealer', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Become a Dealer — MotoMarket</title>
        <meta name="description" content="Upgrade to a MotoMarket Dealer account for a trusted badge, priority placement and unlimited listings." />
      </Head>

      <section className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block px-3 py-1 bg-amber-950/30 text-amber-50 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
            For professional sellers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Become a MotoMarket Dealer</h1>
          <p className="text-xl text-amber-50">
            {formatPrice(DEALER_SUBSCRIPTION.amount)} per {DEALER_SUBSCRIPTION.intervalLabel}. Cancel any time.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-2">{b.title}</h3>
              <p className="text-gray-600">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl font-bold mb-2">{formatPrice(DEALER_SUBSCRIPTION.amount)}</div>
          <div className="text-gray-500 mb-6">per {DEALER_SUBSCRIPTION.intervalLabel}</div>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="px-10 py-4 bg-amber-500 text-white text-lg font-semibold rounded-lg hover:bg-amber-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Opening checkout…' : session ? 'Subscribe now' : 'Log in to subscribe'}
          </button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <p className="mt-4 text-xs text-gray-500">
            Secure payment via Stripe. You can cancel from your dashboard any time.
          </p>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back to home</Link>
        </div>
      </section>
    </div>
  );
}
