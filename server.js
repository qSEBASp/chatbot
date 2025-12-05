import OpenAI from "openai";
import express from "express";

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", 
    messages: [{ role: "user", content: userMessage }]
  });

  res.json({
    reply: response.choices[0].message.content
  });
});

app.listen(3000, () => console.log("Chatbot listo en http://localhost:3000"));
