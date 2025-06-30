// components/ChatBot.js
import { useState } from 'react';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    const botMessage = {
      from: 'bot',
      text: "I'm just a demo bot for now. Real AI features coming soon!",
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 h-64 overflow-y-auto space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`text-sm p-2 rounded ${
              msg.from === 'bot'
                ? 'bg-gray-100 text-left'
                : 'bg-blue-100 text-right'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex border-t">
        <input
          className="flex-1 px-3 py-2 text-sm outline-none"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 text-sm hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
