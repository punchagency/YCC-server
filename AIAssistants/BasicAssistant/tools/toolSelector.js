const VendorServicesTool = require("./vendorServicesInformationTool/vendorServiceInformationTool");
const CustomerSupportTool = require("./customerServiceTool/customerServiceTool");
const BookVendorTool = require("./bookVendorServicesTool/bookVendorTool");
const OpenAI = require("../../../config/openAI");

const tools = {
    VendorServicesTool: async (chat) => {
        //console.log("Vendor Services Tool selected");
        return await VendorServicesTool.handler(chat);
    },
    CustomerSupportTool: async (chat) => {
        //console.log("Customer Support Tool selected");
        return await CustomerSupportTool.handler(chat);
    },
    BookVendorTool: async (chat) => {
        //console.log("Book Vendor Tool selected");
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
                description: "Retrieves and provides detailed information on vendor services, including product availability, pricing, service options, and supplier details. This function ensures vendors have up-to-date information for effective business operations.",
            },
            {
                name: "CustomerSupportTool",
                description: "Handles general customer support inquiries related to the company's services, policies, and yacht crew center (YCC). It assists with minor departmental concerns, frequently asked questions, and general guidance on company operations.",
            },
            {
                name: "BookVendorTool",
                description: "Facilitates the booking of vendor services and product orders. It allows users to schedule vendor services, confirm product availability, and manage bookings efficiently.",
            },
        ],
        function_call: "auto",
    });

    const selectedFunction = response.choices[0].message.function_call?.name;

    return selectedFunction ? await tools[selectedFunction](chat) : tools.CustomerSupportTool(chat);
};


module.exports = ToolSelection;  