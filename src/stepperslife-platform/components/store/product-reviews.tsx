'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { format } from 'date-fns'

interface ProductReview {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
  vendorResponse?: {
    comment: string
    createdAt: Date
  } | null
  reviewImages: {
    id: string
    url: string
  }[]
}

interface ProductReviewsProps {
  reviews: ProductReview[]
  averageRating: number | null
  reviewCount: number
}

export function ProductReviews({ reviews, averageRating, reviewCount }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent')

  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Star className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 font-medium">No reviews yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Be the first to review this product
        </p>
      </div>
    )
  }

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100,
  }))

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === 'highest') {
      return b.rating - a.rating
    } else {
      return a.rating - b.rating
    }
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
      </div>

      {/* Rating Summary */}
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Left: Overall Rating */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold">
              {averageRating ? Number(averageRating).toFixed(1) : '0.0'}
            </div>
            <div className="mt-2 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(Number(averageRating))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        {/* Right: Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm font-medium w-12">
                {rating}
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-sm text-muted-foreground text-right">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between border-t pt-6">
        <h3 className="font-semibold">All Reviews ({reviewCount})</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review.id} className="space-y-4 rounded-lg border p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                {review.user.image ? (
                  <img
                    src={review.user.image}
                    alt={review.user.name || 'User'}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                    {review.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}

                {/* User Info */}
                <div>
                  <p className="font-medium">{review.user.name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(review.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Review Comment */}
            {review.comment && (
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {review.comment}
              </p>
            )}

            {/* Review Images */}
            {review.reviewImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {review.reviewImages.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt="Review"
                    className="h-24 w-24 rounded-md object-cover"
                  />
                ))}
              </div>
            )}

            {/* Vendor Response */}
            {review.vendorResponse && (
              <div className="ml-8 mt-4 rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Vendor Response</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {review.vendorResponse.comment}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {format(new Date(review.vendorResponse.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
