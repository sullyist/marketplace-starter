// components/ChatBot.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! How can I help you search for a bike today?' }
  ]);
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    const lower = input.toLowerCase();
    const params = new URLSearchParams();

    // Basic filters based on keywords
    if (lower.includes('dublin')) params.set('location', 'Dublin');
    if (lower.includes('cork')) params.set('location', 'Cork');
    if (lower.match(/under\s*€?(\d+)/)) {
      const price = lower.match(/under\s*€?(\d+)/)[1];
      params.set('maxPrice', price);
    }
    if (lower.match(/(honda|yamaha|suzuki|bmw|ktm)/)) {
      const make = lower.match(/(honda|yamaha|suzuki|bmw|ktm)/)[1];
      params.set('makeModel', make);
    }

    if ([...params.keys()].length > 0) {
      const botReply = { role: 'bot', text: 'Got it! Showing filtered results...' };
      setMessages((prev) => [...prev, botReply]);
      router.push(`/listings?${params.toString()}`);
    } else {
      const botReply = {
        role: 'bot',
        text: "I'm not sure how to help with that. Try mentioning location, make, or price."
      };
      setMessages((prev) => [...prev, botReply]);
    }

    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border shadow-lg rounded p-4 z-50">
      <div className="h-64 overflow-y-auto space-y-2 text-sm mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <span
              className={`inline-block px-3 py-2 rounded ${
                msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-200'
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-1 border px-2 py-1 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a search..."
        />
        <button onClick={handleSend} className="px-3 py-1 bg-blue-600 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}
