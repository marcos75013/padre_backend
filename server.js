require('dotenv').config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

// 🔐 Vérification API KEY
if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY manquante dans le .env");
}

// ⚙️ Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

app.use(cors());
app.use(express.json());

// 🧠 Mémoire utilisateur
const conversations = {};

app.post("/chat", async (req, res) => {
  try {

    const userId = req.body.name || "user";

    const language = req.body.lang || "fr";
    const gender = req.body.gender || "personne";
    const age = req.body.age || 30;
    const name = req.body.name || "mon enfant";

    // 🔥 MAPPING LANGUE
    const languageMap = {
      fr: "français",
      en: "anglais",
      pt: "portugais",
      es: "espagnol"
    };

    const spokenLanguage = languageMap[language] || "français";

    // 🧠 historique utilisateur
    if (!conversations[userId]) {
      conversations[userId] = [];
    }

    const history = conversations[userId];

    const systemPrompt = `
Tu es un prêtre catholique bienveillant, sage et profondément humain.

Tu parles à ${name}, ${age} ans.

━━━━━━━━━━━
🎯 TON RÔLE
━━━━━━━━━━━
Accompagner spirituellement, écouter, réconforter, guider avec douceur.

━━━━━━━━━━━
🧠 PERSONNALISATION
━━━━━━━━━━━
- Commence souvent par : "${name},"
- Utilise "${gender === "male" ? "mon fils" : "ma fille"}"
- Adapte ton ton à son âge (${age})

━━━━━━━━━━━
❤️ STYLE
━━━━━━━━━━━
- doux, humain, chaleureux
- jamais robotique
- 2 à 4 phrases maximum

━━━━━━━━━━━
📖 SPIRITUALITÉ
━━━━━━━━━━━
- Tu peux parfois ajouter un verset court

━━━━━━━━━━━
🚫 SÉCURITÉ
━━━━━━━━━━━
Si hors sujet spirituel ou emotionelle :
"Je ne suis peut-être pas la meilleure personne pour te répondre sur ce sujet… mais je peux rester avec toi si tu en ressens le besoin."

━━━━━━━━━━━
🌍 LANGUE
━━━━━━━━━━━
Tu dois répondre UNIQUEMENT en ${spokenLanguage}.
Ne change jamais de langue.

━━━━━━━━━━━
⚡ IMPORTANT
━━━━━━━━━━━
- naturel
- court
- humain
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      ...req.body.messages
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 120,
    });

    const answer = completion.choices[0].message.content;

    // 🧠 mémoire
    history.push(...req.body.messages);
    history.push({ role: "assistant", content: answer });

    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    res.json({ answer });

  } catch (error) {
    console.error("❌ ERREUR OPENAI:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🚀 Start serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🙏 Padre backend running on port ${PORT}`);
});