const Pinecone = require("../../../../config/pineconeDB"); // Import Pinecone client
const OpenAI = require("../../../../config/openAI");

const PineconeIndex = Pinecone.index(process.env.YCC_VENDOR_PROFILES_INDEX_NAME);  

async function generateResponse(query) {
    const relatedEmbedding = await generateEmbeddings(query);
    const relatedVendors = await getSimilarEmbedding(relatedEmbedding);
    const response = await generateResponse(relatedVendors, query);
    return response;
  }

async function generateEmbeddings(query) {
    const response = await OpenAI.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    return response.data[0].embedding;
 
  }

// Query Pinecone for similar vendors
async function getSimilarEmbedding(query) {
    const queryEmbedding = await generateEmbeddings(query);
  
    const queryResponse = await PineconeIndex.query({
      vector: queryEmbedding,
      topK: 5, // Get top 5 most relevant vendors
      includeMetadata: true,
    });
    return queryResponse.matches.map((match) => match.metadata);
  }

async function generateResponse(userQuery) {
    const relatedEmbedding = await getSimilarEmbedding(userQuery);
  
    const systemMessage = `
    You are a helpful assistant that can help get available services from vendors.
  
    Data:
    ${JSON.stringify(relatedEmbedding)}
    `;
  
    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: userQuery },
    ];
    const completion = await OpenAI.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });
  
    return completion.choices[0].message.content;
  }
  
module.exports = { generateResponse };