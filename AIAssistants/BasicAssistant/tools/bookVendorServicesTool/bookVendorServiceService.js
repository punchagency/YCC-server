const Pinecone = require("../../../../config/pineconeDB"); // Import Pinecone client
const OpenAI = require("../../../../config/openAI");
const Vendor = require("../../../../models/vendor.model");
const Service = require("../../../../models/service.model");
const Booking = require("../../../../models/booking.model");
const Chat = require("../../../../models/chat.model");
const extractBookingTool = require("../extractBookingTool/extractBookingService");

const PineconeIndex = Pinecone.index(process.env.YCC_VENDOR_PROFILES_INDEX_NAME);

async function generateResponse(chat) {

    const bookingDetails = await extractBookingDetails(chat);
    console.log('bookingDetails', bookingDetails)

    if (!bookingDetails.vendorName ||
        !bookingDetails.serviceName ||
        !bookingDetails.guestName ||
        !bookingDetails.guestEmail ||
        !bookingDetails.guestPhone) {
        const dataNeeded = "vendorName, serviceName, guestName, guestEmail, guestPhone"
        const dataPresent = `vendorName: ${bookingDetails.vendorName}, serviceName: ${bookingDetails.serviceName}, guestName: ${bookingDetails.guestName}, guestEmail: ${bookingDetails.guestEmail}, guestPhone: ${bookingDetails.guestPhone}`

        return extractBookingTool.generateResponse(dataNeeded, dataPresent, chat)
    }

    return bookingDetails

}


async function extractBookingDetails(chat) {
    try {
    const systemMessage = `
    You are a smart AI that extracts booking details from user messages.
    Extract the following details:
    - Guest Name
    - Email
    - Phone Number
    - Vendor Name
    - Service Name
    Respond in JSON format: 
    {"guestName": "...", "guestEmail": "...", "guestPhone": "...", "vendorName": "...", "serviceName": "..."}
    `;

    const messages = [
        { role: "system", content: systemMessage },
        ...chat.messages
    ];

    const completion = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages
    });

    const response = completion.choices[0].message;
    //const updatedChat = await Chat.findByIdAndUpdate(chat._id, { $push: { messages: response } }, { new: true });
    return response;

  
        const extractedData = JSON.parse(completion.choices[0].message.content);
        return extractedData;
    } catch (error) {
        throw new Error("Failed to extract booking details.");
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



















async function bookService({ guestName, guestEmail, guestPhone, vendorId, serviceId }) {

    console.log(guestName, guestEmail, guestPhone, vendorId, serviceId)
    console.log("Booking successful!")
    return { success: true, message: "Booking successful!" };

}

module.exports = { generateResponse };