require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const express = require('express');
const app = express();

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Medical System Prompt (same as before)
const MEDICAL_PROMPT = `You are a medical assistant...`;

// Groq Chat Function (same as before)
async function groqChat(message) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: MEDICAL_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.3
    })
  });
  return await response.json();
}

// Handle Telegram Messages
bot.on('message', async (msg) => {
  try {
    const aiResponse = await groqChat(msg.text);
    let reply = aiResponse.choices[0].message.content;
    
    // Add disclaimer if missing
    if (!reply.includes("consult")) {
      reply += "\n\n⚠️ Consult a healthcare professional for proper diagnosis";
    }
    
    await bot.sendMessage(msg.chat.id, reply);
  } catch (error) {
    console.error("Error:", error);
    await bot.sendMessage(msg.chat.id, "🚨 Our medical assistant is unavailable. Please try again later.");
  }
});

// Start Express (optional for health checks)
app.get('/', (req, res) => res.send('August AI Telegram Bot is Running!'));
app.listen(3000, () => console.log('Bot started'));