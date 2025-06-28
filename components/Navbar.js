import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          MotoMarket
        </Link>
        <div className="space-x-4">
          <Link href="/listings" className="hover:text-gray-300">
            Browse Listings
          </Link>
          <Link href="/create" className="hover:text-gray-300">
            Post an Ad
          </Link>
          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
