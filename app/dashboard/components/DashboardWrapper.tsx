"use client";

import React, { useState, useEffect } from 'react';
import ReviewSubmitForm from './ReviewSubmitForm';
import CustomerMoodDashboard from './CustomerMoodDashboard';
import { ReviewData } from '../reviewsubmit/page';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs'; // ✅ Imported and ready

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string
);

interface DashboardWrapperProps {
    initialData: ReviewData[];
}

export default function DashboardWrapper({ initialData }: DashboardWrapperProps) {
    const [reviews, setReviews] = useState<ReviewData[]>(initialData);

    const triggerSilentSync = async () => {
        try {
            const response = await fetch('/api/reviews');
            const json = await response.json();
            if (json.success) setReviews(json.data);
        } catch (err) {
            // ✅ Capture background state synchronization crashes automatically
            Sentry.captureException(err, { tags: { mechanism: "silent_sync_refetch" } });
            console.error("Sync error:", err);
        }
    };

    useEffect(() => {
        const channel = supabase
            .channel('realtime-tenant-feed')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'customer_reviews'
                },
                (payload) => {
                    const newRow = payload.new as ReviewData;

                    setReviews((prev) => {
                        const cleaned = prev.filter(
                            (item) => !(item.raw_review_text === newRow.raw_review_text && item.isOptimistic)
                        );

                        if (cleaned.some(item => item.id === newRow.id)) return prev;

                        return [newRow, ...cleaned];
                    });
                }
            )
            .subscribe((status) => {
                // ✅ Monitor socket connections. If a websocket disconnects or crashes, log it!
                if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                    Sentry.captureMessage(`Supabase Realtime Connection Issue: ${status}`, "warning");
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        // ✅ PRODUCTION PORTFOLIO SHIELD: Protects chart rendering loops from unexpected runtime exceptions
        <Sentry.ErrorBoundary
            fallback={
                <div className="p-8 text-center bg-rose-50/60 border border-rose-200 rounded-2xl max-w-xl mx-auto mt-12 shadow-sm text-slate-800">
                    <span className="text-3xl">⚠️</span>
                    <h2 className="text-lg font-bold text-rose-800 mt-2 mb-1">Dashboard Component Crashed</h2>
                    <p className="text-sm text-rose-600/90 mb-4 max-w-md mx-auto">
                        An error occurred while parsing real-time chart states. The technical layout summary log has been piped directly to Sentry pipelines.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
                    >
                        🔄 Force Re-sync Workspace
                    </button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4">
                    <ReviewSubmitForm
                        setReviews={setReviews}
                        onRollback={triggerSilentSync}
                    />
                </div>
                <div className="lg:col-span-8">
                    <CustomerMoodDashboard
                        reviewsData={reviews}
                        isLoading={false}
                    />
                </div>
            </div>
        </Sentry.ErrorBoundary>
    );
}
