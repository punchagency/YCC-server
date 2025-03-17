const Pinecone = require("../../../../config/pineconeDB"); // Import Pinecone client
const OpenAI = require("../../../../config/openAI");
const Vendor = require("../../../../models/vendor.model");
const Service = require("../../../../models/service.model");
const Booking = require("../../../../models/booking.model");
const Chat = require("../../../../models/chat.model");
const extractBookingTool = require("../extractBookingTool/extractBookingService");
const  sendMail  = require("../../../../utils/send-email");
const { BookingConfirmationEmail } = require("../../../../files/email-notification");
const { getVendorByBusinessName } = require("../../../../controllers/vendor.controller");

const PineconeIndex = Pinecone.index(process.env.YCC_VENDOR_PROFILES_INDEX_NAME);

async function generateResponse(chat) {

    let bookingDetails = await extractBookingDetails(chat);
    console.log('bookingDetails before parsing', bookingDetails)
    bookingDetails = JSON.parse(bookingDetails.content)
    console.log('bookingDetails after parsing', bookingDetails)

    //if any of the details are missing, reroute to extractBookingDetails
    if (!bookingDetails.vendorName ||
        !bookingDetails.serviceName ||
        !bookingDetails.name ||
        !bookingDetails.email ||
        !bookingDetails.phoneNumber ||
        !bookingDetails.bookingDate) {
        const dataNeeded = "vendorName, serviceName, name, email, phoneNumber, bookingDate"
        const dataPresent = `vendorName: ${bookingDetails.vendorName}, serviceName: ${bookingDetails.serviceName}, name: ${bookingDetails.name}, email: ${bookingDetails.email}, phoneNumber: ${bookingDetails.phoneNumber}, bookingDate: ${bookingDetails.bookingDate}`

        return extractBookingTool.generateResponse(dataNeeded, dataPresent, chat)
    }

    //get vendor details
    const vendor = await getVendorByBusinessName(bookingDetails.vendorName)
    if (!vendor) {
        console.log('Vendor not found')
        return { status: false, message: 'Vendor not found' };
    }
    const service = vendor.services.find(service => service.name === (bookingDetails.serviceName).toLowerCase())
    if (!service) {
        console.log('Service not found')
        return { status: false, message: 'Service not found' };
    }

    //if all the details are present, book the service
    const bookingDate = new Date(bookingDetails.bookingDate)
    const bookingResponse = await bookService({name: bookingDetails.name, email: bookingDetails.email, phoneNumber: bookingDetails.phoneNumber, vendorId: vendor._id, serviceId: service._id, bookingDate: bookingDate})
    
    return await sendBookingConfirmation(bookingResponse, chat)
}


async function extractBookingDetails(chat) {
    try {
    const systemMessage = `
    You are a smart AI that extracts booking details from user messages.
    Extract the following details, make sure to extract the EXACT Vendor Name and the EXACT Service Name from the available vendors and services:
    - Name
    - Email
    - Phone Number
    - Vendor Name
    - Service Name
    - Booking Date
    format the date to YYYY-MM-DD
    Respond in JSON format, and ONLY return the JSON object, DO NOT include any other text or comments!!!: 
    {"name": "", "email": "", "phoneNumber": "", "vendorName": "", "serviceName": "", "bookingDate": ""}
    `;

    const messages = [
        { role: "system", content: systemMessage },
        ...chat.messages
    ];

    const completion = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" } 
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

async function sendBookingConfirmation(response, chat){
    const systemMessage = `
    You are a smart AI that sends booking confirmation or booking failed message to the user.
    Send the following message to the user:
    if booking is successful:
    "Booking successful! Your booking ID is ${response.booking.bookingId}. Please keep it safe. You can track your booking status at any time by using the booking ID."
    if booking fails:
    "Booking failed. Please try again."

    this is the response from the booking service:
    ${response.success ? "Booking successful!" : "Booking failed."}
    `;
    if(response.success){

        await sendMail(
            response.booking.email,
            'Booking successful!',
            BookingConfirmationEmail
              .replace(/{{firstName}}/g, response.booking.name)
              .replace(/{{bookingId}}/g, response.booking.bookingId)
          );
    }
    const messages = [
        { role: "system", content: systemMessage },
        ...chat.messages
    ];

    const completion = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages
    });

    const openaiResponse = completion.choices[0].message;
    const updatedChat = await Chat.findByIdAndUpdate(chat._id, { $push: { messages: openaiResponse } }, { new: true });
    return updatedChat;

}


async function bookService({ name, email, phoneNumber, vendorId, serviceId, bookingDate }) {

    console.log(name, email, phoneNumber, vendorId, serviceId)
    const booking = await Booking.create({ name, email, phoneNumber, vendor: vendorId, services: [{service: serviceId}], bookingDate })
    console.log("Booking successful!", booking)

    return { success: true, message: "Booking successful!", booking };

}

module.exports = { generateResponse };