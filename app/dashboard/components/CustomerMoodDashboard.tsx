"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ReviewData } from '../reviewsubmit/page';

const MOOD_COLORS: Record<string, string> = {
    Happy: '#10B981',       // Emerald Green
    Neutral: '#64748B',     // Slate Grey
    Frustrated: '#EF4444',  // Bright Red
    Excited: '#3B82F6',     // Electric Blue
    Disappointed: '#F59E0B' // Amber Orange
};

const FALLBACK_COLORS = ['#10B981', '#64748B', '#EF4444', '#F59E0B', '#3B82F6'];

interface CustomerMoodDashboardProps {
    reviewsData: ReviewData[];
    isLoading: boolean;
}

export default function CustomerMoodDashboard({ reviewsData, isLoading }: CustomerMoodDashboardProps) {
    const chartData = useMemo(() => {
        if (!reviewsData || reviewsData.length === 0) return [];

        const counts: Record<string, number> = {
            Happy: 0,
            Neutral: 0,
            Frustrated: 0,
            Excited: 0,
            Disappointed: 0
        };

        reviewsData.forEach((review) => {
            const mood = review.classified_mood || 'Neutral';
            if (mood in counts) {
                counts[mood]++;
            } else {
                // Dynamic handling for capitalization edge cases
                const formalizedMood = mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
                if (formalizedMood in counts) {
                    counts[formalizedMood]++;
                } else {
                    counts['Neutral']++;
                }
            }
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .filter((item) => item.value > 0);
    }, [reviewsData]);
    // Isolated Side-Effect management prevents cascading renders

    return (
        <div className="lg:col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full min-w-0">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800">Customer Mood Breakdown</h2>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">
                    Real-Time Sentiment
                </span>
            </div>

            <div className="h-[350px] w-full min-w-0 flex items-center justify-center">
                {!isLoading && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={350}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={MOOD_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400"></div>
                                <span>Re-aggregating real-time charts...</span>
                            </>
                        ) : (
                            <span className="text-center max-w-xs text-slate-400">
                                No feedback history captured yet. Type an entry on the form to watch it generate!
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
