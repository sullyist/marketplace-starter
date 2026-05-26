import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function MessagesInbox() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/messages');
      return;
    }
    if (status !== 'authenticated') return;

    const load = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        if (res.ok) setConversations(data.conversations || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading messages…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Messages — MotoMarket</title>
      </Head>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold">Messages</h1>
          <p className="text-blue-100 mt-2">Conversations about your listings and inquiries.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">You don't have any conversations yet.</p>
            <Link href="/listings" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md divide-y divide-gray-100">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
              >
                {c.listing?.imageUrl ? (
                  <img src={c.listing.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">🏍️</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-gray-900 truncate">
                      {c.otherParty?.name || c.otherParty?.email || 'Unknown user'}
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0">
                      {c.lastMessage ? timeAgo(c.lastMessage.createdAt) : timeAgo(c.updatedAt)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {c.listing?.title || 'Listing deleted'}
                    <span className="text-gray-400"> · {c.role === 'seller' ? 'You are selling' : 'You are buying'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="text-sm text-gray-500 truncate">
                      {c.lastMessage?.body || <span className="italic">No messages yet</span>}
                    </div>
                    {c.unread > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 bg-blue-600 text-white text-xs font-semibold rounded-full flex-shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
