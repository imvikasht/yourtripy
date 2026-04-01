import { GoogleGenAI } from "@google/genai";
import { readFileSync } from 'fs';

let env = '';
try {
  env = readFileSync('./.env.local', 'utf-8');
} catch (e) {}
const match = env.match(/GEMINI_API_KEY=([^\n]+)/); // or similar
const apiKey = match ? match[1].trim() : undefined;

const ai = new GoogleGenAI({ apiKey });

async function run() {
  const models = await ai.models.list();
  for await (const model of models) {
    if (model.name.includes("flash") || model.name.includes("pro")) {
      console.log(model.name, "=>", model.supportedGenerationMethods);
    }
  }
}
run();
