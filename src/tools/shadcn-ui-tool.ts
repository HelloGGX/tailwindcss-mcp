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
import { createDeepSeek } from "@ai-sdk/deepseek";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
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
      model: deepseek("deepseek-reasoner"),
      maxTokens: 2000,
      maxRetries: 5,
    });
    // const filterComponentsResult = await this.server?.server.createMessage({
    //   systemPrompt: FILTER_COMPONENTS,
    //   messages: [
    //     {
    //       role: "user",
    //       content: {
    //         type: "text",
    //         text: `<description>${description}</description><available-components>${JSON.stringify(
    //           components
    //         )}</available-components>`,
    //       },
    //     },
    //   ],
    //   maxTokens: 2000,
    // });

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
          text: `<description>${description}</description><available-components>
                  ${usageDocs
                    .map((d) => {
                      return `<component>
                    ### ${d.name}

                    > ${d.justification}F

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
      model: deepseek("deepseek-reasoner"),
      maxTokens: 32768,
      maxRetries: 5,
    });
    // const createUiResult = await this.server?.server.createMessage({
    //   systemPrompt: CREATE_UI,
    //   messages: [
    //     {
    //       role: "user",
    //       content: {
    //         type: "text",
    //         text: `<description>${description}</description><available-components>
    //                 ${usageDocs
    //                   .map((d) => {
    //                     return `<component>
    //                   ### ${d.name}

    //                   > ${d.justification}F

    //                   ${d.doc}
    //                   </component>`;
    //                   })
    //                   .join("\n")}
    //               </available-components>`,
    //       },
    //     },
    //   ],
    //   maxTokens: 32768,
    // });

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
