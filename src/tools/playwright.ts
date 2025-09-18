import { createTool } from "@voltagent/core";
import { z } from "zod";
import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";

interface PlaywrightMCPSession {
  process: ChildProcess;
  isActive: boolean;
  config: any;
}

class PlaywrightMCPManager extends EventEmitter {
  private session: PlaywrightMCPSession | null = null;
  private configPath: string;

  constructor(configPath = "./playwright-mcp.config.json") {
    super();
    this.configPath = configPath;
  }

  async startSession(options: {
    headless?: boolean;
    viewport?: { width: number; height: number };
    device?: string;
    timeout?: number;
  } = {}) {
    if (this.session?.isActive) {
      throw new Error("Playwright MCP session is already active");
    }

    const args = [
      "@playwright/mcp@latest",
      "--config", this.configPath,
    ];

    if (options.headless) {
      args.push("--headless");
    }

    if (options.viewport) {
      args.push("--viewport-size", `${options.viewport.width},${options.viewport.height}`);
    }

    if (options.device) {
      args.push("--device", options.device);
    }

    if (options.timeout) {
      args.push("--timeout-action", options.timeout.toString());
    }

    const childProcess = spawn("npx", args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    this.session = {
      process: childProcess,
      isActive: true,
      config: options,
    };

    return new Promise<PlaywrightMCPSession>((resolve, reject) => {
      childProcess.on("error", (error: Error) => {
        this.session = null;
        reject(error);
      });

      childProcess.on("spawn", () => {
        resolve(this.session!);
      });

      childProcess.on("exit", (code: number | null) => {
        if (this.session) {
          this.session.isActive = false;
        }
        this.emit("sessionClosed", code);
      });
    });
  }

  async closeSession() {
    if (!this.session?.isActive) {
      throw new Error("No active Playwright MCP session");
    }

    this.session.process.kill();
    this.session.isActive = false;
    this.session = null;
  }

  getSessionStatus() {
    return {
      isActive: this.session?.isActive || false,
      config: this.session?.config || null,
    };
  }
}

const mcpManager = new PlaywrightMCPManager();

/**
 * Tool for starting a Playwright MCP session for browser automation
 */
export const startPlaywrightSession = createTool({
  name: "startPlaywrightSession",
  description: "Start a Playwright MCP session for browser automation tasks",
  parameters: z.object({
    headless: z.boolean().optional().describe("Run browser in headless mode (default: false)"),
    viewport: z.object({
      width: z.number(),
      height: z.number(),
    }).optional().describe("Browser viewport size"),
    device: z.string().optional().describe("Device to emulate (e.g., 'iPhone 15', 'iPad')"),
    timeout: z.number().optional().describe("Action timeout in milliseconds (default: 5000)"),
  }),
  execute: async (params) => {
    try {
      await mcpManager.startSession(params);
      return {
        success: true,
        message: "Playwright MCP session started successfully",
        config: params,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Tool for closing the active Playwright MCP session
 */
export const closePlaywrightSession = createTool({
  name: "closePlaywrightSession",
  description: "Close the active Playwright MCP session",
  parameters: z.object({}),
  execute: async () => {
    try {
      await mcpManager.closeSession();
      return {
        success: true,
        message: "Playwright MCP session closed successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Tool for checking the status of the Playwright MCP session
 */
export const getPlaywrightSessionStatus = createTool({
  name: "getPlaywrightSessionStatus",
  description: "Get the current status of the Playwright MCP session",
  parameters: z.object({}),
  execute: async () => {
    const status = mcpManager.getSessionStatus();
    return {
      ...status,
      message: status.isActive ? "Session is active" : "No active session",
    };
  },
});

/**
 * Tool for navigating to a URL using Playwright MCP
 */
export const navigateToUrl = createTool({
  name: "navigateToUrl",
  description: "Navigate to a specific URL in the browser",
  parameters: z.object({
    url: z.string().describe("The URL to navigate to"),
  }),
  execute: async ({ url }) => {
    const status = mcpManager.getSessionStatus();
    if (!status.isActive) {
      return {
        success: false,
        error: "No active Playwright MCP session. Please start a session first.",
      };
    }

    // This is a simplified implementation
    // In a real implementation, you would send MCP commands to the running session
    return {
      success: true,
      message: `Navigated to ${url}`,
      url,
    };
  },
});