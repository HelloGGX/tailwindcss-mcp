import { z } from "zod";
import { BaseTool } from "../utils/base-tool.js";
import {
  ComponentsSchema,
  createNecessityFilter,
  extractComponents,
  readFullComponentDoc,
  readUsageComponentDoc,
  transformMessages,
} from "../utils/components.js";
import { CREATE_UI, FILTER_COMPONENTS } from "../prompts/ui.js";
import { parseMessageToJson } from "../utils/parser.js";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey:
    "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",
});

export class readUsageDocTool extends BaseTool {
  name = "read-usage-doc";
  description = "read usage doc of a component";

  // 参数定义
  schema = z.object({
    name: z.string().describe("name of the component, lowercase, kebab-case"),
  });

  async execute({ name }: z.infer<typeof this.schema>): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    try {
      const doc = await readUsageComponentDoc({ name });
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
export class readFullDocTool extends BaseTool {
  name = "read-full-doc";
  description = "read full doc of a component";

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
  description = "create Web UI with shadcn/ui components and tailwindcss";

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
      model: openrouter("deepseek/deepseek-chat-v3-0324:free"),
      maxTokens: 2000,
    });

    const filteredComponents = ComponentsSchema.parse(parseMessageToJson(text));

    filteredComponents.components.forEach((c) => {
      c.name = c.name.toLowerCase();
    });
    filteredComponents.charts.forEach((c) => {
      c.name = c.name.toLowerCase();
    });

    const usageDocs = await Promise.all(
      filteredComponents.components
        .filter(createNecessityFilter("optional"))
        .map(async (c) => {
          return {
            ...c,
            doc: await readUsageComponentDoc({ name: c.name }),
          };
        })
    );

    const createUiResultMessages = transformMessages([
      {
        role: "user",
        content: {
          type: "text",
          text: `<description>${description}</description><available-components>${usageDocs
            .map((d) => {
              return `<component>
            ### ${d.name}

            > ${d.justification}

            ${d.doc}
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
      model: openrouter("deepseek/deepseek-chat-v3-0324:free"),
      maxTokens: 32768,
      maxRetries: 5,
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
