import express from "express";
import { storage } from "../storage";
import type { Finding, Fact } from "@shared/schema";

const app = express();
app.use(express.json());

const MCP_PORT = parseInt(process.env.MCP_PORT || "3001", 10);

app.post("/tools/search_facts", async (req, res) => {
  try {
    const { query, lang } = req.body as { query?: string; lang?: string };
    
    if (!query) {
      return res.status(400).json({ success: false, error: "query parameter is required" });
    }

    let facts = await storage.searchFacts(query);
    
    if (lang && (lang === "fr" || lang === "nl")) {
      facts = facts.filter((f: Fact) => f.lang === lang);
    }

    res.json({ success: true, data: facts });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post("/tools/list_findings", async (req, res) => {
  try {
    const { run_id, type, min_severity } = req.body as { 
      run_id: string; 
      type?: string; 
      min_severity?: number 
    };
    
    if (!run_id) {
      return res.status(400).json({ success: false, error: "run_id parameter is required" });
    }

    let findings = await storage.getFindingsByRun(run_id);
    
    if (type) {
      findings = findings.filter((f: Finding) => f.type === type);
    }
    
    if (min_severity !== undefined) {
      findings = findings.filter((f: Finding) => f.severity >= min_severity);
    }

    res.json({ success: true, data: findings });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.get("/tools", (_req, res) => {
  res.json({
    tools: [
      {
        name: "search_facts",
        description: "Search verified facts in the database",
        parameters: {
          query: { type: "string", required: true, description: "Search query string" },
          lang: { type: "string", required: false, description: "Filter by language: 'fr' or 'nl'" }
        }
      },
      {
        name: "list_findings",
        description: "List findings from an audit run",
        parameters: {
          run_id: { type: "string", required: true, description: "Audit run ID" },
          type: { type: "string", required: false, description: "Filter by finding type: incorrect, outdated, ungrounded, drift" },
          min_severity: { type: "number", required: false, description: "Minimum severity threshold (0-1)" }
        }
      }
    ]
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export function startMcpServer() {
  app.listen(MCP_PORT, "0.0.0.0", () => {
    console.log(`[MCP] Tool server running on http://0.0.0.0:${MCP_PORT}`);
    console.log(`[MCP] Available endpoints:`);
    console.log(`  GET  /tools - List available tools`);
    console.log(`  POST /tools/search_facts - Search facts`);
    console.log(`  POST /tools/list_findings - List findings`);
  });
}

if (require.main === module) {
  startMcpServer();
}
