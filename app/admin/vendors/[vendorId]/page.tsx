"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  Globe,
  MapPin,
  Package,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";

const STATUS_CONFIG: Record<VendorStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: "Pending Review", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  APPROVED: { label: "Approved", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" },
  SUSPENDED: { label: "Suspended", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" },
  REJECTED: { label: "Rejected", color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-900/20" },
};

export default function AdminVendorDetailPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [newCommission, setNewCommission] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Get vendor
  const vendor = useQuery(
    api.vendors.getById,
    vendorId ? { vendorId: vendorId as Id<"vendors"> } : "skip"
  );

  // Get vendor products
  const products = useQuery(
    api.products.queries.getProductsByVendor,
    vendorId ? { vendorId: vendorId as Id<"vendors"> } : "skip"
  );

  // Get vendor earnings
  const earningsSummary = useQuery(
    api.vendorEarnings.getSummary,
    vendorId ? { vendorId: vendorId as Id<"vendors"> } : "skip"
  );

  // Get recent earnings
  const recentEarnings = useQuery(
    api.vendorEarnings.getRecent,
    vendorId ? { vendorId: vendorId as Id<"vendors">, limit: 5 } : "skip"
  );

  // Get payouts
  const payouts = useQuery(
    api.vendorPayouts.getByVendor,
    vendorId ? { vendorId: vendorId as Id<"vendors"> } : "skip"
  );

  const updateCommission = useMutation(api.vendors.updateCommission);

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

  const handleUpdateCommission = async () => {
    if (!vendor?._id) return;
    const commission = parseFloat(newCommission);
    if (isNaN(commission) || commission < 0 || commission > 100) {
      toast.error("Please enter a valid commission percentage (0-100)");
      return;
    }

    setIsUpdating(true);
    try {
      await updateCommission({
        vendorId: vendor._id,
        commissionPercent: commission,
      });
      toast.success("Commission rate updated successfully");
      setShowCommissionModal(false);
    } catch (error) {
      console.error("Update commission error:", error);
      toast.error("Failed to update commission");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!vendor) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[vendor.status as VendorStatus];

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

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Store className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
              <p className="text-muted-foreground">/{vendor.slug}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${statusConfig.bgColor}`}>
            <span className={`font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Products</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{products?.length || 0}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">Orders</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{earningsSummary?.orderCount || 0}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Total Sales</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(vendor.totalSales || 0)}
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Paid Out</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(vendor.totalPaidOut || 0)}
              </p>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-bold text-foreground mb-4">Earnings Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(earningsSummary?.totalEarnings || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(earningsSummary?.availableBalance || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-xl font-bold text-yellow-600">
                  {formatCurrency(earningsSummary?.pendingEarnings || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Processing</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(earningsSummary?.processingEarnings || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Products</h2>
              <span className="text-sm text-muted-foreground">{products?.length || 0} total</span>
            </div>
            {products && products.length > 0 ? (
              <div className="space-y-3">
                {products.slice(0, 5).map((product: any) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {product.primaryImage ? (
                        <img
                          src={product.primaryImage}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No products yet</p>
            )}
          </div>

          {/* Recent Payouts */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-bold text-foreground mb-4">Payout History</h2>
            {payouts && payouts.length > 0 ? (
              <div className="space-y-3">
                {payouts.slice(0, 5).map((payout) => (
                  <div
                    key={payout._id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{payout.payoutNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payout.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatCurrency(payout.totalAmount)}
                      </p>
                      <span
                        className={`text-xs font-medium ${
                          payout.status === "COMPLETED"
                            ? "text-green-600"
                            : payout.status === "PENDING"
                            ? "text-yellow-600"
                            : payout.status === "FAILED"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No payouts yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-bold text-foreground mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{vendor.contactEmail}</span>
              </div>
              {vendor.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">{vendor.contactPhone}</span>
                </div>
              )}
              {vendor.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    {vendor.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {(vendor.city || vendor.state) && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-bold text-foreground mb-4">Location</h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="text-foreground">
                  {vendor.address && <p>{vendor.address}</p>}
                  <p>
                    {vendor.city}
                    {vendor.city && vendor.state && ", "}
                    {vendor.state} {vendor.zipCode}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Business Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-bold text-foreground mb-4">Business Information</h2>
            <div className="space-y-3">
              {vendor.businessType && (
                <div>
                  <p className="text-sm text-muted-foreground">Business Type</p>
                  <p className="text-foreground">{vendor.businessType}</p>
                </div>
              )}
              {vendor.categories && vendor.categories.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {vendor.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 bg-muted rounded-full text-xs text-foreground"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Commission Settings */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Commission</h2>
              <button
                type="button"
                onClick={() => {
                  setNewCommission(String(vendor.commissionPercent || 15));
                  setShowCommissionModal(true);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">
                {vendor.commissionPercent || 15}%
              </p>
              <p className="text-sm text-muted-foreground">Platform Commission</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-bold text-foreground mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Applied</p>
                  <p className="text-foreground">{formatDate(vendor.createdAt)}</p>
                </div>
              </div>
              {vendor.reviewedAt && vendor.status === "APPROVED" && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-muted-foreground">Approved</p>
                    <p className="text-foreground">{formatDate(vendor.reviewedAt)}</p>
                  </div>
                </div>
              )}
              {vendor.reviewedAt && vendor.status === "SUSPENDED" && (
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-muted-foreground">Suspended</p>
                    <p className="text-foreground">{formatDate(vendor.reviewedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Commission Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Update Commission Rate</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Commission Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newCommission}
                  onChange={(e) => setNewCommission(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 pr-8 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Vendor will receive {100 - (parseFloat(newCommission) || 0)}% of each sale
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCommissionModal(false)}
                className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateCommission}
                disabled={isUpdating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
