import { z } from "zod";
import { BaseTool } from "../utils/base-tool.js";
import {
  ComponentsSchema,
  createNecessityFilter,
  extractComponents,
  fetchLibraryDocumentation,
  readFullComponentDoc,
  transformMessages,
} from "../utils/components.js";
import { CREATE_UI, FILTER_COMPONENTS, REFINED_UI } from "../prompts/ui.js";
import { parseMessageToJson } from "../utils/parser.js";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import dotenv from "dotenv";

// Load environment variables from .env file if present
dotenv.config();

const OPENROUTER_MODEL_ID = process.env.OPENROUTER_MODEL_ID;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 创建一个获取OpenRouter客户端的函数，包含环境变量检查
if (!OPENROUTER_MODEL_ID) {
  throw new Error("OPENROUTER_MODEL_ID is not set");
}
if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set");
}

const openrouter = createOpenRouter({
  apiKey: OPENROUTER_API_KEY,
});

export class readUsageDocTool extends BaseTool {
  name = "read-usage-doc";
  description = "read usage doc of a component， Use this tool when mentions /usedoc.";

  // 参数定义
  schema = z.object({
    name: z.string().describe("name of the component, lowercase, kebab-case"),
  });

  async execute({ name }: z.infer<typeof this.schema>): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    try {
      const doc = await fetchLibraryDocumentation("/unovue/shadcn-vue", {
        topic: name,
      });
      return {
        content: [
          {
            type: "text",
            text: doc || "No documentation found for this component",
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool:", error);
      throw error;
    }
  }
}
export class readFullDocTool extends BaseTool {
  name = "read-full-doc";
  description = "read full doc of a component, Use this tool when mentions /doc.";

  // 参数定义
  schema = z.object({
    name: z.string().describe("name of the component, lowercase, kebab-case"),
  });

  async execute({ name }: z.infer<typeof this.schema>): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    try {
      const doc = await readFullComponentDoc({ name });
      return {
        content: [
          {
            type: "text",
            text: doc,
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool:", error);
      throw error;
    }
  }
}
export class createUiTool extends BaseTool {
  name = "create-ui";
  description = `create Web UI with shadcn/ui components and tailwindcss, Use this tool when mentions /ui`;

  // 参数定义
  schema = z.object({
    description: z.string().describe("description of the Web UI"),
  });

  async execute({ description }: z.infer<typeof this.schema>): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    const components = await extractComponents();
    // 使用AI模型来筛选适合用户需求的UI组件
    const transformedMessages = transformMessages([
      {
        role: "user",
        content: {
          type: "text",
          text: `<description>${description}</description><available-components>${JSON.stringify(
            components
          )}</available-components>`,
        },
      },
    ]);
    const { text } = await generateText({
      system: FILTER_COMPONENTS,
      messages: transformedMessages,
      model: openrouter(OPENROUTER_MODEL_ID || ""),
      maxTokens: 2000,
    });
    const responseJson = parseMessageToJson(text);
    if (responseJson.component) {
      responseJson.components = responseJson.component;
      delete responseJson.component;
    }
    if (responseJson.chart) {
      responseJson.charts = responseJson.chart;
      delete responseJson.chart;
    }

    const filteredComponents = ComponentsSchema.parse(responseJson);

    filteredComponents.components.forEach((c) => {
      c.name = c.name.toLowerCase();
    });
    filteredComponents.charts.forEach((c) => {
      c.name = c.name.toLowerCase();
    });

    const usageDocs = await Promise.all(
      filteredComponents.components.filter(createNecessityFilter("optional")).map(async (c) => {
        return {
          ...c,
          doc: await fetchLibraryDocumentation("/unovue/shadcn-vue", {
            topic: c.name,
          }),
        };
      })
    );

    const createUiResultMessages = transformMessages([
      {
        role: "user",
        content: {
          type: "text",
          text: `<description>${description}</description>
          <available-components>
            ${usageDocs
              .map((d) => {
                return `<component name="${d.name}">
                  <justification><![CDATA[${d.justification}]]></justification>
                  <documentation><![CDATA[${d.doc}]]></documentation>
                </component>`;
              })
              .join("\n")}
          </available-components>`,
        },
      },
    ]);

    const { text: uiCode } = await generateText({
      system: CREATE_UI,
      messages: createUiResultMessages,
      model: openrouter(OPENROUTER_MODEL_ID || ""),
      maxTokens: 8192,
      maxRetries: 2,
    });

    return {
      content: [
        {
          type: "text",
          text: uiCode,
        },
      ],
    };
  }
}
export class refineCodeTool extends BaseTool {
  name = "refine-code";
  description = `refine code with shadcn/ui components and tailwindcss,
  Use this tool when the user requests to refine/improve current UI component with /ui commands`;

  schema = z.object({
    userMessage: z.string().describe("Full user's message about UI refinement"),
    absolutePathToRefiningFile: z
      .string()
      .describe("Absolute path to the file that needs to be refined"),
    context: z
      .string()
      .describe(
        "Extract the specific UI elements and aspects that need improvement based on user messages, code, and conversation history. Identify exactly which components (buttons, forms, modals, etc.) the user is referring to and what aspects (styling, layout, responsiveness, etc.) they want to enhance. Do not include generic improvements - focus only on what the user explicitly mentions or what can be reasonably inferred from the available context. If nothing specific is mentioned or you cannot determine what needs improvement, return an empty string."
      ),
  });

  async execute({ userMessage, absolutePathToRefiningFile, context }: z.infer<typeof this.schema>) {
    try {

      const fileContent = await this.getContentOfFile(absolutePathToRefiningFile);

      const { text } = await generateText({
        system: REFINED_UI,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `<description>${userMessage}</description>
                <refining-component>${fileContent}</refining-component>
                ${context}
                `,
              },
            ],
          },
        ],
        model: openrouter(OPENROUTER_MODEL_ID || ""),
        maxTokens: 8192,
        maxRetries: 2,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: text,
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool", error);
      throw error;
    }
  }

  private async getContentOfFile(path: string): Promise<string> {
    try {
      const fs = await import("fs/promises");
      return await fs.readFile(path, "utf-8");
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      return "";
    }
  }
}
