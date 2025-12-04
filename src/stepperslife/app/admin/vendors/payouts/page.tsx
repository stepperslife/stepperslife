"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Search,
  Building2,
  CreditCard,
  Banknote,
} from "lucide-react";
import toast from "react-hot-toast";

type PayoutStatus = "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "FAILED";

const STATUS_CONFIG: Record<PayoutStatus, { label: string; color: string }> = {
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  PROCESSING: { label: "Processing", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

const PAYOUT_METHOD_ICONS: Record<string, typeof Building2> = {
  bank_transfer: Building2,
  paypal: CreditCard,
  check: Banknote,
};

export default function AdminPayoutsPage() {
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "reject" | "process";
    payout: {
      id: string;
      payoutNumber: string;
      vendorName?: string;
      amount: number;
    };
  } | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get all payouts
  const payouts = useQuery(api.vendorPayouts.getAllAdmin, {
    status: statusFilter || undefined,
  });

  // Get all vendors for lookup
  const vendors = useQuery(api.vendors.getAll, {});

  // Get payout stats
  const payoutStats = useQuery(api.vendorPayouts.getStats, {});

  // Mutations
  const approvePayout = useMutation(api.vendorPayouts.approve);
  const rejectPayout = useMutation(api.vendorPayouts.reject);
  const processPayout = useMutation(api.vendorPayouts.process);

  // Create vendor lookup map
  const vendorMap = vendors?.reduce((acc, v) => {
    acc[v._id] = v;
    return acc;
  }, {} as Record<string, typeof vendors[0]>) || {};

  // Filter payouts
  const filteredPayouts = payouts?.filter((payout) => {
    if (!searchQuery) return true;
    const vendor = vendorMap[payout.vendorId];
    const query = searchQuery.toLowerCase();
    return (
      payout.payoutNumber.toLowerCase().includes(query) ||
      vendor?.name.toLowerCase().includes(query) ||
      vendor?.contactEmail.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleAction = async () => {
    if (!actionModal) return;

    setIsProcessing(true);
    try {
      // Get current user ID (in production, this would come from auth)
      const userId = "placeholder_user_id" as Id<"users">;

      switch (actionModal.type) {
        case "approve":
          await approvePayout({
            id: actionModal.payout.id as Id<"vendorPayouts">,
            approvedBy: userId,
            adminNotes: adminNotes || undefined,
          });
          toast.success(`Payout ${actionModal.payout.payoutNumber} approved`);
          break;
        case "reject":
          if (!adminNotes.trim()) {
            toast.error("Please provide a reason for rejection");
            setIsProcessing(false);
            return;
          }
          await rejectPayout({
            id: actionModal.payout.id as Id<"vendorPayouts">,
            processedBy: userId,
            adminNotes: adminNotes,
          });
          toast.success(`Payout ${actionModal.payout.payoutNumber} rejected`);
          break;
        case "process":
          await processPayout({
            id: actionModal.payout.id as Id<"vendorPayouts">,
            processedBy: userId,
            paymentReference: paymentReference || undefined,
            adminNotes: adminNotes || undefined,
          });
          toast.success(`Payout ${actionModal.payout.payoutNumber} processed successfully`);
          break;
      }
      setActionModal(null);
      setAdminNotes("");
      setPaymentReference("");
    } catch (error) {
      console.error("Payout action error:", error);
      toast.error("Failed to process action");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Payout Management</h1>
        <p className="text-muted-foreground">Review and process vendor payout requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{payoutStats?.pendingCount || 0}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-yellow-600 font-medium">
            {formatCurrency(payoutStats?.pendingAmount || 0)}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{payoutStats?.approvedCount || 0}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-600 font-medium">
            {formatCurrency(payoutStats?.approvedAmount || 0)}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{payoutStats?.completedCount || 0}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600 font-medium">
            {formatCurrency(payoutStats?.completedAmount || 0)}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{payoutStats?.failedCount || 0}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by payout number or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PayoutStatus | "")}
              className="px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payouts List */}
      {payouts === undefined ? (
        <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredPayouts && filteredPayouts.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payout #</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vendor</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Requested</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((payout) => {
                  const vendor = vendorMap[payout.vendorId];
                  const statusConfig = STATUS_CONFIG[payout.status as PayoutStatus];
                  const MethodIcon = PAYOUT_METHOD_ICONS[payout.payoutMethod] || Banknote;

                  return (
                    <tr key={payout._id} className="border-b border-border last:border-0">
                      <td className="p-4 font-medium text-foreground">{payout.payoutNumber}</td>
                      <td className="p-4">
                        <p className="text-foreground">{vendor?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{vendor?.contactEmail}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MethodIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground capitalize">
                            {payout.payoutMethod.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {formatCurrency(payout.totalAmount)}
                        <p className="text-sm text-muted-foreground font-normal">
                          {payout.earningsCount} earnings
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(payout.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {payout.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setActionModal({
                                    type: "approve",
                                    payout: {
                                      id: payout._id,
                                      payoutNumber: payout.payoutNumber,
                                      vendorName: vendor?.name,
                                      amount: payout.totalAmount,
                                    },
                                  })
                                }
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setActionModal({
                                    type: "reject",
                                    payout: {
                                      id: payout._id,
                                      payoutNumber: payout.payoutNumber,
                                      vendorName: vendor?.name,
                                      amount: payout.totalAmount,
                                    },
                                  })
                                }
                                className="px-3 py-1.5 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {payout.status === "APPROVED" && (
                            <button
                              type="button"
                              onClick={() =>
                                setActionModal({
                                  type: "process",
                                  payout: {
                                    id: payout._id,
                                    payoutNumber: payout.payoutNumber,
                                    vendorName: vendor?.name,
                                    amount: payout.totalAmount,
                                  },
                                })
                              }
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                            >
                              Process
                            </button>
                          )}
                          {(payout.status === "COMPLETED" || payout.status === "FAILED") && (
                            <span className="text-sm text-muted-foreground">No actions</span>
                          )}
                        </div>
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
          <h3 className="text-lg font-bold text-foreground mb-2">No payouts found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {searchQuery || statusFilter
              ? "Try adjusting your search or filter criteria"
              : "No payout requests have been submitted yet"}
          </p>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">
              {actionModal.type === "approve" && "Approve Payout"}
              {actionModal.type === "reject" && "Reject Payout"}
              {actionModal.type === "process" && "Process Payout"}
            </h3>

            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Payout #</span>
                <span className="font-medium text-foreground">{actionModal.payout.payoutNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Vendor</span>
                <span className="text-foreground">{actionModal.payout.vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(actionModal.payout.amount)}
                </span>
              </div>
            </div>

            {actionModal.type === "process" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction ID, check number, etc."
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                {actionModal.type === "reject" ? "Rejection Reason *" : "Admin Notes (Optional)"}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder={
                  actionModal.type === "reject"
                    ? "Provide a reason for rejection..."
                    : "Add any notes..."
                }
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setActionModal(null);
                  setAdminNotes("");
                  setPaymentReference("");
                }}
                className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  actionModal.type === "reject"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                } disabled:opacity-50`}
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionModal.type === "approve" && "Approve"}
                {actionModal.type === "reject" && "Reject"}
                {actionModal.type === "process" && "Mark as Processed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
