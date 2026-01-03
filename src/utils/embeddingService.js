const OpenAI = require('openai');
const client = new OpenAI({
  apiKey:process.env.GOOGLE_API_KEY,  // store your Google API key in .env
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});
async function embedText(text) {
  const response = await client.embeddings.create({
    model: "gemini-embedding-001",  // Gemini embedding model
    input: text
  });
  return response.data[0].embedding;
}

async function embedTextBatch(textArray) {
  const response = await client.embeddings.create({
    model: "gemini-embedding-001",
    input: textArray
  });
  return response.data.map(item => item.embedding);
}

module.exports = { embedText, embedTextBatch };

