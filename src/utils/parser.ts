import { jsonrepair } from "jsonrepair";

export function parseMessageToJson(input: string) {
  // 尝试按优先级提取JSON字符串
  const extractSource = "raw input";

  try {
    // 解析JSON字符串为对象
    return JSON.parse(jsonrepair(input));
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${extractSource}: ${error}\n\n${input}`);
  }
}
