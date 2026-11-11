import Link from 'next/link';
import Head from 'next/head';

export default function DealerCanceled() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Head>
        <title>Subscription canceled — MotoMarket</title>
      </Head>
      <div className="bg-white rounded-lg shadow-md p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">No charge was made</h1>
        <p className="text-gray-600 mb-6">You can come back any time if you change your mind.</p>
        <Link href="/upgrade" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
          See dealer benefits
        </Link>
      </div>
    </div>
  );
}
