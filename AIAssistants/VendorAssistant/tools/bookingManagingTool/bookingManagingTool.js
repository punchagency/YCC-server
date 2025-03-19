const { generateResponse } = require("./bookingManagingService");

const BookingManagingTool = {
    name: "AI Booking Managing Assistant",
    description: "A booking managing assistant that helps the vendor to manage their bookings.",
    tools: ["pinecone_search"],
    handler: async (chat) => {
        return await generateResponse(chat);
    },
};

module.exports = BookingManagingTool;