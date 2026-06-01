import Image from "next/image";
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Home() {
    redirect('/login');
//  return (
//    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//        <h1>AI-Powered-Saas-Dashboard</h1>
//              <Image
//          className="dark:invert"
//          src="/next.svg"
//          alt="Next.js logo"
//          width={100}
//          height={20}
//          priority
//        />
//        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//            Explore your personal dashboard options below.
//          </h1>
//          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//            Need real-time assistance or want to analyze client data?
//            Head over to the AI Support Hub or check out the Customer Insights panel.
//          </p>
//        </div>
//        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//          <Link
//            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[200px]"
//            href="/dashboard/aisupporthub"
//          >
//            <Image
//              className="dark:invert"
//              src="/vercel.svg"
//              alt="Vercel logomark"
//              width={20}
//              height={20}
//            />
//            AI-Support Hub
//          </Link>
//          <Link 
//            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[200px]"
//            href="/dashboard/reviewsubmit"
//          >
//            Review Submit
//          </Link>
//        </div>
//      </main>
//    </div>
//  );
}
