const CalendarInformationTool = require("./calendarInformationTool/calendarInformationTool");
const OpenAI = require("../../../config/openAI");
const BookingManagingTool = require("./bookingManagingTool/bookingManagingTool");


const tools = {
    CalendarInformationTool: async (chat) => {
        console.log("Calendar Information Tool selected");
        return await CalendarInformationTool.handler(chat);
    },
    BookingManagingTool: async (chat) => {
        console.log("Booking Managing Tool selected");
        return await BookingManagingTool.handler(chat);
    },
};

const ToolSelection = async (chat) => {
    const response = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chat.messages,
        functions: [
            {
                name: "CalendarInformationTool",
                description: "Retrieves details about the user's calendar and bookings. This includes fetching a specific booking by ID, retrieving all bookings, filtering bookings by date or status, and other calendar-related queries.",
                parameters: {
                    type: "object",
                    properties: {
                        bookingId: { 
                            type: "string", 
                            description: "The unique identifier of the booking to retrieve. If omitted, all bookings will be returned." 
                        },
                        date: { 
                            type: "string", 
                            format: "date", 
                            description: "Fetches bookings for a specific date (YYYY-MM-DD)."
                        },
                        status: { 
                            type: "string", 
                            enum: ["confirmed", "pending", "cancelled", "completed"], 
                            description: "Filters bookings by their current status."
                        }
                    },
                    required: []
                },
            },
            {
                name: "BookingManagingTool",
                description: "performs crud operations on bookings, and other booking related tasks like editing, deleting, and declining bookings.",
                parameters: {
                    type: "object",
                    properties: {
                        bookingId: { type: "string", description: "the id of the booking to perform the action on" },
                        action: { type: "string", description: "the action to perform on the booking" },
                    },
                    required: ["bookingId", "action"] 
                },
            },
        ],
        function_call: "auto",
    });

    const selectedFunction = response.choices[0].message.function_call?.name;
    console.log("Selected Function from ToolSelector: ", selectedFunction);

    return selectedFunction ? await tools[selectedFunction](chat) : tools.CalendarInformationTool(chat);
};


module.exports = ToolSelection;  