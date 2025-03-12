const Pinecone = require("../../../../config/pineconeDB"); // Import Pinecone client
const OpenAI = require("../../../../config/openAI");
const Vendor = require("../../../../models/vendor.model");
const Chat = require("../../../../models/chat.model");

const PineconeIndex = Pinecone.index(process.env.YCC_VENDOR_PROFILES_INDEX_NAME);  

async function generateResponse(chat) {
  try {
    const relatedEmbedding = await generateEmbeddings(chat.messages[0].content);
    const relatedVendors = await getSimilarEmbedding(relatedEmbedding);
    const vendors = await getVendorsFromQuery(relatedVendors);
    const response = await generateResponseFromAI(vendors, chat);


    return response;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    return 'An error occurred while processing your request. Please try again later.';
  }
}

async function generateEmbeddings(query) {
  try {
    const response = await OpenAI.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    console.log('one')
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error in generateEmbeddings:', error);
    return 'An error occurred while generating embeddings. Please try again later.';
  }
}

// Query Pinecone for similar vendors
async function getSimilarEmbedding(queryEmbedding) {
  try {
  
    const queryResponse = await PineconeIndex.query({
      vector: queryEmbedding,
      topK: 5, // Get top 5 most relevant vendors
      includeMetadata: true,
    });
    console.log('two')
    return queryResponse //.matches.map((match) => match.metadata);
  } catch (error) {
    console.error('Error in getSimilarEmbedding:', error);
    return 'An error occurred while getting similar embeddings. Please try again later.';
  }
}

const getVendorsFromQuery = async (queryResponse) => {
  // Extract vendor IDs from metadata
  console.log(queryResponse)
  const vendorIds = queryResponse.matches.map(item => item.id);

  // Fetch full vendor details from MongoDB
  const vendors = await Vendor.find({ _id: { $in: vendorIds } }).populate('services');

  return vendors;
};


async function generateResponseFromAI(relatedEmbedding, chat) {
      console.log(relatedEmbedding);
    const systemMessage = `
    You are a helpful assistant that can help get available services and pricing from vendors.
  
    Data:
    ${relatedEmbedding ? JSON.stringify(relatedEmbedding) : 'No related embedding found'}
    `;
  
    const messages = [
      { role: "system", content: systemMessage },
      ...chat.messages
    ]
;
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