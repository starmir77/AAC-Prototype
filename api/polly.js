import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

module.exports =  async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "No text provided" });
  }

  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text: text,
    TextType: "ssml",
    VoiceId: "Joanna",
  });

  try {
    const data = await polly.send(command);
    const audioStream = await data.AudioStream.transformToByteArray();

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline");

    res.status(200).send(Buffer.from(audioStream));
  } catch (error) {
    console.error("Error calling Polly:", error);
    res.status(500).json({ message: "Polly error", error: error.toString() });
  }
}
