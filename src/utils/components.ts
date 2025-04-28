import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import { CoreMessage } from "ai";
import { fromMarkdown } from "mdast-util-from-markdown";
import { visitParents } from "unist-util-visit-parents";
import { z } from "zod";

const BASE_URL = `https://raw.gitmirror.com/unovue/shadcn-vue/dev/apps/www`;
const GitHub_URL = `https://api.github.com/repos/unovue/shadcn-vue/contents/apps/www/src/content/docs`;

export async function extractComponents() {
  try {
    // 并行发起请求以提高性能
    const [componentsResponse, chartsResponse] = await Promise.all([
      fetch(`${GitHub_URL}/components`),
      fetch(`${GitHub_URL}/charts`),
    ]);
    // 并行解析JSON响应
    const [componentsData, chartsData] = await Promise.all([
      componentsResponse.json(),
      chartsResponse.json(),
    ]);

    // 定义更明确的类型和提取函数
    interface GitHubItem {
      name: string;
      type: string;
      [key: string]: any;
    }

    const extractNames = (items: GitHubItem[]) =>
      items
        .filter((item) => item.type === "file" && item.name.endsWith(".md"))
        .map((item) => item.name.replace(".md", ""));

    // 提取组件和图表名称
    const components = extractNames(componentsData as GitHubItem[]);
    const charts = extractNames(chartsData as GitHubItem[]);

    return { components, charts };
  } catch (error) {
    console.error("获取组件列表失败:", error);
    // 返回空数组而不是抛出错误，使应用程序更健壮
    return { components: [], charts: [] };
  }
}

function extractVueCodeBlocks(markdownContent: string): string[] {
  // Parse the markdown into an AST
  const ast = fromMarkdown(markdownContent);

  // 初始化变量用于存储 "Usage" 部分的信息
  // usageHeadingNode: 存储 "Usage" 标题节点
  // usageSectionStart: 存储 "Usage" 部分开始的行号
  // usageSectionEnd: 存储 "Usage" 部分结束的行号，初始设为无穷大
  let usageHeadingNode = null;
  let usageSectionStart = -1;
  let usageSectionEnd = Infinity;

  // 使用 unist-util-visit-parents 库遍历 AST，查找 "Usage" 标题
  // visitParents 函数接收三个参数：AST、要查找的节点类型、回调函数
  visitParents(ast, "heading", (node, ancestors) => {
    // 检查当前节点是否为二级标题(## Usage)
    // 并且标题文本为 "Usage"
    if (
      node.depth === 2 && // 检查是否为二级标题
      node.children &&
      node.children[0] &&
      node.children[0].type === "text" &&
      node.children[0].value === "Usage"
    ) {
      usageHeadingNode = node;
      usageSectionStart = node.position?.end?.line || -1;
    }
  });

  // If no Usage section, return empty array
  if (usageSectionStart === -1) {
    console.log("No Usage section found in the markdown");
    return [];
  }

  // 再次遍历 AST，查找 "Usage" 部分之后的下一个二级标题
  // 这用于确定 "Usage" 部分的结束位置
  visitParents(ast, "heading", (node) => {
    const headingLine = node.position?.start?.line || Infinity;
    if (
      node.depth === 2 &&
      headingLine > usageSectionStart &&
      headingLine < usageSectionEnd
    ) {
      usageSectionEnd = headingLine;
    }
  });

  // 初始化数组用于存储提取的 Vue 代码块
  const tsxBlocks: string[] = [];
  visitParents(ast, "code", (node) => {
    const nodeLine = node.position?.start?.line || 0;

    // 检查代码块是否在 "Usage" 部分内，且语言为 "vue"
    if (
      nodeLine > usageSectionStart &&
      nodeLine < usageSectionEnd &&
      node.lang === "vue"
    ) {
      tsxBlocks.push(node.value);
    }
  });

  return tsxBlocks;
}

export async function readFullComponentDoc({ name }: { name: string }) {
  const res = await fetch(`${BASE_URL}/src/content/docs/components/${name}.md`);
  return await res.text();
}

export async function readUsageComponentDoc({ name }: { name: string }) {
  const fileContent = await readFullComponentDoc({ name });

  const usageBlocks = extractVueCodeBlocks(fileContent);

  return `\`\`\`\`vue
${usageBlocks.join("\n")}
\`\`\`\``;
}

export const ComponentSchema = z.object({
  name: z.string(),
  necessity: z.enum(["critical", "important", "optional"]),
  justification: z.string(),
});

export const ComponentsSchema = z.object({
  components: z.array(ComponentSchema),
  charts: z.array(ComponentSchema),
});

export function createNecessityFilter(necessity: string) {
  return (component: { necessity: string }) => {
    const score: Record<string, number> = {
      critical: 3,
      important: 2,
      optional: 1,
    };
    return (score[component.necessity] ?? 0) >= (score[necessity] ?? 0);
  };
}

export function transformMessages(messages: PromptMessage[]): CoreMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: [
      {
        type: m.content.type as "text",
        text: m.content.text as string,
      },
    ],
  }));
}
