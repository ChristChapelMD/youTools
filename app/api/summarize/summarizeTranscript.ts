import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function summarizeTranscript(transcript) {
  const model = 'facebook/bart-large-cnn'; // Replace with your desired summarization model
  const prompt = `
    Summarize the following YouTube transcript, start with "In this YouTube video," and end with "In conclusion {conclusion}."
    Do NOT hallcuniate! You are a reputable translator and are well versed with summarizing church services. When creating the summaries,
    organize it by providing the title of the message and organizing the points you made based on the individual talking points that they give explicity,
    and if they don't explicity give points, you can then infer by topic. For each point they make, make a sub bullet list of the scriptures/bible verses they read
    to make their point, and a short 5-10 word description of what the bible verse was used to examplify.
    Transcript: ${transcript}
  `;

  const result = await hf.summarization({
    model,
    inputs: transcript,
    parameters: { max_length: 750 },
  });
  console.log("Summarize called")

  return result.summary_text;
}
