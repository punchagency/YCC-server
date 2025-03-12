const OpenAI = require('../../../../config/openAI')
const Chat = require('../../../../models/chat.model')


const generateResponse = async (dataNeeded, dataPresent, chat) => {
    return await generateResponseFromAI(dataNeeded, dataPresent, chat)
}


async function generateResponseFromAI(dataNeeded, dataPresent, chat) {

      const systemMessage = `
      Provide a message to request additional details based on the data present and the data needed.
      Data:
      Data needed: ${dataNeeded}
      Data present: ${dataPresent}
      `;
    
      const messages = [
        { role: "system", content: systemMessage },
        ...chat.messages
      ];
      const completion = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });
      const response = completion.choices[0].message;
      const updatedChat = await Chat.findByIdAndUpdate(chat._id, { $push: { messages: response } }, { new: true });
      return updatedChat;
}














module.exports = { generateResponse };

