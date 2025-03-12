const Pinecone = require("../../../../config/pineconeDB"); // Import Pinecone client
const OpenAI = require("../../../../config/openAI");
const Chat = require("../../../../models/chat.model");

const PineconeIndex = Pinecone.index(process.env.BASIC_CHAT_BOT_INDEX_NAME);  

async function generateResponse(chat) {
    const embedding = await generateEmbeddings(chat.messages[0].content);
    const relatedEmbedding = await getSimilarEmbedding(embedding);
    const response = await generateResponseFromAI(relatedEmbedding, chat);
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
async function getSimilarEmbedding(queryEmbedding) {
  
    const queryResponse = await PineconeIndex.query({
      vector: queryEmbedding,
      topK: 5, // Get top 5 most relevant vendors
      includeMetadata: true,
    });
    return queryResponse
  }

async function generateResponseFromAI(relatedEmbedding, chat) {
  
    const systemMessage = `
    You are a helpful assistant that can help with customer inquiries and support.
  
    Data:
    ${JSON.stringify(relatedEmbedding)}
    `;
  
    const messages = [
      { role: "system", content: systemMessage },
      ...chat.messages
    ];
    const completion = await OpenAI.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });
    console.log('three')
    const response = completion.choices[0].message;
    const updatedChat = await Chat.findByIdAndUpdate(chat._id, { $push: { messages: response } }, { new: true });
    return updatedChat;
  }
  
module.exports = { generateResponse };