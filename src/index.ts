import "dotenv/config";
import { VoltAgent, VoltOpsClient, Agent, Memory, MCPConfiguration } from "@voltagent/core";
import { LibSQLMemoryAdapter } from "@voltagent/libsql";
import { createPinoLogger } from "@voltagent/logger";
import { openai } from "@ai-sdk/openai";
import { honoServer } from "@voltagent/server-hono";
import { expenseApprovalWorkflow } from "./workflows";

// Create a logger instance
const logger = createPinoLogger({
  name: "agent",
  level: "info",
});

// Configure persistent memory (LibSQL / SQLite)
const memory = new Memory({
  storage: new LibSQLMemoryAdapter({
    url: "file:./.voltagent/memory.db",
    logger: logger.child({ component: "libsql" }),
  }),
});


const mcpConfig = new MCPConfiguration({
  servers: {
    playwright: {
      type: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest", "--config", "./playwright-mcp.config.json"]
    }
  },
});

const agent = new Agent({
  name: "agent",
  instructions: "playwright-mcpを用いてブラウザ操作を行う。",
  model: openai("gpt-4o-mini"),
  tools: [
    ...(await mcpConfig.getTools())
  ],
  memory,
});

new VoltAgent({
  agents: {
    agent,
  },
  workflows: {
    expenseApprovalWorkflow,
  },
  server: honoServer(),
  logger,
  voltOpsClient: new VoltOpsClient({
    publicKey: process.env.VOLTAGENT_PUBLIC_KEY || "",
    secretKey: process.env.VOLTAGENT_SECRET_KEY || "",
  }),
});
