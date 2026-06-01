// app/api/aisupporthub/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ✅ 1. REGEX SANITIZER: Instantly strips out clear structural data leaks
function sanitizePII(text: string): string {
    if (!text) return "";
    let sanitized = text;
    // Strip Credit Cards
    sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,16}\b/g, "[REDACTED_CREDIT_CARD]");
    // Strip Emails
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");
    // Strip Phone Numbers
    sanitized = sanitized.replace(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/g, "[REDACTED_PHONE]");
    return sanitized;
}

// ✅ 2. ZOD STRUCURAL SCHEMA VALIDATOR
const searchPayloadSchema = z.object({
    userQuery: z.string().min(3, "Query must be at least 3 characters long"),
    existingData: z.string().min(10, "Context data is required to run a query"),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit

export async function POST(req: Request) {
    let currentMechanism = "unknown_payload";

    try {
        const contentType = req.headers.get("content-type") || "";
        let textToAnalyze = "";
        let isSearchQuery = false;
        let userQuery = "";

        if (contentType.includes("application/json")) {
            const body = await req.json();

            // Validate structure with Zod
            const validation = searchPayloadSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json(
                    { error: "Validation failed", details: validation.error.format() },
                    { status: 400 }
                );
            }

            userQuery = validation.data.userQuery;
            textToAnalyze = validation.data.existingData;
            isSearchQuery = true;
        } else {
            currentMechanism = "bulk_file_upload";
            const formData = await req.formData();
            const file = formData.get("file") as File;
            if (!file) {
                return NextResponse.json({ error: "No file provided" }, { status: 400 });
            }
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ error: "File size exceeds 5MB protective ceiling" }, { status: 400 });
            }

            const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
            currentMechanism = `bulk_file_upload_type_${fileExt}`;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                const pdfModule = await import("pdf-parse-fork");
                let rawParser: unknown = pdfModule;

                if (rawParser && typeof rawParser === "object" && "default" in rawParser) {
                    rawParser = (rawParser as { default: unknown }).default;
                }
                if (rawParser && typeof rawParser === "object" && "default" in rawParser) {
                    rawParser = (rawParser as { default: unknown }).default;
                }

                const parsePdf = rawParser as (dataBuffer: Buffer) => Promise<{ text: string }>;
                if (typeof parsePdf !== "function") {
                    throw new Error("PDF parsing library resolution failed.");
                }

                const pdfData = await parsePdf(buffer);
                textToAnalyze = pdfData.text;
            }
            else if (
                file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                file.type === "application/vnd.ms-excel" ||
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xls")
            ) {
                const workbook = XLSX.read(buffer, { type: "buffer" });
                let sheetDataText = "";
                workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const textContent = XLSX.utils.sheet_to_txt(worksheet);
                    if (textContent.trim()) {
                        sheetDataText += `[Sheet Name: ${sheetName}]\n${textContent}\n\n`;
                    }
                });
                textToAnalyze = sheetDataText;
            }
            else {
                textToAnalyze = await file.text();
            }
        }

        // ✅ 3. FIREWALL SANITIZATION LAYER RUNS HERE
        textToAnalyze = sanitizePII(textToAnalyze);

        if (!textToAnalyze || !textToAnalyze.trim()) {
            return NextResponse.json(
                { error: "Could not extract legible text content from the document." },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // ✅ 4. COMPLIANCE PROMPTS
        let prompt = "";
        if (isSearchQuery) {
            prompt = `
        You are a data analyst. Based on this historical context: "${textToAnalyze}", 
answer this specific user question: "${userQuery}".

🚨 COMPLIANCE DIRECTIVE: If the text contains any explicit personal credentials or locations, ensure they are masked or replaced with "[REDACTED]" inside your output responses.

If the query asks for something that does not exist in the data, do not error out. Instead, state clearly in the "summary" that no such items were found, and provide empty or original arrays/objects for the remaining keys.

You MUST return a JSON object matching this exact TypeScript structure:
{
  "summary": string, 
  "actionItems": string[], 
  "customerMood": Array<{ name: string, value: number }>, 
  "emailDrafts": { chefEmail: string } 
}
      `;
        } else {
            prompt = `
  Analyze the following customer reviews:
  "${textToAnalyze}"

  You must categorize the sentiment of these reviews and find the top problems.

  🚨 COMPLIANCE DIRECTIVE (GDPR/HIPAA): If the raw reviews text contain home addresses or full social security codes, ensure they are overwritten with "[REDACTED]" in your answers.

  Return ONLY a JSON object with this exact structure:
  {
    "summary": "3 sentence overall sentiment summary here",
    "actionItems": ["Top problem 1 to fix", "Top problem 2 to fix", "Top problem 3 to fix"],
    "customerMood": [
      { "name": "Happy", "value": 0 },
      { "name": "Neutral", "value": 0 },
      { "name": "Frustrated", "value": 0 },
      { "name": "Excited", "value": 0 },
      { "name": "Disappointed", "value": 0 }
    ],
    "emailDrafts": {
      "chefEmail": "Draft text here"
    }
  }
`;
        }

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Model failed to output a valid JSON payload.");
        }

        const parsedData = JSON.parse(jsonMatch[0].trim());
        return NextResponse.json(parsedData);

    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                endpoint: "/api/aisupporthub",
                mechanism: currentMechanism
            }
        });
        console.error("Endpoint Engine Crash:", error);
        return NextResponse.json({ error: "Internal AI processing cluster failed" }, { status: 500 });
    }
}
