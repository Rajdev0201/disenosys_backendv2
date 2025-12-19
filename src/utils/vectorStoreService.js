const { embedTextBatch } = require("./embeddingService");
const PolicyVector = require("../models/policyBot");

const CHUNK_SIZE = 1000;
const BATCH_SIZE = 5; // number of chunks per embedding request

async function storeToVectorDB(text, docType = "policy") {
  if (!text || text.length === 0) return;

  // Split text into chunks
  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  console.log(`Total chunks: ${chunks.length}`);

  const docs = [];

  // Process in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + BATCH_SIZE);

    // embedTextBatch returns array of embeddings
    const embeddings = await embedTextBatch(batchChunks);

    // Map embeddings back to chunks
    for (let j = 0; j < batchChunks.length; j++) {
      docs.push({
        docType,
        chunk: batchChunks[j],
        embedding: embeddings[j],
        createdAt: new Date()
      });
    }
  }

  if (docs.length) {
    await PolicyVector.insertMany(docs);
    console.log("Vector chunks saved:", docs.length);
  }
}

module.exports = { storeToVectorDB };
