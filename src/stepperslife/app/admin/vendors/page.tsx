"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  Store,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  Package,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";

const STATUS_CONFIG: Record<VendorStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  SUSPENDED: { label: "Suspended", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: AlertTriangle },
  REJECTED: { label: "Rejected", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300", icon: XCircle },
};

export default function AdminVendorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "">("");
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "reject" | "suspend" | "reactivate";
    vendorId: string;
    vendorName: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Get all vendors
  const vendors = useQuery(api.vendors.getAllAdmin, {
    status: statusFilter || undefined,
  });

  // Get pending payouts count for dashboard
  const pendingPayouts = useQuery(api.vendorPayouts.getPending, {});

  // Mutations
  const approveVendor = useMutation(api.vendors.approve);
  const rejectVendor = useMutation(api.vendors.reject);
  const suspendVendor = useMutation(api.vendors.suspend);
  const reactivateVendor = useMutation(api.vendors.reactivate);

  // Filter vendors by search
  const filteredVendors = vendors?.filter((vendor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.contactEmail.toLowerCase().includes(query) ||
      vendor.slug.toLowerCase().includes(query)
    );
  });

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

  // Stats
  const stats = {
    total: vendors?.length || 0,
    pending: vendors?.filter((v) => v.status === "PENDING").length || 0,
    approved: vendors?.filter((v) => v.status === "APPROVED").length || 0,
    suspended: vendors?.filter((v) => v.status === "SUSPENDED").length || 0,
    pendingPayouts: pendingPayouts?.length || 0,
  };

  const handleAction = async () => {
    if (!actionModal) return;

    try {
      switch (actionModal.type) {
        case "approve":
          await approveVendor({ vendorId: actionModal.vendorId as Id<"vendors"> });
          toast.success(`${actionModal.vendorName} has been approved`);
          break;
        case "reject":
          if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
          }
          await rejectVendor({
            vendorId: actionModal.vendorId as Id<"vendors">,
            reason: rejectionReason,
          });
          toast.success(`${actionModal.vendorName} has been rejected`);
          break;
        case "suspend":
          if (!rejectionReason.trim()) {
            toast.error("Please provide a suspension reason");
            return;
          }
          await suspendVendor({
            vendorId: actionModal.vendorId as Id<"vendors">,
            reason: rejectionReason,
          });
          toast.success(`${actionModal.vendorName} has been suspended`);
          break;
        case "reactivate":
          await reactivateVendor({ vendorId: actionModal.vendorId as Id<"vendors"> });
          toast.success(`${actionModal.vendorName} has been reactivated`);
          break;
      }
      setActionModal(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Action error:", error);
      toast.error("Failed to perform action");
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Vendor Management</h1>
        <p className="text-muted-foreground">Manage marketplace vendors and their applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.suspended}</p>
              <p className="text-sm text-muted-foreground">Suspended</p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/vendors/payouts"
          className="bg-card rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pendingPayouts}</p>
              <p className="text-sm text-muted-foreground">Payouts</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vendors by name, email, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VendorStatus | "")}
              className="px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      {vendors === undefined ? (
        <div className="bg-card rounded-xl border border-border p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredVendors && filteredVendors.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vendor</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Products</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sales</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => {
                  const statusConfig = STATUS_CONFIG[vendor.status as VendorStatus];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={vendor._id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Store className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{vendor.name}</p>
                            <p className="text-sm text-muted-foreground">/{vendor.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">{vendor.contactEmail}</p>
                        {vendor.contactPhone && (
                          <p className="text-sm text-muted-foreground">{vendor.contactPhone}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{vendor.totalProducts || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">
                          {formatCurrency(vendor.totalSales || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(vendor as { totalOrders?: number }).totalOrders || 0} orders
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(vendor.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/vendors/${vendor._id}`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Link>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedVendor(selectedVendor === vendor._id ? null : vendor._id)
                              }
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {selectedVendor === vendor._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                                {vendor.status === "PENDING" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionModal({
                                          type: "approve",
                                          vendorId: vendor._id,
                                          vendorName: vendor.name,
                                        });
                                        setSelectedVendor(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-muted transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionModal({
                                          type: "reject",
                                          vendorId: vendor._id,
                                          vendorName: vendor.name,
                                        });
                                        setSelectedVendor(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {vendor.status === "APPROVED" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionModal({
                                        type: "suspend",
                                        vendorId: vendor._id,
                                        vendorName: vendor.name,
                                      });
                                      setSelectedVendor(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted transition-colors"
                                  >
                                    Suspend
                                  </button>
                                )}
                                {(vendor.status === "SUSPENDED" || vendor.status === "REJECTED") && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionModal({
                                        type: "reactivate",
                                        vendorId: vendor._id,
                                        vendorName: vendor.name,
                                      });
                                      setSelectedVendor(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-muted transition-colors"
                                  >
                                    Reactivate
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
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
            <Store className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No vendors found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {searchQuery || statusFilter
              ? "Try adjusting your search or filter criteria"
              : "No vendors have applied yet"}
          </p>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">
              {actionModal.type === "approve" && "Approve Vendor"}
              {actionModal.type === "reject" && "Reject Vendor"}
              {actionModal.type === "suspend" && "Suspend Vendor"}
              {actionModal.type === "reactivate" && "Reactivate Vendor"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {actionModal.type === "approve" &&
                `Are you sure you want to approve "${actionModal.vendorName}"? They will be able to list products on the marketplace.`}
              {actionModal.type === "reject" &&
                `Please provide a reason for rejecting "${actionModal.vendorName}".`}
              {actionModal.type === "suspend" &&
                `Please provide a reason for suspending "${actionModal.vendorName}". Their products will be hidden from the marketplace.`}
              {actionModal.type === "reactivate" &&
                `Are you sure you want to reactivate "${actionModal.vendorName}"?`}
            </p>

            {(actionModal.type === "reject" || actionModal.type === "suspend") && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Provide a reason..."
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setActionModal(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  actionModal.type === "approve" || actionModal.type === "reactivate"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {actionModal.type === "approve" && "Approve"}
                {actionModal.type === "reject" && "Reject"}
                {actionModal.type === "suspend" && "Suspend"}
                {actionModal.type === "reactivate" && "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
