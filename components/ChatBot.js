// components/ChatBot.js
import { useState, useRef, useEffect } from 'react';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I can help you find a motorcycle or post an ad. What would you like to do?' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);

    const reply = generateReply(input.trim().toLowerCase());
    setMessages((prev) => [...prev, userMessage, { from: 'bot', text: reply }]);
    setInput('');
  };

  const generateReply = (text) => {
    if (text.includes('find') || text.includes('search')) {
      return 'You can search bikes from the listings page.';
    }
    if (text.includes('post') || text.includes('sell') || text.includes('advert')) {
      return 'To post an ad, go to the "Post Ad" section from the navigation bar.';
    }
    if (text.includes('hello') || text.includes('hi')) {
      return 'Hello! How can I assist you today?';
    }
    return "I'm not sure how to help with that. Try asking about listings or how to post.";
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow border">
      <h2 className="text-xl font-bold mb-4">Search Assistant</h2>
      <div className="h-64 overflow-y-auto border p-2 mb-4 bg-gray-50 rounded">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
            <span
              className={`inline-block px-3 py-2 rounded ${
                msg.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Ask something..."
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  );
}
