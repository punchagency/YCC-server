const OpenAI = require('../../../../config/openAI')



const generateResponse = async (dataNeeded, dataPresent) => {
    return await generateResponseFromAI(dataNeeded, dataPresent)
}


async function generateResponseFromAI(dataNeeded, dataPresent) {

      const systemMessage = `
      Provide a message to request additional details based on the data present and the data needed.
      Data:
      Data needed: ${dataNeeded}
      Data present: ${dataPresent}
      `;
    
      const messages = [
        { role: "system", content: systemMessage },
        { role: "user", content: 'What else do you need to complete the booking?' },
      ];
      const completion = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });
      console.log('three')
      return completion.choices[0].message.content;
}














module.exports = { generateResponse };

