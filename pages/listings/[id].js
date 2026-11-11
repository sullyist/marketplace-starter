import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FEATURED_LISTING, formatPrice } from '../../lib/pricing';

const prisma = new PrismaClient();

function daysLeft(featuredUntil) {
  if (!featuredUntil) return 0;
  const ms = new Date(featuredUntil).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
}

export async function getServerSideProps(context) {
  const product = await prisma.product.findUnique({
    where: { id: context.params.id },
    include: { user: true },
  });

  if (!product) {
    return { notFound: true };
  }

  return {
    props: { product: JSON.parse(JSON.stringify(product)) },
  };
}

export default function ListingDetail({ product }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [starting, setStarting] = useState(false);
  const [contactError, setContactError] = useState('');
  const [featuring, setFeaturing] = useState(false);
  const [featureError, setFeatureError] = useState('');
  const isOwner = session?.user?.id === product.userId;
  const featuredDaysLeft = daysLeft(product.featuredUntil);

  const handleFeature = async () => {
    setFeatureError('');
    setFeaturing(true);
    try {
      const res = await fetch('/api/stripe/checkout-featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: product.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout');
      window.location.href = data.url;
    } catch (err) {
      setFeatureError(err.message || 'Failed to start checkout');
      setFeaturing(false);
    }
  };

  const handleContact = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/listings/${product.id}`);
      return;
    }
    setStarting(true);
    setContactError('');
    try {
      const res = await fetch('/api/messages/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start conversation');
      router.push(`/messages/${data.id}`);
    } catch (err) {
      setContactError(err.message);
      setStarting(false);
    }
  };

  const formattedDate = new Date(product.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{product.title} — MotoMarket</title>
        <meta name="description" content={`${product.year} ${product.make} ${product.model} for sale in ${product.location}. ${product.condition} condition, ${parseInt(product.mileage).toLocaleString()} ${product.mileageUnit || 'km'}. €${product.price.toLocaleString()}.`} />
        <meta property="og:title" content={`${product.title} — MotoMarket`} />
        <meta property="og:description" content={`${product.year} ${product.make} ${product.model} for sale in ${product.location}. €${product.price.toLocaleString()}.`} />
        <meta property="og:image" content={product.imageUrl} />
        <meta property="og:type" content="product" />
      </Head>
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-blue-200 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link href="/listings" className="hover:text-white transition">Listings</Link>
            <span>/</span>
            <span className="text-white truncate max-w-xs">{product.title}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold">
            {product.title}
          </h1>
          <p className="text-xl text-blue-100 mt-2">
            {product.make} {product.model}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-96 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-6xl">🏍️</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-500 mb-2">Price</div>
              <div className="text-4xl font-bold text-blue-600">
                €{product.price.toLocaleString()}
              </div>
            </div>

            {/* Specifications Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Specifications</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">Make:</span>
                  <span className="text-gray-900">{product.make}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">Model:</span>
                  <span className="text-gray-900">{product.model}</span>
                </div>
                {product.year && product.year !== 'Unknown' && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-700">Year:</span>
                    <span className="text-gray-900">{product.year}</span>
                  </div>
                )}
                {product.mileage && product.mileage !== 'Unknown' && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-700">Mileage:</span>
                    <span className="text-gray-900">{parseInt(product.mileage).toLocaleString()} {product.mileageUnit || 'km'}</span>
                  </div>
                )}
                {product.condition && product.condition !== 'Unknown' && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-700">Condition:</span>
                    <span className="text-gray-900">{product.condition}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900">{product.bikeType}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">Engine Size:</span>
                  <span className="text-gray-900">{product.engineSize}cc</span>
                </div>
                {product.power && product.power !== 'Unknown' && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-700">Power:</span>
                    <span className="text-gray-900">{product.power}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="text-gray-900">{product.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Posted:</span>
                  <span className="text-gray-900">{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Seller Information</h2>
              <div className="space-y-2">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900">{product.user.name || 'Not provided'}</span>
                  {product.user.dealerUntil && new Date(product.user.dealerUntil) > new Date() && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded">Dealer</span>
                  )}
                </div>
              </div>
              {isOwner ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-500 italic">This is your listing.</p>
                  {featuredDaysLeft > 0 && (
                    <p className="text-sm font-semibold text-amber-700">★ Featured — {featuredDaysLeft} day{featuredDaysLeft === 1 ? '' : 's'} left</p>
                  )}
                  <button
                    onClick={handleFeature}
                    disabled={featuring}
                    className="w-full px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {featuring
                      ? 'Opening checkout…'
                      : featuredDaysLeft > 0
                        ? `★ Extend by ${FEATURED_LISTING.durationDays} days — ${formatPrice(FEATURED_LISTING.amount)}`
                        : `★ Feature for ${FEATURED_LISTING.durationDays} days — ${formatPrice(FEATURED_LISTING.amount)}`}
                  </button>
                  {featureError && (
                    <p className="text-sm text-red-600">{featureError}</p>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleContact}
                    disabled={starting}
                    className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {starting ? 'Opening…' : 'Contact Seller'}
                  </button>
                  {contactError && (
                    <p className="mt-2 text-sm text-red-600">{contactError}</p>
                  )}
                  {!session && (
                    <p className="mt-2 text-xs text-gray-500 text-center">You'll be asked to log in first.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Similar Listings CTA */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Looking for more options?</h3>
          <p className="text-gray-600 mb-4">
            Browse more {product.bikeType} motorcycles or explore all listings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/listings?bikeType=${product.bikeType}`}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              More {product.bikeType} Bikes
            </Link>
            <Link
              href="/listings"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition border-2 border-blue-600"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
