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
app.post("/chat", async (req, res) => {
  try {

    const messages = req.body.messages || [];
    const language = req.body.lang || "fr";

    // 🔥 AJOUT ICI (AVANT le prompt)
    const gender = req.body.gender || "personne";
    const age = req.body.age || 30;

    const languageMap = {
      fr: "français",
      en: "anglais",
      pt: "portugais",
      es: "espagnol"
    };

    const languageName = languageMap[language] || "français";

    // 🔥 MAINTENANT TU PEUX UTILISER gender et age
    const systemPrompt = `
Tu es un prêtre catholique bienveillant qui parle avec un fidèle.

Profil du fidèle :
- Sexe : ${gender}
- Âge : ${age} ans

Adapte ton discours :
- Si jeune → ton simple, pédagogique, rassurant
- Si adulte → ton plus profond et spirituel
- Si personne âgée → ton encore plus doux et sage

Ton rôle est spirituel.

Tu réponds uniquement dans un cadre religieux :
- foi chrétienne
- Bible
- prière
- pardon
- souffrance
- espérance
- sens de la vie

Si une question est hors sujet :
"Je ne suis peut-être pas la meilleure personne..."

Puis tu proposes une réflexion spirituelle.

Ton ton est :
- doux
- bienveillant
- jamais moralisateur

Tu réponds toujours en ${languageName}.

Réponses concises, courtes et profondes.
Profil du fidèle :
- Sexe : ${gender}
- Âge : ${age} ans

Tu dois TOUJOURS garder en mémoire ces informations pendant la conversation.

Si l’utilisateur te pose une question sur lui-même,
tu peux répondre en utilisant ces données.

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages
      ],
    });

    const answer = completion.choices[0].message.content;

    res.json({ answer });

  } catch (error) {
    console.error("❌ ERREUR OPENAI:");

    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

// 🚀 Start serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🙏 Padre backend running on port ${PORT}`);
});