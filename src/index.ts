#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  createUiTool,
  readFullDocTool,
  readUsageDocTool,
} from "./tools/shadcn-ui-tool.js";

const VERSION = "0.0.35";
const server = new McpServer({
  name: "shadcn-ui",
  version: VERSION,
});
// Register tools
new readUsageDocTool().register(server);
new readFullDocTool().register(server);
new createUiTool().register(server);

async function runServer() {
  const transport = new StdioServerTransport();
  console.log(`Starting server v${VERSION} (PID: ${process.pid})`);

  let isShuttingDown = false;

  const cleanup = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`Shutting down server (PID: ${process.pid})...`);
    try {
      transport.close();
    } catch (error) {
      console.error(`Error closing transport (PID: ${process.pid}):`, error);
    }
    console.log(`Server closed (PID: ${process.pid})`);
    process.exit(0);
  };

  transport.onerror = (error: Error) => {
    console.error(`Transport error (PID: ${process.pid}):`, error);
    cleanup();
  };

  transport.onclose = () => {
    console.log(`Transport closed unexpectedly (PID: ${process.pid})`);
    cleanup();
  };

  process.on("SIGTERM", () => {
    console.log(`Received SIGTERM (PID: ${process.pid})`);
    cleanup();
  });

  process.on("SIGINT", () => {
    console.log(`Received SIGINT (PID: ${process.pid})`);
    cleanup();
  });

  process.on("beforeExit", () => {
    console.log(`Received beforeExit (PID: ${process.pid})`);
    cleanup();
  });

  await server.connect(transport);
  console.log(`Server started (PID: ${process.pid})`);
}

runServer().catch((error) => {
  console.error(`Fatal error running server (PID: ${process.pid}):`, error);
  if (!process.exitCode) {
    process.exit(1);
  }
});
