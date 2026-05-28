import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Inter, Poppins } from "next/font/google";
import { Brain, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });

type Mode = "loading" | "form" | "success" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token") ?? "";

    if (!accessToken) {
      setMode("invalid");
      return;
    }

    supabaseClient.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: err }) => {
        if (err) {
          setMode("invalid");
        } else {
          setMode("form");
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: updateError } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
    } else {
      setMode("success");
      setTimeout(() => router.replace("/login"), 2000);
    }
  }

  const wrapper = `${inter.variable} ${poppins.variable} font-sans min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4`;

  if (mode === "loading") {
    return (
      <div className={wrapper}>
        <div className="text-sm text-gray-400 animate-pulse">Se verifică...</div>
      </div>
    );
  }

  if (mode === "invalid") {
    return (
      <>
        <Head><title>Link invalid — AgendAI</title></Head>
        <div className={wrapper}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-[#164B2E] rounded-2xl p-3 shadow-md">
              <Brain className="text-white" size={32} />
            </div>
            <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
              Link invalid sau expirat
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Linkul de resetare a parolei este invalid sau a expirat. Solicită un link nou de la pagina de autentificare.
            </p>
            <button
              onClick={() => router.replace("/login")}
              className="mt-2 bg-[#164B2E] hover:bg-[#0d2819] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Înapoi la autentificare
            </button>
          </div>
        </div>
      </>
    );
  }

  if (mode === "success") {
    return (
      <>
        <Head><title>Parolă actualizată — AgendAI</title></Head>
        <div className={wrapper}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
              <CheckCircle size={36} className="text-[#164B2E] dark:text-green-400" />
            </div>
            <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
              Parola a fost schimbată cu succes!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ești redirecționat către pagina de autentificare...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Resetează parola — AgendAI</title></Head>
      <div className={wrapper}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#164B2E] rounded-2xl p-3 mb-4 shadow-md">
              <Brain className="text-white" size={32} />
            </div>
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Parolă nouă
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Alege o parolă nouă pentru contul tău
            </p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* New password */}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Parolă nouă
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#164B2E] focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((p) => !p)}
                    aria-label={showNew ? "Ascunde parola" : "Arată parola"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirmă parola
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#164B2E] focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    aria-label={showConfirm ? "Ascunde parola" : "Arată parola"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-2.5 text-sm transition-colors duration-200 mt-1"
              >
                {submitting ? "Se salvează..." : "Salvează parola"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
