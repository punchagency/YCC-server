const Pinecone = require("../../../../config/pineconeDB");
const OpenAI = require("../../../../config/openAI");
const Vendor = require("../../../../models/vendor.model");
const Chat = require("../../../../models/chat.model");
const Booking = require("../../../../models/booking.model");

const PineconeIndex = Pinecone.index(process.env.YCC_VENDOR_PROFILES_INDEX_NAME);  

async function generateResponse(chat) {
  try {
    const userId = chat.userId;
    const vendors = await getVendorCalendar(userId);
    const response = await generateResponseFromAI(vendors, chat);


    return response;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    return 'An error occurred while processing your request. Please try again later.';
  }
}

  const getVendorCalendar = async (userId) => {
 
  const vendor = await Vendor.findById(userId)
 // console.log('vendor', vendor);
  const bookings = await Booking.find({ vendor: vendor._id })
  //console.log('bookings', bookings);
  return bookings;
};


async function generateResponseFromAI(bookings, chat) {
      //console.log(bookings);
    const systemMessage = `
    You are a helpful assistant that can help get information about the vendor's calender.
  
    Data:
    ${bookings ? JSON.stringify(bookings) : 'No bookings found'}
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
    //console.log('three')
    const response = completion.choices[0].message;
    const updatedChat = await Chat.findByIdAndUpdate(chat._id, { $push: { messages: response } }, { new: true });
    return updatedChat;
  }
  
module.exports = { generateResponse };