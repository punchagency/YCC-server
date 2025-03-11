const { generateResponse } = require("./vendorServiceService");

const VendorServicesTool = {
    name: "AI Vendor Services Assistant",
    description: "A vendor services assistant that can help get available services from vendors.",
    tools: ["pinecone_search"],
    handler: async (query) => {
        return await generateResponse(query);
    },
};

module.exports = VendorServicesTool;