'use client';

import { useEffect, useRef, useState } from 'react';
import { FiSend, FiCopy, FiCheck } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setTypingText('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: updatedMessages }),
    });

    const data = await res.json();
    const fullText = data.text;

    for (let i = 0; i <= fullText.length; i++) {
      setTypingText(fullText.slice(0, i));
      const currentChar = fullText.charAt(i);
      const isPunctuation = /[.,?!]/.test(currentChar);
      const delay = isPunctuation ? 100 : 30;
      await new Promise((res) => setTimeout(res, delay));
    }

    setMessages([...updatedMessages, { role: 'assistant', content: fullText }]);
    setTypingText('');
    setLoading(false);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-100 to-pink-100 text-gray-900 dark:text-white transition-colors">
      <header className="py-6 text-center font-bold text-3xl bg-white/10 backdrop-blur shadow text-black dark:text-white">
        💬 AI Chatbot
      </header>

      <main className="flex-grow flex flex-col items-center px-4 pt-6">
        <div className="w-full max-w-2xl h-[70vh] overflow-y-auto bg-white/90 dark:bg-gray-900 border border-white/30 backdrop-blur rounded-lg p-4 space-y-4 shadow-inner">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2 rounded-xl text-sm shadow whitespace-pre-wrap transition-opacity duration-300 ${
                  m.role === 'user'
                    ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                    : 'bg-white dark:bg-gray-800 text-black dark:text-white'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ inline, className, children, ...props }: CodeProps) {
                      const codeText = Array.isArray(children)
                        ? children.join('')
                        : String(children).trim();

                      if (inline) {
                        return (
                          <code className="bg-gray-300 dark:bg-gray-600 px-1 rounded" {...props}>
                            {codeText}
                          </code>
                        );
                      }

                      return (
                        <div className="relative group my-2">
                          <pre className="overflow-x-auto rounded bg-gray-900 text-white p-3 text-sm">
                            <code className={className} {...props}>
                              {codeText}
                            </code>
                          </pre>
                          <button
                            onClick={() => handleCopy(codeText, i)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-xs bg-black/50 hover:bg-black text-white px-2 py-1 rounded flex items-center gap-1"
                          >
                            {copiedIndex === i ? <FiCheck /> : <FiCopy />}
                            {copiedIndex === i ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      );
                    },
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {typingText && (
            <div className="flex justify-start">
              <div className="max-w-[75%] px-4 py-2 rounded-xl text-sm shadow whitespace-pre-wrap italic bg-white dark:bg-gray-800 text-black dark:text-white animate-pulse">
                <ReactMarkdown>{typingText}</ReactMarkdown>
              </div>
            </div>
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
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center justify-center"
          >
            <FiSend size={18} />
          </button>
        </div>
      </main>

      <footer className="text-center text-sm py-4 text-black/60 dark:text-white/60">
        Built with ❤️ using Next.js + Groq
      </footer>
    </div>
  );
}
