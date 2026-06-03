import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeEmail(text: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `
You are an executive assistant.

Given an email, return:
1. One-line summary
2. Priority: Urgent / Normal / Ignore
3. Suggested short reply

Email:
${text}
        `,
      },
    ],
  });

  return res.choices[0].message.content;
}
