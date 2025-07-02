'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="py-6 text-center font-bold text-2xl bg-white dark:bg-gray-800 shadow">
        💬 AI Chatbot
      </header>

      <main className="flex-grow flex flex-col items-center px-4 pt-6">
        <div className="w-full max-w-2xl h-[70vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 space-y-4 shadow-inner">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg text-sm shadow ${
                  m.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-sm text-gray-400 dark:text-gray-500">Typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 w-full max-w-2xl flex gap-2">
          <input
            type="text"
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-black dark:text-white"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Send
          </button>
        </div>
      </main>

      <footer className="text-center text-sm py-4 text-gray-500 dark:text-gray-400">
        Built with ❤️ using Next.js + Groq
      </footer>
    </div>
  );
}
