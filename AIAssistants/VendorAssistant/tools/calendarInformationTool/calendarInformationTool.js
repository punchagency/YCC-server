const { generateResponse } = require("./calendarInformationService");

const CalendarInformationTool = {
    name: "AI Calendar Information Assistant",
    description: "A calendar Information assistant that keeps track of the vendor's calendar.",
    tools: ["pinecone_search"],
    handler: async (chat) => {
        return await generateResponse(chat);
    },
};

module.exports = CalendarInformationTool;