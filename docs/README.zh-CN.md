# ShadcnVue MCP Server - 一款强大的 AI Agent工具，可帮助开发者创建高质量的 UI 组件

Shadcn-vue MCP Server  是一款强大的 AI 驱动工具，可帮助开发者通过自然语言描述即时创建美观、现代的 UI 组件。它集成 shadcn-vue 组件库和 tailwindcss, 并与主流 IDE 无缝集成，并提供精简的 UI 开发工作流程。

## ❌ 不使用 shadcn-vue MCP

开发者在构建UI组件时面临诸多挑战：

- ❌ 需要手动查阅shadcn-vue文档和tailwindcss4.0文档，耗费大量时间
- ❌ 组件代码需要从零开始编写，效率低下
- ❌ 难以实现设计一致性，组件风格不统一
- ❌ 难以实现符合组件设计和编码规范的高质量组件

## ✅ 使用 shadcn-vue MCP

SCP提供智能化的UI组件开发体验：

- 1️⃣ 只需用自然语言描述您需要的组件
- 2️⃣ 该MCP自动生成符合shadcn-vue、tailwindcss规范的代码
- 3️⃣ 获得可直接使用的高质量，设计统一的shadcn-vue UI组件

示例用法：

```txt
/ui 创建一个导航栏组件
```

```txt
/refine 优化导航栏组件的响应式和可访问性
```

优势：

- 实时获取最新的shadcn-vue组件使用规范
- 生成的代码100%符合当前版本要求
- 基于context7提供的LLM.txt文件作为上下文，实现更精准的代码生成
- 无需反复查阅文档，不再担心版本兼容问题，让AI为您处理所有UI开发细节。
- 多IDE无缝集成工作流

### 功能

- 人工智能驱动的 UI 生成：通过自然语言描述来创建 UI 组件
  **Multi-IDE Support**:
  - [Cursor](https://cursor.com) IDE integration
  - [Trae](https://www.trae.ai/) support
  - [VSCode](https://code.visualstudio.com/) support
  - [VSCode + Cline](https://cline.bot) integration (Beta)
- 现代组件库：基于 shadcn-vue 组件库和 tailwindcss
- TypeScript 支持：全面支持 TypeScript，实现类型安全开发
- shadcn-vue 组件文档智能查询
- 组件增强：可访问性支持/性能优化/高级设计改进/动画改进
- 实时组件预览生成(即将推出)。

## 前置需求 ｜ Prerequisite

Node.js 22 版本或以上。

Node.js 22 or above.

## 开始使用 ｜ Start

### Installing via Smithery

1. **请到 **https://openrouter.ai/models** 注册账号，获取 OPENROUTER_API_KEY， 查看可用的模型列表获取**

2. **选择安装方法**

#### 方法 1：CLI 快速安装

To install bazi-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@HelloGGX/shadcn-vue-mcp):

```bash
npx -y @smithery/cli@latest install @HelloGGX/shadcn-vue-mcp --client vscode
```

Supported clients: cursor, windsurf, cline, claude, vscode, vscode-insiders

#### 方法 2：手动配置

手动配置 AI 应用（例如 Claude Descktop）。
Configure AI application (e.g. Claude Desktop).

```json
{
  "mcpServers": {
    "shadcn-vue": {
      "command": "npx",
      "args": ["-y", "@agent/shadcn-vue"],
      "env": {
        "OPENROUTER_MODEL_ID": "您选择的OpenRouter model id",
        "OPENROUTER_API_KEY": "您的OpenRouter API密钥"
      }
    }
  }
}
```

Config file locations:

- Cursor: `~/.cursor/mcp.json`
- Trae: `~/.Trae/mcp.json`
- Cline: `~/.cline/mcp_config.json`
- Claude: `~/.claude/mcp_config.json`

## 工具列表 | Tools

### read-usage-doc

> 查询组件文档
> Query component documentation

#### 参数 ｜ Arguments

- name: `String`
  > shadcn-vue 的组件名称。例如："button 组件的使用文档"

### read-full-doc

> 查询组件完整文档  
> read full doc of a component, Use this tool when mentions /doc.

#### 参数 ｜ Arguments

- name: `String`
  > shadcn-vue 的组件名称。例如："button 组件的完整文档"

### create-ui

> 创建 UI 组件  
> create Web UI with shadcn/ui components and tailwindcss, Use this tool when mentions /ui

#### 参数 ｜ Arguments

- description: `String`
  > 组件功能等相关需求的描述。例如："/ui 创建一个航班展示组件"  
  > Component description. Example: "/ui create a flight show component"

### refine-code

> 增强优化指定组件的代码
> Refine code, Use this tool when mentions /refine

#### 参数 ｜ Arguments

- userMessage: `String`
  > 待优化的代码。例如："/refine 优化一下这段代码，使其具备移动端响应式布局"
  > Full user's message about UI refinement. Example: "/refine optimize this code"
- absolutePathToRefiningFile: `String`
  > 待优化的代码文件的绝对路径。"
  > Absolute path to the file that needs to be refined. Example: "/Users/agent/Desktop/Button.vue"
- context: `String`
  > 根据用户消息、代码和对话历史记录，提取需要改进的具体 UI 元素和方面。
  > Extract the specific UI elements and aspects that need improvement based on user messages, code, and conversation history.

## 返回结果 | result

用户: /ui 创建一个航班展示组件

AI: 生成的代码如下：

![UI组件示例](https://github.com/HelloGGX/tailwindcss-mcp/raw/main/docs/ui.png)

## 🤝 贡献指南

我们欢迎所有贡献！帮助我改进 @agent/shadcn-vue。源代码已在 [GitHub](https://github.com/HelloGGX/shadcn-vue-mcp) 开源。

## 👥 社区与支持

- [Discord 社区](https://discord.gg/82Kf65ut) - 加入我们的活跃社区

## 📝 许可证

MIT 许可证

---
