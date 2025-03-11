const VendorServicesTool = require("./vendorServicesInformationTool/vendorServiceInformationTool");
const CustomerSupportTool = require("./customerServiceTool/customerServiceTool");
const BookVendorTool = require("./bookVendorServicesTool/bookVendorTool");
const OpenAI = require("../../../config/openAI");

const tools = {
    VendorServicesTool: async (chat) => {
        console.log("Vendor Services Tool selected");
        return await VendorServicesTool.handler(chat);
    },
    CustomerSupportTool: async (chat) => {
        console.log("Customer Support Tool selected");
        return await CustomerSupportTool.handler(chat);
    },
    BookVendorTool: async (chat) => {
        console.log("Book Vendor Tool selected");
        return await BookVendorTool.handler(chat);
    },
};

const ToolSelection = async (chat) => {
    const response = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chat.messages,
        functions: [
            {
                name: "VendorServicesTool",
                description: "Provides information about pricing and availability for vendor services and products.",
            },
            {
                name: "CustomerSupportTool",
                description: "Provides general customer support inquiries about the company and minor departmental inquiries, YCC(Yatch Crew Center).",
            },
            {
                name: "BookVendorTool",
                description: "Helps users book vendor services and products.",
            },
        ],
        function_call: "auto",
    });

    const selectedFunction = response.choices[0].message.function_call?.name;

    return selectedFunction ? await tools[selectedFunction](chat) : "No tool selected.";
};


module.exports = ToolSelection;  