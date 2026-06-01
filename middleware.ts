import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh token if expired - critical for maintaining session state
    const { data: { user } } = await supabase.auth.getUser();

    // PROTECTIVE ROUTING GATEWAY:
    // If user is logged out and trying to view dashboard pages -> redirect to login
    //if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    //    return NextResponse.redirect(new URL('/login', request.url));
    //}
    const currentPath = request.nextUrl.pathname;

    // 2. ENHANCED PROTECTIVE ROUTING GATEWAY:
    // Block access if they are logged out AND trying to open the dashboard OR the base root page
    if (!user && (currentPath.startsWith('/dashboard') || currentPath === '/')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Keep a logged-in user from manually navigating backwards to the login page
    if (user && currentPath === '/login') {
        // Look up their role and send them to the correct section instead!
        return NextResponse.redirect(new URL('/dashboard/reviewsubmit', request.url));
    }

    return response;
}

// Only run middleware on dashboard paths to optimize performance
export const config = {
    matcher: ['/','/dashboard/:path*'],
};
