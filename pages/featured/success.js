import Link from 'next/link';
import Head from 'next/head';

export default function FeaturedSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Head>
        <title>Listing featured — MotoMarket</title>
      </Head>
      <div className="bg-white rounded-lg shadow-md p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment received</h1>
        <p className="text-gray-600 mb-6">
          Your listing will be featured shortly. It can take a few seconds for the update to appear.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
            Back to dashboard
          </Link>
          <Link href="/listings" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition">
            Browse listings
          </Link>
        </div>
      </div>
    </div>
  );
}
