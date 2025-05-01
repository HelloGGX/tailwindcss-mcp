## 中文

Shadcn-vue Component Platform (SCP) 是一款强大的 AI 驱动工具，可帮助开发者通过自然语言描述即时创建美观、现代的 UI 组件。它集成 shadcn-vue 组件库和 tailwindcss, 并与主流 IDE 无缝集成，并提供精简的 UI 开发工作流程。

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

手动配置 AI 应用（例如 Claude Descktop）。
Configure AI application (e.g. Claude Desktop).

```json
{
  "mcpServers": {
    "shadcn-vue": {
      "command": "npx",
      "args": ["-y", "@agentgavin/shadcn-vue"],
      "env": {
        "OPENROUTER_API_KEY": "您的OpenRouter API密钥"
      }
    }
  }
}
```

### Installing via Smithery

快速安装
```bash
npx -y @smithery/cli install @agentgavin/shadcn-vue --client claude
```

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
  > Absolute path to the file that needs to be refined. Example: "/Users/agentgavin/Desktop/Button.vue"
- context: `String`
  > 根据用户消息、代码和对话历史记录，提取需要改进的具体 UI 元素和方面。
  > Extract the specific UI elements and aspects that need improvement based on user messages, code, and conversation history.

## 返回结果 | result

用户: /ui 创建一个航班展示组件

AI: 生成的代码如下：

```vue
<script setup lang="ts">
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NavBar from "@/components/Nav.vue";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  已起飞: {
    color: "from-green-400 to-green-600",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  即将起飞: {
    color: "from-blue-400 to-blue-600",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  延迟: {
    color: "from-orange-400 to-orange-600",
    icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  取消: {
    color: "from-red-400 to-red-600",
    icon: "M6 18L18 6M6 6l12 12",
  },
};
const flights = [
  {
    flightNumber: "CA1234",
    route: "北京首都 (PEK) → 上海虹桥 (SHA)",
    departure: "08:30",
    arrival: "10:45",
    status: "已起飞",
  },
  {
    flightNumber: "MU5678",
    route: "上海虹桥 (SHA) → 广州白云 (CAN)",
    departure: "11:00",
    arrival: "13:15",
    status: "即将起飞",
  },
  {
    flightNumber: "CA1234",
    route: "北京首都 (PEK) → 上海虹桥 (SHA)",
    departure: "08:30",
    arrival: "10:45",
    status: "延迟",
  },
  // ...其他航班数据
];
</script>

<template>
  <NavBar />
  <Card
    class="max-w-4xl mx-auto my-6 md:my-8 rounded-2xl shadow-xl dark:shadow-xl/30 border border-gray-100 dark:border-gray-800/70 transition-all duration-300 hover:shadow-2xl"
  >
    <!-- 增强的卡片头部 -->
    <div
      class="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 px-6 py-4 border-b border-blue-900/20 relative overflow-hidden
             animate-gradient-x bg-[length:200%] transition-all duration-500"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20"
      ></div>
      <div class="relative flex items-center justify-between space-x-4">
        <div class="flex-1 min-w-0">
          <h2
            class="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md"
          >
            ✈️ 实时航班动态
            <span
              class="block text-sm font-semibold mt-1 opacity-95 tracking-wide"
            >
              <span
                class="inline-flex items-center bg-white/10 px-2 py-1 rounded-lg"
              >
                <span
                  class="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"
                ></span>
                最后更新: 14:30:45
              </span>
            </span>
          </h2>
        </div>
        <div
          class="flex-shrink-0 p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
        >
          <svg
            class="w-7 h-7 text-white animate-spin-slow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
            />
          </svg>
        </div>
      </div>
    </div>
    <div class="overflow-x-auto pb-2">
      <Table class="min-w-full table-fixed">
        <TableHeader class="bg-gray-50/95 dark:bg-gray-800">
          <TableRow class="divide-x divide-gray-200/80 dark:divide-gray-700">
            <TableHead class="w-[12%] pl-6 py-4">
              <span class="text-gray-700 dark:text-gray-300 font-bold"
                >航班号</span
              >
            </TableHead>
            <TableHead class="w-[28%] px-4 py-4">
              <span class="text-gray-700 dark:text-gray-300 font-bold"
                >航线</span
              >
            </TableHead>
            <TableHead class="w-[20%] px-4 py-4 text-center">
              <span class="text-gray-700 dark:text-gray-300 font-bold"
                >出发时间</span
              >
            </TableHead>
            <TableHead class="w-[20%] px-4 py-4 text-center">
              <span class="text-gray-700 dark:text-gray-300 font-bold"
                >到达时间</span
              >
            </TableHead>
            <TableHead class="w-[20%] pr-6 py-4 text-right">
              <span class="text-gray-700 dark:text-gray-300 font-bold"
                >状态</span
              >
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-gray-200/80 dark:divide-gray-700">
          <TableRow
            v-for="flight in flights"
            :key="flight.flightNumber"
            class="transition-all duration-200 hover:bg-gradient-to-r from-blue-50/30 dark:from-blue-900/20 to-transparent group"
          >
            <TableCell class="pl-6 py-4 w-[12%]">
              <span
                class="font-bold text-blue-800 dark:text-blue-300 transition-colors"
              >
                {{ flight.flightNumber }}
              </span>
            </TableCell>
            <TableCell class="px-4 py-4 w-[28%]">
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  class="text-gray-700 dark:text-gray-300 font-medium transition-colors"
                >
                  {{ flight.route }}
                </span>
              </div>
            </TableCell>
            <TableCell class="px-4 py-4 w-[20%]">
              <div class="flex flex-col items-center space-y-2">
                <div class="relative">
                  <div
                    class="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/20 rounded-full animate-ping"
                  />
                  <div
                    class="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-100/50 dark:ring-blue-900/30"
                  />
                </div>
                <span
                  class="text-gray-900 dark:text-gray-100 font-medium tabular-nums"
                >
                  {{ flight.departure }}
                </span>
              </div>
            </TableCell>
            <TableCell class="px-4 py-4 w-[20%] text-center">
              <div class="flex flex-col items-center space-y-2">
                <div class="relative">
                  <div
                    class="absolute inset-0 bg-green-100/50 dark:bg-green-900/20 rounded-full animate-ping"
                  />
                  <div
                    class="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-100/50 dark:ring-green-900/30"
                  />
                </div>
                <span class="text-gray-900 dark:text-gray-100">{{
                  flight.arrival
                }}</span>
              </div>
            </TableCell>
            <TableCell class="pr-6 py-4 w-[20%] text-right">
              <Badge
                v-if="statusConfig[flight.status]"
                :class="`px-4 py-2 bg-gradient-to-r ${
                  statusConfig[flight.status].color
                } text-white 
                       transition-all hover:scale-[1.02] rounded-[8px] shadow-sm 
                       dark:shadow-black/30 group-hover:shadow-md`"
              >
                <div class="flex items-center space-x-2">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :d="statusConfig[flight.status].icon"
                    />
                  </svg>
                  <span class="font-medium">{{ flight.status }}</span>
                </div>
              </Badge>
              <Badge v-else class="px-4 py-2 bg-gray-400 text-white">
                未知状态
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </Card>
</template>
```
