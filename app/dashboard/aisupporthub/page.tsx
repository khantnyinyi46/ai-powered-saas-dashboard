"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import LogoutButton from "../components/LogoutButton";

// ✅ 1. MOVE INTERFACE OUTSIDE THE FUNCTION
interface AnalysisResult {
    summary: string;
    actionItems: string[];
    customerMood: { name: string; value: number }[]; // Changed to match Pie Chart structure
    emailDrafts: { chefEmail: string };
}

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [query, setQuery] = useState("");
    const [isQuerying, setIsQuerying] = useState(false);
    const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // Green, Orange, Red


    const handleAskAI = async () => {
        if (!query || !result) return;
        setIsQuerying(true);
        setError("");
        try {
            const response = await fetch("/api/aisupporthub", {
                method: "POST",
                body: JSON.stringify({
                    userQuery: query,
                    existingData: result.summary // Send context
                }),
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) {
                // Read response text safely instead of calling .json() blindly
                const errorText = await response.text();
                throw new Error(errorText || "Failed to fetch AI answer");
            }
            const data = await response.json();
            setResult(data); // This updates the chart and summary dynamically
        } catch (err) {
            setError("Something went wrong during AI query processing.");
            console.error(err);
        }
        finally {
            setIsQuerying(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(""); // Clear previous errors
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/aisupporthub", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                //const errorData = await response.json();
                const errorText = await response.text();
                let errorMessage = "Failed to process file";
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError("Something went wrong during processing.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* 1. Upload Section */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed">
                <div className="flex flex-col items-center gap-4">
                    <input
                        type="file"
                        accept=".txt, .pdf, .xlsx, .xls, text/plain, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"
                    />
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? "AI is Analyzing..." : "Generate Dashboard"}
                    </button>
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                </div>
            </div>

            { /*1. Search Bar Results */}
            <div className="mt-8 flex gap-2">
                <input
                    type="text"
                    placeholder="Ask: 'Which branch had the most fries complaints?'"
                    className="flex-1 p-3 border rounded-lg shadow-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    onClick={handleAskAI}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold"
                >
                    {isQuerying ? "Asking..." : "Ask Data"}
                </button>
            </div>

            {/* 2. UI RESULTS SECTION */}
            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Summary Box */}
                    <div className="p-6 border rounded-xl shadow-sm bg-white border-slate-200">
                        <h3 className="font-bold text-xl mb-4 text-slate-800">AI Summary</h3>
                        <p className="text-slate-600 leading-relaxed mb-6">{result.summary}</p>

                        <h3 className="font-bold text-lg mb-2 text-slate-800">Priority Action Items:</h3>
                        <ul className="space-y-2">
                            {result.actionItems?.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-600">
                                    <span className="text-blue-500 font-bold">•</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* --- Customer Mood Pie Chart --- */}
                    <div className="lg:col-span-7 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-800">Customer Mood Breakdown</h2>
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">Real-time Sentiment</span>
                        </div>
                        <div className="h-[350px] w-full min-w-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={350}>
                                <PieChart>
                                    <Pie
                                        data={result.customerMood || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={75} // Makes it a Donut Chart
                                        outerRadius={105}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {result.customerMood.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>


                    {/* Email Generation Box */}
                    {/* Component wrapper with zero horizontal overflow */}
                    <div className="md:col-span-2 bg-slate-900 text-slate-100 p-6 rounded-xl shadow-lg w-full min-w-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Automated Email Draft</h2>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(result?.emailDrafts?.chefEmail || "");
                                    alert("Copied!");
                                }}
                                className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded shrink-0"
                            >
                                Copy to Clipboard
                            </button>
                        </div>

                        {/* Content Container box */}
                        <div className="w-full min-w-0 font-mono text-sm bg-slate-800 p-4 rounded border border-slate-700 text-slate-300 flex flex-col gap-4">

                            {/* Force Subject Line onto a single line with ellipsis protection if too long */}
                            <div className="font-bold text-slate-100 truncate w-full border-b border-slate-700 pb-2">
                                {result?.emailDrafts?.chefEmail?.split('\n')[0] || "Subject: (No Subject Provided)"}
                            </div>

                            {/* Body content with forced wrapping rules for continuous strings */}
                            <div className="whitespace-pre-line break-words [word-break:break-word] w-full">
                                {result?.emailDrafts?.chefEmail
                                    ? result.emailDrafts.chefEmail.split('\n').slice(1).join('\n').trim()
                                    : "No email body content available."
                                }
                            </div>
                        </div>
                    </div>

                </div>
            )}
            <LogoutButton />
        </div>
    );
}
