const { generateResponse } = require("./extractBookingService");

    const ExtractBookingTool = {
    name: "AI Booking Extraction Assistant",
    description: "An assistant that can help with extracting booking information from a user's message.",
    tools: ["pinecone_search"],
    handler: async (query) => {
        return await generateResponse(query);
    },
};

module.exports = ExtractBookingTool;