"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_LABELS = {
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  DRAFT: { label: "Draft", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  ARCHIVED: { label: "Archived", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300" },
};

export default function VendorProductsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteProductId, setDeleteProductId] = useState<Id<"products"> | null>(null);

  // Get vendor
  const vendor = useQuery(
    api.vendors.getByOwner,
    user?._id ? { ownerId: user._id as Id<"users"> } : "skip"
  );

  // Get products
  const products = useQuery(
    api.products.getProductsByVendor,
    vendor?._id ? { vendorId: vendor._id } : "skip"
  );

  // Delete mutation
  const deleteProduct = useMutation(api.products.deleteVendorProduct);

  const handleDelete = async () => {
    if (!deleteProductId || !vendor?._id) return;

    try {
      await deleteProduct({ productId: deleteProductId, vendorId: vendor._id });
      toast.success("Product deleted");
      setDeleteProductId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  // Filter products
  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!vendor || products === undefined) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link
          href="/vendor/dashboard/products/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Inventory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {product.primaryImage ? (
                            <img
                              src={product.primaryImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category || "Uncategorized"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">
                        ${(product.price / 100).toFixed(2)}
                      </p>
                      {product.compareAtPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          ${(product.compareAtPrice / 100).toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${product.inventoryQuantity <= 5 ? "text-red-600" : "text-foreground"}`}>
                        {product.inventoryQuantity}
                      </p>
                      {product.inventoryQuantity <= 5 && (
                        <p className="text-xs text-red-600">Low stock</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[product.status].color}`}>
                        {STATUS_LABELS[product.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/marketplace/${product._id}`}
                          target="_blank"
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          title="View in marketplace"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/vendor/dashboard/products/${product._id}/edit`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteProductId(product._id)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-6">
            Start adding products to your store to begin selling.
          </p>
          <Link
            href="/vendor/dashboard/products/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Product
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProductId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Product</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteProductId(null)}
                className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
