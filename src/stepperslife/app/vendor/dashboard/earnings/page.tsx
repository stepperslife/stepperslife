"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Banknote,
  ArrowRight,
  Filter,
} from "lucide-react";

type EarningStatus = "PENDING" | "AVAILABLE" | "PROCESSING" | "PAID" | "REFUNDED";

const STATUS_CONFIG: Record<EarningStatus, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  AVAILABLE: { label: "Available", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  PAID: { label: "Paid", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  REFUNDED: { label: "Refunded", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

export default function VendorEarningsPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<EarningStatus | "">("");

  // Get vendor
  const vendor = useQuery(
    api.vendors.getByOwner,
    user?._id ? { ownerId: user._id as Id<"users"> } : "skip"
  );

  // Get earnings
  const earnings = useQuery(
    api.vendorEarnings.getByVendor,
    vendor?._id
      ? {
          vendorId: vendor._id,
          status: statusFilter || undefined,
        }
      : "skip"
  );

  // Get earnings summary
  const summary = useQuery(
    api.vendorEarnings.getSummary,
    vendor?._id ? { vendorId: vendor._id } : "skip"
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
        <p className="text-muted-foreground">Track your sales earnings and commission</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(summary?.totalEarnings || 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Earnings</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Banknote className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(summary?.availableBalance || 0)}
          </p>
          <p className="text-sm text-muted-foreground">Available for Payout</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(summary?.pendingEarnings || 0)}
          </p>
          <p className="text-sm text-muted-foreground">Pending Clearance</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(summary?.paidOut || 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Paid Out</p>
        </div>
      </div>

      {/* Request Payout CTA */}
      {(summary?.availableBalance || 0) >= 2500 && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-white">
              <h3 className="text-lg font-bold mb-1">Ready for Payout</h3>
              <p className="text-purple-100">
                You have {formatCurrency(summary?.availableBalance || 0)} available for withdrawal
              </p>
            </div>
            <Link
              href="/vendor/dashboard/payouts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition-colors"
            >
              Request Payout
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Commission Info */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-1">
              How Earnings Work
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              You earn <strong>85%</strong> of each sale (SteppersLife takes a 15% commission).
              Earnings become available for payout after orders are completed.
              Minimum payout is <strong>$25.00</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EarningStatus | "")}
            className="px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="AVAILABLE">Available</option>
            <option value="PROCESSING">Processing</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Earnings List */}
      {earnings === undefined ? (
        <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : earnings && earnings.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sale Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Commission</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Your Earnings</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((earning) => {
                  const statusConfig = STATUS_CONFIG[earning.status as EarningStatus];
                  return (
                    <tr key={earning._id} className="border-b border-border last:border-0">
                      <td className="p-4 text-sm text-foreground">
                        {formatDate(earning.createdAt)}
                      </td>
                      <td className="p-4 text-sm text-foreground font-medium">
                        {earning.orderNumber || "-"}
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {formatCurrency(earning.grossAmount)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        -{formatCurrency(earning.commissionAmount)} ({earning.commissionPercent}%)
                      </td>
                      <td className="p-4 text-sm font-bold text-green-600">
                        {formatCurrency(earning.netAmount)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No earnings yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            When customers purchase your products, your earnings will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
