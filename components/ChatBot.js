// components/ChatBot.js
import { useState } from 'react';
import { useRouter } from 'next/router';

const BIKE_TYPES = [
  'Sport', 'Cruiser', 'Adventure', 'Touring', 'Standard', 'Dual-Sport',
  'Naked', 'Scooter', 'Cafe Racer', 'Bobber', 'Chopper', 'Streetfighter',
  'Supermoto', 'Electric', 'Sport Touring', 'Enduro', 'Dirt Bike', 'Classic', 'Moped'
];

const COMMON_MAKES = [
  'honda', 'yamaha', 'suzuki', 'kawasaki', 'ducati', 'bmw', 'ktm',
  'harley', 'triumph', 'aprilia', 'mv agusta', 'royal enfield'
];

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! How can I help you search for a bike today?' }
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const router = useRouter();

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    const lower = input.toLowerCase();
    const params = new URLSearchParams();

    // Location search
    if (lower.includes('dublin')) params.set('location', 'Dublin');
    if (lower.includes('cork')) params.set('location', 'Cork');
    if (lower.includes('galway')) params.set('location', 'Galway');
    if (lower.includes('limerick')) params.set('location', 'Limerick');

    // Price search
    if (lower.match(/under\s*€?(\d+)/)) {
      const price = lower.match(/under\s*€?(\d+)/)[1];
      params.set('maxPrice', price);
    }

    // Make search
    const makeMatch = COMMON_MAKES.find(make => lower.includes(make));
    if (makeMatch) {
      params.set('search', makeMatch);
    }

    // Model search - check if input contains common model names
    const modelPatterns = [
      'cbr', 'gsxr', 'ninja', 'yzf', 'r1', 'r6', 'monster', 'scrambler',
      'sportster', 'street', 'rebel', 'shadow', 'boulevard', 'versys'
    ];
    const modelMatch = modelPatterns.find(model => lower.includes(model));
    if (modelMatch && !makeMatch) {
      params.set('search', modelMatch);
    }

    // Category/Type search
    const typeMatch = BIKE_TYPES.find(type =>
      lower.includes(type.toLowerCase())
    );
    if (typeMatch) {
      params.set('bikeType', typeMatch);
    }

    if ([...params.keys()].length > 0) {
      const botReply = { role: 'bot', text: 'Got it! Showing filtered results...' };
      setMessages((prev) => [...prev, botReply]);
      router.push(`/listings?${params.toString()}`);
    } else {
      const botReply = {
        role: 'bot',
        text: "I'm not sure how to help with that. Try mentioning make, model, category, location, or price."
      };
      setMessages((prev) => [...prev, botReply]);
    }

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border shadow-lg rounded z-50">
      {/* Header with minimize button */}
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t flex justify-between items-center">
        <span className="font-semibold">Search Assistant</span>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-white hover:text-blue-200 text-xl leading-none"
        >
          {isMinimized ? '□' : '−'}
        </button>
      </div>

      {/* Chat content - only show if not minimized */}
      {!isMinimized && (
        <div className="p-4">
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
              className="flex-1 border px-2 py-1 rounded text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter make, model, or category to search"
            />
            <button onClick={handleSend} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
