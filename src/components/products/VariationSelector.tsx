"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle } from "lucide-react";

interface ProductAttribute {
  id: string;
  name: string;
  slug: string;
  values: string[];
  isVariation: boolean;
  isVisible: boolean;
  sortOrder?: number;
}

interface SelectedVariation {
  variationId: Id<"productVariations">;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  sku?: string;
  imageUrl?: string;
  isInStock: boolean;
  allowBackorder: boolean;
}

interface VariationSelectorProps {
  productId: Id<"products">;
  attributes: ProductAttribute[];
  onVariationSelect: (variation: SelectedVariation | null) => void;
  className?: string;
}

export function VariationSelector({
  productId,
  attributes,
  onVariationSelect,
  className,
}: VariationSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  // Get variation attributes only
  const variationAttributes = useMemo(
    () =>
      attributes
        .filter((attr) => attr.isVariation)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    [attributes]
  );

  // Get all variations for this product
  const variations = useQuery(api.products.variations.getVariationsByProduct, {
    productId,
    includeDisabled: false,
  });

  // Get available options based on current selection
  const availableOptions = useQuery(
    api.products.variations.getAvailableAttributeOptions,
    {
      productId,
      selectedAttributes,
    }
  );

  // Find matching variation based on selected attributes
  const selectedVariation = useMemo(() => {
    if (!variations || variationAttributes.length === 0) return null;

    // Check if all attributes are selected
    const allSelected = variationAttributes.every(
      (attr) => selectedAttributes[attr.slug]
    );
    if (!allSelected) return null;

    // Find matching variation
    const match = variations.find((variation) => {
      const varAttrs = variation.attributes as Record<string, string>;
      return variationAttributes.every(
        (attr) => varAttrs[attr.slug] === selectedAttributes[attr.slug]
      );
    });

    if (!match) return null;

    return {
      variationId: match._id,
      attributes: match.attributes as Record<string, string>,
      price: match.price,
      compareAtPrice: match.compareAtPrice || undefined,
      inventoryQuantity: match.inventoryQuantity,
      sku: match.sku || undefined,
      imageUrl: match.imageUrl || undefined,
      isInStock: match.inventoryQuantity > 0 || !match.trackInventory,
      allowBackorder: match.allowBackorder || false,
    };
  }, [variations, selectedAttributes, variationAttributes]);

  // Notify parent of selection changes
  useEffect(() => {
    onVariationSelect(selectedVariation);
  }, [selectedVariation, onVariationSelect]);

  // Handle attribute selection
  const handleAttributeSelect = (slug: string, value: string) => {
    setSelectedAttributes((prev) => {
      const newAttrs = { ...prev, [slug]: value };

      // Reset subsequent attributes if this one changes
      const currentIndex = variationAttributes.findIndex((a) => a.slug === slug);
      if (currentIndex !== -1) {
        variationAttributes.slice(currentIndex + 1).forEach((attr) => {
          delete newAttrs[attr.slug];
        });
      }

      return newAttrs;
    });
  };

  // Check if a value is available (in stock)
  const isValueAvailable = (attrSlug: string, value: string): boolean => {
    if (!availableOptions) return true;

    const attrOption = availableOptions.find((opt) => opt.slug === attrSlug);
    if (!attrOption) return true;

    const valueInfo = attrOption.valuesWithStock?.find((v) => v.value === value);
    return valueInfo?.available ?? true;
  };

  // Check if a value is in stock
  const isValueInStock = (attrSlug: string, value: string): boolean => {
    if (!availableOptions) return true;

    const attrOption = availableOptions.find((opt) => opt.slug === attrSlug);
    if (!attrOption) return true;

    const valueInfo = attrOption.valuesWithStock?.find((v) => v.value === value);
    return valueInfo?.inStock ?? true;
  };

  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (variationAttributes.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {variationAttributes.map((attr, index) => {
        const isFirstUnselected =
          index === 0 ||
          variationAttributes.slice(0, index).every((a) => selectedAttributes[a.slug]);

        return (
          <div key={attr.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{attr.name}</label>
              {selectedAttributes[attr.slug] && (
                <span className="text-sm text-muted-foreground">
                  {selectedAttributes[attr.slug]}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {attr.values.map((value) => {
                const isSelected = selectedAttributes[attr.slug] === value;
                const isAvailable = isValueAvailable(attr.slug, value);
                const isInStock = isValueInStock(attr.slug, value);
                const isDisabled = !isFirstUnselected && !isAvailable;

                // Determine button style based on state
                let buttonVariant: "default" | "outline" | "secondary" = "outline";
                let additionalClasses = "";

                if (isSelected) {
                  buttonVariant = "default";
                } else if (!isInStock && isAvailable) {
                  // Available but out of stock (backorder)
                  additionalClasses = "border-amber-300 text-amber-600";
                } else if (!isAvailable) {
                  additionalClasses = "opacity-50 line-through";
                }

                return (
                  <Button
                    key={value}
                    type="button"
                    variant={buttonVariant}
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => handleAttributeSelect(attr.slug, value)}
                    className={cn(
                      "min-w-[48px] relative",
                      additionalClasses,
                      isSelected && "ring-2 ring-offset-2 ring-primary"
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {value}
                    {!isInStock && isAvailable && !isSelected && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected Variation Info */}
      {selectedVariation && (
        <div className="pt-4 border-t space-y-2">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {formatPrice(selectedVariation.price)}
            </span>
            {selectedVariation.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(selectedVariation.compareAtPrice)}
              </span>
            )}
            {selectedVariation.compareAtPrice && (
              <Badge variant="destructive" className="ml-2">
                {Math.round(
                  ((selectedVariation.compareAtPrice - selectedVariation.price) /
                    selectedVariation.compareAtPrice) *
                    100
                )}
                % OFF
              </Badge>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {selectedVariation.isInStock ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-600">In Stock</span>
                {selectedVariation.inventoryQuantity <= 5 && (
                  <span className="text-sm text-amber-600">
                    (Only {selectedVariation.inventoryQuantity} left)
                  </span>
                )}
              </>
            ) : selectedVariation.allowBackorder ? (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600">
                  Available on backorder
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-600">Out of Stock</span>
              </>
            )}
          </div>

          {/* SKU */}
          {selectedVariation.sku && (
            <p className="text-sm text-muted-foreground">
              SKU: {selectedVariation.sku}
            </p>
          )}
        </div>
      )}

      {/* Prompt to select */}
      {!selectedVariation && variationAttributes.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Please select{" "}
          {variationAttributes
            .filter((attr) => !selectedAttributes[attr.slug])
            .map((attr) => attr.name.toLowerCase())
            .join(", ")}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for using variation selection in parent components
 */
export function useVariationSelection(productId: Id<"products">) {
  const [selectedVariation, setSelectedVariation] =
    useState<SelectedVariation | null>(null);

  const variations = useQuery(api.products.variations.getVariationsByProduct, {
    productId,
    includeDisabled: false,
  });

  const priceRange = useQuery(api.products.variations.getProductPriceRange, {
    productId,
  });

  return {
    selectedVariation,
    setSelectedVariation,
    variations,
    priceRange,
    hasVariations: (variations?.length || 0) > 0,
    isVariationSelected: selectedVariation !== null,
    canAddToCart:
      selectedVariation !== null &&
      (selectedVariation.isInStock || selectedVariation.allowBackorder),
  };
}
