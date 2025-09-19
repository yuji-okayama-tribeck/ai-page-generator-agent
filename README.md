<div align="center">
  <h1>⚡ agent</h1>
  <p>AI Agent powered by <a href="https://voltagent.dev">VoltAgent</a></p>
  
  <p>
    <a href="https://github.com/voltagent/voltagent"><img src="https://img.shields.io/badge/built%20with-VoltAgent-blue" alt="Built with VoltAgent" /></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node Version" /></a>
  </p>
</div>

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- Git
- OpenAI API Key (optional - can configure later)
  - Get your key at: https://platform.openai.com/api-keys

### Installation

```bash
# Clone the repository (if not created via create-voltagent-app)
git clone <your-repo-url>
cd agent

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Configuration

Edit `.env` file with your API keys:

```env
OPENAI_API_KEY=your-api-key-here

# VoltOps Platform (Optional)
# Get your keys at https://console.voltagent.dev/tracing-setup
# VOLTAGENT_PUBLIC_KEY=your-public-key
# VOLTAGENT_SECRET_KEY=your-secret-key
```

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### PlayWright Config
```
const mcpConfig = new MCPConfiguration({
  servers: {
    playwright: {
      type: "stdio",
      command: "npx",
      args: [
        "@playwright/mcp",
        "--headless",           // ヘッドレスモードで実行
        "--timeout=30000",      // タイムアウト設定（ミリ秒）
        "--viewport=1920x1080", // ビューポートサイズ
        "--user-agent=custom",  // カスタムユーザーエージェント
        "--slow-mo=1000",       // アクション間の遅延（ミリ秒）
        "--debug",              // デバッグモード
        "--trace",              // トレース記録
        "--video",              // ビデオ記録
        "--screenshot",         // スクリーンショット撮影
      ]
    },
  },
});
```

