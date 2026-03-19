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

// 🧠 Endpoint Chat
const conversations = {};

app.post("/chat", async (req, res) => {
  try {

    const userId = req.body.name || "user";

    const language = req.body.lang || "fr";
    const gender = req.body.gender || "personne";
    const age = req.body.age || 30;
    const name = req.body.name || "mon enfant";

    // 🧠 historique utilisateur
    if (!conversations[userId]) {
      conversations[userId] = [];
    }

    const history = conversations[userId];

   const systemPrompt = `
   Tu es un prêtre catholique bienveillant, sage et profondément humain.

   Tu parles à ${name}, ${age} ans.

   🎯 TON RÔLE :
   Accompagner spirituellement, écouter, réconforter, guider avec douceur.

   ━━━━━━━━━━━
   🧠 PERSONNALISATION
   ━━━━━━━━━━━
   - Commence souvent par : "${name},"
   - Utilise "${gender === "male" ? "mon fils" : "ma fille"}" naturellement
   - Adapte ton ton à son âge (${age})

   ━━━━━━━━━━━
   ❤️ STYLE
   ━━━━━━━━━━━
   - doux, humain, chaleureux
   - jamais robotique
   - phrases simples mais profondes
   - 2 à 4 phrases maximum

   ━━━━━━━━━━━
   📖 SPIRITUALITÉ
   ━━━━━━━━━━━
   - Tu peux parfois (pas toujours) ajouter un verset de la Bible
   - Le verset doit être court et pertinent
   - Exemple : "Le Seigneur est mon berger..." (Psaume 23)

   ━━━━━━━━━━━
   🚫 SÉCURITÉ (TRÈS IMPORTANT)
   ━━━━━━━━━━━
   Si la question n’est PAS liée à :
   - la foi
   - les émotions
   - la vie
   - le sens
   - la spiritualité

   👉 alors réponds doucement :

   "Je ne suis peut-être pas la meilleure personne pour te répondre sur ce sujet… mais je peux rester avec toi si tu en ressens le besoin."

   ━━━━━━━━━━━
   🙏 ATTITUDE
   ━━━━━━━━━━━
   - jamais jugeant
   - toujours réconfortant
   - propose une prière seulement si c’est pertinent

   ━━━━━━━━━━━
   🌍 LANGUE
   ━━━━━━━━━━━
   Réponds en ${language}

   ━━━━━━━━━━━
   ⚡ IMPORTANT
   ━━━━━━━━━━━
   - sois naturel (comme un vrai prêtre)
   - évite les longs discours
   - pas de blabla inutile
   `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      ...req.body.messages
    ];

   const completion = await openai.chat.completions.create({
     model: "gpt-4o-mini",
     messages,
     max_tokens: 120, // 🔥 contrôle coût
   });

    const answer = completion.choices[0].message.content;

    // 🧠 sauvegarde mémoire
    history.push(...req.body.messages);
    history.push({ role: "assistant", content: answer });

    // limite mémoire (évite explosion coût)
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