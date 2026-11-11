import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FEATURED_LISTING, formatPrice } from '../lib/pricing';

function daysLeft(featuredUntil) {
  if (!featuredUntil) return 0;
  const ms = new Date(featuredUntil).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [featureLoading, setFeatureLoading] = useState(null);
  const [featureError, setFeatureError] = useState('');

  const [dealerStatus, setDealerStatus] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');

    if (newPassword !== confirmPassword) {
      return setPwError('New passwords do not match.');
    }
    if (newPassword.length < 8) {
      return setPwError('New password must be at least 8 characters.');
    }

    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPwMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwOpen(false);
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const fetchProducts = () => {
    if (session?.user?.id) {
      setLoading(true);
      fetch(`/api/products/user/${session.user.id}`)
        .then(res => res.json())
        .then((data) => {
          setProducts(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchProducts();
    if (session?.user?.id) {
      fetch('/api/me/dealer').then(r => r.ok ? r.json() : null).then(setDealerStatus).catch(() => {});
    }
  }, [session]);

  const openPortal = async () => {
    setPortalError('');
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not open billing portal');
      window.location.href = data.url;
    } catch (err) {
      setPortalError(err.message || 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  const handleFeature = async (productId) => {
    setFeatureError('');
    setFeatureLoading(productId);
    try {
      const res = await fetch('/api/stripe/checkout-featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: productId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout');
      window.location.href = data.url;
    } catch (err) {
      setFeatureError(err.message || 'Failed to start checkout');
      setFeatureLoading(null);
    }
  };

  const handleDelete = async (productId, productTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${productTitle}"?`)) return;

    setDeleteLoading(productId);
    setDeleteError('');

    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete listing');
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete listing');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be logged in to view your dashboard.</p>
          <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-gray-600">Manage your motorcycle listings</p>
          </div>
          <Link
            href="/post-ad"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            + Post New Ad
          </Link>
        </div>

        {/* Dealer subscription status */}
        {dealerStatus && (
          <div className={`mb-6 rounded-lg shadow-sm border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${dealerStatus.isDealer ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
            <div>
              {dealerStatus.isDealer ? (
                <>
                  <h3 className="font-bold text-amber-900">★ Dealer account active</h3>
                  <p className="text-sm text-amber-800">
                    Renews on {new Date(dealerStatus.dealerUntil).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900">Sell like a pro</h3>
                  <p className="text-sm text-gray-600">Dealer accounts get a trusted badge, priority placement and unlimited listings.</p>
                </>
              )}
              {portalError && <p className="mt-2 text-sm text-red-600">{portalError}</p>}
            </div>
            {dealerStatus.isDealer ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="px-5 py-2 bg-white border border-amber-300 text-amber-900 font-medium rounded-lg hover:bg-amber-100 transition disabled:opacity-60"
              >
                {portalLoading ? 'Opening…' : 'Manage subscription'}
              </button>
            ) : (
              <Link
                href="/upgrade"
                className="px-5 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
              >
                Become a dealer
              </Link>
            )}
          </div>
        )}

        {/* Change Password */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100">
          <button
            onClick={() => { setPwOpen(!pwOpen); setPwError(''); setPwMessage(''); }}
            className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <span>Change Password</span>
            <span className="text-gray-400">{pwOpen ? '▲' : '▼'}</span>
          </button>

          {pwOpen && (
            <div className="px-6 pb-6">
              {pwError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{pwError}</div>
              )}
              {pwMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{pwMessage}</div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pwLoading ? 'Saving...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {deleteError}
          </div>
        )}

        {featureError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {featureError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-500">Loading your listings...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold mb-2">No Listings Yet</h2>
            <p className="text-gray-600 mb-6">You haven't posted any motorcycle ads yet.</p>
            <Link
              href="/post-ad"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Post Your First Ad
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                {daysLeft(product.featuredUntil) > 0 && (
                  <span className="absolute top-3 left-3 z-10 px-2 py-1 text-xs font-bold bg-amber-400 text-amber-950 rounded shadow">
                    ★ Featured · {daysLeft(product.featuredUntil)}d left
                  </span>
                )}
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Make:</span> {product.make}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Model:</span> {product.model}
                  </p>
                  {product.year && product.year !== 'Unknown' && (
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Year:</span> {product.year}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    €{product.price.toLocaleString()}
                  </p>

                  <button
                    onClick={() => handleFeature(product.id)}
                    disabled={featureLoading === product.id}
                    className="w-full mb-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {featureLoading === product.id
                      ? 'Opening checkout…'
                      : daysLeft(product.featuredUntil) > 0
                        ? `★ Extend by ${FEATURED_LISTING.durationDays} days — ${formatPrice(FEATURED_LISTING.amount)}`
                        : `★ Feature for ${FEATURED_LISTING.durationDays} days — ${formatPrice(FEATURED_LISTING.amount)}`}
                  </button>

                  <div className="flex gap-2">
                    <Link
                      href={`/listings/${product.id}`}
                      className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      View
                    </Link>
                    <Link
                      href={`/edit-listing/${product.id}`}
                      className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.title)}
                      disabled={deleteLoading === product.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
