'use client';
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    const botMessage = { role: 'assistant', content: data.text };
    setMessages([...newMessages, botMessage]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-2xl font-bold">Simple Groq Chatbot</h1>
      <div className="w-full max-w-md space-y-4">
        <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto space-y-2">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <span className="inline-block bg-white px-3 py-2 rounded shadow">{m.content}</span>
            </div>
          ))}
          {loading && <div className="text-sm text-gray-500">Typing...</div>}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow p-2 border rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Say something..."
          />
          <button
            onClick={sendMessage}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
