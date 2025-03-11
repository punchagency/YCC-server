const VendorServicesTool = require("./vendorServicesTool/vendorServiceTool");
const CustomerSupportTool = require("./customerServiceTool/customerServiceTool");
const OpenAI = require("../../../config/openAI");

const tools = {
    VendorServicesTool: async (query) => {
        console.log("Vendor Services Tool selected");
        return await VendorServicesTool.handler(query);
    },
    CustomerSupportTool: async (query) => {
        console.log("Customer Support Tool selected");
        return await CustomerSupportTool.handler(query);
    },
};

const ToolSelection = async (query) => {
    const response = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: query }],
        functions: [
            {
                name: "VendorServicesTool",
                description: "Handles vendor-related queries (services, products, vendors).",
            },
            {
                name: "CustomerSupportTool",
                description: "Handles general customer support inquiries about the company, YCC(Yatch Crew Center).",
            },
        ],
        function_call: "auto",
    });

    const selectedFunction = response.choices[0].message.function_call?.name;

    return selectedFunction ? await tools[selectedFunction](query) : "No tool selected.";
};


module.exports = ToolSelection;  