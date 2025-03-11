const { generateResponse } = require("./bookVendorServiceService");

    const BookVendorTool = {
    name: "AI Vendor Service Booking Assistant",
    description: "An assistant that can help with booking vendor services.",
    tools: ["pinecone_search"],
    handler: async (query) => {
        return await generateResponse(query);
    },
};

module.exports = BookVendorTool;