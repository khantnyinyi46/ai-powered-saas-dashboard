"use client";

import { signOutUser } from "@/app/login/action"; 

export default function LogoutButton() {
    return (
        <button
            onClick={async () => {
                // Execute the secure backend cookie destruction process
                await signOutUser();
            }}
            className="px-4 py-2 text-sm font-medium text-black bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
        >
            🚪 Sign Out / Forget Me
        </button>
    );
}
