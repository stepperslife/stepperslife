"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Filter,
  DollarSign,
  CheckCircle2,
  FileText,
  Archive,
  Eye,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export default function ProductsManagementPage() {
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");

  const allProducts = useQuery(
    api.products.queries.getAllProducts,
    statusFilter !== "all" ? { status: statusFilter } : {}
  );

  const deleteProduct = useMutation(api.products.mutations.deleteProduct);
  const duplicateProduct = useMutation(api.products.mutations.duplicateProduct);

  const handleDeleteProduct = async (productId: Id<"products">, productName: string) => {
    try {
      await deleteProduct({ productId });
    } catch (error: unknown) {
      alert(`Failed to delete product: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDuplicateProduct = async (productId: Id<"products">, productName: string) => {
    try {
      const newProductId = await duplicateProduct({ productId });
      window.location.href = `/admin/products/${newProductId}/edit`;
    } catch (error: unknown) {
      alert(
        `Failed to duplicate product: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  if (!allProducts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const stats = {
    total: allProducts.length,
    active: allProducts.filter((p) => p.status === "ACTIVE").length,
    draft: allProducts.filter((p) => p.status === "DRAFT").length,
    archived: allProducts.filter((p) => p.status === "ARCHIVED").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store products and inventory</p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent text-primary rounded-full flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 text-success rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 text-warning rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Archived</p>
              <p className="text-2xl font-bold text-foreground">{stats.archived}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Products</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DRAFT">Draft Only</option>
            <option value="ARCHIVED">Archived Only</option>
          </select>

          <span className="text-sm text-muted-foreground">
            Showing {allProducts.length} {allProducts.length === 1 ? "product" : "products"}
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {allProducts.length === 0 ? (
        <div className="bg-card rounded-lg shadow-md p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No products found</p>
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProducts.map((product) => (
            <div key={product._id} className="bg-card rounded-lg shadow-md overflow-hidden">
              {/* Product Image */}
              <div className="aspect-square bg-muted relative">
                {product.primaryImage ? (
                  <img
                    src={product.primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : product.status === "DRAFT"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-foreground"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-bold text-foreground">
                    ${(product.price / 100).toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${(product.compareAtPrice / 100).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  <span>Stock: {product.inventoryQuantity}</span>
                  {product.sku && <span> • SKU: {product.sku}</span>}
                </div>

                {product.category && (
                  <span className="inline-block px-2 py-1 bg-accent text-primary text-xs rounded">
                    {product.category}
                  </span>
                )}

                {/* Actions */}
                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/marketplace/${product._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Link>
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-accent text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicateProduct(product._id, product.name)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-accent text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id, product.name)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
