"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginUser(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );

    // 1. Authenticate user credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError || !authData.user) {
        return { error: authError?.message || "Authentication failed" };
    }

    // 2. Fetch the user's explicit role from the database
    const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role_type')
        .eq('user_id', authData.user.id)
        .single();

    // 3. Conditional Routing Decision Logic
    if (roleData?.role_type === 'SupportAgent') {
        // Support agents go directly to the manual form input station
        redirect("/dashboard/reviewsubmit");
    } else if (roleData?.role_type === 'Manager') {
        // Executives/Managers go straight to the document summary & AI search engine hub
        redirect("/dashboard/aisupporthub");
    } else {
        // Fallback safety route if no explicit profile configuration is found
        redirect("/dashboard/reviewsubmit");
    }
}

export async function signUpUser(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) return { error: error.message };
    return { success: "Check your email for the confirmation link!" };
}

export async function signOutUser() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );

    // 1. Invalidate the active session on Supabase servers
    await supabase.auth.signOut();

    // 2. Clear out all auth cookies from the browser tray
    cookieStore.delete("sb-access-token");
    cookieStore.delete("sb-refresh-token");

    // 3. Forcefully redirect the user back to the login screen
    redirect("/login");
}