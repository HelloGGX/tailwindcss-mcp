export function parseMessageToJson(input: string) {
    // Regular expression to match JSON code blocks
    const jsonCodeBlockRegex = /```json\n([\s\S]*?)\n```/g;
  
    // Find all matches for JSON code blocks
    const matches = Array.from(input.matchAll(jsonCodeBlockRegex));
  
    if (matches.length > 1) {
      throw new Error("Multiple JSON code blocks found in the input string.");
    }
  
    let jsonString: string;
  
    if (matches.length === 1) {
      // Extract JSON content from the code block, trimming whitespace
      jsonString = matches[0][1].trim();
    } else {
      // No JSON code block found, use the entire input
      jsonString = input.trim();
    }
  
    try {
      // Parse the JSON string into an object
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error("Failed to parse JSON: " + error + "\n\n" + jsonString);
    }
  }
  