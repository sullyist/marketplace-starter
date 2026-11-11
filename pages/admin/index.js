import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatPrice } from '../../lib/pricing';

function daysLeft(date) {
  if (!date) return 0;
  const ms = new Date(date).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState('listings');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listingsPage, setListingsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const ADMIN_PAGE_SIZE = 10;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      if (session.user.role !== 'admin') { router.push('/'); return; }
      loadData();
    }
  }, [status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, uRes, payRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/users'),
        fetch('/api/admin/payments'),
      ]);
      const [pData, uData, payData] = await Promise.all([pRes.json(), uRes.json(), payRes.json()]);
      if (Array.isArray(pData)) setProducts(pData);
      if (Array.isArray(uData)) setUsers(uData);
      if (Array.isArray(payData)) setPayments(payData);
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProducts(products.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete listing.');
    }
  };

  const handleToggleRole = async (userId, currentRole, userName) => {
    const newRole = currentRole === 'admin' ? 'buyer' : 'admin';
    const action = newRole === 'admin' ? 'promote' : 'demote';
    if (!window.confirm(`${action === 'promote' ? 'Promote' : 'Demote'} ${userName || 'this user'} ${action === 'promote' ? 'to admin' : 'to buyer'}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(users.map(u => u.id === userId ? { ...u, role: data.role } : u));
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  const handleFeatureListing = async (listingId, title) => {
    const input = window.prompt(`Feature "${title}" for how many days? (0 to unfeature, max 365)`, '7');
    if (input === null) return;
    const days = parseInt(input, 10);
    if (!Number.isFinite(days) || days < 0 || days > 365) {
      setError('Days must be a number between 0 and 365.');
      return;
    }
    try {
      const res = await fetch('/api/admin/feature-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProducts(products.map(p => p.id === listingId ? { ...p, featuredUntil: data.featuredUntil } : p));
    } catch (err) {
      setError(err.message || 'Failed to feature listing.');
    }
  };

  const handleGrantDealer = async (userId, userName) => {
    const input = window.prompt(`Grant dealer status to ${userName} for how many days? (0 to revoke, max 3650)`, '30');
    if (input === null) return;
    const days = parseInt(input, 10);
    if (!Number.isFinite(days) || days < 0 || days > 3650) {
      setError('Days must be a number between 0 and 3650.');
      return;
    }
    try {
      const res = await fetch('/api/admin/grant-dealer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(users.map(u => u.id === userId ? { ...u, dealerUntil: data.dealerUntil } : u));
    } catch (err) {
      setError(err.message || 'Failed to grant dealer status.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const newListingsThisWeek = products.filter(p => new Date(p.createdAt) > thisWeek).length;
  const newUsersThisWeek = users.filter(u => new Date(u.createdAt) > thisWeek).length;
  const dealerCount = users.filter(u => daysLeft(u.dealerUntil) > 0).length;
  const succeededPayments = payments.filter(p => p.status === 'succeeded' && p.amount > 0);
  const revenueCents = succeededPayments.reduce((s, p) => s + p.amount, 0);
  const revenueThisWeekCents = succeededPayments
    .filter(p => new Date(p.createdAt) > thisWeek)
    .reduce((s, p) => s + p.amount, 0);

  const listingsTotalPages = Math.ceil(products.length / ADMIN_PAGE_SIZE);
  const paginatedProducts = products.slice((listingsPage - 1) * ADMIN_PAGE_SIZE, listingsPage * ADMIN_PAGE_SIZE);
  const usersTotalPages = Math.ceil(users.length / ADMIN_PAGE_SIZE);
  const paginatedUsers = users.slice((usersPage - 1) * ADMIN_PAGE_SIZE, usersPage * ADMIN_PAGE_SIZE);
  const paymentsTotalPages = Math.ceil(payments.length / ADMIN_PAGE_SIZE);
  const paginatedPayments = payments.slice((paymentsPage - 1) * ADMIN_PAGE_SIZE, paymentsPage * ADMIN_PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
          <p className="text-blue-200">Manage listings, users and payments</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between">
            {error}
            <button onClick={() => setError('')} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Listings</p>
            <p className="text-3xl font-bold text-blue-600">{products.length}</p>
            <p className="text-xs text-green-600 mt-1">+{newListingsThisWeek} this week</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Users</p>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            <p className="text-xs text-green-600 mt-1">+{newUsersThisWeek} this week</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Dealers</p>
            <p className="text-3xl font-bold text-amber-600">{dealerCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Revenue</p>
            <p className="text-3xl font-bold text-emerald-600">{formatPrice(revenueCents)}</p>
            <p className="text-xs text-green-600 mt-1">+{formatPrice(revenueThisWeekCents)} this week</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Avg Price</p>
            <p className="text-3xl font-bold text-blue-600">
              {products.length > 0
                ? `€${Math.round(products.reduce((s, p) => s + p.price, 0) / products.length).toLocaleString()}`
                : '—'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab('listings')}
            className={`px-5 py-2 font-medium text-sm rounded-t-lg transition -mb-px border-b-2 ${tab === 'listings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Listings ({products.length})
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-5 py-2 font-medium text-sm rounded-t-lg transition -mb-px border-b-2 ${tab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setTab('payments')}
            className={`px-5 py-2 font-medium text-sm rounded-t-lg transition -mb-px border-b-2 ${tab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Payments ({payments.length})
          </button>
        </div>

        {/* Listings Tab */}
        {tab === 'listings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {products.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No listings yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Listing</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Seller</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Featured</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Posted</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedProducts.map(product => {
                      const fdl = daysLeft(product.featuredUntil);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{product.title}</div>
                            <div className="text-gray-400 text-xs">{product.make} {product.model} · {product.year}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <div>{product.user?.name || '—'}</div>
                            <div className="text-xs text-gray-400">{product.user?.email}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-blue-600">€{product.price.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {fdl > 0
                              ? <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded">★ {fdl}d left</span>
                              : <span className="text-xs text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(product.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              <Link
                                href={`/listings/${product.id}`}
                                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleFeatureListing(product.id, product.title)}
                                className="px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition"
                              >
                                Feature
                              </button>
                              <button
                                onClick={() => handleDeleteListing(product.id, product.title)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {listingsTotalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">Showing {(listingsPage - 1) * ADMIN_PAGE_SIZE + 1}–{Math.min(listingsPage * ADMIN_PAGE_SIZE, products.length)} of {products.length}</span>
                <div className="flex gap-2">
                  <button onClick={() => setListingsPage(p => p - 1)} disabled={listingsPage === 1}
                    className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
                  <span className="px-3 py-1 text-gray-600">{listingsPage} / {listingsTotalPages}</span>
                  <button onClick={() => setListingsPage(p => p + 1)} disabled={listingsPage === listingsTotalPages}
                    className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {users.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Dealer</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Listings</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedUsers.map(user => {
                      const ddl = daysLeft(user.dealerUntil);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{user.name || '—'}</div>
                            <div className="text-gray-400 text-xs">{user.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {ddl > 0 ? (
                              <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded">
                                {ddl}d left{user.stripeSubscriptionId ? '' : ' (manual)'}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{user._count.products}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleToggleRole(user.id, user.role, user.name || user.email)}
                                disabled={user.id === session?.user?.id}
                                className={`px-3 py-1 text-xs rounded transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                  user.role === 'admin'
                                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                              </button>
                              <button
                                onClick={() => handleGrantDealer(user.id, user.name || user.email)}
                                className="px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition"
                              >
                                {ddl > 0 ? 'Edit Dealer' : 'Grant Dealer'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {usersTotalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">Showing {(usersPage - 1) * ADMIN_PAGE_SIZE + 1}–{Math.min(usersPage * ADMIN_PAGE_SIZE, users.length)} of {users.length}</span>
                <div className="flex gap-2">
                  <button onClick={() => setUsersPage(p => p - 1)} disabled={usersPage === 1}
                    className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
                  <span className="px-3 py-1 text-gray-600">{usersPage} / {usersTotalPages}</span>
                  <button onClick={() => setUsersPage(p => p + 1)} disabled={usersPage === usersTotalPages}
                    className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {tab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No payments yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Listing</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedPayments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{p.user?.name || '—'}</div>
                          <div className="text-xs text-gray-400">{p.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs font-mono">{p.type}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {p.listing ? (
                            <Link href={`/listings/${p.listing.id}`} className="text-blue-600 hover:underline">
                              {p.listing.title}
                            </Link>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {p.amount > 0 ? formatPrice(p.amount, p.currency) : <span className="text-gray-400">free</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            p.status === 'succeeded' ? 'bg-green-100 text-green-700'
                            : p.status === 'failed' ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {paymentsTotalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">Showing {(paymentsPage - 1) * ADMIN_PAGE_SIZE + 1}–{Math.min(paymentsPage * ADMIN_PAGE_SIZE, payments.length)} of {payments.length}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPaymentsPage(p => p - 1)} disabled={paymentsPage === 1}
                    className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
                  <span className="px-3 py-1 text-gray-600">{paymentsPage} / {paymentsTotalPages}</span>
                  <button onClick={() => setPaymentsPage(p => p + 1)} disabled={paymentsPage === paymentsTotalPages}
                    className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
