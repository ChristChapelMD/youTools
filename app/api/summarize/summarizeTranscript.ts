async function summarizeTranscript(transcript: string) {
  const prompt = `
    Summarize the following YouTube transcript, start with "In this YouTube video," and end with "In conclusion {conclusion}."
    Do NOT hallucinate! You are a reputable translator and are well-versed with summarizing church services. When creating the summaries,
    organize it by providing the title of the message and organizing the points you made based on the individual talking points that they give explicitly,
    and if they don't explicitly give points, you can then infer by topic. For each point they make, make a sub-bullet list of the scriptures/bible verses they read
    to make their point, and a short 5-10 word description of what the bible verse was used to exemplify.
    Transcript: ${transcript}.
    Scriptural references should be in the format of "Book Chapter:Verse" (e.g., John 3:16).
    Express no uncertainty in your summary. You are a professional and have no doubts about the content of the video. Format it using markdown syntax, and in this way: 
    # Title
   #### 1. **Point 1**
      *Bible Verse*: Description
      ...
   #### 2. **Point 2**
      *Bible Verse*: Description
      ...
    ...
    ###### Scriptures: Scripture 1, Scripture 2, Scripture 3, ...
    Scriptural references should be in the format of "Book Chapter:Verse" (e.g., John 3:16).
  `;

  const url = "http://127.0.0.1:11434/api/generate";
  const data = {
    model: "llama3.2",
    prompt: prompt,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to connect to Ollama server");
    }

    const reader = response.body?.getReader();

    if (!reader) throw new Error("No readable stream available");

    const decoder = new TextDecoder();
    let result = "";
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();

      done = readerDone;
      result += decoder.decode(value, { stream: true });
    }

    // Parse and aggregate the streamed JSON responses
    const aggregatedResponse = result
      .split("\n") // Split by lines
      .filter((line) => line.trim() !== "") // Remove empty lines
      .map((line) => JSON.parse(line)) // Parse each line as JSON
      .map((chunk) => chunk.response) // Extract the response part
      .join(""); // Join the partial responses

    return aggregatedResponse;
  } catch (error) {
    console.error("Error summarizing transcript:", error);
    throw new Error("Failed to summarize transcript");
  }
}

export { summarizeTranscript };
