import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">MotoMarket</Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Reset your password</h1>
          <p className="text-gray-500">We'll send you a link to reset it</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-xl font-semibold mb-2">Check your email</h2>
              <p className="text-gray-600">If that address is registered, a reset link has been sent.</p>
              <Link href="/login" className="inline-block mt-6 text-blue-600 hover:text-blue-700 font-medium">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-gray-600">
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
