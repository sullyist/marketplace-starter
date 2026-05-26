import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const POLL_MS = 5000;

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MessageThread() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [thread, setThread] = useState(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const fetchThread = async () => {
    if (!id) return;
    const res = await fetch(`/api/messages/${id}`);
    if (res.status === 401) {
      router.push(`/login?callbackUrl=/messages/${id}`);
      return;
    }
    if (res.status === 403 || res.status === 404) {
      router.push('/messages');
      return;
    }
    const data = await res.json();
    if (res.ok) setThread(data);
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/messages/${id || ''}`);
      return;
    }
    if (status !== 'authenticated' || !id) return;
    fetchThread();
    const interval = setInterval(fetchThread, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages?.length]);

  const send = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setBody('');
      await fetchThread();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (status === 'loading' || loading || !thread) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading…</div>
      </div>
    );
  }

  const me = session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{thread.otherParty?.name || 'Conversation'} — MotoMarket</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/messages" className="text-sm text-blue-600 hover:underline">← Back to messages</Link>

        {/* Listing header */}
        {thread.listing ? (
          <Link
            href={`/listings/${thread.listing.id}`}
            className="mt-3 flex items-center gap-4 bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
          >
            {thread.listing.imageUrl ? (
              <img src={thread.listing.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">🏍️</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{thread.listing.title}</div>
              <div className="text-blue-600 font-bold">€{thread.listing.price?.toLocaleString()}</div>
            </div>
            <div className="text-sm text-gray-500 hidden sm:block">
              {thread.role === 'seller' ? 'Inquiry from buyer' : 'Your inquiry'}
            </div>
          </Link>
        ) : (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            This listing is no longer available.
          </div>
        )}

        <div className="mt-2 text-sm text-gray-600">
          With <span className="font-semibold">{thread.otherParty?.name || thread.otherParty?.email}</span>
        </div>

        {/* Messages */}
        <div className="mt-4 bg-white rounded-lg shadow-sm p-4 min-h-[400px] max-h-[60vh] overflow-y-auto">
          {thread.messages.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No messages yet — say hello.</div>
          ) : (
            <div className="space-y-3">
              {thread.messages.map((m) => {
                const mine = m.senderId === me;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.body}</div>
                      <div className={`text-xs mt-1 ${mine ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <form onSubmit={send} className="mt-4 bg-white rounded-lg shadow-sm p-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message…"
            rows={3}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(e);
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">Cmd/Ctrl + Enter to send · {body.length}/2000</span>
            <button
              type="submit"
              disabled={!body.trim() || sending}
              className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
