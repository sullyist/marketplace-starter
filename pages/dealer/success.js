import Link from 'next/link';
import Head from 'next/head';

export default function DealerSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Head>
        <title>Welcome, dealer — MotoMarket</title>
      </Head>
      <div className="bg-white rounded-lg shadow-md p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">★</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">You're a MotoMarket Dealer</h1>
        <p className="text-gray-600 mb-6">
          Your dealer badge will appear on your listings shortly. Manage your subscription any time from the dashboard.
        </p>
        <Link href="/dashboard" className="inline-block px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
