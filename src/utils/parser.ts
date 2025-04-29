export function parseMessageToJson(input: string) {
  // 定义提取JSON内容的格式模式
  const extractPatterns = [
    {
      pattern: /<response_format>([\s\S]*?)<\/response_format>/g,
      name: "response_format",
    },
    { pattern: /```json\n([\s\S]*?)\n```/g, name: "json code block" },
  ];

  // 尝试按优先级提取JSON字符串
  let jsonString = input.trim();
  let extractSource = "raw input";

  for (const { pattern, name } of extractPatterns) {
    const matches = Array.from(input.matchAll(pattern));

    if (matches.length > 1) {
      throw new Error(`Multiple ${name} blocks found in the input string.`);
    }

    if (matches.length === 1) {
      jsonString = matches[0][1].trim();
      extractSource = name;
      break;
    }
  }

  try {
    // 解析JSON字符串为对象
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from ${extractSource}: ${error}\n\n${jsonString}`
    );
  }
}
