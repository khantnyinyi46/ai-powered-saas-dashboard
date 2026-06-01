"use client";

import { useState } from 'react';
import { loginUser, signUpUser } from './action'; // Adjusted path if needed

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        const formData = new FormData(e.currentTarget);

        // Execute the correct server action block directly
        const result = (isSignUp
            ? await signUpUser(formData)
            : await loginUser(formData)) as { error?: string; success?: string } | undefined;

        setLoading(false);

        if (result?.error) {
            setErrorMsg(result.error);
        } else if (result?.success) {
            setSuccessMsg(result.success);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-slate-800 text-center">
                    {isSignUp ? "Create Tenant Account" : "SaaS Dashboard Login"}
                </h2>

                {errorMsg && <p className="text-xs bg-red-50 text-red-500 p-2.5 rounded-lg border border-red-100 font-medium">{errorMsg}</p>}
                {successMsg && <p className="text-xs bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100 font-medium">{successMsg}</p>}

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Company Email</label>
                    <input name="email" type="email" required className="w-full border rounded-lg p-2 text-sm bg-slate-50" placeholder="name@company.com" />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
                    <input name="password" type="password" required className="w-full border rounded-lg p-2 text-sm bg-slate-50" placeholder="Enter your password" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-800 transition disabled:bg-slate-400">
                    {loading ? "Processing Secure Gateway..." : isSignUp ? "Sign Up" : "Sign In"}
                </button>

                <p className="text-xs text-center text-slate-500 mt-2 cursor-pointer hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </p>
            </form>
        </div>
    );
}
