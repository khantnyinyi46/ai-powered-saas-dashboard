"use client";

import React, { useState } from 'react';
import { ReviewData } from '../reviewsubmit/page';

// Define explicit types for your custom function handler prop
interface ReviewSubmitFormProps {
    setReviews: React.Dispatch<React.SetStateAction<ReviewData[]>>;
    onRollback: () => void;
}

export default function ReviewSubmitForm({ setReviews, onRollback }: ReviewSubmitFormProps) {
    const [customerName, setCustomerName] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !reviewText) return;

        const textSignature = reviewText.trim();

        const optimisticReview: ReviewData = {
            id: `temp-${Date.now()}`, // temporary client-side key
            customer_name: customerName,
            raw_review_text: textSignature,
            classified_mood: 'Neutral', // Baseline fallback assumption
            sentiment_score: 0.0,
            isOptimistic: true // Identifies it as a pending asset
        };
        setReviews(prev => [optimisticReview, ...prev]);
        setSubmitting(true);

        const savedName = customerName;
        const savedText = reviewText;
        setCustomerName('');
        setReviewText('');

        try {
            const response = await fetch('/api/process-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerName: savedName, reviewText: savedText }),
            });

            if (!response.ok) {
                throw new Error("Server rejected insert action");
            }

            setReviews(prev => prev.filter(item => item.id !== optimisticReview.id));
            
        } catch (err) {
            console.error('Failed to submit review:', err);
            alert('Submission failed.');

            // Restore text to inputs so the user doesn't lose their data
            setCustomerName(savedName);
            setReviewText(savedText);
            setReviews(prev => prev.filter(item => item.id !== optimisticReview.id));
            onRollback(); // Trigger a refresh of the reviews list to restore original state
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800">Submit Customer Review</h3>
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name</label>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-slate-50"
                    placeholder="John Doe"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Review Text</label>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-slate-50 h-24 resize-none"
                    placeholder="Type or paste unstructured user feedback here..."
                />
            </div>
            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-800 transition disabled:bg-slate-300"
            >
                {submitting ? 'Injecting Optimistically...' : 'Analyze Sentiment'}
            </button>
        </form>
    );
}
