import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages,
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify({ text: data.choices[0].message.content }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
