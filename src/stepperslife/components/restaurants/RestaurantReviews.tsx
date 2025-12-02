"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Star, ThumbsUp, Flag, CheckCircle, User, ChevronDown, MessageSquare } from "lucide-react";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";
import { Button } from "@/components/ui/button";

interface RestaurantReviewsProps {
  restaurantId: Id<"restaurants">;
  userId: Id<"users"> | null;
}

export function RestaurantReviews({ restaurantId, userId }: RestaurantReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const stats = useQuery(api.restaurantReviews.getRestaurantStats, { restaurantId });
  const reviews = useQuery(api.restaurantReviews.getByRestaurant, { restaurantId, limit: 50 });
  const voteHelpful = useMutation(api.restaurantReviews.voteHelpful);
  const reportReview = useMutation(api.restaurantReviews.reportReview);

  const displayedReviews = showAllReviews ? reviews : reviews?.slice(0, 3);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleVoteHelpful = async (reviewId: Id<"restaurantReviews">) => {
    if (!userId) return;
    try {
      await voteHelpful({ reviewId, userId });
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const handleReport = async (reviewId: Id<"restaurantReviews">) => {
    if (!userId) return;
    if (window.confirm("Are you sure you want to report this review?")) {
      try {
        await reportReview({ reviewId, userId });
      } catch (err) {
        console.error("Failed to report:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Overall Rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white">
                {stats?.averageRating?.toFixed(1) || "0.0"}
              </div>
              <StarRating rating={stats?.averageRating || 0} size="md" />
              <p className="text-sm text-gray-500 mt-1">
                {stats?.totalReviews || 0} {stats?.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 min-w-[200px]">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats?.ratingBreakdown?.[stars as 1 | 2 | 3 | 4 | 5] || 0;
                const percentage = stats?.totalReviews ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-gray-600 dark:text-gray-400">{stars}★</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-500 text-xs">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write Review Button */}
          <div>
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          restaurantId={restaurantId}
          userId={userId}
          onSuccess={() => setShowReviewForm(false)}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>

        {!reviews || reviews.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No reviews yet. Be the first to share your experience!
            </p>
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Write the First Review
            </Button>
          </div>
        ) : (
          <>
            {displayedReviews?.map((review) => (
              <div
                key={review._id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.customerImage ? (
                      <img
                        src={review.customerImage}
                        alt={review.customerName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.customerName}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {review.title}
                  </h4>
                )}

                {/* Review Text */}
                {review.reviewText && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{review.reviewText}</p>
                )}

                {/* Restaurant Response */}
                {review.restaurantResponse && (
                  <div className="mt-4 pl-4 border-l-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-r-lg">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
                      Restaurant Response
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {review.restaurantResponse}
                    </p>
                    {review.restaurantResponseAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(review.restaurantResponseAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleVoteHelpful(review._id)}
                    disabled={!userId}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({review.helpfulCount})
                  </button>
                  <button
                    onClick={() => handleReport(review._id)}
                    disabled={!userId}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                </div>
              </div>
            ))}

            {/* Show More Button */}
            {reviews.length > 3 && !showAllReviews && (
              <Button
                variant="outline"
                onClick={() => setShowAllReviews(true)}
                className="w-full"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Show All {reviews.length} Reviews
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
