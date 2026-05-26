import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Inter } from "next/font/google";
import { Brain } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";

const inter = Inter({ subsets: ["latin"] });

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setReady(true);
      }
    });
  }, [router]);

  if (!ready) return null;

  return (
    <>
      <Head>
        <title>Dashboard — AgendAI</title>
      </Head>
      <div
        className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center`}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-[#164B2E] rounded-2xl p-3 shadow-md">
            <Brain className="text-white" size={32} />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Dashboard — în construcție
          </p>
        </div>
      </div>
    </>
  );
}
