//import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");

const polly = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "No text provided" });
  }

  const command = new SynthesizeSpeechCommand({
    OutputFormat: "json",
    Text: text,
    TextType: "ssml",
    VoiceId: "Joanna",
    SpeechMarkTypes: ["word"],
  });

  try {
    const data = await polly.send(command);
    const stream = await data.AudioStream.transformToString("utf-8");

    // Polly returns a newline-separated list of JSON objects
    const lines = stream
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    console.log("✅ Received SSML text:", text);
    console.log("✅ Returning speech marks:", lines);

    res.status(200).json({ marks: lines });

  } catch (error) {
    console.error("Speech mark error:", error);
    res.status(500).json({ message: "Speech mark error", error: error.toString() });
  }
}
