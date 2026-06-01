import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { GoogleGenAI, Type } from '@google/genai';
// 1. Import the official Next.js API types
import { NextResponse } from 'next/server';
import { sanitizePII } from '@/lib/sanitize';
import { cookies } from 'next/headers';
import * as Sentry from '@sentry/nextjs';

//const supabase = createClient(
//    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
//    process.env.SUPABASE_SERVICE_ROLE_KEY as string
//);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // ✅ Uses the publishable browser key for RLS compliance
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    // 🌟 FIX: Add explicit TypeScript type shapes to prevent the 'any' compiler error
                    setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options as Record<string, string | boolean | number | Date | undefined>)
                            );
                        } catch {
                            // The `setAll` method can be ignored if the middleware handles cookie refreshes
                        }
                    },
                },
            }
        );

        // 2. Authenticate the active tenant user securely
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
        }

        // 1. App Router requires parsing the body manually via .json()
        const { customerName, reviewText } = await req.json();
        const cleanReviewText = sanitizePII(reviewText);
        // 2. Database Safeguard: Fallback to 'Anonymous' if customerName is null/missing
        const safeCustomerName = customerName && customerName.trim() !== "" ? customerName : "Anonymous";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this user review and extract customer sentiment values: "${cleanReviewText}"`,
            config: {
                systemInstruction: "You are a precise dashboard metrics service. Categorize customer sentiment strictly into one of the allowed enums, and give a score decimal from -1.00 to 1.00.SECURITY RULE: If the review text still contains private data such as home addresses, social security numbers, or full corporate accounts, ensure they are omitted or labeled as [REDACTED] in any internal processing logs.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mood: {
                            type: Type.STRING,
                            enum: ['Happy', 'Neutral', 'Frustrated', 'Excited', 'Disappointed'],
                            description: "The primary sentiment category that best represents the customer review.",
                        },
                        score: {
                            type: Type.NUMBER,
                            description: "Sentiment classification floating rating score from -1.0 to 1.0.",
                        },
                    },
                    required: ["mood", "score"],
                },
            },
        });

        const analysis = JSON.parse(response.text as string);

        const { data, error } = await supabase
            .from('customer_reviews')
            .insert([
                {
                    user_id: user.id,
                    customer_name: safeCustomerName, // Uses the safe fallback value
                    raw_review_text: cleanReviewText,
                    classified_mood: analysis.mood,
                    sentiment_score: analysis.score,
                }
            ]).select();

        if (error) throw error;

        // 3. App Router response syntax
        return NextResponse.json({ success: true, saved: data ? data[0]:null });

    } catch (err) {
        Sentry.captureException(err);
        console.error("Gemini Processor Error:", err);
        // Correct App Router error syntax
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
