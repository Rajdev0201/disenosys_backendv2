const { storeToVectorDB } = require('../utils/vectorStoreService.js');
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const PolicyVector = require("../models/policyBot.js"); 
const router = express.Router();
const upload = multer(); 
const { GoogleGenAI } = require("@google/genai");

router.post('/upload-rag', upload.single('file'), async (req, res) => {
try {
const docType = req.body.docType || 'unknown';
if (!req.file) return res.status(400).json({ error: 'No file uploaded' });


const pdfBuffer = req.file.buffer;
const data = await pdfParse(pdfBuffer);
const text = data.text || '';


await storeToVectorDB(text, docType);


res.json({ message: 'PDF embedded successfully', docType });
} catch (err) {
console.error(err);
res.status(500).json({ error: err.message });
}
});

const ai = new GoogleGenAI({
  apiKey:process.env.GEMINI_KEY
});

// Normalize vector
function normalize(vec) {
  const mag = Math.sqrt(vec.reduce((sum, x) => sum + x*x, 0));
  return vec.map(x => x / (mag || 1));
}

// Cosine similarity
function cosineSimilarity(a, b) {
  return a.reduce((sum, x, i) => sum + x * b[i], 0);
}

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    // 1️⃣ Generate embedding
    const embedRes = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [
        { role: "user", parts: [{ text: question }] }
      ]
    });
    const questionEmbedding = normalize(embedRes.embeddings?.[0]?.values || []);
    if (!questionEmbedding.length) return res.status(500).json({ error: "Failed to generate embedding" });

    // 2️⃣ Vector search
    const allVectors = await PolicyVector.find();
    const similarities = allVectors.map(v => {
      const stored = Array.isArray(v.embedding) ? v.embedding : v.embedding.values || [];
      return {
        text: v.chunk, // ✅ use chunk from your schema
        score: cosineSimilarity(questionEmbedding, normalize(stored)),
      };
    });

    // Top 3 chunks with score > 0.2
    const topChunks = similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(c => c.score > 0.2);

    if (!topChunks.length) console.log("No relevant context found.");

    // 3️⃣ Prepare contents for Gemini
    // Pass each chunk as a separate part for clarity
    const contextParts = topChunks.map(c => ({ text: c.text }));

    const llmRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Use the policy text below to answer the question." },
            ...contextParts,
            { text: `Question: ${question}` },
            { text: `If answer not found, respond: "This information is not available in our policy."` }
          ]
        }
      ],
      config: { temperature: 0.2 }
    });

    // 4️⃣ Extract answer
    const answer = llmRes.text || "No answer generated.";

    res.json({ answer, context: topChunks.map(c => c.text).join("\n") });

  } catch (err) {
    console.error("Error in /ask:", err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;




// router.post("/ask", async (req, res) => {
//   try {
//     const { question } = req.body;

//     // Create embedding
  
// const response = await ai.models.embedContent({
//   model: "gemini-embedding-001",
//   contents: question
// });

// // Correct extraction
// const questionEmbedding = response.embeddings[0].values;


//     // Fetch stored vectors
//     const allVectors = await PolicyVector.find();

//     const similarities = allVectors.map(v => {
//   const stored = Array.isArray(v.embedding)
//       ? v.embedding
//       : v.embedding.values;

//   return {
//     text: v.text,
//     score: cosineSimilarity(questionEmbedding, stored),
//   };
// });


//     const context = similarities
//       .sort((a, b) => b.score - a.score)
//       .slice(0, 3)
//       .map(c => c.text)
//       .join("\n");

//     const prompt = `
// Use ONLY the policy text to answer.

// Context:
// ${context}

// Question:
// ${question}

// If not found, answer: "This information is not available in our policy."
// `;

//     const result = await ai.models.generateContent({
//   model: "gemini-2.5-flash",
//   contents: prompt,
//   generationConfig: { temperature: 0.2 }
// });
// console.log(result)

// const answer =
//       result.candidates?.[0]?.content?.[0]?.text ||
//       "No answer generated.";

// res.json({
//   answer:answer,
//   context,
// });


//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });




module.exports = router;