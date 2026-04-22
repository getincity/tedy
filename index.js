/* ══════════════════════════════════════════
   GIC BROADBAND — Firebase Cloud Function
   AI Chatbot powered by OpenAI GPT-4o
   
   DEPLOYMENT:
   1. npm install -g firebase-tools
   2. firebase login
   3. firebase init functions (select your project)
   4. Copy this file to functions/index.js
   5. cd functions && npm install openai cors
   6. Set secret: firebase functions:secrets:set OPENAI_API_KEY
   7. firebase deploy --only functions
   ══════════════════════════════════════════ */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const cors = require("cors")({ origin: true });
const OpenAI = require("openai");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

const SYSTEM_PROMPT = `You are GIC Assistant, the AI-powered customer support agent for GIC Broadband — India's first AI-native ISP.

GIC Broadband Plans:
- Pulse: 50 Mbps, ₹499/month (₹399 yearly), 500GB data, basic AI monitoring
- Surge: 200 Mbps, ₹899/month (₹719 yearly), unlimited data, full AI monitoring, static IP — MOST POPULAR
- Nova: 1 Gbps, ₹1799/month (₹1439 yearly), unlimited + predictive AI suite, dedicated node
- Apex: 10 Gbps, custom pricing, enterprise SLA, full AI command center

Coverage: Mumbai, Thane, Pune, Navi Mumbai, Nashik, Aurangabad
Support: 24×7×365 | Install: within 48 hours | No contracts

Be helpful, friendly, concise, and enthusiastic. Use emojis sparingly. 
For technical issues, always suggest calling 1800-GIC-FAST.
Max 3 sentences per response. Never mention competitor ISPs.`;

exports.chatbot = onRequest(
  { secrets: [OPENAI_API_KEY], cors: true, region: "asia-south1" },
  async (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "POST");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.status(204).send("");
        return;
      }

      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { message } = req.body;
      if (!message || typeof message !== "string" || message.length > 500) {
        return res.status(400).json({ error: "Invalid message" });
      }

      try {
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 150,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message }
          ],
          temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content || "Let me connect you with our team for that!";
        return res.status(200).json({ reply });

      } catch (err) {
        console.error("[GIC Chatbot Error]", err);
        return res.status(500).json({
          reply: "I'm experiencing a glitch. Please call 1800-GIC-FAST for immediate help! 📞"
        });
      }
    });
  }
);

/* ══════════════════════════════════════════
   functions/package.json
   ══════════════════════════════════════════
   {
     "name": "gic-broadband-functions",
     "version": "1.0.0",
     "main": "index.js",
     "engines": { "node": "18" },
     "dependencies": {
       "firebase-functions": "^4.9.0",
       "firebase-admin": "^12.0.0",
       "openai": "^4.0.0",
       "cors": "^2.8.5"
     }
   }
   ══════════════════════════════════════════ */
