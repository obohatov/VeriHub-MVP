import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const OPENAPI_PATH = resolve(process.cwd(), "openapi.yaml");

console.log("[openapi] OpenAPI specification is at:", OPENAPI_PATH);

try {
  const content = readFileSync(OPENAPI_PATH, "utf-8");
  console.log("[openapi] OpenAPI file exists with", content.split("\n").length, "lines");
  console.log("[openapi] To regenerate, update the openapi.yaml file directly");
} catch (error) {
  console.error("[openapi] OpenAPI file not found");
  process.exit(1);
}
