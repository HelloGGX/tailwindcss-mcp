import { jsonrepair } from "jsonrepair";

export function parseMessageToJson(input: string) {
  // 尝试按优先级提取JSON字符串
  let jsonString = input.trim();
  const result = jsonrepair(jsonString);

  try {
    // 解析JSON字符串为对象
    return JSON.parse(result);
  } catch (error) {
    throw new Error(`Failed to parse JSON : ${error}\n\n${jsonString}`);
  }
}
