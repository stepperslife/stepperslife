"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Id } from "@/convex/_generated/dataModel";
import {
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Building2,
  Loader2,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

type PayoutStatus = "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "FAILED";

const STATUS_CONFIG: Record<PayoutStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: CheckCircle },
  PROCESSING: { label: "Processing", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: Loader2 },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle },
};

const PAYOUT_METHODS = [
  { id: "bank_transfer", name: "Bank Transfer", icon: Building2, description: "Direct deposit to your bank account" },
  { id: "paypal", name: "PayPal", icon: CreditCard, description: "Transfer to your PayPal account" },
  { id: "check", name: "Check", icon: Banknote, description: "Physical check mailed to your address" },
];

export default function VendorPayoutsPage() {
  const { user } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("bank_transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get vendor
  const vendor = useQuery(
    api.vendors.getByOwner,
    user?._id ? { ownerId: user._id as Id<"users"> } : "skip"
  );

  // Get payouts
  const payouts = useQuery(
    api.vendorPayouts.getByVendor,
    vendor?._id ? { vendorId: vendor._id } : "skip"
  );

  // Get earnings summary for available balance
  const earningsSummary = useQuery(
    api.vendorEarnings.getSummary,
    vendor?._id ? { vendorId: vendor._id } : "skip"
  );

  const requestPayout = useMutation(api.vendorPayouts.request);

  const availableBalance = earningsSummary?.availableBalance || 0;
  const minimumPayout = 2500; // $25.00 in cents
  const canRequestPayout = availableBalance >= minimumPayout;

  // Check if there's already a pending payout
  const hasPendingPayout = payouts?.some(
    (p) => p.status === "PENDING" || p.status === "APPROVED" || p.status === "PROCESSING"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleRequestPayout = async () => {
    if (!vendor?._id || !canRequestPayout || hasPendingPayout) return;

    setIsSubmitting(true);
    try {
      await requestPayout({
        vendorId: vendor._id,
        payoutMethod: selectedMethod,
      });
      toast.success("Payout request submitted successfully!");
      setShowRequestModal(false);
    } catch (error) {
      console.error("Payout request error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to request payout";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate stats
  const stats = {
    totalRequested: payouts?.length || 0,
    totalPaid: payouts
      ?.filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.totalAmount, 0) || 0,
    pendingAmount: payouts
      ?.filter((p) => p.status === "PENDING" || p.status === "APPROVED" || p.status === "PROCESSING")
      .reduce((sum, p) => sum + p.totalAmount, 0) || 0,
  };

  if (!vendor) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
          <p className="text-muted-foreground">Request and track your payouts</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          disabled={!canRequestPayout || hasPendingPayout}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Request Payout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Banknote className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(availableBalance)}</p>
          <p className="text-sm text-muted-foreground">Available Balance</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.pendingAmount)}</p>
          <p className="text-sm text-muted-foreground">Pending Payouts</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalPaid)}</p>
          <p className="text-sm text-muted-foreground">Total Paid Out</p>
        </div>
      </div>

      {/* Alerts */}
      {!canRequestPayout && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Minimum payout not reached
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You need at least {formatCurrency(minimumPayout)} available to request a payout.
                You currently have {formatCurrency(availableBalance)} available.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasPendingPayout && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Payout in progress
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You already have a pending payout request. Please wait for it to complete before
                requesting another.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-foreground">Payout History</h2>
        </div>

        {payouts === undefined ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : payouts && payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payout #</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => {
                  const statusConfig = STATUS_CONFIG[payout.status as PayoutStatus];
                  const StatusIcon = statusConfig.icon;
                  const method = PAYOUT_METHODS.find((m) => m.id === payout.payoutMethod);

                  return (
                    <tr key={payout._id} className="border-b border-border last:border-0">
                      <td className="p-4 text-sm text-foreground">{formatDate(payout.createdAt)}</td>
                      <td className="p-4 text-sm font-medium text-foreground">
                        {payout.payoutNumber}
                      </td>
                      <td className="p-4 text-sm text-foreground">{method?.name || payout.payoutMethod}</td>
                      <td className="p-4 text-sm font-bold text-foreground">
                        {formatCurrency(payout.totalAmount)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No payouts yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Once you have {formatCurrency(minimumPayout)} or more available, you can request a
              payout.
            </p>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">Request Payout</h3>
            <p className="text-muted-foreground mb-6">
              Request a payout of {formatCurrency(availableBalance)} to your preferred payment
              method.
            </p>

            {/* Payout Method Selection */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Payout Method
              </label>
              {PAYOUT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-border hover:border-purple-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payoutMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedMethod === method.id
                          ? "bg-purple-100 dark:bg-purple-900/50"
                          : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          selectedMethod === method.id ? "text-purple-600" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground">{formatCurrency(availableBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Time</span>
                <span className="text-foreground">3-5 business days</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
