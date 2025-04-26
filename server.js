// 1. Import Polly Client
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import * as fs from "fs"; // File system, to save the audio file
import dotenv from "dotenv"; // To load .env file

// 2. Load environment variables
dotenv.config();

// 3. Create Polly client using your AWS credentials
const polly = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// 4. Function to synthesize speech
async function speak(text) {
  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text: text,
    VoiceId: "Joanna" // (you can change voice later!)
  });

  try {
    const data = await polly.send(command);
    const audioStream = data.AudioStream;

    // Save the audio to an MP3 file
    fs.writeFileSync("output.mp3", Buffer.from(await audioStream.transformToByteArray()));
    console.log("✅ Audio saved as output.mp3");
  } catch (error) {
    console.error("❌ Error calling Polly:", error);
  }
}

// 5. Run the function
speak("Hello, this is your AAC Sarcasm Prototype speaking!");
