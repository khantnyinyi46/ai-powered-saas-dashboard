import { createClient } from '@supabase/supabase-js';
//import DashboardWrapper from '@/components/DashboardWrapper'; // We will create this next
import DashboardWrapper from '../components/DashboardWrapper'; // Adjust path if needed
import LogoutButton from '../components/LogoutButton';

export interface ReviewData {
    id?: string;
    customer_name: string;
    raw_review_text: string;
    classified_mood: string;
    sentiment_score: number;
    created_at?: string;
    isOptimistic?: boolean;
}

// Direct, fast server-side database fetch
async function getInitialReviews(): Promise<ReviewData[]> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    const { data } = await supabase
        .from('customer_reviews')
        .select('id, customer_name, raw_review_text, classified_mood, sentiment_score, created_at')
        .order('created_at', { ascending: false });

    return (data as ReviewData[]) || [];
}

export default async function AnalyticsDashboardPage() {
    // 1. Data fetches securely on the server side during initial page loading
    const initialReviews = await getInitialReviews();

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            {/* 2. Feed the pre-fetched server data down directly into a client bridge wrapper */}
            <DashboardWrapper initialData={initialReviews} />
            <LogoutButton />
        </div>
    );
}
