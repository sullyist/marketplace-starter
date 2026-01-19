import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';

const prisma = new PrismaClient();

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
  const formattedDate = new Date(product.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <button
            onClick={() => router.back()}
            className="mb-4 text-white hover:text-blue-200 transition flex items-center"
          >
            ← Back to Listings
          </button>
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
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900">{product.bikeType}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-700">Engine Size:</span>
                  <span className="text-gray-900">{product.engineSize}cc</span>
                </div>
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
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Name:</span>
                  <span className="text-gray-900">{product.user.name || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">Email:</span>
                  <a
                    href={`mailto:${product.user.email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {product.user.email}
                  </a>
                </div>
              </div>
              <button
                onClick={() => window.location.href = `mailto:${product.user.email}?subject=Inquiry about ${product.title}`}
                className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Contact Seller
              </button>
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
