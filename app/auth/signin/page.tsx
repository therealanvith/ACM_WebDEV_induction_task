"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Check, AlertCircle } from "lucide-react";

function SignInContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Sign in failed:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto py-8">
      {/* Centered Brutalist Card */}
      <div className="border border-outline bg-surface grid grid-cols-1 md:grid-cols-5">
        {/* Left Side: Brand & Benefits */}
        <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-outline p-6 sm:p-8 flex flex-col justify-between bg-surface-container-low">
          <div>
            <div className="font-serif text-lg font-bold text-primary uppercase mb-6">
              Campus Found
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-primary font-bold leading-tight mb-6">
              Sign in to Campus Lost & Found
            </h1>
          </div>

          <div className="space-y-5 mt-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-4 h-4 border border-primary flex items-center justify-center bg-primary text-on-primary">
                <Check className="w-3 h-3 text-on-primary stroke-[3]" />
              </div>
              <div>
                <div className="font-label-md text-xs text-primary uppercase font-bold mb-1">
                  Claim what&apos;s yours
                </div>
                <div className="font-body text-xs text-on-surface-variant leading-relaxed">
                  Only you can confirm it&apos;s your item.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-4 h-4 border border-primary flex items-center justify-center bg-primary text-on-primary">
                <Check className="w-3 h-3 text-on-primary stroke-[3]" />
              </div>
              <div>
                <div className="font-label-md text-xs text-primary uppercase font-bold mb-1">
                  Know the moment it turns up
                </div>
                <div className="font-body text-xs text-on-surface-variant leading-relaxed">
                  Get pinged instantly when a match appears.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-4 h-4 border border-primary flex items-center justify-center bg-primary text-on-primary">
                <Check className="w-3 h-3 text-on-primary stroke-[3]" />
              </div>
              <div>
                <div className="font-label-md text-xs text-primary uppercase font-bold mb-1">
                  Built for campus
                </div>
                <div className="font-body text-xs text-on-surface-variant leading-relaxed">
                  Made for students, by students — no clutter, no spam.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 w-4 h-4 border border-primary flex items-center justify-center bg-primary text-on-primary">
                <Check className="w-3 h-3 text-on-primary stroke-[3]" />
              </div>
              <div>
                <div className="font-label-md text-xs text-primary uppercase font-bold mb-1">
                  Simple & Fast
                </div>
                <div className="font-body text-xs text-on-surface-variant leading-relaxed">
                  Post in seconds, get notified just as fast.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Google Sign In & Auth Form */}
        <div className="md:col-span-3 p-6 sm:p-10 flex flex-col justify-center bg-surface space-y-6">
          <div>
            <h2 className="font-label-md text-xs text-primary uppercase tracking-widest border-b border-outline pb-2 inline-block font-bold">
              Authentication
            </h2>
          </div>

          {errorParam && (
            <div className="p-3 bg-surface border border-error text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {errorParam === "OAuthSignin" || errorParam === "OAuthCallback"
                  ? "Could not sign in with Google. Please try again."
                  : "Authentication failed. Please try again."}
              </span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading || status === "loading"}
            className="w-full flex items-center justify-center gap-3 border border-outline p-4 font-label-md text-xs uppercase tracking-wider text-primary hover:bg-surface-container-high font-bold"
            type="button"
          >
            {isLoading || status === "loading" ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 fill-current group-hover:text-on-primary" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
