import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FeaturedCanceled() {
  const { query } = useRouter();
  const backHref = query.listingId ? `/listings/${query.listingId}` : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Head>
        <title>Payment canceled — MotoMarket</title>
      </Head>
      <div className="bg-white rounded-lg shadow-md p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Payment canceled</h1>
        <p className="text-gray-600 mb-6">No charge was made. You can try again whenever you're ready.</p>
        <Link href={backHref} className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
          Go back
        </Link>
      </div>
    </div>
  );
}
