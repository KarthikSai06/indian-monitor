const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
  const genAI = new GoogleGenerativeAI("AIzaSyCoXNW-wbwEJnGugBLDEfXIi6E3WbCHbvg");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Respond with exactly one word: ALIVE");
    console.log("SUCCESS:", result.response.text().trim());
  } catch (error) {
    console.error("FAILED MAIN:", error.message);
  }
}
testKey();
testKey();
testKey();
