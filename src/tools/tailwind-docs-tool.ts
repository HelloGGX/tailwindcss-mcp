import { z } from "zod";
import { BaseTool } from "../utils/base-tool.js";
import {
  fetchTailwindUrl,
  TailwindUrlResponse,
} from "../utils/fetchTailwindUrl.js";
import { fetchTailwindDocs } from "../utils/fetchTailwindDoc.js";

const TAILWIND_URL_QUERY_TOOL_DESCRIPTION = `
"Use this tool when the user asks about styling implementation,
 Tailwind CSS class usage, responsive design, or theming questions.
 Examples include queries about spacing utilities, color palettes, 
 breakpoints, dark mode, or specific class combinations. 
 This tool returns filtered official Tailwind CSS documentation URLs
 based on semantic relevance to the search query. The results are
 structured for direct consumption by tailwind_doc_query tool.
 After invocation, pass the {results, query} output to 
 tailwind_doc_query for detailed content crawling."
`;

const TAILWIND_DOC_QUERY_TOOL_DESCRIPTION = `Use this tool to crawl and process detailed content from Tailwind CSS documentation URLs.
This tool requires {urls: string[], searchQuery: string} input format from tailwind_url_query.
It will automatically:
1. Crawl content from selected documentation pages
2. Search for relevant content based on the searchQuery
3. Extract code examples and implementation patterns
4. Return structured data in a user-friendly format including:
   - Document titles and links
   - Relevant code snippets and usage examples
   - Implementation suggestions and best practices

Always use this tool after tailwind_url_query when:
- Need actual CSS class usage examples
- Require implementation details from official docs
- The user asks "how to implement" type questions
- Need to verify proper class combinations

The output contains well-formatted content with markdown formatting and code snippets ready for direct implementation, ensuring users can quickly understand and apply Tailwind CSS solutions.`;

/**
 * Tailwind CSS 文档助手工具
 */
export class TailwindCSSUrlQueryTool extends BaseTool {
  name = "tailwind_url_query";
  description = TAILWIND_URL_QUERY_TOOL_DESCRIPTION;

  // 参数定义
  schema = z.object({
    searchQuery: z
      .string()
      .describe(
        "Transform the user's message into a precise search query for the official Tailwind CSS documentation. Extract the key concepts and terminology from their question to create a focused query that will return the most relevant documentation. The query should capture the essence of what the user is asking about Tailwind CSS."
      ),
    timeout: z
      .number()
      .optional()
      .describe(
        "Optional timeout in milliseconds. Default is 30000 (30 seconds). Set a higher value for more thorough searches, lower for quicker responses."
      ),
  });

  /**
   * 执行工具逻辑
   */
  async execute({
    searchQuery,
    timeout = 30000,
  }: z.infer<typeof this.schema>): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    try {
      // 执行文档搜索
      const docsContent = await this.performUrlSearch(searchQuery, timeout);
      // 准备响应数据
      const responseData = this.prepareResponseData(docsContent);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(responseData, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool:", error);
      throw error;
    }
  }

  /**
   * 执行文档搜索
   */
  private async performUrlSearch(
    searchQuery: string,
    timeout: number
  ): Promise<TailwindUrlResponse> {
    return fetchTailwindUrl({
      query: searchQuery,
      version: "latest",
      timeout,
    });
  }

  /**
   * 准备响应数据
   */
  private prepareResponseData(docsContent: TailwindUrlResponse): any {
    const resultCount = docsContent.results?.length || 0;

    return {
      ...docsContent,
      userMessage:
        docsContent.status === "complete"
          ? `成功获取了${resultCount}条相关文档`
          : docsContent.message || "搜索完成，但可能不完整",
    };
  }
}

export class TailwindCSSDocTool extends BaseTool {
  name = "tailwind_doc_query";
  description = TAILWIND_DOC_QUERY_TOOL_DESCRIPTION;

  schema = z.object({
    urls: z.array(z.string()).describe("The urls of the documentation page"),
    searchQuery: z.string().describe("The search query from tailwind_url_query"),
  });

  /**
   * 执行工具逻辑
   */
  async execute({ urls, searchQuery }: z.infer<typeof this.schema>): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    try {
      // 执行文档搜索
      const docsContent = await fetchTailwindDocs({
        urls,
        query: searchQuery,
        timeout: 30000,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: '',
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool:", error);
      throw error;
    }
  }
}
