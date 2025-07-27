import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
            You are an AI assistant for a resource allocation configurator.
            For data filtering, return JSON like: { entity: "tasks", filter: { Duration: ">2", PreferredPhases: "includes 3" } }
            For rule creation, return JSON like: { type: "coRun", tasks: ["T1", "T2"] } or { type: "slotRestriction", group: "GroupA", minCommonSlots: 2 }
            For data correction, return JSON like: { entity: "clients", row: 0, field: "AttributesJSON", suggestedValue: "{\"budget\":100000}" }
          `
        },
        { role: 'user', content: prompt }
      ]
    });
    const result = response.choices[0].message?.content || '';
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ result: 'AI failed to interpret query.' });
  }
}