// app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
// Initialize the Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET() {
    try {
        // Fetch the full records so the frontend can populate both the chart and a text history list
        const { data, error } = await supabase
            .from('customer_reviews')
            .select('id, customer_name, raw_review_text, classified_mood, sentiment_score, created_at')
            .order('created_at', { ascending: false }); // Show newest submissions first

        if (error) throw error;

        // Return a clean success payload to matching your frontend await fetch('/api/reviews')
        return NextResponse.json({
            success: true,
            data: data || []
        }, { status: 200 });

    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                endpoint: "/api/reviews",
                method: "GET",
                layer: "database_fetch"
            }
        });
        console.error('Fetch Reviews API Error:', error);
        return NextResponse.json(
            { success: false, error: error || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
