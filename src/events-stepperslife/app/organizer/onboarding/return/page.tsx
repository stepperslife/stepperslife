"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function StripeConnectReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convex = useConvex();

  const [status, setStatus] = useState<"loading" | "success" | "incomplete" | "error">("loading");
  const [message, setMessage] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);

  useEffect(() => {
    async function verifyAccount() {
      try {
        // Get Stripe account info from Convex
        const stripeInfo = await convex.query(api.users.queries.getStripeConnectAccount);

        if (!stripeInfo?.stripeConnectedAccountId) {
          setStatus("error");
          setMessage("No Stripe account found. Please try connecting again.");
          return;
        }

        // Check account status with Stripe
        const response = await fetch(
          `/api/stripe/account-status?accountId=${stripeInfo.stripeConnectedAccountId}`
        );

        if (!response.ok) {
          throw new Error("Failed to check account status");
        }

        const accountStatus = await response.json();

        if (accountStatus.isComplete) {
          // Mark account as complete in Convex
          await convex.mutation(api.users.mutations.markStripeAccountComplete);

          setStatus("success");
          setMessage("Your Stripe account is set up and ready to receive payments!");

          // Redirect to settings after 2 seconds
          setTimeout(() => {
            router.push("/organizer/settings?stripe=success");
          }, 2000);
        } else {
          // Account needs more information
          setStatus("incomplete");
          setMessage("Your Stripe account needs additional information.");
          setRequirements(accountStatus.requirements?.currentlyDue || []);
        }
      } catch (error) {
        console.error("[Stripe Connect] Verification error:", error);
        setStatus("error");
        setMessage("Failed to verify your Stripe account. Please try again.");
      }
    }

    verifyAccount();
  }, [convex, router]);

  const handleContinue = () => {
    router.push("/organizer/settings");
  };

  const handleRetryOnboarding = async () => {
    try {
      const stripeInfo = await convex.query(api.users.queries.getStripeConnectAccount);

      if (!stripeInfo?.stripeConnectedAccountId) {
        router.push("/organizer/settings");
        return;
      }

      // Redirect to refresh page
      router.push("/organizer/onboarding/refresh");
    } catch (error) {
      console.error("[Stripe Connect] Retry error:", error);
      router.push("/organizer/settings");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Account</h2>
            <p className="text-gray-600">Please wait while we verify your Stripe account setup...</p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Set!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting you to settings...
            </p>
          </div>
        )}

        {/* Incomplete State */}
        {status === "incomplete" && (
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Information Needed</h2>
            <p className="text-gray-600 mb-4">{message}</p>

            {requirements.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <p className="font-semibold text-sm text-yellow-800 mb-2">Missing Information:</p>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {requirements.map((req, index) => (
                    <li key={index} className="capitalize">
                      {req.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRetryOnboarding}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Complete Setup
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Do Later
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={handleContinue}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Go to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
