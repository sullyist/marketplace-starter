import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState('listings');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const [pRes, uRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/users'),
      ]);
      const [pData, uData] = await Promise.all([pRes.json(), uRes.json()]);
      if (Array.isArray(pData)) setProducts(pData);
      if (Array.isArray(uData)) setUsers(uData);
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
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
          <p className="text-blue-200">Manage listings and users</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Listings</p>
            <p className="text-3xl font-bold text-blue-600">{products.length}</p>
            <p className="text-xs text-green-600 mt-1">+{newListingsThisWeek} this week</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            <p className="text-xs text-green-600 mt-1">+{newUsersThisWeek} this week</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Admins</p>
            <p className="text-3xl font-bold text-blue-600">{adminCount}</p>
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
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Posted</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(product => (
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
                        <td className="px-4 py-3 text-gray-600">{product.bikeType}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(product.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link
                              href={`/listings/${product.id}`}
                              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteListing(product.id, product.title)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Listings</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(user => (
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
                        <td className="px-4 py-3 text-gray-600">{user._count.products}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
