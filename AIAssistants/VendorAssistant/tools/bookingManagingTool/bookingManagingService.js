const Pinecone = require("../../../../config/pineconeDB");
const OpenAI = require("../../../../config/openAI");
const Vendor = require("../../../../models/vendor.model");
const Chat = require("../../../../models/chat.model");
const Booking = require("../../../../models/booking.model");
const { updateBookingStatus, declineBooking, deleteBooking, getBookingByBookingId } = require("../../../../controllers/booking.controller");


const PineconeIndex = Pinecone.index(process.env.YCC_VENDOR_PROFILES_INDEX_NAME); 

async function generateResponse(chat) {
  try {
    const response = await selectFunction(chat);
    //response from the function to perform on the booking 
    console.log("Response from the function to perform on the booking", response);
    return await generateResponseFromAI(response, chat);
  } catch (error) {
    console.error('Error in generateResponse:', error);
    return 'An error occurred while processing your request. Please try again later.';
  }
}


const functions = {
  getBookingByBookingId: async ({bookingId}) => {
    console.log("Get Booking By Booking Id Tool selected", bookingId);
    return await getBookingByBookingId(bookingId);
  },
    updateBookingStatus: async ({bookingId, status}) => {
        console.log("Update Booking Status Tool selected", bookingId, status);
        return await updateBookingStatus(bookingId, status);
    },
    declineBooking: async ({bookingId}) => {
        console.log("Decline Booking Tool selected");
        return await declineBooking(bookingId);
    },
    deleteBooking: async ({bookingId}) => {   
        console.log("Delete Booking Tool selected");
        return await deleteBooking(bookingId);
    },
};

async function selectFunction(chat) {
    const response = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chat.messages,
        functions: [  
            {
                name: "getBookingByBookingId",
                description: "Retrieves details about a specific booking by its ID.",
                parameters: {
                    type: "object",
                    properties: {
                        bookingId: { type: "string" },
                    },
                },
            },
            {
                name: "updateBookingStatus",
                description: "Updates the status of a booking. eg: 'confirmed', 'cancelled', 'pending', 'completed'",
                parameters: {
                    type: "object",
                    properties: {
                        bookingId: { type: "string" },
                        status: { type: "string", enum: ["confirmed", "pending", "cancelled", "completed", "declined"] },
                    },
                },
              },
            {
                name: "declineBooking",
                description: "Declines a booking.",
                parameters: {
                    type: "object",
                    properties: {
                        bookingId: { type: "string" },
                    },
                },
            },
            {
                name: "deleteBooking",
                description: "Deletes a booking.",
                parameters: {
                    type: "object",
                    properties: {
                        bookingId: { type: "string" },
                    },
                },
            },
        ],
        function_call: "auto",
    });


    
// Extract function call details
const functionCall = response.choices[0]?.message?.function_call;
console.log('functionCall', functionCall);
if (functionCall) {
    const functionName = functionCall.name;
    const args = JSON.parse(functionCall.arguments);
    console.log(functionName, args);

    // Call the function dynamically
    if (functions[functionName]) {
       return await functions[functionName](args);
    } else {
        console.error(`Unknown function: ${functionName}`);
    }
}
};



async function generateResponseFromAI(response, chat) {
      console.log(response);
    const systemMessage = `
    You are a helpful assistant that gives feedback to the user concerning the status of the action performed on the booking.
    If the action is successful, you should return a success message.
    If the action is not successful, you should return an error message.
    status: ${response.status}
    message: ${response.message}
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
    const aiResponse = completion.choices[0].message;
    const updatedChat = await Chat.findByIdAndUpdate(chat._id, { $push: { messages: aiResponse } }, { new: true });
    return updatedChat;
  }
  
module.exports = { generateResponse };