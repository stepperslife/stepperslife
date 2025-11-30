"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Layers,
  Truck,
  Save,
  Loader2,
  ImagePlus,
  X,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const PRODUCT_CATEGORIES = [
  "Apparel & Fashion",
  "Accessories & Jewelry",
  "Art & Prints",
  "Home & Living",
  "Health & Beauty",
  "Digital Products",
  "Books & Media",
  "Handmade & Crafts",
  "Dance Supplies",
  "Event Merchandise",
  "Other",
];

interface FormData {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  inventoryQuantity: string;
  trackInventory: boolean;
  category: string;
  tags: string;
  requiresShipping: boolean;
  weight: string;
  shippingPrice: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  images: string[];
  primaryImage: string;
}

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get vendor
  const vendor = useQuery(
    api.vendors.getByOwner,
    user?._id ? { ownerId: user._id as Id<"users"> } : "skip"
  );

  // Get product
  const product = useQuery(
    api.products.getProductById,
    productId ? { productId: productId as Id<"products"> } : "skip"
  );

  const updateProduct = useMutation(api.products.updateVendorProduct);
  const deleteProduct = useMutation(api.products.deleteVendorProduct);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    inventoryQuantity: "0",
    trackInventory: true,
    category: "",
    tags: "",
    requiresShipping: true,
    weight: "",
    shippingPrice: "",
    status: "DRAFT",
    images: [],
    primaryImage: "",
  });

  const [imageUrl, setImageUrl] = useState("");

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price ? (product.price / 100).toFixed(2) : "",
        compareAtPrice: product.compareAtPrice
          ? (product.compareAtPrice / 100).toFixed(2)
          : "",
        sku: product.sku || "",
        inventoryQuantity: String(product.inventoryQuantity || 0),
        trackInventory: product.trackInventory ?? true,
        category: product.category || "",
        tags: product.tags?.join(", ") || "",
        requiresShipping: product.requiresShipping ?? true,
        weight: product.weight ? String(product.weight) : "",
        shippingPrice: product.shippingPrice
          ? (product.shippingPrice / 100).toFixed(2)
          : "",
        status: product.status || "DRAFT",
        images: product.images || [],
        primaryImage: product.primaryImage || "",
      });
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addImage = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      const newImages = [...formData.images, imageUrl];
      setFormData((prev) => ({
        ...prev,
        images: newImages,
        primaryImage: prev.primaryImage || imageUrl,
      }));
      setImageUrl("");
    }
  };

  const removeImage = (url: string) => {
    const newImages = formData.images.filter((img) => img !== url);
    setFormData((prev) => ({
      ...prev,
      images: newImages,
      primaryImage: prev.primaryImage === url ? newImages[0] || "" : prev.primaryImage,
    }));
  };

  const setPrimaryImage = (url: string) => {
    setFormData((prev) => ({ ...prev, primaryImage: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendor?._id || !productId) {
      toast.error("Vendor or product not found");
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Product description is required");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert price to cents
      const priceInCents = Math.round(parseFloat(formData.price) * 100);
      const compareAtPriceInCents = formData.compareAtPrice
        ? Math.round(parseFloat(formData.compareAtPrice) * 100)
        : undefined;
      const shippingPriceInCents = formData.shippingPrice
        ? Math.round(parseFloat(formData.shippingPrice) * 100)
        : undefined;

      await updateProduct({
        productId: productId as Id<"products">,
        vendorId: vendor._id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceInCents,
        compareAtPrice: compareAtPriceInCents,
        sku: formData.sku || undefined,
        inventoryQuantity: parseInt(formData.inventoryQuantity) || 0,
        trackInventory: formData.trackInventory,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        primaryImage: formData.primaryImage || undefined,
        requiresShipping: formData.requiresShipping,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        shippingPrice: shippingPriceInCents,
        status: formData.status,
      });

      toast.success("Product updated successfully!");
      router.push("/vendor/dashboard/products");
    } catch (error) {
      console.error("Update product error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update product";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!vendor?._id || !productId) return;

    try {
      await deleteProduct({
        productId: productId as Id<"products">,
        vendorId: vendor._id,
      });
      toast.success("Product deleted successfully");
      router.push("/vendor/dashboard/products");
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error("Failed to delete product");
    }
  };

  if (!vendor || !product) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check if this product belongs to the vendor
  if (product.vendorId?.toString() !== vendor._id.toString()) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
            Access Denied
          </h2>
          <p className="text-red-600 dark:text-red-300">
            You don't have permission to edit this product.
          </p>
          <Link
            href="/vendor/dashboard/products"
            className="mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/vendor/dashboard/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
            <p className="text-muted-foreground">Update your product details</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Product
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="steppers, dance, apparel"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <ImagePlus className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Product Images</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter image URL"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((img) => (
                  <div key={img} className="relative group">
                    <img
                      src={img}
                      alt="Product"
                      className={`w-full h-24 object-cover rounded-lg border-2 ${
                        formData.primaryImage === img
                          ? "border-purple-600"
                          : "border-border"
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(img)}
                        className="p-1 bg-white/80 rounded text-xs font-medium"
                      >
                        Primary
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        className="p-1 bg-red-500 text-white rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {formData.primaryImage === img && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Pricing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Compare at Price (original)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              <strong>Commission:</strong> SteppersLife takes a 15% commission on each sale.
              {formData.price && (
                <>
                  {" "}
                  You'll earn ${((parseFloat(formData.price) || 0) * 0.85).toFixed(2)} per sale.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Inventory</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="inventoryQuantity"
                value={formData.inventoryQuantity}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="trackInventory"
                checked={formData.trackInventory}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-input text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-foreground">Track inventory for this product</span>
            </label>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Shipping</h2>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="requiresShipping"
                checked={formData.requiresShipping}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-input text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-foreground">This product requires shipping</span>
            </label>
          </div>

          {formData.requiresShipping && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Weight (grams)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Shipping Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    name="shippingPrice"
                    value={formData.shippingPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status & Submit */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="DRAFT">Draft - Not visible to customers</option>
                <option value="ACTIVE">Active - Visible in marketplace</option>
                <option value="ARCHIVED">Archived - Hidden from store</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Link
                href="/vendor/dashboard/products"
                className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Product</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{formData.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
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
