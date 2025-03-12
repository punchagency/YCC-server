const { generateResponse } = require("./vendorServiceInformationService");

const VendorServicesTool = {
    name: "AI Vendor Services Assistant",
    description: "A vendor services assistant that can help get available services from vendors.",
    tools: ["pinecone_search"],
    handler: async (chat) => {
        return await generateResponse(chat);
    },
};

module.exports = VendorServicesTool;