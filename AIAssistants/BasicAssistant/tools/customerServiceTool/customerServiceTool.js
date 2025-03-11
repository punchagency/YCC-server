const { generateResponse } = require("./customerServiceService");

const CustomerSupportTool = {
    name: "AI Customer Service Assistant",
    description: "A customer service assistant that can help with customer inquiries and support.",
    tools: ["pinecone_search"],
    handler: async (query) => {
        return await generateResponse(query);
    },
};

module.exports = CustomerSupportTool;