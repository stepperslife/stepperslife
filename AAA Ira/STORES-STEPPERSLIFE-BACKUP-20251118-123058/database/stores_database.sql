--
-- PostgreSQL database dump
--

\restrict 2VmvgJyIZXfvieXjDbXNJPBYko2E8ESGyNFDbfNFWETYGtYcDaPyiT5S0ht6oGO

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AddonFieldType; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."AddonFieldType" AS ENUM (
    'TEXT',
    'TEXTAREA',
    'NUMBER',
    'SELECT',
    'CHECKBOX',
    'RADIO',
    'DATE',
    'FILE',
    'COLOR',
    'IMAGE_BUTTONS'
);


ALTER TYPE public."AddonFieldType" OWNER TO stepperslife;

--
-- Name: AnnouncementStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."AnnouncementStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'SCHEDULED',
    'ARCHIVED'
);


ALTER TYPE public."AnnouncementStatus" OWNER TO stepperslife;

--
-- Name: AnnouncementTarget; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."AnnouncementTarget" AS ENUM (
    'ALL_VENDORS',
    'SPECIFIC_VENDORS'
);


ALTER TYPE public."AnnouncementTarget" OWNER TO stepperslife;

--
-- Name: ArticleCategory; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."ArticleCategory" AS ENUM (
    'NEWS',
    'EVENTS',
    'INTERVIEWS',
    'HISTORY',
    'TUTORIALS',
    'LIFESTYLE',
    'FASHION',
    'CULTURE',
    'COMMUNITY'
);


ALTER TYPE public."ArticleCategory" OWNER TO stepperslife;

--
-- Name: ArticleStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."ArticleStatus" AS ENUM (
    'DRAFT',
    'REVIEW',
    'APPROVED',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."ArticleStatus" OWNER TO stepperslife;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'FREE_SHIPPING'
);


ALTER TYPE public."DiscountType" OWNER TO stepperslife;

--
-- Name: DomainStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."DomainStatus" AS ENUM (
    'PENDING',
    'VERIFYING',
    'VERIFIED',
    'FAILED',
    'ACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."DomainStatus" OWNER TO stepperslife;

--
-- Name: FulfillmentStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."FulfillmentStatus" AS ENUM (
    'UNFULFILLED',
    'PARTIALLY_FULFILLED',
    'FULFILLED',
    'SHIPPED',
    'DELIVERED'
);


ALTER TYPE public."FulfillmentStatus" OWNER TO stepperslife;

--
-- Name: MarketplaceOrderStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."MarketplaceOrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."MarketplaceOrderStatus" OWNER TO stepperslife;

--
-- Name: MarketplacePaymentStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."MarketplacePaymentStatus" AS ENUM (
    'PENDING',
    'AUTHORIZED',
    'PAID',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


ALTER TYPE public."MarketplacePaymentStatus" OWNER TO stepperslife;

--
-- Name: PaymentProcessor; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."PaymentProcessor" AS ENUM (
    'STRIPE',
    'PAYPAL',
    'SQUARE',
    'CASH'
);


ALTER TYPE public."PaymentProcessor" OWNER TO stepperslife;

--
-- Name: PriceType; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."PriceType" AS ENUM (
    'FIXED',
    'PERCENTAGE',
    'FORMULA'
);


ALTER TYPE public."PriceType" OWNER TO stepperslife;

--
-- Name: ProductCategory; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."ProductCategory" AS ENUM (
    'ACCESSORIES',
    'ART_AND_COLLECTIBLES',
    'BAGS_AND_PURSES',
    'BATH_AND_BEAUTY',
    'BOOKS_MOVIES_AND_MUSIC',
    'CLOTHING',
    'CRAFT_SUPPLIES_AND_TOOLS',
    'ELECTRONICS_AND_ACCESSORIES',
    'HOME_AND_LIVING',
    'JEWELRY',
    'PAPER_AND_PARTY_SUPPLIES',
    'PET_SUPPLIES',
    'SHOES',
    'TOYS_AND_GAMES',
    'WEDDINGS'
);


ALTER TYPE public."ProductCategory" OWNER TO stepperslife;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'OUT_OF_STOCK',
    'ARCHIVED'
);


ALTER TYPE public."ProductStatus" OWNER TO stepperslife;

--
-- Name: PromotionStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."PromotionStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SCHEDULED',
    'EXPIRED'
);


ALTER TYPE public."PromotionStatus" OWNER TO stepperslife;

--
-- Name: PromotionType; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."PromotionType" AS ENUM (
    'ORDER_BUMP',
    'UPSELL',
    'CROSS_SELL'
);


ALTER TYPE public."PromotionType" OWNER TO stepperslife;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PUBLISHED',
    'FLAGGED',
    'HIDDEN',
    'DELETED'
);


ALTER TYPE public."ReviewStatus" OWNER TO stepperslife;

--
-- Name: SSLStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."SSLStatus" AS ENUM (
    'PENDING',
    'REQUESTING',
    'ACTIVE',
    'EXPIRED',
    'FAILED'
);


ALTER TYPE public."SSLStatus" OWNER TO stepperslife;

--
-- Name: ShippingType; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."ShippingType" AS ENUM (
    'FLAT_RATE',
    'FREE_SHIPPING',
    'WEIGHT_BASED',
    'LOCAL_PICKUP'
);


ALTER TYPE public."ShippingType" OWNER TO stepperslife;

--
-- Name: SubscriptionPlan; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."SubscriptionPlan" AS ENUM (
    'TRIAL',
    'STARTER',
    'PRO',
    'ENTERPRISE'
);


ALTER TYPE public."SubscriptionPlan" OWNER TO stepperslife;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'TRIAL',
    'ACTIVE',
    'PAST_DUE',
    'CANCELLED',
    'PAUSED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO stepperslife;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'USER',
    'STORE_OWNER',
    'STORE_ADMIN',
    'RESTAURANT_OWNER',
    'EVENT_ORGANIZER',
    'INSTRUCTOR',
    'SERVICE_PROVIDER',
    'MAGAZINE_WRITER',
    'RESTAURANT_MANAGER',
    'RESTAURANT_STAFF',
    'EVENT_STAFF',
    'AFFILIATE',
    'MAGAZINE_EDITOR'
);


ALTER TYPE public."UserRole" OWNER TO stepperslife;

--
-- Name: VariantType; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."VariantType" AS ENUM (
    'SIZE',
    'COLOR'
);


ALTER TYPE public."VariantType" OWNER TO stepperslife;

--
-- Name: WithdrawMethod; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."WithdrawMethod" AS ENUM (
    'BANK_TRANSFER',
    'PAYPAL',
    'STRIPE',
    'SKRILL'
);


ALTER TYPE public."WithdrawMethod" OWNER TO stepperslife;

--
-- Name: WithdrawStatus; Type: TYPE; Schema: public; Owner: stepperslife
--

CREATE TYPE public."WithdrawStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'PROCESSING',
    'PAID',
    'CANCELLED',
    'REJECTED'
);


ALTER TYPE public."WithdrawStatus" OWNER TO stepperslife;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO stepperslife;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO stepperslife;

--
-- Name: Store; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public."Store" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "ownerId" text NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Store" OWNER TO stepperslife;

--
-- Name: User; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    password text
);


ALTER TABLE public."User" OWNER TO stepperslife;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO stepperslife;

--
-- Name: abandoned_carts; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.abandoned_carts (
    id text NOT NULL,
    "cartSessionId" text NOT NULL,
    "vendorStoreId" text NOT NULL,
    "customerEmail" text,
    "customerName" text,
    "cartData" jsonb NOT NULL,
    "cartTotal" numeric(10,2) NOT NULL,
    "itemCount" integer NOT NULL,
    "recoveryToken" text NOT NULL,
    "reminderSentAt" timestamp(3) without time zone,
    "secondReminderSentAt" timestamp(3) without time zone,
    "thirdReminderSentAt" timestamp(3) without time zone,
    "recoveredAt" timestamp(3) without time zone,
    "isRecovered" boolean DEFAULT false NOT NULL,
    "discountCode" text,
    "discountPercent" integer DEFAULT 10 NOT NULL,
    "discountCodeUsed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.abandoned_carts OWNER TO stepperslife;

--
-- Name: announcement_reads; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.announcement_reads (
    id text NOT NULL,
    "announcementId" text NOT NULL,
    "vendorStoreId" text NOT NULL,
    "readAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.announcement_reads OWNER TO stepperslife;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.announcements (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "targetType" public."AnnouncementTarget" NOT NULL,
    "targetVendors" text[],
    status public."AnnouncementStatus" DEFAULT 'DRAFT'::public."AnnouncementStatus" NOT NULL,
    "publishAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text NOT NULL
);


ALTER TABLE public.announcements OWNER TO stepperslife;

--
-- Name: article_likes; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.article_likes (
    id text NOT NULL,
    "articleId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.article_likes OWNER TO stepperslife;

--
-- Name: articles; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.articles (
    id text NOT NULL,
    "authorId" text NOT NULL,
    "authorName" text NOT NULL,
    "authorPhoto" text,
    "authorBio" text,
    title text NOT NULL,
    slug text NOT NULL,
    subtitle text,
    excerpt text,
    content text NOT NULL,
    "metaTitle" character varying(60),
    "metaDescription" character varying(160),
    status public."ArticleStatus" DEFAULT 'DRAFT'::public."ArticleStatus" NOT NULL,
    category public."ArticleCategory" NOT NULL,
    "subCategory" text,
    tags text[],
    "featuredImageUrl" text,
    "featuredImageAlt" text,
    "featuredImageCaption" text,
    "contentBlocks" jsonb,
    "readingTime" integer,
    "reviewedBy" text,
    "reviewNotes" text,
    "publishedAt" timestamp(3) without time zone,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "featuredUntil" timestamp(3) without time zone,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "likeCount" integer DEFAULT 0 NOT NULL,
    "shareCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.articles OWNER TO stepperslife;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    color text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categories OWNER TO stepperslife;

--
-- Name: comment_flags; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.comment_flags (
    id text NOT NULL,
    "commentId" text NOT NULL,
    "userId" text NOT NULL,
    reason text NOT NULL,
    details text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.comment_flags OWNER TO stepperslife;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.comments (
    id text NOT NULL,
    "articleId" text NOT NULL,
    "userId" text NOT NULL,
    "userName" text NOT NULL,
    "userPhoto" text,
    content text NOT NULL,
    "parentId" text,
    "isApproved" boolean DEFAULT true NOT NULL,
    "isFlagged" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "flagCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.comments OWNER TO stepperslife;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    "vendorStoreId" text NOT NULL,
    code text NOT NULL,
    description text,
    "discountType" public."DiscountType" NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    "minPurchaseAmount" numeric(10,2),
    "maxDiscountAmount" numeric(10,2),
    "usageLimit" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "perCustomerLimit" integer,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "applicableProducts" text[],
    "applicableCategories" text[],
    "excludedProducts" text[],
    "firstTimeCustomersOnly" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.coupons OWNER TO stepperslife;

--
-- Name: media; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.media (
    id text NOT NULL,
    filename text NOT NULL,
    "originalName" text NOT NULL,
    url text NOT NULL,
    "mimeType" text NOT NULL,
    size integer NOT NULL,
    width integer,
    height integer,
    alt text,
    caption text,
    credit text,
    "bucketKey" text NOT NULL,
    "uploadedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.media OWNER TO stepperslife;

--
-- Name: order_promotions; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.order_promotions (
    id text NOT NULL,
    "vendorStoreId" text NOT NULL,
    type public."PromotionType" NOT NULL,
    title text NOT NULL,
    description text,
    "productId" text NOT NULL,
    "variantId" text,
    "discountType" public."DiscountType" NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    "freeShipping" boolean DEFAULT false NOT NULL,
    status public."PromotionStatus" DEFAULT 'ACTIVE'::public."PromotionStatus" NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    conditions jsonb,
    "displayCount" integer DEFAULT 0 NOT NULL,
    "acceptedCount" integer DEFAULT 0 NOT NULL,
    "revenueAdded" numeric(12,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_promotions OWNER TO stepperslife;

--
-- Name: product_addons; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.product_addons (
    id text NOT NULL,
    "productId" text,
    "storeId" text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "allowMultiple" boolean DEFAULT false NOT NULL,
    "maxQuantity" integer,
    "requiredForVariants" jsonb,
    "excludedForVariants" jsonb,
    "imageUrl" text,
    icon text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "conditionalLogic" jsonb,
    "fieldType" public."AddonFieldType" DEFAULT 'TEXT'::public."AddonFieldType" NOT NULL,
    "maxValue" numeric(10,2),
    "minValue" numeric(10,2),
    options jsonb,
    "priceFormula" text,
    "priceType" public."PriceType" DEFAULT 'FIXED'::public."PriceType" NOT NULL
);


ALTER TABLE public.product_addons OWNER TO stepperslife;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    thumbnail text,
    medium text,
    large text,
    "altText" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_images OWNER TO stepperslife;

--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.product_reviews (
    id text NOT NULL,
    "productId" text NOT NULL,
    "orderItemId" text NOT NULL,
    "customerId" text,
    "vendorStoreId" text NOT NULL,
    rating integer NOT NULL,
    title character varying(100),
    review text NOT NULL,
    "photoUrls" text[],
    "isVerifiedPurchase" boolean DEFAULT true NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text NOT NULL,
    "vendorResponse" text,
    "vendorRespondedAt" timestamp(3) without time zone,
    status public."ReviewStatus" DEFAULT 'PUBLISHED'::public."ReviewStatus" NOT NULL,
    "flaggedAt" timestamp(3) without time zone,
    "flagReason" text,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "unhelpfulCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_reviews OWNER TO stepperslife;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    price numeric(10,2),
    sku text,
    quantity integer DEFAULT 0 NOT NULL,
    "imageUrl" text,
    available boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_variants OWNER TO stepperslife;

--
-- Name: products; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.products (
    id text NOT NULL,
    "vendorStoreId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    "compareAtPrice" numeric(10,2),
    sku text,
    quantity integer DEFAULT 0 NOT NULL,
    "trackInventory" boolean DEFAULT true NOT NULL,
    "lowStockThreshold" integer DEFAULT 5 NOT NULL,
    category public."ProductCategory" NOT NULL,
    subcategory text,
    tags text[],
    "hasVariants" boolean DEFAULT false NOT NULL,
    "variantType" public."VariantType",
    weight numeric(8,2),
    "requiresShipping" boolean DEFAULT true NOT NULL,
    "metaTitle" character varying(60),
    "metaDescription" character varying(160),
    status public."ProductStatus" DEFAULT 'DRAFT'::public."ProductStatus" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "salesCount" integer DEFAULT 0 NOT NULL,
    "averageRating" numeric(3,2),
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "variantTypes" text[] DEFAULT ARRAY[]::text[],
    "useMultiVariants" boolean DEFAULT false NOT NULL,
    "quantityAvailable" integer,
    "quantityCommitted" integer DEFAULT 0 NOT NULL,
    "quantityOnHold" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO stepperslife;

--
-- Name: shipping_rates; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.shipping_rates (
    id text NOT NULL,
    "zoneId" text NOT NULL,
    name text NOT NULL,
    type public."ShippingType" NOT NULL,
    cost numeric(10,2) NOT NULL,
    "minOrderAmount" numeric(10,2),
    "isEnabled" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.shipping_rates OWNER TO stepperslife;

--
-- Name: shipping_zones; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.shipping_zones (
    id text NOT NULL,
    "vendorStoreId" text NOT NULL,
    name text NOT NULL,
    regions jsonb NOT NULL,
    "isEnabled" boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.shipping_zones OWNER TO stepperslife;

--
-- Name: shop_ratings; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.shop_ratings (
    id text NOT NULL,
    "vendorStoreId" text NOT NULL,
    "averageRating" numeric(3,2) NOT NULL,
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "fiveStars" integer DEFAULT 0 NOT NULL,
    "fourStars" integer DEFAULT 0 NOT NULL,
    "threeStars" integer DEFAULT 0 NOT NULL,
    "twoStars" integer DEFAULT 0 NOT NULL,
    "oneStar" integer DEFAULT 0 NOT NULL,
    "lastCalculated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.shop_ratings OWNER TO stepperslife;

--
-- Name: store_hours; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.store_hours (
    id text NOT NULL,
    "vendorStoreId" text NOT NULL,
    monday jsonb,
    tuesday jsonb,
    wednesday jsonb,
    thursday jsonb,
    friday jsonb,
    saturday jsonb,
    sunday jsonb,
    timezone text DEFAULT 'America/New_York'::text NOT NULL,
    "isEnabled" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.store_hours OWNER TO stepperslife;

--
-- Name: store_order_items; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.store_order_items (
    id text NOT NULL,
    "storeOrderId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    name text NOT NULL,
    sku text,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    "variantName" text,
    "imageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    addons jsonb,
    "variantCombinationId" text,
    "variantDetails" jsonb
);


ALTER TABLE public.store_order_items OWNER TO stepperslife;

--
-- Name: store_orders; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.store_orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "vendorStoreId" text NOT NULL,
    "customerId" text,
    "customerEmail" text NOT NULL,
    "customerName" text NOT NULL,
    "customerPhone" text,
    "shippingAddress" jsonb NOT NULL,
    "billingAddress" jsonb NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "shippingCost" numeric(10,2) NOT NULL,
    "taxAmount" numeric(10,2) NOT NULL,
    "discountAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    "platformFee" numeric(10,2) NOT NULL,
    "vendorPayout" numeric(10,2) NOT NULL,
    "paymentProcessor" public."PaymentProcessor" DEFAULT 'STRIPE'::public."PaymentProcessor" NOT NULL,
    "paymentIntentId" text,
    "paymentStatus" public."MarketplacePaymentStatus" DEFAULT 'PENDING'::public."MarketplacePaymentStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "fulfillmentStatus" public."FulfillmentStatus" DEFAULT 'UNFULFILLED'::public."FulfillmentStatus" NOT NULL,
    "shippingMethod" text,
    "trackingNumber" text,
    carrier text,
    "shippedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    status public."MarketplaceOrderStatus" DEFAULT 'PENDING'::public."MarketplaceOrderStatus" NOT NULL,
    "customerNotes" text,
    "internalNotes" text,
    "cancelledAt" timestamp(3) without time zone,
    "cancelReason" text,
    "refundedAt" timestamp(3) without time zone,
    "refundAmount" numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "couponCode" text,
    "couponId" text
);


ALTER TABLE public.store_orders OWNER TO stepperslife;

--
-- Name: store_vacations; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.store_vacations (
    id text NOT NULL,
    "vendorStoreId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    message text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.store_vacations OWNER TO stepperslife;

--
-- Name: subscription_history; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.subscription_history (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    plan public."SubscriptionPlan" NOT NULL,
    amount numeric(10,2) NOT NULL,
    "stripePriceId" text NOT NULL,
    "stripeInvoiceId" text,
    status text NOT NULL,
    "billingPeriodStart" timestamp(3) without time zone NOT NULL,
    "billingPeriodEnd" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.subscription_history OWNER TO stepperslife;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "ownerId" text NOT NULL,
    "subscriptionPlan" public."SubscriptionPlan" DEFAULT 'TRIAL'::public."SubscriptionPlan" NOT NULL,
    "subscriptionStatus" public."SubscriptionStatus" DEFAULT 'TRIAL'::public."SubscriptionStatus" NOT NULL,
    "stripeCustomerId" text,
    "stripeSubscriptionId" text,
    "stripePriceId" text,
    "currentPeriodEnd" timestamp(3) without time zone,
    "customDomain" text,
    "customDomainVerified" boolean DEFAULT false NOT NULL,
    "customDomainStatus" public."DomainStatus" DEFAULT 'PENDING'::public."DomainStatus" NOT NULL,
    "customDomainDnsRecord" text,
    "sslCertificateStatus" public."SSLStatus" DEFAULT 'PENDING'::public."SSLStatus" NOT NULL,
    "sslCertificateExpiry" timestamp(3) without time zone,
    "sslLastCheckedAt" timestamp(3) without time zone,
    "maxProducts" integer DEFAULT 10 NOT NULL,
    "maxOrders" integer DEFAULT 20 NOT NULL,
    "maxStorageGB" numeric(5,2) DEFAULT 0.5 NOT NULL,
    "currentProducts" integer DEFAULT 0 NOT NULL,
    "currentOrders" integer DEFAULT 0 NOT NULL,
    "currentStorageGB" numeric(5,2) DEFAULT 0 NOT NULL,
    "platformFeePercent" numeric(5,2) DEFAULT 7.0 NOT NULL,
    "trialEndsAt" timestamp(3) without time zone,
    "logoUrl" text,
    "primaryColor" text DEFAULT '#10b981'::text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tenants OWNER TO stepperslife;

--
-- Name: usage_records; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.usage_records (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    metric text NOT NULL,
    quantity integer NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.usage_records OWNER TO stepperslife;

--
-- Name: variant_combinations; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.variant_combinations (
    id text NOT NULL,
    "productId" text NOT NULL,
    "combinationKey" text NOT NULL,
    "optionValues" jsonb NOT NULL,
    sku text,
    price numeric(10,2),
    "compareAtPrice" numeric(10,2),
    quantity integer DEFAULT 0 NOT NULL,
    "inventoryTracked" boolean DEFAULT true NOT NULL,
    "lowStockThreshold" integer,
    available boolean DEFAULT true NOT NULL,
    "inStock" boolean DEFAULT true NOT NULL,
    "imageUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "quantityAvailable" integer,
    "quantityCommitted" integer DEFAULT 0 NOT NULL,
    "quantityOnHold" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.variant_combinations OWNER TO stepperslife;

--
-- Name: variant_options; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.variant_options (
    id text NOT NULL,
    "productId" text NOT NULL,
    type text NOT NULL,
    value text NOT NULL,
    "displayName" text NOT NULL,
    "hexColor" text,
    "imageUrl" text,
    icon text,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.variant_options OWNER TO stepperslife;

--
-- Name: vendor_followers; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.vendor_followers (
    id text NOT NULL,
    "vendorStoreId" text NOT NULL,
    "customerId" text NOT NULL,
    "followedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "notifyNewProducts" boolean DEFAULT true NOT NULL,
    "notifySales" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.vendor_followers OWNER TO stepperslife;

--
-- Name: vendor_stores; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.vendor_stores (
    id text NOT NULL,
    "storeId" text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    tagline character varying(100),
    description text,
    "logoUrl" text,
    "bannerUrl" text,
    email text NOT NULL,
    phone text,
    "shipFromAddress" jsonb,
    "shippingRates" jsonb,
    "stripeAccountId" text,
    "stripeChargesEnabled" boolean DEFAULT false NOT NULL,
    "stripeDetailsSubmitted" boolean DEFAULT false NOT NULL,
    "platformFeePercent" numeric(5,2) DEFAULT 7.0 NOT NULL,
    "totalProducts" integer DEFAULT 0 NOT NULL,
    "totalOrders" integer DEFAULT 0 NOT NULL,
    "totalSales" numeric(12,2) DEFAULT 0 NOT NULL,
    "averageRating" numeric(3,2),
    "totalReviews" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "primaryPaymentProcessor" public."PaymentProcessor" DEFAULT 'STRIPE'::public."PaymentProcessor" NOT NULL,
    "secondaryPaymentProcessor" public."PaymentProcessor",
    "paypalEmail" text,
    "paypalMerchantId" text,
    "squareAccessToken" text,
    "squareLocationId" text,
    "acceptsCash" boolean DEFAULT false NOT NULL,
    "cashInstructions" text,
    "tenantId" text,
    "bankAccountDetails" jsonb,
    "isVerified" boolean DEFAULT false NOT NULL,
    "minimumWithdraw" numeric(10,2) DEFAULT 50 NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "withdrawBalance" numeric(12,2) DEFAULT 0 NOT NULL,
    "withdrawMethod" public."WithdrawMethod"
);


ALTER TABLE public.vendor_stores OWNER TO stepperslife;

--
-- Name: vendor_withdraws; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.vendor_withdraws (
    id text NOT NULL,
    "vendorStoreId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    method public."WithdrawMethod" NOT NULL,
    status public."WithdrawStatus" DEFAULT 'PENDING'::public."WithdrawStatus" NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone,
    notes text,
    "adminNotes" text,
    "bankDetails" jsonb
);


ALTER TABLE public.vendor_withdraws OWNER TO stepperslife;

--
-- Name: writer_profiles; Type: TABLE; Schema: public; Owner: stepperslife
--

CREATE TABLE public.writer_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    "displayName" text NOT NULL,
    bio text NOT NULL,
    expertise text[],
    "photoUrl" text,
    "instagramUrl" text,
    "twitterUrl" text,
    "websiteUrl" text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "totalArticles" integer DEFAULT 0 NOT NULL,
    "totalViews" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.writer_profiles OWNER TO stepperslife;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
cmgs6bmf40002jxqw4ef104je	cmgs6bmf10000jxqwm4y3tpjl	oidc	google	105197143788980099930	\N	ya29.a0AQQ_BDQzib3dWivI8WkKwyVGQdnZ3eBB6hlFjFuquVYusJKR6TOyf5wQvCYCju0V666LZ5vGheYw3FKALKmXQ_GvhrpKKXtQcosxz6fdkihCeVc3e8LxWrBmNjp1SAJvZJjdrWApPAmRErt9R_wynuwZmeiEzWh2_kidFEUxGdg-6Ymv1TIowuRPuTIOuq-fnrDYWO-oaCgYKAUUSARYSFQHGX2MiuoDm57HbLHbHZyuYcnvQyg0207	1760547399	bearer	https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid	eyJhbGciOiJSUzI1NiIsImtpZCI6ImZiOWY5MzcxZDU3NTVmM2UzODNhNDBhYjNhMTcyY2Q4YmFjYTUxN2YiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMjU1NDMzMzg0OTAtYnJrMGNtb2RwcmRldG8yc2cxOXByampsc2M5ZGlrcnYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzMjU1NDMzMzg0OTAtYnJrMGNtb2RwcmRldG8yc2cxOXByampsc2M5ZGlrcnYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDUxOTcxNDM3ODg5ODAwOTk5MzAiLCJlbWFpbCI6ImlyYWR3YXRraW5zQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoicVJ2MzUwRzI3S3puSG5sRmNRS29NZyIsIm5hbWUiOiIqIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pvMGczdUM5Z1FFQlhWYW0tN2xzX3hGem5wR05HVjZKdTFQN0UtMnpucTZ0UXYtWnFyPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IioiLCJpYXQiOjE3NjA1NDM4MDAsImV4cCI6MTc2MDU0NzQwMH0.fQ5HFksibtIfohjhGnhJG2XJG1088gEDXRp9oh_Bl3d6X9u0aDzVeRMNdQmto6GfcrQLajAlSk-GjFlLXlyMBokg3ycdxzR97Kvk68tWGIxdBuMFw9KYOMdczzGtIJLFuHvyruYg39XB8kU85qGJrXTLy6ZH1RhlcedAg4mUEWwuZswpj2UAjg_nb0MD5dMwiIddkJ4CLZoD4cKPMKdLEfinK60eSnZw32D4C8SM-jTEkeCivsOIL1Aj0DM7_g18zvUqJa4EXpITVABB9KSDO4onICFNPOrpfSLZof0951tttlE61KEeMFehh10siLiwG1ru7advVBCg7ibUioWeQg	\N
cmgs6j2hd0007jxqwzogk88qq	cmgs6j2hb0005jxqwrocbtw57	oidc	google	108862183532381339593	\N	ya29.a0AQQ_BDTj-NypTr5h6FqdWIyqAH5RqWC-iAENvP1UKTqOwsUmCIggtlC0g-3kQEHXldFBFRREZl4YI-M_Y4Wf2Kxo9oJqBSEACGQcw53vo1KVTvITFigNMThuNlf7LMwXFbYFCK6tepIe543y8ISWnGuW3QyVeu6LWkYoTyGOx3XEZa3z3weRDv8dJg9m_pil8l_2gENEaCgYKAWUSARMSFQHGX2MiaZWiEfX39wwfzH7fB6IfnQ0207	1760547746	bearer	openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email	eyJhbGciOiJSUzI1NiIsImtpZCI6ImZiOWY5MzcxZDU3NTVmM2UzODNhNDBhYjNhMTcyY2Q4YmFjYTUxN2YiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMjU1NDMzMzg0OTAtYnJrMGNtb2RwcmRldG8yc2cxOXByampsc2M5ZGlrcnYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzMjU1NDMzMzg0OTAtYnJrMGNtb2RwcmRldG8yc2cxOXByampsc2M5ZGlrcnYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDg4NjIxODM1MzIzODEzMzk1OTMiLCJlbWFpbCI6InRoZXN0ZXBwZXJzbGlmZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Ink5UUFwYms4VzVxdzA0YWxKTmNsbXciLCJuYW1lIjoiU3RlcHBlcnMgTGlmZSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKNEwtX2VOSDFoMG4xQXZmcEZBT0ZxTzNhZ1lIODZTanpPVGxhUjJWbFlvOFpQTXc9czk2LWMiLCJnaXZlbl9uYW1lIjoiU3RlcHBlcnMiLCJmYW1pbHlfbmFtZSI6IkxpZmUiLCJpYXQiOjE3NjA1NDQxNDcsImV4cCI6MTc2MDU0Nzc0N30.mkUuYU7-1CPKS8MFHKxVG1YHPwuyyYFn5oGKuQB4VT92EIOq3ehF3CXgWyioyExGXcGcPnYbK-Z_zwbCgjYnq2AwCa_oL0L0_ylvImKjjMkXbbNjhjDV-JCQ6LKCkC-s4v1Tw3eN_I1CpXapekDTU_FNTi20SCgUskRrX5nZ1ENJJnVyVzX3-xeezIHbcJuuYTPDgbZkuByisWLlTsGU6JTzhCzsQLIDz1TG004r7vC3Dv9N_I6LrHjQ5nPM8JYaqJqwg3TZ32WTa-9erX0msKBAer8AJGsnNI3l3NUAaSL836VC7zKX-tP70MJq8ooAk-vJypf_MH8M5GzeXvsLBA	\N
cmgsnpyvs0002jxszgbitvxyx	cmgsnpyvk0000jxszvvzk8e3w	oidc	google	115556781030581759084	\N	ya29.a0AQQ_BDRxNVdTebOz_BVcXoP8Tti4wl07cQd7Up8plCJtkaKhJoSrZnQtJVqF3MQnkZhL1jwTca85OS9u4lcJp7L7uaRJiHsCP3OW8koCQoUooaMEZHEdY4RZr0MgTtR0kKtIhpMzVbrmmwzdyt250L5EmFmqym1T4vhlZuGugjS6tvh5Gp-9nZuy8PiUmXt52zU5hHS9QQaCgYKAeQSARASFQHGX2MiV3DXevm1kllv6iBPsE5VwQ0209	1760576621	bearer	https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/userinfo.profile	eyJhbGciOiJSUzI1NiIsImtpZCI6ImZiOWY5MzcxZDU3NTVmM2UzODNhNDBhYjNhMTcyY2Q4YmFjYTUxN2YiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMjU1NDMzMzg0OTAtYnJrMGNtb2RwcmRldG8yc2cxOXByampsc2M5ZGlrcnYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzMjU1NDMzMzg0OTAtYnJrMGNtb2RwcmRldG8yc2cxOXByampsc2M5ZGlrcnYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTU1NTY3ODEwMzA1ODE3NTkwODQiLCJlbWFpbCI6ImJvYmJ5Z3dhdGtpbnNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiIzQ05nSzhFNmZWemFCMU5rWUZTRS1RIiwibmFtZSI6ImJvYmJ5IEcuIFdhdGtpbnMiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTHd4c2NjU1o5Q2h1V0EtdlU5YzhZWkxqT0NVUC1waWp6eVU2ZVo5ZEZLSWtPQlh3PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6ImJvYmJ5IEcuIiwiZmFtaWx5X25hbWUiOiJXYXRraW5zIiwiaWF0IjoxNzYwNTczMDIzLCJleHAiOjE3NjA1NzY2MjN9.X0xgu3EfsXBKaztp81UhE_vhhT9VTyG0ojlfABIsTyRdmFNWNCf4YANAnDqwQb0wvV-l1Av0iDL1tLYEF_xpKfcsizfe7dY-xUW-b-QO9Ryn9Ga8QvOquoq4pSJG2h5x0tLZZn4UNkbP0OxEXIs-NKvzetn_Zr-oVyjiqfRLlUh_MksqyeNMh8tzR65rvFpgO1Y0RL61Z9xbzzVb3tAnJ0NTgh6UQoULsHwoPQC6XP4qt1Nu4b-ApuUMQfwT2mz1Khxt4YrCKLkm7sQYjbMDg8Ew1AFPuNijqMvRQIZdEURVR-6X-SSvEEfEFDdMo4oSh2EDF_BSg7xBEgxzjcvEOA	\N
cmhzcnf830002jxx8w7eoqx7p	cmhzcnf800000jxx8qqzm03m9	oidc	google	105693528721906235785	\N	ya29.A0ATi6K2vsPy3C_0HYs0u53mxDZ9ozlVWONC5ytGbMxeCqMNJWLT6oTpHLPPNFX7reUxk-b4vfoP286L3FExu_bUlYwFuA2CH9nT3aUU_ttEsZVGVt_1bgKQ7Ve4TqKOc6lpWxuzvVEZbSrxd17Pk9QB0K7NUZNOEGwhKXv1KTFWcZ-yVB4izuYR1YMhjGNFm165GmvCXlqTwKPI3UTWiuluZtTYuVJMaf4O2Hs1dvMs1QGJQwVpcUoGiI-bQz2RaRn3bLM_SxVqXfPwgnqlZUeRZmrNPFOEAaCgYKAeUSARISFQHGX2MiUvTofcH3o0yAOtj3dUIEzw0294	1763158072	bearer	openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email	eyJhbGciOiJSUzI1NiIsImtpZCI6IjRmZWI0NGYwZjdhN2UyN2M3YzQwMzM3OWFmZjIwYWY1YzhjZjUyZGMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzMjU1NDMzMzg0OTAtYnJrMGNtb2RwcmRldG8yc2cxOXByampsc2M5ZGlrcnYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzMjU1NDMzMzg0OTAtYnJrMGNtb2RwcmRldG8yc2cxOXByampsc2M5ZGlrcnYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDU2OTM1Mjg3MjE5MDYyMzU3ODUiLCJlbWFpbCI6ImFwcHZpbGxhZ2VsbGNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJZNVNvRE00NF9MRWU5N0hTUjBnU0x3IiwibmFtZSI6IkJpbGxpbmcgJiBTaGlwcGluZyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLT3dpdkVMQmJJckNValBtMUM5N3F2MDlxYnJZVXdWdElUSnlvaEt0ejQ5bUtKaC14cT1zOTYtYyIsImdpdmVuX25hbWUiOiJCaWxsaW5nICYiLCJmYW1pbHlfbmFtZSI6IlNoaXBwaW5nIiwiaWF0IjoxNzYzMTU0NDc0LCJleHAiOjE3NjMxNTgwNzR9.C4-FGLJ3_kZ5lqg6liCwgk1zvTADG-Kq67d5GLHIuxUR4I5te8if656K4CcobKl9NnNnNIvfqF3jqv-3ISnkAHx-EGfUqQOZCGyYkHfkkBCz69typIJzGSJa3chhh9J3M8HPy2I4S-hz6onh1UK8DLzQZ8RJhMj8EluhOvLvYpaUBxysmII51xAkvFXkqLqpRnsFafrmm6IwssJtdN2590nLXdFVnhRVZnsvAFLBzI9UoVWFL59mLJfnMU8lwBVjpllL5vkAR9Vfhrzc49qV2bjbTzRgi8zb3Ie_XH6G6eJ6_Z99W4XYz3aW6w_1JItIhW-9GvrMemfnGkd3zvUTvA	\N
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
cmgwlccgu0029jxl2eyc0e863	16675287-3517-4091-ba2a-8ddcdfa1ce4f	cmgs6j2hb0005jxqwrocbtw57	2025-11-17 18:08:13.084
cmhzc0y7h0001jxcp1fndffg8	ee1a2b99-d5ac-4dce-b77c-789b36b70e07	cmgs6j2hb0005jxqwrocbtw57	2025-12-14 20:50:25.709
cmhzcnf870004jxx81kdqhmf2	a5101068-f267-4c66-a563-3f223300723c	cmhzcnf800000jxx8qqzm03m9	2025-12-14 21:07:54.198
\.


--
-- Data for Name: Store; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public."Store" (id, name, slug, "ownerId", "isActive", "createdAt", "updatedAt") FROM stdin;
cmgs732ck000ajxqw63fkv0h9	Bernard hat store	bernard	cmgs6j2hb0005jxqwrocbtw57	f	2025-10-15 16:18:00.741	2025-10-15 16:18:00.741
cmgsssw4x000djxszn1oslfrf	Color Tee Shirts	colorteeshirts	cmgsnpyvk0000jxszvvzk8e3w	f	2025-10-16 02:25:57.681	2025-10-16 02:25:57.681
store_1763154499466_nzv1jt3di	asdfasdfasd	ira-watkins	cmhzcnf800000jxx8qqzm03m9	f	2025-11-14 21:08:19.467	2025-11-14 21:08:19.467
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public."User" (id, name, email, "emailVerified", image, role, "createdAt", "updatedAt", password) FROM stdin;
cmgs6j2hb0005jxqwrocbtw57	Steppers Life	thestepperslife@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocJ4L-_eNH1h0n1AvfpFAOFqO3agYH86SjzOTlaR2VlYo8ZPMw=s96-c	STORE_OWNER	2025-10-15 16:02:27.791	2025-10-15 16:18:00.754	\N
cmgs6bmf10000jxqwm4y3tpjl	*	iradwatkins@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocJo0g3uC9gQEBXVam-7ls_xFznpGNGV6Ju1P7E-2znq6tQv-Zqr=s96-c	ADMIN	2025-10-15 15:56:40.382	2025-10-18 18:07:50.178	\N
cmgwunt0m0000jxbntejlrpct	Ira Watkins	ira@irawatkins.com	2025-10-18 22:29:04.292	\N	ADMIN	2025-10-18 22:29:04.294	2025-10-18 22:29:04.294	$2b$10$.1/9ygP1VO8iKyh8kl2vhOoBC2pnxDr7DktLNx00UrZNfMTUEJtQq
test_433864078	Test User	testuser@example.com	2025-10-19 13:21:28.135	\N	USER	2025-10-19 13:21:28.135	2025-10-19 13:21:28.135	$2b$10$/3YFwz4Wy1y8SmhIC5cOSej2/Hce1YJ.oYzc0ZFn6XoCMV6e0fX.a
test_normal_user_001	Normal Test User	normaluser@test.com	2025-10-19 14:04:53.116	\N	USER	2025-10-19 14:04:53.116	2025-10-19 14:04:53.116	$2b$10$B/Pisn/mU.ubJmCSecDmZ.jf/RvGX0W7oELqbovaLaWjCLYID8HH6
test_vendor_user_001	Vendor Test User	vendor@test.com	2025-10-19 14:04:53.119	\N	STORE_OWNER	2025-10-19 14:04:53.119	2025-10-19 14:04:53.119	$2b$10$AMhm6lNChQHBEUZgMRwYXu1eyxL0QglYPen53abI1p9iq0cavSAhi
cmgsnpyvk0000jxszvvzk8e3w	bobby G. Watkins	bobbygwatkins@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocLwxsccSZ9ChuWA-vU9c8YZLjOCUP-pijzyU6eZ9dFKIkOBXw=s96-c	ADMIN	2025-10-16 00:03:43.184	2025-10-17 17:53:59.83	\N
df856a1d1218ab140ed57a21	Test Vendor	testvendor@stepperslife.com	2025-11-12 19:55:14.289	\N	STORE_OWNER	2025-11-12 19:55:14.357	2025-11-12 19:55:14.357	\N
cmhwgs8iy0000jxc455rshrss	Shop Owner	shopowner@stepperslife.com	2025-11-12 20:40:18.662	\N	USER	2025-11-12 20:40:18.73	2025-11-12 20:40:18.73	\N
cmhzcnf800000jxx8qqzm03m9	Billing & Shipping	appvillagellc@gmail.com	\N	https://lh3.googleusercontent.com/a/ACg8ocKOwivELBbIrCUjPm1C97qv09qbrYUwVtITJyohKtz49mKJh-xq=s96-c	STORE_OWNER	2025-11-14 21:07:54.192	2025-11-14 21:07:54.192	\N
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: abandoned_carts; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.abandoned_carts (id, "cartSessionId", "vendorStoreId", "customerEmail", "customerName", "cartData", "cartTotal", "itemCount", "recoveryToken", "reminderSentAt", "secondReminderSentAt", "thirdReminderSentAt", "recoveredAt", "isRecovered", "discountCode", "discountPercent", "discountCodeUsed", "createdAt", "updatedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: announcement_reads; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.announcement_reads (id, "announcementId", "vendorStoreId", "readAt") FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.announcements (id, title, content, "targetType", "targetVendors", status, "publishAt", "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: article_likes; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.article_likes (id, "articleId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.articles (id, "authorId", "authorName", "authorPhoto", "authorBio", title, slug, subtitle, excerpt, content, "metaTitle", "metaDescription", status, category, "subCategory", tags, "featuredImageUrl", "featuredImageAlt", "featuredImageCaption", "contentBlocks", "readingTime", "reviewedBy", "reviewNotes", "publishedAt", "isFeatured", "featuredUntil", "viewCount", "likeCount", "shareCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.categories (id, name, slug, description, color, "createdAt") FROM stdin;
\.


--
-- Data for Name: comment_flags; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.comment_flags (id, "commentId", "userId", reason, details, "createdAt") FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.comments (id, "articleId", "userId", "userName", "userPhoto", content, "parentId", "isApproved", "isFlagged", "createdAt", "updatedAt", "deletedAt", "deletedBy", "flagCount") FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.coupons (id, "vendorStoreId", code, description, "discountType", "discountValue", "minPurchaseAmount", "maxDiscountAmount", "usageLimit", "usageCount", "perCustomerLimit", "startDate", "endDate", "isActive", "applicableProducts", "applicableCategories", "excludedProducts", "firstTimeCustomersOnly", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.media (id, filename, "originalName", url, "mimeType", size, width, height, alt, caption, credit, "bucketKey", "uploadedById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_promotions; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.order_promotions (id, "vendorStoreId", type, title, description, "productId", "variantId", "discountType", "discountValue", "freeShipping", status, priority, conditions, "displayCount", "acceptedCount", "revenueAdded", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_addons; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.product_addons (id, "productId", "storeId", name, description, price, "isRequired", "allowMultiple", "maxQuantity", "requiredForVariants", "excludedForVariants", "imageUrl", icon, "sortOrder", "isActive", "createdAt", "updatedAt", "conditionalLogic", "fieldType", "maxValue", "minValue", options, "priceFormula", "priceType") FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.product_images (id, "productId", url, thumbnail, medium, large, "altText", "sortOrder", "createdAt") FROM stdin;
cf0a96a2c2e48b476cd82449	bdfebbd8b3bab6cab71cc6c7	https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800	\N	\N	\N	Classic Crew Neck	0	2025-11-12 20:50:39.072
4c31684683bb3f95d7789299	94c805c481cc4efd557699c6	https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800	\N	\N	\N	Vintage Wash Tee	0	2025-11-12 20:50:39.14
d5a669b9ef8955b217b81417	9a6ea3fbecfc23c01f9e3734	https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800	\N	\N	\N	Premium V-Neck	0	2025-11-12 20:50:39.199
f264be0e4e55da37d655f9aa	6b486d564c5c5d2e284c5342	https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800	\N	\N	\N	Classic Polo	0	2025-11-12 20:50:39.269
fe2ecb3882008deb971f9819	06ee32c9ac00f8c475aca3b4	https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800	\N	\N	\N	Henley Long Sleeve	0	2025-11-12 20:50:39.336
292e5e4f36c70775c32b18d3	dae702177783e835d4d70246	https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800	\N	\N	\N	Long Sleeve Crew	0	2025-11-12 20:50:39.407
aeeae35500d0fccb4ce4ca20	1eecab038e59821264bbbb23	https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800	\N	\N	\N	Pocket Tee	0	2025-11-12 20:50:39.47
23ab3394f404587e43e36a6e	b296159ba233dd44e6a7b584	https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800	\N	\N	\N	Athletic Performance	0	2025-11-12 20:50:39.541
96ca268eb36fe209c005d042	b714e56e0dc77578e3457e66	https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800	\N	\N	\N	Classic Baseball Cap	0	2025-11-12 20:50:39.621
07b586aac538c4f0f2564fd9	cb076411fddaf2dac28d809e	https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800	\N	\N	\N	Snapback Flat Brim	0	2025-11-12 20:50:39.642
3c1fe9f6d693b0aad1a93332	ba61f67d8e2e16bce3a0d5e9	https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=800	\N	\N	\N	Trucker Mesh Cap	0	2025-11-12 20:50:39.674
7ee9e00bbeb9043946c4d811	197d12406547e42a6f5bc484	https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800	\N	\N	\N	Knit Beanie	0	2025-11-12 20:50:39.687
798056a1a0b2542fa8d35ce8	21d4e2f63ebd4fc6822fdca2	https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800	\N	\N	\N	Bucket Hat Classic	0	2025-11-12 20:50:39.698
b457187c1a85d4d9b01c78f0	d211d37587626b5dcc801bd2	https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=800	\N	\N	\N	Fedora Hat	0	2025-11-12 20:50:39.711
9305c25ac13124fbed11969d	91dc2206e5f7a1c0a7eb0b7c	https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800	\N	\N	\N	Dad Hat Low Profile	0	2025-11-12 20:50:39.721
5db8593ac7a5364e51fc0b53	2db4c4ce785e7a3c59225419	https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800	\N	\N	\N	Fitted Performance Cap	0	2025-11-12 20:50:39.731
c2893e56a34670dd9cd97836	7c8c3333aa56a6b5abf198fd	https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800	\N	\N	\N	Visor Sport	0	2025-11-12 20:50:39.742
1d856e1204a3a0450c9fd876	ac3ff669021524948e7b8970	https://images.unsplash.com/photo-1519709042477-8de6eaf1fdc5?w=800	\N	\N	\N	French Beret	0	2025-11-12 20:50:39.755
3ad5ce6ac4314e2968ffb82e	8571e831a8d37a7376db7883	https://images.unsplash.com/photo-1519709042477-8de6eaf1fdc5?w=800	\N	\N	\N	Newsboy Cap	0	2025-11-12 20:50:39.766
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.product_reviews (id, "productId", "orderItemId", "customerId", "vendorStoreId", rating, title, review, "photoUrls", "isVerifiedPurchase", "customerName", "customerEmail", "vendorResponse", "vendorRespondedAt", status, "flaggedAt", "flagReason", "helpfulCount", "unhelpfulCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.product_variants (id, "productId", name, value, price, sku, quantity, "imageUrl", available, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.products (id, "vendorStoreId", name, slug, description, price, "compareAtPrice", sku, quantity, "trackInventory", "lowStockThreshold", category, subcategory, tags, "hasVariants", "variantType", weight, "requiresShipping", "metaTitle", "metaDescription", status, "publishedAt", "viewCount", "salesCount", "averageRating", "reviewCount", "createdAt", "updatedAt", "variantTypes", "useMultiVariants", "quantityAvailable", "quantityCommitted", "quantityOnHold") FROM stdin;
94c805c481cc4efd557699c6	fe823f7d7c2ca75697705dcf	Vintage Wash Tee	vintage-tee	Worn-in feel	29.99	39.99	VINTAGE	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.138	2025-11-12 20:50:39.138	{SIZE,COLOR}	t	877	0	0
9a6ea3fbecfc23c01f9e3734	fe823f7d7c2ca75697705dcf	Premium V-Neck	vneck-tee	Flattering cut	26.99	36.99	VNECK	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.197	2025-11-12 20:50:39.197	{SIZE,COLOR}	t	860	0	0
6b486d564c5c5d2e284c5342	fe823f7d7c2ca75697705dcf	Classic Polo	polo-tee	Timeless style	39.99	54.99	POLO	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.266	2025-11-12 20:50:39.266	{SIZE,COLOR}	t	901	0	0
06ee32c9ac00f8c475aca3b4	fe823f7d7c2ca75697705dcf	Henley Long Sleeve	henley-tee	Stylish design	34.99	44.99	HENLEY	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.334	2025-11-12 20:50:39.334	{SIZE,COLOR}	t	881	0	0
dae702177783e835d4d70246	fe823f7d7c2ca75697705dcf	Long Sleeve Crew	longsleeve-tee	Extended coverage	29.99	39.99	LONGSLEEVE	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.405	2025-11-12 20:50:39.405	{SIZE,COLOR}	t	820	0	0
1eecab038e59821264bbbb23	fe823f7d7c2ca75697705dcf	Pocket Tee	pocket-tee	Functional pocket	27.99	37.99	POCKET	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.468	2025-11-12 20:50:39.468	{SIZE,COLOR}	t	835	0	0
b296159ba233dd44e6a7b584	fe823f7d7c2ca75697705dcf	Athletic Performance	athletic-tee	Moisture-wicking	32.99	44.99	ATHLETIC	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.54	2025-11-12 20:50:39.54	{SIZE,COLOR}	t	958	0	0
bdfebbd8b3bab6cab71cc6c7	fe823f7d7c2ca75697705dcf	Classic Crew Neck	crew-tee	Premium cotton	24.99	34.99	CREW	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.068	2025-11-12 20:50:39.068	{SIZE,COLOR}	t	868	0	0
b714e56e0dc77578e3457e66	b8c3e336e6cdc2322a1cc2d9	Classic Baseball Cap	baseball-hat	Structured cap	22.99	29.99	BASEBALL	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.619	2025-11-12 20:50:39.619	{SIZE}	t	106	0	0
cb076411fddaf2dac28d809e	b8c3e336e6cdc2322a1cc2d9	Snapback Flat Brim	snapback-hat	Urban style	24.99	32.99	SNAPBACK	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.64	2025-11-12 20:50:39.64	{SIZE}	t	91	0	0
ba61f67d8e2e16bce3a0d5e9	b8c3e336e6cdc2322a1cc2d9	Trucker Mesh Cap	trucker-hat	Breathable mesh	19.99	27.99	TRUCKER	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.669	2025-11-12 20:50:39.669	{SIZE}	t	119	0	0
197d12406547e42a6f5bc484	b8c3e336e6cdc2322a1cc2d9	Knit Beanie	beanie-hat	Cozy knit	18.99	25.99	BEANIE	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.685	2025-11-12 20:50:39.685	{SIZE}	t	117	0	0
21d4e2f63ebd4fc6822fdca2	b8c3e336e6cdc2322a1cc2d9	Bucket Hat Classic	bucket-hat	Trendy bucket	21.99	29.99	BUCKET	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.697	2025-11-12 20:50:39.697	{SIZE}	t	111	0	0
d211d37587626b5dcc801bd2	b8c3e336e6cdc2322a1cc2d9	Fedora Hat	fedora-hat	Sophisticated	34.99	49.99	FEDORA	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.709	2025-11-12 20:50:39.709	{SIZE}	t	122	0	0
91dc2206e5f7a1c0a7eb0b7c	b8c3e336e6cdc2322a1cc2d9	Dad Hat Low Profile	dad-hat	Relaxed dad hat	20.99	28.99	DAD	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.719	2025-11-12 20:50:39.719	{SIZE}	t	131	0	0
2db4c4ce785e7a3c59225419	b8c3e336e6cdc2322a1cc2d9	Fitted Performance Cap	fitted-hat	Moisture-wicking	27.99	36.99	FITTED	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.73	2025-11-12 20:50:39.73	{SIZE}	t	105	0	0
7c8c3333aa56a6b5abf198fd	b8c3e336e6cdc2322a1cc2d9	Visor Sport	visor-hat	Lightweight visor	16.99	22.99	VISOR	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.741	2025-11-12 20:50:39.741	{SIZE}	t	83	0	0
ac3ff669021524948e7b8970	b8c3e336e6cdc2322a1cc2d9	French Beret	beret-hat	Classic beret	26.99	35.99	BERET	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.754	2025-11-12 20:50:39.754	{SIZE}	t	90	0	0
8571e831a8d37a7376db7883	b8c3e336e6cdc2322a1cc2d9	Newsboy Cap	newsboy-hat	Vintage newsboy	28.99	38.99	NEWSBOY	0	f	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-12 20:50:39.765	2025-11-12 20:50:39.765	{SIZE}	t	111	0	0
product_1763158427220_zo7i7fjm2	vendorStore_1763154499470_eq2etdfh6	Premium Cotton T-Shirt	premium-cotton-t-shirt	Soft, breathable 100% cotton tee perfect for everyday wear. Pre-shrunk fabric ensures lasting fit. Classic crew neck design with reinforced shoulder seams for durability.	29.99	39.99	TSHIRT-TEST-001	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-14 22:13:47.221	2025-11-14 22:13:47.221	{SIZE,COLOR}	t	\N	0	0
product_1763158427277_lsm8a9ymp	vendorStore_1763154499470_eq2etdfh6	Pro Runner Athletic Shoes	pro-runner-athletic-shoes	High-performance running shoes with advanced cushioning and breathable mesh upper. Designed for maximum comfort and durability.	89.99	119.99	SHOES-TEST-001	0	t	5	SHOES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-14 22:13:47.278	2025-11-14 22:13:47.278	{SIZE,COLOR}	t	\N	0	0
product_1763158427324_hs34jtvhr	vendorStore_1763154499470_eq2etdfh6	Classic Baseball Cap	classic-baseball-cap	Adjustable cotton baseball cap with embroidered logo. One size fits most with premium snap-back closure.	24.99	34.99	HAT-TEST-001	0	t	5	ACCESSORIES	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-14 22:13:47.325	2025-11-14 22:13:47.325	{SIZE,STYLE}	t	\N	0	0
product_1763158427340_3y3zmvz7q	vendorStore_1763154499470_eq2etdfh6	Urban Performance Jacket	urban-performance-jacket	Weather-resistant jacket with multiple fabric options. Features adjustable hood, zippered pockets, and athletic fit perfect for layering.	79.99	99.99	JACKET-TEST-001	0	t	5	CLOTHING	\N	\N	t	\N	\N	t	\N	\N	ACTIVE	\N	0	0	\N	0	2025-11-14 22:13:47.341	2025-11-14 22:13:47.341	{MATERIAL,SIZE}	t	\N	0	0
\.


--
-- Data for Name: shipping_rates; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.shipping_rates (id, "zoneId", name, type, cost, "minOrderAmount", "isEnabled", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: shipping_zones; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.shipping_zones (id, "vendorStoreId", name, regions, "isEnabled", priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: shop_ratings; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.shop_ratings (id, "vendorStoreId", "averageRating", "totalReviews", "fiveStars", "fourStars", "threeStars", "twoStars", "oneStar", "lastCalculated", "updatedAt") FROM stdin;
\.


--
-- Data for Name: store_hours; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.store_hours (id, "vendorStoreId", monday, tuesday, wednesday, thursday, friday, saturday, sunday, timezone, "isEnabled") FROM stdin;
\.


--
-- Data for Name: store_order_items; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.store_order_items (id, "storeOrderId", "productId", "variantId", name, sku, price, quantity, "variantName", "imageUrl", "createdAt", addons, "variantCombinationId", "variantDetails") FROM stdin;
\.


--
-- Data for Name: store_orders; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.store_orders (id, "orderNumber", "vendorStoreId", "customerId", "customerEmail", "customerName", "customerPhone", "shippingAddress", "billingAddress", subtotal, "shippingCost", "taxAmount", "discountAmount", total, "platformFee", "vendorPayout", "paymentProcessor", "paymentIntentId", "paymentStatus", "paidAt", "fulfillmentStatus", "shippingMethod", "trackingNumber", carrier, "shippedAt", "deliveredAt", status, "customerNotes", "internalNotes", "cancelledAt", "cancelReason", "refundedAt", "refundAmount", "createdAt", "updatedAt", "couponCode", "couponId") FROM stdin;
\.


--
-- Data for Name: store_vacations; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.store_vacations (id, "vendorStoreId", "startDate", "endDate", message, "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: subscription_history; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.subscription_history (id, "tenantId", plan, amount, "stripePriceId", "stripeInvoiceId", status, "billingPeriodStart", "billingPeriodEnd", "createdAt") FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.tenants (id, name, slug, "ownerId", "subscriptionPlan", "subscriptionStatus", "stripeCustomerId", "stripeSubscriptionId", "stripePriceId", "currentPeriodEnd", "customDomain", "customDomainVerified", "customDomainStatus", "customDomainDnsRecord", "sslCertificateStatus", "sslCertificateExpiry", "sslLastCheckedAt", "maxProducts", "maxOrders", "maxStorageGB", "currentProducts", "currentOrders", "currentStorageGB", "platformFeePercent", "trialEndsAt", "logoUrl", "primaryColor", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: usage_records; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.usage_records (id, "tenantId", metric, quantity, "timestamp") FROM stdin;
\.


--
-- Data for Name: variant_combinations; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.variant_combinations (id, "productId", "combinationKey", "optionValues", sku, price, "compareAtPrice", quantity, "inventoryTracked", "lowStockThreshold", available, "inStock", "imageUrl", "sortOrder", "createdAt", "updatedAt", "quantityAvailable", "quantityCommitted", "quantityOnHold") FROM stdin;
6de7b031dcc2174d34ec735d	94c805c481cc4efd557699c6	SIZE:XS|COLOR:white	{"SIZE": "XS", "COLOR": "white"}	VINTAGE-XS-white	29.99	\N	19	t	\N	t	t	\N	1	2025-11-12 20:50:39.154	2025-11-12 20:50:39.154	19	0	0
e7f26ceb7ff70af4e593a29d	bdfebbd8b3bab6cab71cc6c7	SIZE:XS|COLOR:black	{"SIZE": "XS", "COLOR": "black"}	CREW-XS-black	24.99	\N	34	t	\N	t	t	\N	0	2025-11-12 20:50:39.091	2025-11-12 20:50:39.091	34	0	0
3aa59687efc705b10b2ae750	bdfebbd8b3bab6cab71cc6c7	SIZE:XS|COLOR:white	{"SIZE": "XS", "COLOR": "white"}	CREW-XS-white	24.99	\N	20	t	\N	t	t	\N	1	2025-11-12 20:50:39.093	2025-11-12 20:50:39.093	20	0	0
3f222d20a3178621c61bd80f	bdfebbd8b3bab6cab71cc6c7	SIZE:XS|COLOR:gray	{"SIZE": "XS", "COLOR": "gray"}	CREW-XS-gray	24.99	\N	11	t	\N	t	t	\N	2	2025-11-12 20:50:39.095	2025-11-12 20:50:39.095	11	0	0
761dd16c888622cc661a3926	bdfebbd8b3bab6cab71cc6c7	SIZE:XS|COLOR:navy	{"SIZE": "XS", "COLOR": "navy"}	CREW-XS-navy	26.99	\N	18	t	\N	t	t	\N	3	2025-11-12 20:50:39.096	2025-11-12 20:50:39.096	18	0	0
3265a5a704fb6ee145e4bc2d	bdfebbd8b3bab6cab71cc6c7	SIZE:XS|COLOR:red	{"SIZE": "XS", "COLOR": "red"}	CREW-XS-red	27.99	\N	15	t	\N	t	t	\N	4	2025-11-12 20:50:39.098	2025-11-12 20:50:39.098	15	0	0
a083fe29d4e4698babeb02ab	bdfebbd8b3bab6cab71cc6c7	SIZE:S|COLOR:black	{"SIZE": "S", "COLOR": "black"}	CREW-S-black	24.99	\N	33	t	\N	t	t	\N	10	2025-11-12 20:50:39.101	2025-11-12 20:50:39.101	33	0	0
09e34eb56bbd663734ccadb7	bdfebbd8b3bab6cab71cc6c7	SIZE:S|COLOR:white	{"SIZE": "S", "COLOR": "white"}	CREW-S-white	24.99	\N	10	t	\N	t	t	\N	11	2025-11-12 20:50:39.102	2025-11-12 20:50:39.102	10	0	0
230f6cf5846bbcd28154a4cb	bdfebbd8b3bab6cab71cc6c7	SIZE:S|COLOR:gray	{"SIZE": "S", "COLOR": "gray"}	CREW-S-gray	24.99	\N	13	t	\N	t	t	\N	12	2025-11-12 20:50:39.103	2025-11-12 20:50:39.103	13	0	0
3fdfcf29652f4078f576355c	bdfebbd8b3bab6cab71cc6c7	SIZE:S|COLOR:navy	{"SIZE": "S", "COLOR": "navy"}	CREW-S-navy	26.99	\N	36	t	\N	t	t	\N	13	2025-11-12 20:50:39.104	2025-11-12 20:50:39.104	36	0	0
ddf6889f7c85a7aba730348c	bdfebbd8b3bab6cab71cc6c7	SIZE:S|COLOR:red	{"SIZE": "S", "COLOR": "red"}	CREW-S-red	27.99	\N	15	t	\N	t	t	\N	14	2025-11-12 20:50:39.105	2025-11-12 20:50:39.105	15	0	0
3197042e73612c2ad78f9a2d	bdfebbd8b3bab6cab71cc6c7	SIZE:S|COLOR:green	{"SIZE": "S", "COLOR": "green"}	CREW-S-green	27.49	\N	24	t	\N	t	t	\N	15	2025-11-12 20:50:39.106	2025-11-12 20:50:39.106	24	0	0
93404964f6a723b05453b33f	bdfebbd8b3bab6cab71cc6c7	SIZE:M|COLOR:black	{"SIZE": "M", "COLOR": "black"}	CREW-M-black	24.99	\N	24	t	\N	t	t	\N	20	2025-11-12 20:50:39.108	2025-11-12 20:50:39.108	24	0	0
a9ef8220948e1962ea36c644	bdfebbd8b3bab6cab71cc6c7	SIZE:M|COLOR:white	{"SIZE": "M", "COLOR": "white"}	CREW-M-white	24.99	\N	22	t	\N	t	t	\N	21	2025-11-12 20:50:39.109	2025-11-12 20:50:39.109	22	0	0
4a3c4e6e8d2efe55dc172dac	bdfebbd8b3bab6cab71cc6c7	SIZE:M|COLOR:gray	{"SIZE": "M", "COLOR": "gray"}	CREW-M-gray	24.99	\N	11	t	\N	t	t	\N	22	2025-11-12 20:50:39.11	2025-11-12 20:50:39.11	11	0	0
498ea3ffa611b9e33175f937	bdfebbd8b3bab6cab71cc6c7	SIZE:M|COLOR:navy	{"SIZE": "M", "COLOR": "navy"}	CREW-M-navy	26.99	\N	29	t	\N	t	t	\N	23	2025-11-12 20:50:39.111	2025-11-12 20:50:39.111	29	0	0
75b4dc994eed5047d2a5a32f	bdfebbd8b3bab6cab71cc6c7	SIZE:M|COLOR:red	{"SIZE": "M", "COLOR": "red"}	CREW-M-red	27.99	\N	21	t	\N	t	t	\N	24	2025-11-12 20:50:39.113	2025-11-12 20:50:39.113	21	0	0
c3ee8a068888a406075bdf46	bdfebbd8b3bab6cab71cc6c7	SIZE:M|COLOR:green	{"SIZE": "M", "COLOR": "green"}	CREW-M-green	27.49	\N	17	t	\N	t	t	\N	25	2025-11-12 20:50:39.114	2025-11-12 20:50:39.114	17	0	0
410b9278d0d7a16cba84f1a6	bdfebbd8b3bab6cab71cc6c7	SIZE:L|COLOR:black	{"SIZE": "L", "COLOR": "black"}	CREW-L-black	26.24	\N	38	t	\N	t	t	\N	30	2025-11-12 20:50:39.116	2025-11-12 20:50:39.116	38	0	0
6619e81aaca7925ccdf1ced3	bdfebbd8b3bab6cab71cc6c7	SIZE:L|COLOR:white	{"SIZE": "L", "COLOR": "white"}	CREW-L-white	26.24	\N	29	t	\N	t	t	\N	31	2025-11-12 20:50:39.117	2025-11-12 20:50:39.117	29	0	0
0e939e9ead25404eec873680	bdfebbd8b3bab6cab71cc6c7	SIZE:L|COLOR:gray	{"SIZE": "L", "COLOR": "gray"}	CREW-L-gray	26.24	\N	10	t	\N	t	t	\N	32	2025-11-12 20:50:39.118	2025-11-12 20:50:39.118	10	0	0
397134deebef589ab11a829b	bdfebbd8b3bab6cab71cc6c7	SIZE:L|COLOR:navy	{"SIZE": "L", "COLOR": "navy"}	CREW-L-navy	28.24	\N	27	t	\N	t	t	\N	33	2025-11-12 20:50:39.119	2025-11-12 20:50:39.119	27	0	0
fbb176801892ad23975f2af7	bdfebbd8b3bab6cab71cc6c7	SIZE:L|COLOR:red	{"SIZE": "L", "COLOR": "red"}	CREW-L-red	29.24	\N	37	t	\N	t	t	\N	34	2025-11-12 20:50:39.12	2025-11-12 20:50:39.12	37	0	0
88a0713ae439615e0f5ae8d5	bdfebbd8b3bab6cab71cc6c7	SIZE:L|COLOR:green	{"SIZE": "L", "COLOR": "green"}	CREW-L-green	28.74	\N	27	t	\N	t	t	\N	35	2025-11-12 20:50:39.121	2025-11-12 20:50:39.121	27	0	0
d151c9cf36acd608d25311f0	bdfebbd8b3bab6cab71cc6c7	SIZE:XL|COLOR:black	{"SIZE": "XL", "COLOR": "black"}	CREW-XL-black	27.49	\N	10	t	\N	t	t	\N	40	2025-11-12 20:50:39.123	2025-11-12 20:50:39.123	10	0	0
daa793af7b363093cee1ea39	bdfebbd8b3bab6cab71cc6c7	SIZE:XL|COLOR:white	{"SIZE": "XL", "COLOR": "white"}	CREW-XL-white	27.49	\N	34	t	\N	t	t	\N	41	2025-11-12 20:50:39.124	2025-11-12 20:50:39.124	34	0	0
84ef8fb4d7c38760108e92e5	bdfebbd8b3bab6cab71cc6c7	SIZE:XL|COLOR:gray	{"SIZE": "XL", "COLOR": "gray"}	CREW-XL-gray	27.49	\N	39	t	\N	t	t	\N	42	2025-11-12 20:50:39.125	2025-11-12 20:50:39.125	39	0	0
4343dc22279bf55fc3a38e8a	bdfebbd8b3bab6cab71cc6c7	SIZE:XL|COLOR:navy	{"SIZE": "XL", "COLOR": "navy"}	CREW-XL-navy	29.49	\N	37	t	\N	t	t	\N	43	2025-11-12 20:50:39.126	2025-11-12 20:50:39.126	37	0	0
c99dcdbebb72a24cef4776df	bdfebbd8b3bab6cab71cc6c7	SIZE:XL|COLOR:red	{"SIZE": "XL", "COLOR": "red"}	CREW-XL-red	30.49	\N	12	t	\N	t	t	\N	44	2025-11-12 20:50:39.127	2025-11-12 20:50:39.127	12	0	0
f2c2dcd3f6942541df5b3918	bdfebbd8b3bab6cab71cc6c7	SIZE:XL|COLOR:green	{"SIZE": "XL", "COLOR": "green"}	CREW-XL-green	29.99	\N	35	t	\N	t	t	\N	45	2025-11-12 20:50:39.128	2025-11-12 20:50:39.128	35	0	0
3b82da5b3021853062bfe605	bdfebbd8b3bab6cab71cc6c7	SIZE:2XL|COLOR:black	{"SIZE": "2XL", "COLOR": "black"}	CREW-2XL-black	28.74	\N	37	t	\N	t	t	\N	50	2025-11-12 20:50:39.129	2025-11-12 20:50:39.129	37	0	0
8ea921345c581c2287915be7	bdfebbd8b3bab6cab71cc6c7	SIZE:2XL|COLOR:white	{"SIZE": "2XL", "COLOR": "white"}	CREW-2XL-white	28.74	\N	32	t	\N	t	t	\N	51	2025-11-12 20:50:39.13	2025-11-12 20:50:39.13	32	0	0
12ea4ced1a99b3d12f230761	bdfebbd8b3bab6cab71cc6c7	SIZE:2XL|COLOR:gray	{"SIZE": "2XL", "COLOR": "gray"}	CREW-2XL-gray	28.74	\N	21	t	\N	t	t	\N	52	2025-11-12 20:50:39.132	2025-11-12 20:50:39.132	21	0	0
b3e891834f423283f548fe66	bdfebbd8b3bab6cab71cc6c7	SIZE:2XL|COLOR:navy	{"SIZE": "2XL", "COLOR": "navy"}	CREW-2XL-navy	30.74	\N	29	t	\N	t	t	\N	53	2025-11-12 20:50:39.133	2025-11-12 20:50:39.133	29	0	0
6cdcb431364957f38b115da8	bdfebbd8b3bab6cab71cc6c7	SIZE:2XL|COLOR:red	{"SIZE": "2XL", "COLOR": "red"}	CREW-2XL-red	31.74	\N	11	t	\N	t	t	\N	54	2025-11-12 20:50:39.134	2025-11-12 20:50:39.134	11	0	0
abe70e6a1cf5d94608ebb4b9	bdfebbd8b3bab6cab71cc6c7	SIZE:2XL|COLOR:green	{"SIZE": "2XL", "COLOR": "green"}	CREW-2XL-green	31.24	\N	17	t	\N	t	t	\N	55	2025-11-12 20:50:39.135	2025-11-12 20:50:39.135	17	0	0
ee3a88b039da4e40a2ec4ca5	91dc2206e5f7a1c0a7eb0b7c	SIZE:S/M	{"SIZE": "S/M"}	DAD-S/M	20.99	\N	36	t	\N	t	t	\N	1	2025-11-12 20:50:39.726	2025-11-12 20:50:39.726	36	0	0
fbc6382bf8ccb0e1d842b9ab	94c805c481cc4efd557699c6	SIZE:XS|COLOR:navy	{"SIZE": "XS", "COLOR": "navy"}	VINTAGE-XS-navy	31.99	\N	24	t	\N	t	t	\N	3	2025-11-12 20:50:39.156	2025-11-12 20:50:39.156	24	0	0
b9e7e80ef4b7d5b429c3332d	94c805c481cc4efd557699c6	SIZE:XS|COLOR:red	{"SIZE": "XS", "COLOR": "red"}	VINTAGE-XS-red	32.99	\N	11	t	\N	t	t	\N	4	2025-11-12 20:50:39.157	2025-11-12 20:50:39.157	11	0	0
e170cccb10fcc01145441698	94c805c481cc4efd557699c6	SIZE:XS|COLOR:green	{"SIZE": "XS", "COLOR": "green"}	VINTAGE-XS-green	32.49	\N	39	t	\N	t	t	\N	5	2025-11-12 20:50:39.158	2025-11-12 20:50:39.158	39	0	0
af9a4b694a25f22ce54b14f6	94c805c481cc4efd557699c6	SIZE:S|COLOR:black	{"SIZE": "S", "COLOR": "black"}	VINTAGE-S-black	29.99	\N	36	t	\N	t	t	\N	10	2025-11-12 20:50:39.16	2025-11-12 20:50:39.16	36	0	0
e9ec40e1963af56a7b7f1469	94c805c481cc4efd557699c6	SIZE:S|COLOR:white	{"SIZE": "S", "COLOR": "white"}	VINTAGE-S-white	29.99	\N	23	t	\N	t	t	\N	11	2025-11-12 20:50:39.161	2025-11-12 20:50:39.161	23	0	0
814b77c220d8d2278491c047	94c805c481cc4efd557699c6	SIZE:S|COLOR:gray	{"SIZE": "S", "COLOR": "gray"}	VINTAGE-S-gray	29.99	\N	37	t	\N	t	t	\N	12	2025-11-12 20:50:39.162	2025-11-12 20:50:39.162	37	0	0
c78f330ae0ca64ccfa1e8b0f	94c805c481cc4efd557699c6	SIZE:S|COLOR:navy	{"SIZE": "S", "COLOR": "navy"}	VINTAGE-S-navy	31.99	\N	38	t	\N	t	t	\N	13	2025-11-12 20:50:39.163	2025-11-12 20:50:39.163	38	0	0
c21e0e526d27ecd72235a431	94c805c481cc4efd557699c6	SIZE:S|COLOR:red	{"SIZE": "S", "COLOR": "red"}	VINTAGE-S-red	32.99	\N	14	t	\N	t	t	\N	14	2025-11-12 20:50:39.164	2025-11-12 20:50:39.164	14	0	0
7579b1fdbeeb0362b14ab898	94c805c481cc4efd557699c6	SIZE:S|COLOR:green	{"SIZE": "S", "COLOR": "green"}	VINTAGE-S-green	32.49	\N	34	t	\N	t	t	\N	15	2025-11-12 20:50:39.165	2025-11-12 20:50:39.165	34	0	0
cda73c289920e1c19a867334	94c805c481cc4efd557699c6	SIZE:M|COLOR:black	{"SIZE": "M", "COLOR": "black"}	VINTAGE-M-black	29.99	\N	11	t	\N	t	t	\N	20	2025-11-12 20:50:39.167	2025-11-12 20:50:39.167	11	0	0
726ae1a167120235ee7442bb	94c805c481cc4efd557699c6	SIZE:M|COLOR:white	{"SIZE": "M", "COLOR": "white"}	VINTAGE-M-white	29.99	\N	34	t	\N	t	t	\N	21	2025-11-12 20:50:39.169	2025-11-12 20:50:39.169	34	0	0
cb2167531dbefbabcde9b036	94c805c481cc4efd557699c6	SIZE:M|COLOR:gray	{"SIZE": "M", "COLOR": "gray"}	VINTAGE-M-gray	29.99	\N	29	t	\N	t	t	\N	22	2025-11-12 20:50:39.17	2025-11-12 20:50:39.17	29	0	0
fe61d10ded06afb85c12ffda	94c805c481cc4efd557699c6	SIZE:M|COLOR:navy	{"SIZE": "M", "COLOR": "navy"}	VINTAGE-M-navy	31.99	\N	35	t	\N	t	t	\N	23	2025-11-12 20:50:39.171	2025-11-12 20:50:39.171	35	0	0
a925c05a50d880af10fba8cd	94c805c481cc4efd557699c6	SIZE:M|COLOR:red	{"SIZE": "M", "COLOR": "red"}	VINTAGE-M-red	32.99	\N	27	t	\N	t	t	\N	24	2025-11-12 20:50:39.172	2025-11-12 20:50:39.172	27	0	0
01f2f0221946f8d8834a5c04	94c805c481cc4efd557699c6	SIZE:M|COLOR:green	{"SIZE": "M", "COLOR": "green"}	VINTAGE-M-green	32.49	\N	30	t	\N	t	t	\N	25	2025-11-12 20:50:39.173	2025-11-12 20:50:39.173	30	0	0
e02e4602311e13652ba4c81e	94c805c481cc4efd557699c6	SIZE:L|COLOR:black	{"SIZE": "L", "COLOR": "black"}	VINTAGE-L-black	31.49	\N	28	t	\N	t	t	\N	30	2025-11-12 20:50:39.175	2025-11-12 20:50:39.175	28	0	0
288df05a6844a4c3c2d785d8	94c805c481cc4efd557699c6	SIZE:L|COLOR:white	{"SIZE": "L", "COLOR": "white"}	VINTAGE-L-white	31.49	\N	11	t	\N	t	t	\N	31	2025-11-12 20:50:39.176	2025-11-12 20:50:39.176	11	0	0
c80da07a85eaf5b8a8f5914a	94c805c481cc4efd557699c6	SIZE:L|COLOR:gray	{"SIZE": "L", "COLOR": "gray"}	VINTAGE-L-gray	31.49	\N	19	t	\N	t	t	\N	32	2025-11-12 20:50:39.177	2025-11-12 20:50:39.177	19	0	0
da1c57a7aed3dd5540d9feb2	94c805c481cc4efd557699c6	SIZE:L|COLOR:navy	{"SIZE": "L", "COLOR": "navy"}	VINTAGE-L-navy	33.49	\N	11	t	\N	t	t	\N	33	2025-11-12 20:50:39.178	2025-11-12 20:50:39.178	11	0	0
cf7d5368c817c84506dce292	94c805c481cc4efd557699c6	SIZE:L|COLOR:red	{"SIZE": "L", "COLOR": "red"}	VINTAGE-L-red	34.49	\N	23	t	\N	t	t	\N	34	2025-11-12 20:50:39.179	2025-11-12 20:50:39.179	23	0	0
afef44664f0b06d00125c04e	94c805c481cc4efd557699c6	SIZE:L|COLOR:green	{"SIZE": "L", "COLOR": "green"}	VINTAGE-L-green	33.99	\N	19	t	\N	t	t	\N	35	2025-11-12 20:50:39.18	2025-11-12 20:50:39.18	19	0	0
e78450e0607e37401bf447de	94c805c481cc4efd557699c6	SIZE:XL|COLOR:black	{"SIZE": "XL", "COLOR": "black"}	VINTAGE-XL-black	32.99	\N	14	t	\N	t	t	\N	40	2025-11-12 20:50:39.181	2025-11-12 20:50:39.181	14	0	0
2cefc8f7e8217a13ffd6aa3b	94c805c481cc4efd557699c6	SIZE:XL|COLOR:white	{"SIZE": "XL", "COLOR": "white"}	VINTAGE-XL-white	32.99	\N	25	t	\N	t	t	\N	41	2025-11-12 20:50:39.183	2025-11-12 20:50:39.183	25	0	0
46efb527bda475bdfd14003b	94c805c481cc4efd557699c6	SIZE:XL|COLOR:gray	{"SIZE": "XL", "COLOR": "gray"}	VINTAGE-XL-gray	32.99	\N	14	t	\N	t	t	\N	42	2025-11-12 20:50:39.184	2025-11-12 20:50:39.184	14	0	0
4f90f5c206660fe70fe7c93b	94c805c481cc4efd557699c6	SIZE:XL|COLOR:navy	{"SIZE": "XL", "COLOR": "navy"}	VINTAGE-XL-navy	34.99	\N	26	t	\N	t	t	\N	43	2025-11-12 20:50:39.185	2025-11-12 20:50:39.185	26	0	0
ebbd1b2e7661e4c0ee65db32	94c805c481cc4efd557699c6	SIZE:XL|COLOR:red	{"SIZE": "XL", "COLOR": "red"}	VINTAGE-XL-red	35.99	\N	20	t	\N	t	t	\N	44	2025-11-12 20:50:39.186	2025-11-12 20:50:39.186	20	0	0
178638ab9e65a187baef8309	94c805c481cc4efd557699c6	SIZE:XL|COLOR:green	{"SIZE": "XL", "COLOR": "green"}	VINTAGE-XL-green	35.49	\N	25	t	\N	t	t	\N	45	2025-11-12 20:50:39.187	2025-11-12 20:50:39.187	25	0	0
34461c7009912ef73d79443a	94c805c481cc4efd557699c6	SIZE:2XL|COLOR:white	{"SIZE": "2XL", "COLOR": "white"}	VINTAGE-2XL-white	34.49	\N	33	t	\N	t	t	\N	51	2025-11-12 20:50:39.189	2025-11-12 20:50:39.189	33	0	0
59dd2241d08a706a6647aabc	94c805c481cc4efd557699c6	SIZE:2XL|COLOR:gray	{"SIZE": "2XL", "COLOR": "gray"}	VINTAGE-2XL-gray	34.49	\N	26	t	\N	t	t	\N	52	2025-11-12 20:50:39.19	2025-11-12 20:50:39.19	26	0	0
5d4b049694c56d6b8b228564	94c805c481cc4efd557699c6	SIZE:2XL|COLOR:navy	{"SIZE": "2XL", "COLOR": "navy"}	VINTAGE-2XL-navy	36.49	\N	14	t	\N	t	t	\N	53	2025-11-12 20:50:39.192	2025-11-12 20:50:39.192	14	0	0
8ad9765f8dddfdfd559cbf4c	94c805c481cc4efd557699c6	SIZE:2XL|COLOR:red	{"SIZE": "2XL", "COLOR": "red"}	VINTAGE-2XL-red	37.49	\N	38	t	\N	t	t	\N	54	2025-11-12 20:50:39.193	2025-11-12 20:50:39.193	38	0	0
7e37a5fcf97619e98509c684	94c805c481cc4efd557699c6	SIZE:2XL|COLOR:green	{"SIZE": "2XL", "COLOR": "green"}	VINTAGE-2XL-green	36.99	\N	19	t	\N	t	t	\N	55	2025-11-12 20:50:39.194	2025-11-12 20:50:39.194	19	0	0
5e2d94c937fe862fa6becf0c	9a6ea3fbecfc23c01f9e3734	SIZE:XS|COLOR:black	{"SIZE": "XS", "COLOR": "black"}	VNECK-XS-black	26.99	\N	24	t	\N	t	t	\N	0	2025-11-12 20:50:39.215	2025-11-12 20:50:39.215	24	0	0
61f116d6472529b842f4deff	9a6ea3fbecfc23c01f9e3734	SIZE:XS|COLOR:white	{"SIZE": "XS", "COLOR": "white"}	VNECK-XS-white	26.99	\N	18	t	\N	t	t	\N	1	2025-11-12 20:50:39.216	2025-11-12 20:50:39.216	18	0	0
22dcf20aef3171751ce50f8e	9a6ea3fbecfc23c01f9e3734	SIZE:XS|COLOR:gray	{"SIZE": "XS", "COLOR": "gray"}	VNECK-XS-gray	26.99	\N	32	t	\N	t	t	\N	2	2025-11-12 20:50:39.217	2025-11-12 20:50:39.217	32	0	0
e8c1623e73ee89a96377258b	9a6ea3fbecfc23c01f9e3734	SIZE:XS|COLOR:navy	{"SIZE": "XS", "COLOR": "navy"}	VNECK-XS-navy	28.99	\N	21	t	\N	t	t	\N	3	2025-11-12 20:50:39.218	2025-11-12 20:50:39.218	21	0	0
f226c00fd524f069cf1f9b24	9a6ea3fbecfc23c01f9e3734	SIZE:XS|COLOR:green	{"SIZE": "XS", "COLOR": "green"}	VNECK-XS-green	29.49	\N	24	t	\N	t	t	\N	5	2025-11-12 20:50:39.221	2025-11-12 20:50:39.221	24	0	0
4ec355287e2773489be82263	9a6ea3fbecfc23c01f9e3734	SIZE:S|COLOR:black	{"SIZE": "S", "COLOR": "black"}	VNECK-S-black	26.99	\N	30	t	\N	t	t	\N	10	2025-11-12 20:50:39.222	2025-11-12 20:50:39.222	30	0	0
b316caf2b019b113215035f3	9a6ea3fbecfc23c01f9e3734	SIZE:S|COLOR:white	{"SIZE": "S", "COLOR": "white"}	VNECK-S-white	26.99	\N	18	t	\N	t	t	\N	11	2025-11-12 20:50:39.224	2025-11-12 20:50:39.224	18	0	0
209daf55ac57237e1a448438	9a6ea3fbecfc23c01f9e3734	SIZE:S|COLOR:gray	{"SIZE": "S", "COLOR": "gray"}	VNECK-S-gray	26.99	\N	29	t	\N	t	t	\N	12	2025-11-12 20:50:39.225	2025-11-12 20:50:39.225	29	0	0
1763d452e2740bff8753aedd	9a6ea3fbecfc23c01f9e3734	SIZE:S|COLOR:navy	{"SIZE": "S", "COLOR": "navy"}	VNECK-S-navy	28.99	\N	37	t	\N	t	t	\N	13	2025-11-12 20:50:39.226	2025-11-12 20:50:39.226	37	0	0
7f3b5963b565ea21d9ca2c17	9a6ea3fbecfc23c01f9e3734	SIZE:S|COLOR:red	{"SIZE": "S", "COLOR": "red"}	VNECK-S-red	29.99	\N	10	t	\N	t	t	\N	14	2025-11-12 20:50:39.228	2025-11-12 20:50:39.228	10	0	0
3cf59a5129cd07eeccce6c3a	9a6ea3fbecfc23c01f9e3734	SIZE:M|COLOR:black	{"SIZE": "M", "COLOR": "black"}	VNECK-M-black	26.99	\N	23	t	\N	t	t	\N	20	2025-11-12 20:50:39.23	2025-11-12 20:50:39.23	23	0	0
911838c8a5fe4385294488ee	9a6ea3fbecfc23c01f9e3734	SIZE:M|COLOR:white	{"SIZE": "M", "COLOR": "white"}	VNECK-M-white	26.99	\N	36	t	\N	t	t	\N	21	2025-11-12 20:50:39.231	2025-11-12 20:50:39.231	36	0	0
e5c3313fb74041ad5b2919db	9a6ea3fbecfc23c01f9e3734	SIZE:M|COLOR:gray	{"SIZE": "M", "COLOR": "gray"}	VNECK-M-gray	26.99	\N	13	t	\N	t	t	\N	22	2025-11-12 20:50:39.233	2025-11-12 20:50:39.233	13	0	0
a6684b492d13836f5fbec497	9a6ea3fbecfc23c01f9e3734	SIZE:M|COLOR:navy	{"SIZE": "M", "COLOR": "navy"}	VNECK-M-navy	28.99	\N	29	t	\N	t	t	\N	23	2025-11-12 20:50:39.234	2025-11-12 20:50:39.234	29	0	0
c81ead20368d010f9312e618	9a6ea3fbecfc23c01f9e3734	SIZE:M|COLOR:red	{"SIZE": "M", "COLOR": "red"}	VNECK-M-red	29.99	\N	18	t	\N	t	t	\N	24	2025-11-12 20:50:39.235	2025-11-12 20:50:39.235	18	0	0
cfd0f1a51851cf841c7d1837	9a6ea3fbecfc23c01f9e3734	SIZE:M|COLOR:green	{"SIZE": "M", "COLOR": "green"}	VNECK-M-green	29.49	\N	33	t	\N	t	t	\N	25	2025-11-12 20:50:39.237	2025-11-12 20:50:39.237	33	0	0
cac6b254ff60fcc94cf39705	9a6ea3fbecfc23c01f9e3734	SIZE:L|COLOR:black	{"SIZE": "L", "COLOR": "black"}	VNECK-L-black	28.34	\N	27	t	\N	t	t	\N	30	2025-11-12 20:50:39.239	2025-11-12 20:50:39.239	27	0	0
cfccca5b23450e9f6b3a8eb4	9a6ea3fbecfc23c01f9e3734	SIZE:L|COLOR:white	{"SIZE": "L", "COLOR": "white"}	VNECK-L-white	28.34	\N	17	t	\N	t	t	\N	31	2025-11-12 20:50:39.24	2025-11-12 20:50:39.24	17	0	0
1d075be6b3fa962ee277fea0	9a6ea3fbecfc23c01f9e3734	SIZE:L|COLOR:gray	{"SIZE": "L", "COLOR": "gray"}	VNECK-L-gray	28.34	\N	29	t	\N	t	t	\N	32	2025-11-12 20:50:39.242	2025-11-12 20:50:39.242	29	0	0
b96364ec94a21fbc36e19808	9a6ea3fbecfc23c01f9e3734	SIZE:L|COLOR:navy	{"SIZE": "L", "COLOR": "navy"}	VNECK-L-navy	30.34	\N	11	t	\N	t	t	\N	33	2025-11-12 20:50:39.243	2025-11-12 20:50:39.243	11	0	0
49f56adadfadbee5a8e27aed	9a6ea3fbecfc23c01f9e3734	SIZE:L|COLOR:red	{"SIZE": "L", "COLOR": "red"}	VNECK-L-red	31.34	\N	28	t	\N	t	t	\N	34	2025-11-12 20:50:39.245	2025-11-12 20:50:39.245	28	0	0
31762efe83d0d34c755446fe	9a6ea3fbecfc23c01f9e3734	SIZE:L|COLOR:green	{"SIZE": "L", "COLOR": "green"}	VNECK-L-green	30.84	\N	12	t	\N	t	t	\N	35	2025-11-12 20:50:39.246	2025-11-12 20:50:39.246	12	0	0
6fd7cc9bb9bdfab56e59398f	9a6ea3fbecfc23c01f9e3734	SIZE:XL|COLOR:black	{"SIZE": "XL", "COLOR": "black"}	VNECK-XL-black	29.69	\N	34	t	\N	t	t	\N	40	2025-11-12 20:50:39.248	2025-11-12 20:50:39.248	34	0	0
69f23b01362834f369aa431a	9a6ea3fbecfc23c01f9e3734	SIZE:XL|COLOR:white	{"SIZE": "XL", "COLOR": "white"}	VNECK-XL-white	29.69	\N	20	t	\N	t	t	\N	41	2025-11-12 20:50:39.249	2025-11-12 20:50:39.249	20	0	0
fb8a222e40eaeafea48845bf	9a6ea3fbecfc23c01f9e3734	SIZE:XL|COLOR:gray	{"SIZE": "XL", "COLOR": "gray"}	VNECK-XL-gray	29.69	\N	37	t	\N	t	t	\N	42	2025-11-12 20:50:39.251	2025-11-12 20:50:39.251	37	0	0
3e87571006296faf75c957d0	9a6ea3fbecfc23c01f9e3734	SIZE:XL|COLOR:navy	{"SIZE": "XL", "COLOR": "navy"}	VNECK-XL-navy	31.69	\N	15	t	\N	t	t	\N	43	2025-11-12 20:50:39.252	2025-11-12 20:50:39.252	15	0	0
4e4a12b29462efd524bf192e	9a6ea3fbecfc23c01f9e3734	SIZE:XL|COLOR:red	{"SIZE": "XL", "COLOR": "red"}	VNECK-XL-red	32.69	\N	37	t	\N	t	t	\N	44	2025-11-12 20:50:39.253	2025-11-12 20:50:39.253	37	0	0
a3daf0580802301b264db9d4	9a6ea3fbecfc23c01f9e3734	SIZE:XL|COLOR:green	{"SIZE": "XL", "COLOR": "green"}	VNECK-XL-green	32.19	\N	10	t	\N	t	t	\N	45	2025-11-12 20:50:39.255	2025-11-12 20:50:39.255	10	0	0
3ec83b05c341b3b24eb00648	9a6ea3fbecfc23c01f9e3734	SIZE:2XL|COLOR:black	{"SIZE": "2XL", "COLOR": "black"}	VNECK-2XL-black	31.04	\N	12	t	\N	t	t	\N	50	2025-11-12 20:50:39.256	2025-11-12 20:50:39.256	12	0	0
c88dd56646a04a502e641a81	9a6ea3fbecfc23c01f9e3734	SIZE:2XL|COLOR:white	{"SIZE": "2XL", "COLOR": "white"}	VNECK-2XL-white	31.04	\N	13	t	\N	t	t	\N	51	2025-11-12 20:50:39.257	2025-11-12 20:50:39.257	13	0	0
b90fb8863573a025d16d7201	9a6ea3fbecfc23c01f9e3734	SIZE:2XL|COLOR:gray	{"SIZE": "2XL", "COLOR": "gray"}	VNECK-2XL-gray	31.04	\N	38	t	\N	t	t	\N	52	2025-11-12 20:50:39.258	2025-11-12 20:50:39.258	38	0	0
39401be4ace10955348bf403	9a6ea3fbecfc23c01f9e3734	SIZE:2XL|COLOR:navy	{"SIZE": "2XL", "COLOR": "navy"}	VNECK-2XL-navy	33.04	\N	30	t	\N	t	t	\N	53	2025-11-12 20:50:39.26	2025-11-12 20:50:39.26	30	0	0
69c12451831c6755f9a3d649	9a6ea3fbecfc23c01f9e3734	SIZE:2XL|COLOR:red	{"SIZE": "2XL", "COLOR": "red"}	VNECK-2XL-red	34.04	\N	36	t	\N	t	t	\N	54	2025-11-12 20:50:39.261	2025-11-12 20:50:39.261	36	0	0
9060c8ff884b249a0d5bc784	9a6ea3fbecfc23c01f9e3734	SIZE:2XL|COLOR:green	{"SIZE": "2XL", "COLOR": "green"}	VNECK-2XL-green	33.54	\N	13	t	\N	t	t	\N	55	2025-11-12 20:50:39.262	2025-11-12 20:50:39.262	13	0	0
49a0cc20ad2b32e7b398b6fc	6b486d564c5c5d2e284c5342	SIZE:XS|COLOR:black	{"SIZE": "XS", "COLOR": "black"}	POLO-XS-black	39.99	\N	39	t	\N	t	t	\N	0	2025-11-12 20:50:39.284	2025-11-12 20:50:39.284	39	0	0
92a53c2b75c4a37ae6978a79	6b486d564c5c5d2e284c5342	SIZE:XS|COLOR:white	{"SIZE": "XS", "COLOR": "white"}	POLO-XS-white	39.99	\N	23	t	\N	t	t	\N	1	2025-11-12 20:50:39.285	2025-11-12 20:50:39.285	23	0	0
36efe83e3789c184cdf7a057	6b486d564c5c5d2e284c5342	SIZE:XS|COLOR:gray	{"SIZE": "XS", "COLOR": "gray"}	POLO-XS-gray	39.99	\N	27	t	\N	t	t	\N	2	2025-11-12 20:50:39.287	2025-11-12 20:50:39.287	27	0	0
bdb8c405294e224a207c02d4	6b486d564c5c5d2e284c5342	SIZE:XS|COLOR:navy	{"SIZE": "XS", "COLOR": "navy"}	POLO-XS-navy	41.99	\N	14	t	\N	t	t	\N	3	2025-11-12 20:50:39.288	2025-11-12 20:50:39.288	14	0	0
9f9e91a8184519deaa245362	6b486d564c5c5d2e284c5342	SIZE:XS|COLOR:red	{"SIZE": "XS", "COLOR": "red"}	POLO-XS-red	42.99	\N	32	t	\N	t	t	\N	4	2025-11-12 20:50:39.289	2025-11-12 20:50:39.289	32	0	0
1f1a19eccf823e9d142ffcd1	6b486d564c5c5d2e284c5342	SIZE:XS|COLOR:green	{"SIZE": "XS", "COLOR": "green"}	POLO-XS-green	42.49	\N	12	t	\N	t	t	\N	5	2025-11-12 20:50:39.29	2025-11-12 20:50:39.29	12	0	0
711a6f7d4684e5d779770002	91dc2206e5f7a1c0a7eb0b7c	SIZE:L/XL	{"SIZE": "L/XL"}	DAD-L/XL	22.99	\N	49	t	\N	t	t	\N	2	2025-11-12 20:50:39.727	2025-11-12 20:50:39.727	49	0	0
fd9e230fe1e30b6c0bf84a8d	6b486d564c5c5d2e284c5342	SIZE:S|COLOR:white	{"SIZE": "S", "COLOR": "white"}	POLO-S-white	39.99	\N	18	t	\N	t	t	\N	11	2025-11-12 20:50:39.294	2025-11-12 20:50:39.294	18	0	0
9552a08ec531f2fa844586cc	6b486d564c5c5d2e284c5342	SIZE:S|COLOR:gray	{"SIZE": "S", "COLOR": "gray"}	POLO-S-gray	39.99	\N	36	t	\N	t	t	\N	12	2025-11-12 20:50:39.295	2025-11-12 20:50:39.295	36	0	0
90b3976fe5c65126e607f1ef	6b486d564c5c5d2e284c5342	SIZE:S|COLOR:navy	{"SIZE": "S", "COLOR": "navy"}	POLO-S-navy	41.99	\N	29	t	\N	t	t	\N	13	2025-11-12 20:50:39.297	2025-11-12 20:50:39.297	29	0	0
41fa740304f2de28a9b4d477	6b486d564c5c5d2e284c5342	SIZE:S|COLOR:red	{"SIZE": "S", "COLOR": "red"}	POLO-S-red	42.99	\N	32	t	\N	t	t	\N	14	2025-11-12 20:50:39.298	2025-11-12 20:50:39.298	32	0	0
9058a0cb8ebc957e7ce8bf62	6b486d564c5c5d2e284c5342	SIZE:S|COLOR:green	{"SIZE": "S", "COLOR": "green"}	POLO-S-green	42.49	\N	37	t	\N	t	t	\N	15	2025-11-12 20:50:39.3	2025-11-12 20:50:39.3	37	0	0
7506f11a6df474a13ca934bb	6b486d564c5c5d2e284c5342	SIZE:M|COLOR:white	{"SIZE": "M", "COLOR": "white"}	POLO-M-white	39.99	\N	33	t	\N	t	t	\N	21	2025-11-12 20:50:39.302	2025-11-12 20:50:39.302	33	0	0
72f176cac980fbcb45419dcb	6b486d564c5c5d2e284c5342	SIZE:M|COLOR:gray	{"SIZE": "M", "COLOR": "gray"}	POLO-M-gray	39.99	\N	14	t	\N	t	t	\N	22	2025-11-12 20:50:39.304	2025-11-12 20:50:39.304	14	0	0
66b2004d2833ccf7ee2e1382	6b486d564c5c5d2e284c5342	SIZE:M|COLOR:navy	{"SIZE": "M", "COLOR": "navy"}	POLO-M-navy	41.99	\N	10	t	\N	t	t	\N	23	2025-11-12 20:50:39.306	2025-11-12 20:50:39.306	10	0	0
5484df2cf39f8e883785c795	6b486d564c5c5d2e284c5342	SIZE:M|COLOR:red	{"SIZE": "M", "COLOR": "red"}	POLO-M-red	42.99	\N	27	t	\N	t	t	\N	24	2025-11-12 20:50:39.307	2025-11-12 20:50:39.307	27	0	0
ab4e3615b4043bb1c0830624	6b486d564c5c5d2e284c5342	SIZE:M|COLOR:green	{"SIZE": "M", "COLOR": "green"}	POLO-M-green	42.49	\N	31	t	\N	t	t	\N	25	2025-11-12 20:50:39.308	2025-11-12 20:50:39.308	31	0	0
c137ff076d5edd0813da702e	6b486d564c5c5d2e284c5342	SIZE:L|COLOR:black	{"SIZE": "L", "COLOR": "black"}	POLO-L-black	41.99	\N	23	t	\N	t	t	\N	30	2025-11-12 20:50:39.309	2025-11-12 20:50:39.309	23	0	0
ee114c434f18d47ee6b65823	6b486d564c5c5d2e284c5342	SIZE:L|COLOR:white	{"SIZE": "L", "COLOR": "white"}	POLO-L-white	41.99	\N	33	t	\N	t	t	\N	31	2025-11-12 20:50:39.311	2025-11-12 20:50:39.311	33	0	0
803c0cf0e33bcc4d1204a9bb	6b486d564c5c5d2e284c5342	SIZE:L|COLOR:gray	{"SIZE": "L", "COLOR": "gray"}	POLO-L-gray	41.99	\N	21	t	\N	t	t	\N	32	2025-11-12 20:50:39.312	2025-11-12 20:50:39.312	21	0	0
69718542f1905ba6cb5213ff	6b486d564c5c5d2e284c5342	SIZE:L|COLOR:navy	{"SIZE": "L", "COLOR": "navy"}	POLO-L-navy	43.99	\N	25	t	\N	t	t	\N	33	2025-11-12 20:50:39.313	2025-11-12 20:50:39.313	25	0	0
90ccdb904e14d4676101defe	6b486d564c5c5d2e284c5342	SIZE:L|COLOR:red	{"SIZE": "L", "COLOR": "red"}	POLO-L-red	44.99	\N	24	t	\N	t	t	\N	34	2025-11-12 20:50:39.314	2025-11-12 20:50:39.314	24	0	0
aa8720846b01b917fd65f019	6b486d564c5c5d2e284c5342	SIZE:L|COLOR:green	{"SIZE": "L", "COLOR": "green"}	POLO-L-green	44.49	\N	27	t	\N	t	t	\N	35	2025-11-12 20:50:39.316	2025-11-12 20:50:39.316	27	0	0
84da3f624cbd41c39f5e0da2	6b486d564c5c5d2e284c5342	SIZE:XL|COLOR:black	{"SIZE": "XL", "COLOR": "black"}	POLO-XL-black	43.99	\N	29	t	\N	t	t	\N	40	2025-11-12 20:50:39.317	2025-11-12 20:50:39.317	29	0	0
907b856c2c2e6712ceba18b0	6b486d564c5c5d2e284c5342	SIZE:XL|COLOR:white	{"SIZE": "XL", "COLOR": "white"}	POLO-XL-white	43.99	\N	38	t	\N	t	t	\N	41	2025-11-12 20:50:39.318	2025-11-12 20:50:39.318	38	0	0
df7d0415d7551b11637ce03e	6b486d564c5c5d2e284c5342	SIZE:XL|COLOR:gray	{"SIZE": "XL", "COLOR": "gray"}	POLO-XL-gray	43.99	\N	15	t	\N	t	t	\N	42	2025-11-12 20:50:39.319	2025-11-12 20:50:39.319	15	0	0
b433358875da18ea9691257a	6b486d564c5c5d2e284c5342	SIZE:XL|COLOR:navy	{"SIZE": "XL", "COLOR": "navy"}	POLO-XL-navy	45.99	\N	18	t	\N	t	t	\N	43	2025-11-12 20:50:39.321	2025-11-12 20:50:39.321	18	0	0
f7c08c45a8eb086a6698dc71	6b486d564c5c5d2e284c5342	SIZE:XL|COLOR:red	{"SIZE": "XL", "COLOR": "red"}	POLO-XL-red	46.99	\N	19	t	\N	t	t	\N	44	2025-11-12 20:50:39.322	2025-11-12 20:50:39.322	19	0	0
cc42e15fd36c5091e87a703c	6b486d564c5c5d2e284c5342	SIZE:XL|COLOR:green	{"SIZE": "XL", "COLOR": "green"}	POLO-XL-green	46.49	\N	26	t	\N	t	t	\N	45	2025-11-12 20:50:39.323	2025-11-12 20:50:39.323	26	0	0
715c8f1d792c9c47bd9f36fb	6b486d564c5c5d2e284c5342	SIZE:2XL|COLOR:black	{"SIZE": "2XL", "COLOR": "black"}	POLO-2XL-black	45.99	\N	14	t	\N	t	t	\N	50	2025-11-12 20:50:39.325	2025-11-12 20:50:39.325	14	0	0
203083476ecf7d414715acf7	6b486d564c5c5d2e284c5342	SIZE:2XL|COLOR:white	{"SIZE": "2XL", "COLOR": "white"}	POLO-2XL-white	45.99	\N	19	t	\N	t	t	\N	51	2025-11-12 20:50:39.326	2025-11-12 20:50:39.326	19	0	0
764771cba6b304868ef3442e	6b486d564c5c5d2e284c5342	SIZE:2XL|COLOR:gray	{"SIZE": "2XL", "COLOR": "gray"}	POLO-2XL-gray	45.99	\N	21	t	\N	t	t	\N	52	2025-11-12 20:50:39.327	2025-11-12 20:50:39.327	21	0	0
108f7790211b334e2d756cb6	6b486d564c5c5d2e284c5342	SIZE:2XL|COLOR:navy	{"SIZE": "2XL", "COLOR": "navy"}	POLO-2XL-navy	47.99	\N	38	t	\N	t	t	\N	53	2025-11-12 20:50:39.328	2025-11-12 20:50:39.328	38	0	0
33bd494f19032ba3e280d7bb	6b486d564c5c5d2e284c5342	SIZE:2XL|COLOR:red	{"SIZE": "2XL", "COLOR": "red"}	POLO-2XL-red	48.99	\N	27	t	\N	t	t	\N	54	2025-11-12 20:50:39.329	2025-11-12 20:50:39.329	27	0	0
446f2dfc4e58700df5b99834	6b486d564c5c5d2e284c5342	SIZE:2XL|COLOR:green	{"SIZE": "2XL", "COLOR": "green"}	POLO-2XL-green	48.49	\N	27	t	\N	t	t	\N	55	2025-11-12 20:50:39.331	2025-11-12 20:50:39.331	27	0	0
7e5c5e5445929489362eb1d7	06ee32c9ac00f8c475aca3b4	SIZE:XS|COLOR:black	{"SIZE": "XS", "COLOR": "black"}	HENLEY-XS-black	34.99	\N	11	t	\N	t	t	\N	0	2025-11-12 20:50:39.352	2025-11-12 20:50:39.352	11	0	0
bf60bfffdb5d261ce1eada00	06ee32c9ac00f8c475aca3b4	SIZE:XS|COLOR:white	{"SIZE": "XS", "COLOR": "white"}	HENLEY-XS-white	34.99	\N	22	t	\N	t	t	\N	1	2025-11-12 20:50:39.353	2025-11-12 20:50:39.353	22	0	0
edf480ab4916d25106ac4516	06ee32c9ac00f8c475aca3b4	SIZE:XS|COLOR:gray	{"SIZE": "XS", "COLOR": "gray"}	HENLEY-XS-gray	34.99	\N	32	t	\N	t	t	\N	2	2025-11-12 20:50:39.354	2025-11-12 20:50:39.354	32	0	0
5d91be08056b8ab66ae56008	06ee32c9ac00f8c475aca3b4	SIZE:XS|COLOR:navy	{"SIZE": "XS", "COLOR": "navy"}	HENLEY-XS-navy	36.99	\N	10	t	\N	t	t	\N	3	2025-11-12 20:50:39.355	2025-11-12 20:50:39.355	10	0	0
e711ae790c05dacc3a3371b5	06ee32c9ac00f8c475aca3b4	SIZE:XS|COLOR:red	{"SIZE": "XS", "COLOR": "red"}	HENLEY-XS-red	37.99	\N	15	t	\N	t	t	\N	4	2025-11-12 20:50:39.356	2025-11-12 20:50:39.356	15	0	0
b246792a8dad53c2d20320a6	06ee32c9ac00f8c475aca3b4	SIZE:XS|COLOR:green	{"SIZE": "XS", "COLOR": "green"}	HENLEY-XS-green	37.49	\N	12	t	\N	t	t	\N	5	2025-11-12 20:50:39.358	2025-11-12 20:50:39.358	12	0	0
d96081ad911080faf852ee4a	06ee32c9ac00f8c475aca3b4	SIZE:S|COLOR:black	{"SIZE": "S", "COLOR": "black"}	HENLEY-S-black	34.99	\N	39	t	\N	t	t	\N	10	2025-11-12 20:50:39.359	2025-11-12 20:50:39.359	39	0	0
e8091ba93f2cd503852e0a85	06ee32c9ac00f8c475aca3b4	SIZE:S|COLOR:white	{"SIZE": "S", "COLOR": "white"}	HENLEY-S-white	34.99	\N	37	t	\N	t	t	\N	11	2025-11-12 20:50:39.361	2025-11-12 20:50:39.361	37	0	0
bcceca496f89e22f976bfb71	2db4c4ce785e7a3c59225419	SIZE:OSFM	{"SIZE": "OSFM"}	FITTED-OSFM	27.99	\N	23	t	\N	t	t	\N	0	2025-11-12 20:50:39.735	2025-11-12 20:50:39.735	23	0	0
b02224450ef9142250e31fa6	06ee32c9ac00f8c475aca3b4	SIZE:S|COLOR:navy	{"SIZE": "S", "COLOR": "navy"}	HENLEY-S-navy	36.99	\N	36	t	\N	t	t	\N	13	2025-11-12 20:50:39.364	2025-11-12 20:50:39.364	36	0	0
f1fca61d5dbf3807d3b20ea0	06ee32c9ac00f8c475aca3b4	SIZE:S|COLOR:red	{"SIZE": "S", "COLOR": "red"}	HENLEY-S-red	37.99	\N	35	t	\N	t	t	\N	14	2025-11-12 20:50:39.366	2025-11-12 20:50:39.366	35	0	0
aa481b744fb13a33bdb5694b	06ee32c9ac00f8c475aca3b4	SIZE:S|COLOR:green	{"SIZE": "S", "COLOR": "green"}	HENLEY-S-green	37.49	\N	24	t	\N	t	t	\N	15	2025-11-12 20:50:39.368	2025-11-12 20:50:39.368	24	0	0
96c98d0d3beef06ed1543572	06ee32c9ac00f8c475aca3b4	SIZE:M|COLOR:black	{"SIZE": "M", "COLOR": "black"}	HENLEY-M-black	34.99	\N	28	t	\N	t	t	\N	20	2025-11-12 20:50:39.369	2025-11-12 20:50:39.369	28	0	0
aae634af2174452447d97610	06ee32c9ac00f8c475aca3b4	SIZE:M|COLOR:white	{"SIZE": "M", "COLOR": "white"}	HENLEY-M-white	34.99	\N	33	t	\N	t	t	\N	21	2025-11-12 20:50:39.37	2025-11-12 20:50:39.37	33	0	0
e5be611e98371c9a2d0ea112	06ee32c9ac00f8c475aca3b4	SIZE:M|COLOR:gray	{"SIZE": "M", "COLOR": "gray"}	HENLEY-M-gray	34.99	\N	21	t	\N	t	t	\N	22	2025-11-12 20:50:39.372	2025-11-12 20:50:39.372	21	0	0
4e54ad3cd7daff88dd3d70e8	06ee32c9ac00f8c475aca3b4	SIZE:M|COLOR:navy	{"SIZE": "M", "COLOR": "navy"}	HENLEY-M-navy	36.99	\N	32	t	\N	t	t	\N	23	2025-11-12 20:50:39.373	2025-11-12 20:50:39.373	32	0	0
5ab3d0a8a88c25a068c9f92e	06ee32c9ac00f8c475aca3b4	SIZE:M|COLOR:red	{"SIZE": "M", "COLOR": "red"}	HENLEY-M-red	37.99	\N	12	t	\N	t	t	\N	24	2025-11-12 20:50:39.374	2025-11-12 20:50:39.374	12	0	0
44d7d2acb08773c91493f38d	06ee32c9ac00f8c475aca3b4	SIZE:M|COLOR:green	{"SIZE": "M", "COLOR": "green"}	HENLEY-M-green	37.49	\N	11	t	\N	t	t	\N	25	2025-11-12 20:50:39.375	2025-11-12 20:50:39.375	11	0	0
3f16dba18e1ff95d37336de4	06ee32c9ac00f8c475aca3b4	SIZE:L|COLOR:black	{"SIZE": "L", "COLOR": "black"}	HENLEY-L-black	36.74	\N	13	t	\N	t	t	\N	30	2025-11-12 20:50:39.377	2025-11-12 20:50:39.377	13	0	0
56ded3136e4b5c5ca81d7f82	06ee32c9ac00f8c475aca3b4	SIZE:L|COLOR:white	{"SIZE": "L", "COLOR": "white"}	HENLEY-L-white	36.74	\N	32	t	\N	t	t	\N	31	2025-11-12 20:50:39.378	2025-11-12 20:50:39.378	32	0	0
d147d42de9175d0a2686944e	06ee32c9ac00f8c475aca3b4	SIZE:L|COLOR:gray	{"SIZE": "L", "COLOR": "gray"}	HENLEY-L-gray	36.74	\N	16	t	\N	t	t	\N	32	2025-11-12 20:50:39.38	2025-11-12 20:50:39.38	16	0	0
a79e327a8067a5887eecf9bc	06ee32c9ac00f8c475aca3b4	SIZE:L|COLOR:navy	{"SIZE": "L", "COLOR": "navy"}	HENLEY-L-navy	38.74	\N	35	t	\N	t	t	\N	33	2025-11-12 20:50:39.382	2025-11-12 20:50:39.382	35	0	0
6003adffd35fda95acb49f3a	06ee32c9ac00f8c475aca3b4	SIZE:L|COLOR:red	{"SIZE": "L", "COLOR": "red"}	HENLEY-L-red	39.74	\N	18	t	\N	t	t	\N	34	2025-11-12 20:50:39.383	2025-11-12 20:50:39.383	18	0	0
b09aa6baf17a9ccf6fb55782	06ee32c9ac00f8c475aca3b4	SIZE:L|COLOR:green	{"SIZE": "L", "COLOR": "green"}	HENLEY-L-green	39.24	\N	36	t	\N	t	t	\N	35	2025-11-12 20:50:39.384	2025-11-12 20:50:39.384	36	0	0
387fde4a35294684bb982690	06ee32c9ac00f8c475aca3b4	SIZE:XL|COLOR:black	{"SIZE": "XL", "COLOR": "black"}	HENLEY-XL-black	38.49	\N	31	t	\N	t	t	\N	40	2025-11-12 20:50:39.386	2025-11-12 20:50:39.386	31	0	0
2748bbe1b207129d28aa132e	06ee32c9ac00f8c475aca3b4	SIZE:XL|COLOR:white	{"SIZE": "XL", "COLOR": "white"}	HENLEY-XL-white	38.49	\N	12	t	\N	t	t	\N	41	2025-11-12 20:50:39.387	2025-11-12 20:50:39.387	12	0	0
d6b5f9aa577e447c45abd050	06ee32c9ac00f8c475aca3b4	SIZE:XL|COLOR:gray	{"SIZE": "XL", "COLOR": "gray"}	HENLEY-XL-gray	38.49	\N	33	t	\N	t	t	\N	42	2025-11-12 20:50:39.388	2025-11-12 20:50:39.388	33	0	0
73292b21b0263eeb998aca30	06ee32c9ac00f8c475aca3b4	SIZE:XL|COLOR:navy	{"SIZE": "XL", "COLOR": "navy"}	HENLEY-XL-navy	40.49	\N	30	t	\N	t	t	\N	43	2025-11-12 20:50:39.389	2025-11-12 20:50:39.389	30	0	0
f1fac557d296f2e9026b410e	06ee32c9ac00f8c475aca3b4	SIZE:XL|COLOR:red	{"SIZE": "XL", "COLOR": "red"}	HENLEY-XL-red	41.49	\N	29	t	\N	t	t	\N	44	2025-11-12 20:50:39.391	2025-11-12 20:50:39.391	29	0	0
1589f41dc308f93d39cfb3eb	06ee32c9ac00f8c475aca3b4	SIZE:XL|COLOR:green	{"SIZE": "XL", "COLOR": "green"}	HENLEY-XL-green	40.99	\N	32	t	\N	t	t	\N	45	2025-11-12 20:50:39.393	2025-11-12 20:50:39.393	32	0	0
0fa1d2bf3ccec830079f13f2	06ee32c9ac00f8c475aca3b4	SIZE:2XL|COLOR:black	{"SIZE": "2XL", "COLOR": "black"}	HENLEY-2XL-black	40.24	\N	30	t	\N	t	t	\N	50	2025-11-12 20:50:39.394	2025-11-12 20:50:39.394	30	0	0
39446a2fe4d267efa4e71800	06ee32c9ac00f8c475aca3b4	SIZE:2XL|COLOR:white	{"SIZE": "2XL", "COLOR": "white"}	HENLEY-2XL-white	40.24	\N	21	t	\N	t	t	\N	51	2025-11-12 20:50:39.396	2025-11-12 20:50:39.396	21	0	0
eece3d8fc630d17a4baee960	06ee32c9ac00f8c475aca3b4	SIZE:2XL|COLOR:gray	{"SIZE": "2XL", "COLOR": "gray"}	HENLEY-2XL-gray	40.24	\N	12	t	\N	t	t	\N	52	2025-11-12 20:50:39.397	2025-11-12 20:50:39.397	12	0	0
a9b4ee8241532c42c07d18af	06ee32c9ac00f8c475aca3b4	SIZE:2XL|COLOR:navy	{"SIZE": "2XL", "COLOR": "navy"}	HENLEY-2XL-navy	42.24	\N	19	t	\N	t	t	\N	53	2025-11-12 20:50:39.398	2025-11-12 20:50:39.398	19	0	0
b29a432af0d02ade077fadce	06ee32c9ac00f8c475aca3b4	SIZE:2XL|COLOR:red	{"SIZE": "2XL", "COLOR": "red"}	HENLEY-2XL-red	43.24	\N	15	t	\N	t	t	\N	54	2025-11-12 20:50:39.4	2025-11-12 20:50:39.4	15	0	0
4200a6ae89dfac8ac80cd07d	06ee32c9ac00f8c475aca3b4	SIZE:2XL|COLOR:green	{"SIZE": "2XL", "COLOR": "green"}	HENLEY-2XL-green	42.74	\N	34	t	\N	t	t	\N	55	2025-11-12 20:50:39.401	2025-11-12 20:50:39.401	34	0	0
8e176cc9a90a77e6f7cd8178	dae702177783e835d4d70246	SIZE:XS|COLOR:black	{"SIZE": "XS", "COLOR": "black"}	LONGSLEEVE-XS-black	29.99	\N	14	t	\N	t	t	\N	0	2025-11-12 20:50:39.422	2025-11-12 20:50:39.422	14	0	0
3cc3a795199f90181c925089	dae702177783e835d4d70246	SIZE:XS|COLOR:white	{"SIZE": "XS", "COLOR": "white"}	LONGSLEEVE-XS-white	29.99	\N	28	t	\N	t	t	\N	1	2025-11-12 20:50:39.424	2025-11-12 20:50:39.424	28	0	0
1631c436af7d388ff11413a5	dae702177783e835d4d70246	SIZE:XS|COLOR:gray	{"SIZE": "XS", "COLOR": "gray"}	LONGSLEEVE-XS-gray	29.99	\N	18	t	\N	t	t	\N	2	2025-11-12 20:50:39.425	2025-11-12 20:50:39.425	18	0	0
401b9d61c3175886c8000f20	dae702177783e835d4d70246	SIZE:XS|COLOR:navy	{"SIZE": "XS", "COLOR": "navy"}	LONGSLEEVE-XS-navy	31.99	\N	14	t	\N	t	t	\N	3	2025-11-12 20:50:39.426	2025-11-12 20:50:39.426	14	0	0
63bd17ccf71febcff351a392	dae702177783e835d4d70246	SIZE:XS|COLOR:red	{"SIZE": "XS", "COLOR": "red"}	LONGSLEEVE-XS-red	32.99	\N	25	t	\N	t	t	\N	4	2025-11-12 20:50:39.427	2025-11-12 20:50:39.427	25	0	0
d3f996d54896410769155857	dae702177783e835d4d70246	SIZE:S|COLOR:black	{"SIZE": "S", "COLOR": "black"}	LONGSLEEVE-S-black	29.99	\N	15	t	\N	t	t	\N	10	2025-11-12 20:50:39.429	2025-11-12 20:50:39.429	15	0	0
0d747c79dec60167ba4d21b7	dae702177783e835d4d70246	SIZE:S|COLOR:white	{"SIZE": "S", "COLOR": "white"}	LONGSLEEVE-S-white	29.99	\N	35	t	\N	t	t	\N	11	2025-11-12 20:50:39.431	2025-11-12 20:50:39.431	35	0	0
e628ec2ffb4a1bb0c53bd1cb	dae702177783e835d4d70246	SIZE:S|COLOR:gray	{"SIZE": "S", "COLOR": "gray"}	LONGSLEEVE-S-gray	29.99	\N	12	t	\N	t	t	\N	12	2025-11-12 20:50:39.432	2025-11-12 20:50:39.432	12	0	0
0af1098014e9c792cb0edb16	dae702177783e835d4d70246	SIZE:S|COLOR:navy	{"SIZE": "S", "COLOR": "navy"}	LONGSLEEVE-S-navy	31.99	\N	25	t	\N	t	t	\N	13	2025-11-12 20:50:39.433	2025-11-12 20:50:39.433	25	0	0
dd6dfaf16c885c8b43aed896	dae702177783e835d4d70246	SIZE:S|COLOR:green	{"SIZE": "S", "COLOR": "green"}	LONGSLEEVE-S-green	32.49	\N	13	t	\N	t	t	\N	15	2025-11-12 20:50:39.435	2025-11-12 20:50:39.435	13	0	0
7f70277518616d322432dad1	dae702177783e835d4d70246	SIZE:M|COLOR:black	{"SIZE": "M", "COLOR": "black"}	LONGSLEEVE-M-black	29.99	\N	23	t	\N	t	t	\N	20	2025-11-12 20:50:39.436	2025-11-12 20:50:39.436	23	0	0
f061d619a9437b5137997a4b	dae702177783e835d4d70246	SIZE:M|COLOR:white	{"SIZE": "M", "COLOR": "white"}	LONGSLEEVE-M-white	29.99	\N	19	t	\N	t	t	\N	21	2025-11-12 20:50:39.438	2025-11-12 20:50:39.438	19	0	0
2278006b0d5236b61145b8dd	dae702177783e835d4d70246	SIZE:M|COLOR:gray	{"SIZE": "M", "COLOR": "gray"}	LONGSLEEVE-M-gray	29.99	\N	24	t	\N	t	t	\N	22	2025-11-12 20:50:39.439	2025-11-12 20:50:39.439	24	0	0
5b426999c07a0cde5f5b8852	dae702177783e835d4d70246	SIZE:M|COLOR:navy	{"SIZE": "M", "COLOR": "navy"}	LONGSLEEVE-M-navy	31.99	\N	36	t	\N	t	t	\N	23	2025-11-12 20:50:39.44	2025-11-12 20:50:39.44	36	0	0
1dcffa480664132dcfc54752	dae702177783e835d4d70246	SIZE:M|COLOR:red	{"SIZE": "M", "COLOR": "red"}	LONGSLEEVE-M-red	32.99	\N	38	t	\N	t	t	\N	24	2025-11-12 20:50:39.441	2025-11-12 20:50:39.441	38	0	0
61377a5e18912241a34d592a	dae702177783e835d4d70246	SIZE:M|COLOR:green	{"SIZE": "M", "COLOR": "green"}	LONGSLEEVE-M-green	32.49	\N	12	t	\N	t	t	\N	25	2025-11-12 20:50:39.442	2025-11-12 20:50:39.442	12	0	0
e40215e7f76b2d70f3ba7497	dae702177783e835d4d70246	SIZE:L|COLOR:black	{"SIZE": "L", "COLOR": "black"}	LONGSLEEVE-L-black	31.49	\N	14	t	\N	t	t	\N	30	2025-11-12 20:50:39.443	2025-11-12 20:50:39.443	14	0	0
48578d8ea01def53a5af590b	dae702177783e835d4d70246	SIZE:L|COLOR:white	{"SIZE": "L", "COLOR": "white"}	LONGSLEEVE-L-white	31.49	\N	27	t	\N	t	t	\N	31	2025-11-12 20:50:39.444	2025-11-12 20:50:39.444	27	0	0
8b5ce3922942e24de1daba70	dae702177783e835d4d70246	SIZE:L|COLOR:gray	{"SIZE": "L", "COLOR": "gray"}	LONGSLEEVE-L-gray	31.49	\N	32	t	\N	t	t	\N	32	2025-11-12 20:50:39.445	2025-11-12 20:50:39.445	32	0	0
a94e85b2381f355a67470815	dae702177783e835d4d70246	SIZE:L|COLOR:navy	{"SIZE": "L", "COLOR": "navy"}	LONGSLEEVE-L-navy	33.49	\N	10	t	\N	t	t	\N	33	2025-11-12 20:50:39.447	2025-11-12 20:50:39.447	10	0	0
e158e5e225926c948a01231c	dae702177783e835d4d70246	SIZE:L|COLOR:red	{"SIZE": "L", "COLOR": "red"}	LONGSLEEVE-L-red	34.49	\N	26	t	\N	t	t	\N	34	2025-11-12 20:50:39.448	2025-11-12 20:50:39.448	26	0	0
df99d959c2f9dbf6e4558a10	dae702177783e835d4d70246	SIZE:L|COLOR:green	{"SIZE": "L", "COLOR": "green"}	LONGSLEEVE-L-green	33.99	\N	23	t	\N	t	t	\N	35	2025-11-12 20:50:39.449	2025-11-12 20:50:39.449	23	0	0
e610821d520f11ecf1e6cc7a	dae702177783e835d4d70246	SIZE:XL|COLOR:black	{"SIZE": "XL", "COLOR": "black"}	LONGSLEEVE-XL-black	32.99	\N	31	t	\N	t	t	\N	40	2025-11-12 20:50:39.451	2025-11-12 20:50:39.451	31	0	0
11fa6c81093e6757db9c38c6	dae702177783e835d4d70246	SIZE:XL|COLOR:white	{"SIZE": "XL", "COLOR": "white"}	LONGSLEEVE-XL-white	32.99	\N	10	t	\N	t	t	\N	41	2025-11-12 20:50:39.452	2025-11-12 20:50:39.452	10	0	0
ae75a426690fd849a8aa4129	dae702177783e835d4d70246	SIZE:XL|COLOR:gray	{"SIZE": "XL", "COLOR": "gray"}	LONGSLEEVE-XL-gray	32.99	\N	14	t	\N	t	t	\N	42	2025-11-12 20:50:39.453	2025-11-12 20:50:39.453	14	0	0
c4ca8ce7d11d427d4a4d239b	dae702177783e835d4d70246	SIZE:XL|COLOR:navy	{"SIZE": "XL", "COLOR": "navy"}	LONGSLEEVE-XL-navy	34.99	\N	27	t	\N	t	t	\N	43	2025-11-12 20:50:39.454	2025-11-12 20:50:39.454	27	0	0
a07e5ff2b4bc58e9eda076a6	dae702177783e835d4d70246	SIZE:XL|COLOR:red	{"SIZE": "XL", "COLOR": "red"}	LONGSLEEVE-XL-red	35.99	\N	33	t	\N	t	t	\N	44	2025-11-12 20:50:39.455	2025-11-12 20:50:39.455	33	0	0
2022e9e040fa8ba6c373b2ee	dae702177783e835d4d70246	SIZE:2XL|COLOR:black	{"SIZE": "2XL", "COLOR": "black"}	LONGSLEEVE-2XL-black	34.49	\N	22	t	\N	t	t	\N	50	2025-11-12 20:50:39.458	2025-11-12 20:50:39.458	22	0	0
cfccacec6649e5010f046085	dae702177783e835d4d70246	SIZE:2XL|COLOR:white	{"SIZE": "2XL", "COLOR": "white"}	LONGSLEEVE-2XL-white	34.49	\N	17	t	\N	t	t	\N	51	2025-11-12 20:50:39.459	2025-11-12 20:50:39.459	17	0	0
be557d9008203a4db15f53b3	dae702177783e835d4d70246	SIZE:2XL|COLOR:gray	{"SIZE": "2XL", "COLOR": "gray"}	LONGSLEEVE-2XL-gray	34.49	\N	37	t	\N	t	t	\N	52	2025-11-12 20:50:39.46	2025-11-12 20:50:39.46	37	0	0
875eca25cc2a065665512d61	dae702177783e835d4d70246	SIZE:2XL|COLOR:navy	{"SIZE": "2XL", "COLOR": "navy"}	LONGSLEEVE-2XL-navy	36.49	\N	14	t	\N	t	t	\N	53	2025-11-12 20:50:39.461	2025-11-12 20:50:39.461	14	0	0
b1a9f9163523a1a3337edd67	dae702177783e835d4d70246	SIZE:2XL|COLOR:red	{"SIZE": "2XL", "COLOR": "red"}	LONGSLEEVE-2XL-red	37.49	\N	29	t	\N	t	t	\N	54	2025-11-12 20:50:39.463	2025-11-12 20:50:39.463	29	0	0
6fa9d40b8b325cbe6d3b9b9f	dae702177783e835d4d70246	SIZE:2XL|COLOR:green	{"SIZE": "2XL", "COLOR": "green"}	LONGSLEEVE-2XL-green	36.99	\N	12	t	\N	t	t	\N	55	2025-11-12 20:50:39.465	2025-11-12 20:50:39.465	12	0	0
313b79469c29b98ce38ec242	1eecab038e59821264bbbb23	SIZE:XS|COLOR:black	{"SIZE": "XS", "COLOR": "black"}	POCKET-XS-black	27.99	\N	36	t	\N	t	t	\N	0	2025-11-12 20:50:39.486	2025-11-12 20:50:39.486	36	0	0
8c75a9763b42973cd12d855e	1eecab038e59821264bbbb23	SIZE:XS|COLOR:white	{"SIZE": "XS", "COLOR": "white"}	POCKET-XS-white	27.99	\N	25	t	\N	t	t	\N	1	2025-11-12 20:50:39.487	2025-11-12 20:50:39.487	25	0	0
eaa62ad2bfcea117e69a38aa	1eecab038e59821264bbbb23	SIZE:XS|COLOR:gray	{"SIZE": "XS", "COLOR": "gray"}	POCKET-XS-gray	27.99	\N	20	t	\N	t	t	\N	2	2025-11-12 20:50:39.488	2025-11-12 20:50:39.488	20	0	0
e17940438edcc10f3327cf23	1eecab038e59821264bbbb23	SIZE:XS|COLOR:navy	{"SIZE": "XS", "COLOR": "navy"}	POCKET-XS-navy	29.99	\N	24	t	\N	t	t	\N	3	2025-11-12 20:50:39.489	2025-11-12 20:50:39.489	24	0	0
45e08636aca362f6de2ae276	1eecab038e59821264bbbb23	SIZE:XS|COLOR:red	{"SIZE": "XS", "COLOR": "red"}	POCKET-XS-red	30.99	\N	20	t	\N	t	t	\N	4	2025-11-12 20:50:39.49	2025-11-12 20:50:39.49	20	0	0
9e73a01e18da15bc66101d20	1eecab038e59821264bbbb23	SIZE:XS|COLOR:green	{"SIZE": "XS", "COLOR": "green"}	POCKET-XS-green	30.49	\N	38	t	\N	t	t	\N	5	2025-11-12 20:50:39.492	2025-11-12 20:50:39.492	38	0	0
377b0a0a8cc8d23ec2fd3ca8	1eecab038e59821264bbbb23	SIZE:S|COLOR:black	{"SIZE": "S", "COLOR": "black"}	POCKET-S-black	27.99	\N	26	t	\N	t	t	\N	10	2025-11-12 20:50:39.493	2025-11-12 20:50:39.493	26	0	0
6ac24029d72cd3503ce9e9b3	1eecab038e59821264bbbb23	SIZE:S|COLOR:white	{"SIZE": "S", "COLOR": "white"}	POCKET-S-white	27.99	\N	11	t	\N	t	t	\N	11	2025-11-12 20:50:39.494	2025-11-12 20:50:39.494	11	0	0
a63effe6727095a5579034f3	1eecab038e59821264bbbb23	SIZE:S|COLOR:gray	{"SIZE": "S", "COLOR": "gray"}	POCKET-S-gray	27.99	\N	36	t	\N	t	t	\N	12	2025-11-12 20:50:39.495	2025-11-12 20:50:39.495	36	0	0
d5009bd15a2a839d58c17c86	1eecab038e59821264bbbb23	SIZE:S|COLOR:navy	{"SIZE": "S", "COLOR": "navy"}	POCKET-S-navy	29.99	\N	38	t	\N	t	t	\N	13	2025-11-12 20:50:39.497	2025-11-12 20:50:39.497	38	0	0
08b11f947ec6252acd4b92cf	1eecab038e59821264bbbb23	SIZE:S|COLOR:red	{"SIZE": "S", "COLOR": "red"}	POCKET-S-red	30.99	\N	24	t	\N	t	t	\N	14	2025-11-12 20:50:39.498	2025-11-12 20:50:39.498	24	0	0
649a7cadffd7db1034a09a83	1eecab038e59821264bbbb23	SIZE:S|COLOR:green	{"SIZE": "S", "COLOR": "green"}	POCKET-S-green	30.49	\N	21	t	\N	t	t	\N	15	2025-11-12 20:50:39.501	2025-11-12 20:50:39.501	21	0	0
0698b54c39ea70e7ea49bc9d	1eecab038e59821264bbbb23	SIZE:M|COLOR:white	{"SIZE": "M", "COLOR": "white"}	POCKET-M-white	27.99	\N	38	t	\N	t	t	\N	21	2025-11-12 20:50:39.504	2025-11-12 20:50:39.504	38	0	0
788568d18789989e1c914fc6	1eecab038e59821264bbbb23	SIZE:M|COLOR:gray	{"SIZE": "M", "COLOR": "gray"}	POCKET-M-gray	27.99	\N	15	t	\N	t	t	\N	22	2025-11-12 20:50:39.506	2025-11-12 20:50:39.506	15	0	0
143a695d914e6dee4cf5c80c	1eecab038e59821264bbbb23	SIZE:M|COLOR:navy	{"SIZE": "M", "COLOR": "navy"}	POCKET-M-navy	29.99	\N	11	t	\N	t	t	\N	23	2025-11-12 20:50:39.507	2025-11-12 20:50:39.507	11	0	0
26c71ffe185f7be586d461a1	1eecab038e59821264bbbb23	SIZE:M|COLOR:red	{"SIZE": "M", "COLOR": "red"}	POCKET-M-red	30.99	\N	20	t	\N	t	t	\N	24	2025-11-12 20:50:39.508	2025-11-12 20:50:39.508	20	0	0
6f42379c27d285111501e4b1	1eecab038e59821264bbbb23	SIZE:M|COLOR:green	{"SIZE": "M", "COLOR": "green"}	POCKET-M-green	30.49	\N	17	t	\N	t	t	\N	25	2025-11-12 20:50:39.51	2025-11-12 20:50:39.51	17	0	0
2a5ce6dab91460445038de18	1eecab038e59821264bbbb23	SIZE:L|COLOR:black	{"SIZE": "L", "COLOR": "black"}	POCKET-L-black	29.39	\N	24	t	\N	t	t	\N	30	2025-11-12 20:50:39.511	2025-11-12 20:50:39.511	24	0	0
0a5a7687aea22d35f07fd394	1eecab038e59821264bbbb23	SIZE:L|COLOR:white	{"SIZE": "L", "COLOR": "white"}	POCKET-L-white	29.39	\N	36	t	\N	t	t	\N	31	2025-11-12 20:50:39.512	2025-11-12 20:50:39.512	36	0	0
23537b0fc747446e67831436	1eecab038e59821264bbbb23	SIZE:L|COLOR:gray	{"SIZE": "L", "COLOR": "gray"}	POCKET-L-gray	29.39	\N	24	t	\N	t	t	\N	32	2025-11-12 20:50:39.514	2025-11-12 20:50:39.514	24	0	0
d616e2c7e21ef3848a8fad70	1eecab038e59821264bbbb23	SIZE:L|COLOR:navy	{"SIZE": "L", "COLOR": "navy"}	POCKET-L-navy	31.39	\N	14	t	\N	t	t	\N	33	2025-11-12 20:50:39.515	2025-11-12 20:50:39.515	14	0	0
1db11274aa4ff5bf96795cc1	1eecab038e59821264bbbb23	SIZE:L|COLOR:red	{"SIZE": "L", "COLOR": "red"}	POCKET-L-red	32.39	\N	21	t	\N	t	t	\N	34	2025-11-12 20:50:39.516	2025-11-12 20:50:39.516	21	0	0
82ba46adb91f5f435867f285	1eecab038e59821264bbbb23	SIZE:L|COLOR:green	{"SIZE": "L", "COLOR": "green"}	POCKET-L-green	31.89	\N	30	t	\N	t	t	\N	35	2025-11-12 20:50:39.517	2025-11-12 20:50:39.517	30	0	0
dd0a7a56bfde1a92d02efe6b	1eecab038e59821264bbbb23	SIZE:XL|COLOR:black	{"SIZE": "XL", "COLOR": "black"}	POCKET-XL-black	30.79	\N	13	t	\N	t	t	\N	40	2025-11-12 20:50:39.519	2025-11-12 20:50:39.519	13	0	0
bf3b3fa117567ba8da5a7034	1eecab038e59821264bbbb23	SIZE:XL|COLOR:white	{"SIZE": "XL", "COLOR": "white"}	POCKET-XL-white	30.79	\N	14	t	\N	t	t	\N	41	2025-11-12 20:50:39.52	2025-11-12 20:50:39.52	14	0	0
37c83aef3b81f8c0eeae3013	1eecab038e59821264bbbb23	SIZE:XL|COLOR:gray	{"SIZE": "XL", "COLOR": "gray"}	POCKET-XL-gray	30.79	\N	16	t	\N	t	t	\N	42	2025-11-12 20:50:39.521	2025-11-12 20:50:39.521	16	0	0
8f34176dd9f30eecdb6a499f	1eecab038e59821264bbbb23	SIZE:XL|COLOR:navy	{"SIZE": "XL", "COLOR": "navy"}	POCKET-XL-navy	32.79	\N	17	t	\N	t	t	\N	43	2025-11-12 20:50:39.523	2025-11-12 20:50:39.523	17	0	0
f6ac99300c98a0b2df625f34	1eecab038e59821264bbbb23	SIZE:XL|COLOR:red	{"SIZE": "XL", "COLOR": "red"}	POCKET-XL-red	33.79	\N	21	t	\N	t	t	\N	44	2025-11-12 20:50:39.524	2025-11-12 20:50:39.524	21	0	0
b68c85e051c7973fd3af3fbb	1eecab038e59821264bbbb23	SIZE:XL|COLOR:green	{"SIZE": "XL", "COLOR": "green"}	POCKET-XL-green	33.29	\N	24	t	\N	t	t	\N	45	2025-11-12 20:50:39.526	2025-11-12 20:50:39.526	24	0	0
7060dae0078c3c353df9660a	1eecab038e59821264bbbb23	SIZE:2XL|COLOR:black	{"SIZE": "2XL", "COLOR": "black"}	POCKET-2XL-black	32.19	\N	38	t	\N	t	t	\N	50	2025-11-12 20:50:39.528	2025-11-12 20:50:39.528	38	0	0
21658c485ad6fb6b3594bb1e	1eecab038e59821264bbbb23	SIZE:2XL|COLOR:white	{"SIZE": "2XL", "COLOR": "white"}	POCKET-2XL-white	32.19	\N	17	t	\N	t	t	\N	51	2025-11-12 20:50:39.53	2025-11-12 20:50:39.53	17	0	0
8513847f9634f64c051d8a21	1eecab038e59821264bbbb23	SIZE:2XL|COLOR:gray	{"SIZE": "2XL", "COLOR": "gray"}	POCKET-2XL-gray	32.19	\N	21	t	\N	t	t	\N	52	2025-11-12 20:50:39.532	2025-11-12 20:50:39.532	21	0	0
828695b42212e4d881645fe6	1eecab038e59821264bbbb23	SIZE:2XL|COLOR:navy	{"SIZE": "2XL", "COLOR": "navy"}	POCKET-2XL-navy	34.19	\N	17	t	\N	t	t	\N	53	2025-11-12 20:50:39.533	2025-11-12 20:50:39.533	17	0	0
677af96d89873dc2df05f049	1eecab038e59821264bbbb23	SIZE:2XL|COLOR:red	{"SIZE": "2XL", "COLOR": "red"}	POCKET-2XL-red	35.19	\N	20	t	\N	t	t	\N	54	2025-11-12 20:50:39.534	2025-11-12 20:50:39.534	20	0	0
09184420ebc9b3871d3b7740	1eecab038e59821264bbbb23	SIZE:2XL|COLOR:green	{"SIZE": "2XL", "COLOR": "green"}	POCKET-2XL-green	34.69	\N	34	t	\N	t	t	\N	55	2025-11-12 20:50:39.536	2025-11-12 20:50:39.536	34	0	0
29d6b9fd24d1840957d2f210	b296159ba233dd44e6a7b584	SIZE:XS|COLOR:black	{"SIZE": "XS", "COLOR": "black"}	ATHLETIC-XS-black	32.99	\N	35	t	\N	t	t	\N	0	2025-11-12 20:50:39.559	2025-11-12 20:50:39.559	35	0	0
93ac0901e4604378fec0f139	b296159ba233dd44e6a7b584	SIZE:XS|COLOR:white	{"SIZE": "XS", "COLOR": "white"}	ATHLETIC-XS-white	32.99	\N	31	t	\N	t	t	\N	1	2025-11-12 20:50:39.561	2025-11-12 20:50:39.561	31	0	0
a53b4dd9103a10497a11a7ab	b296159ba233dd44e6a7b584	SIZE:XS|COLOR:gray	{"SIZE": "XS", "COLOR": "gray"}	ATHLETIC-XS-gray	32.99	\N	15	t	\N	t	t	\N	2	2025-11-12 20:50:39.563	2025-11-12 20:50:39.563	15	0	0
9b5ce85e774a13210374f9fa	b296159ba233dd44e6a7b584	SIZE:XS|COLOR:navy	{"SIZE": "XS", "COLOR": "navy"}	ATHLETIC-XS-navy	34.99	\N	19	t	\N	t	t	\N	3	2025-11-12 20:50:39.565	2025-11-12 20:50:39.565	19	0	0
695129240dad9e0d60d4b996	b296159ba233dd44e6a7b584	SIZE:XS|COLOR:red	{"SIZE": "XS", "COLOR": "red"}	ATHLETIC-XS-red	35.99	\N	24	t	\N	t	t	\N	4	2025-11-12 20:50:39.567	2025-11-12 20:50:39.567	24	0	0
272dcfd509e5b35aaaa33e99	b296159ba233dd44e6a7b584	SIZE:XS|COLOR:green	{"SIZE": "XS", "COLOR": "green"}	ATHLETIC-XS-green	35.49	\N	14	t	\N	t	t	\N	5	2025-11-12 20:50:39.57	2025-11-12 20:50:39.57	14	0	0
7a0ee6c38011da711c2bcfa3	b296159ba233dd44e6a7b584	SIZE:S|COLOR:black	{"SIZE": "S", "COLOR": "black"}	ATHLETIC-S-black	32.99	\N	36	t	\N	t	t	\N	10	2025-11-12 20:50:39.572	2025-11-12 20:50:39.572	36	0	0
92959892da82156122dd002f	b296159ba233dd44e6a7b584	SIZE:S|COLOR:white	{"SIZE": "S", "COLOR": "white"}	ATHLETIC-S-white	32.99	\N	35	t	\N	t	t	\N	11	2025-11-12 20:50:39.573	2025-11-12 20:50:39.573	35	0	0
0505c7daf7680d160c9beb42	b296159ba233dd44e6a7b584	SIZE:S|COLOR:gray	{"SIZE": "S", "COLOR": "gray"}	ATHLETIC-S-gray	32.99	\N	34	t	\N	t	t	\N	12	2025-11-12 20:50:39.575	2025-11-12 20:50:39.575	34	0	0
9e6b3c3d373344cda509234d	b296159ba233dd44e6a7b584	SIZE:S|COLOR:navy	{"SIZE": "S", "COLOR": "navy"}	ATHLETIC-S-navy	34.99	\N	32	t	\N	t	t	\N	13	2025-11-12 20:50:39.577	2025-11-12 20:50:39.577	32	0	0
0c9f88eb2ddbc3d9f4248eb8	b296159ba233dd44e6a7b584	SIZE:S|COLOR:red	{"SIZE": "S", "COLOR": "red"}	ATHLETIC-S-red	35.99	\N	31	t	\N	t	t	\N	14	2025-11-12 20:50:39.578	2025-11-12 20:50:39.578	31	0	0
3d097898ba273d70cd8c91e9	b296159ba233dd44e6a7b584	SIZE:S|COLOR:green	{"SIZE": "S", "COLOR": "green"}	ATHLETIC-S-green	35.49	\N	11	t	\N	t	t	\N	15	2025-11-12 20:50:39.579	2025-11-12 20:50:39.579	11	0	0
edb8cc6d5b122493520686a2	b296159ba233dd44e6a7b584	SIZE:M|COLOR:black	{"SIZE": "M", "COLOR": "black"}	ATHLETIC-M-black	32.99	\N	37	t	\N	t	t	\N	20	2025-11-12 20:50:39.581	2025-11-12 20:50:39.581	37	0	0
7b22432e4528f1aa5d924969	b296159ba233dd44e6a7b584	SIZE:M|COLOR:white	{"SIZE": "M", "COLOR": "white"}	ATHLETIC-M-white	32.99	\N	20	t	\N	t	t	\N	21	2025-11-12 20:50:39.582	2025-11-12 20:50:39.582	20	0	0
20fa496e90f31fce7ba5cba8	b296159ba233dd44e6a7b584	SIZE:M|COLOR:navy	{"SIZE": "M", "COLOR": "navy"}	ATHLETIC-M-navy	34.99	\N	38	t	\N	t	t	\N	23	2025-11-12 20:50:39.585	2025-11-12 20:50:39.585	38	0	0
9ce38c56f8937edd6ea2af82	b296159ba233dd44e6a7b584	SIZE:M|COLOR:red	{"SIZE": "M", "COLOR": "red"}	ATHLETIC-M-red	35.99	\N	18	t	\N	t	t	\N	24	2025-11-12 20:50:39.586	2025-11-12 20:50:39.586	18	0	0
1083db6ceb94e8d2ee3183d1	b296159ba233dd44e6a7b584	SIZE:M|COLOR:green	{"SIZE": "M", "COLOR": "green"}	ATHLETIC-M-green	35.49	\N	37	t	\N	t	t	\N	25	2025-11-12 20:50:39.588	2025-11-12 20:50:39.588	37	0	0
83b2db47643151bc35ac28db	b296159ba233dd44e6a7b584	SIZE:L|COLOR:black	{"SIZE": "L", "COLOR": "black"}	ATHLETIC-L-black	34.64	\N	20	t	\N	t	t	\N	30	2025-11-12 20:50:39.589	2025-11-12 20:50:39.589	20	0	0
9a0d0baf2efee33148810a86	b296159ba233dd44e6a7b584	SIZE:L|COLOR:white	{"SIZE": "L", "COLOR": "white"}	ATHLETIC-L-white	34.64	\N	39	t	\N	t	t	\N	31	2025-11-12 20:50:39.591	2025-11-12 20:50:39.591	39	0	0
366bab04c92581c54a3b1515	b296159ba233dd44e6a7b584	SIZE:L|COLOR:gray	{"SIZE": "L", "COLOR": "gray"}	ATHLETIC-L-gray	34.64	\N	20	t	\N	t	t	\N	32	2025-11-12 20:50:39.592	2025-11-12 20:50:39.592	20	0	0
2487e5e461ae6e68b8da39d2	b296159ba233dd44e6a7b584	SIZE:L|COLOR:navy	{"SIZE": "L", "COLOR": "navy"}	ATHLETIC-L-navy	36.64	\N	34	t	\N	t	t	\N	33	2025-11-12 20:50:39.593	2025-11-12 20:50:39.593	34	0	0
5957d994ef7d4ad9ff8a8bdf	b296159ba233dd44e6a7b584	SIZE:L|COLOR:red	{"SIZE": "L", "COLOR": "red"}	ATHLETIC-L-red	37.64	\N	21	t	\N	t	t	\N	34	2025-11-12 20:50:39.595	2025-11-12 20:50:39.595	21	0	0
2d9d7e23cbf3f3883f898761	b296159ba233dd44e6a7b584	SIZE:XL|COLOR:black	{"SIZE": "XL", "COLOR": "black"}	ATHLETIC-XL-black	36.29	\N	22	t	\N	t	t	\N	40	2025-11-12 20:50:39.598	2025-11-12 20:50:39.598	22	0	0
fbc3f3ef1c740e79d70e4da1	b296159ba233dd44e6a7b584	SIZE:XL|COLOR:white	{"SIZE": "XL", "COLOR": "white"}	ATHLETIC-XL-white	36.29	\N	10	t	\N	t	t	\N	41	2025-11-12 20:50:39.599	2025-11-12 20:50:39.599	10	0	0
c344c62b69c3db5ee8984801	b296159ba233dd44e6a7b584	SIZE:XL|COLOR:gray	{"SIZE": "XL", "COLOR": "gray"}	ATHLETIC-XL-gray	36.29	\N	37	t	\N	t	t	\N	42	2025-11-12 20:50:39.601	2025-11-12 20:50:39.601	37	0	0
89f31e9539c813c9afabd27d	b296159ba233dd44e6a7b584	SIZE:XL|COLOR:navy	{"SIZE": "XL", "COLOR": "navy"}	ATHLETIC-XL-navy	38.29	\N	37	t	\N	t	t	\N	43	2025-11-12 20:50:39.602	2025-11-12 20:50:39.602	37	0	0
35563e348276cf355b51eb21	b296159ba233dd44e6a7b584	SIZE:XL|COLOR:red	{"SIZE": "XL", "COLOR": "red"}	ATHLETIC-XL-red	39.29	\N	21	t	\N	t	t	\N	44	2025-11-12 20:50:39.603	2025-11-12 20:50:39.603	21	0	0
d94a6bcf52aacca054fcf2bc	b296159ba233dd44e6a7b584	SIZE:XL|COLOR:green	{"SIZE": "XL", "COLOR": "green"}	ATHLETIC-XL-green	38.79	\N	29	t	\N	t	t	\N	45	2025-11-12 20:50:39.605	2025-11-12 20:50:39.605	29	0	0
7b2bec9ccdf5ff061f4eb8b6	b296159ba233dd44e6a7b584	SIZE:2XL|COLOR:black	{"SIZE": "2XL", "COLOR": "black"}	ATHLETIC-2XL-black	37.94	\N	37	t	\N	t	t	\N	50	2025-11-12 20:50:39.606	2025-11-12 20:50:39.606	37	0	0
7f010b3956884054f4b7d28a	b296159ba233dd44e6a7b584	SIZE:2XL|COLOR:white	{"SIZE": "2XL", "COLOR": "white"}	ATHLETIC-2XL-white	37.94	\N	33	t	\N	t	t	\N	51	2025-11-12 20:50:39.608	2025-11-12 20:50:39.608	33	0	0
6c5e6206ba2688b14bccfb75	b296159ba233dd44e6a7b584	SIZE:2XL|COLOR:gray	{"SIZE": "2XL", "COLOR": "gray"}	ATHLETIC-2XL-gray	37.94	\N	27	t	\N	t	t	\N	52	2025-11-12 20:50:39.609	2025-11-12 20:50:39.609	27	0	0
871ba358130ef80d2cb42201	b296159ba233dd44e6a7b584	SIZE:2XL|COLOR:navy	{"SIZE": "2XL", "COLOR": "navy"}	ATHLETIC-2XL-navy	39.94	\N	14	t	\N	t	t	\N	53	2025-11-12 20:50:39.611	2025-11-12 20:50:39.611	14	0	0
b8017594057cd40015e70dd2	b296159ba233dd44e6a7b584	SIZE:2XL|COLOR:red	{"SIZE": "2XL", "COLOR": "red"}	ATHLETIC-2XL-red	40.94	\N	24	t	\N	t	t	\N	54	2025-11-12 20:50:39.612	2025-11-12 20:50:39.612	24	0	0
2582b989df013ad7cd93f68b	b296159ba233dd44e6a7b584	SIZE:2XL|COLOR:green	{"SIZE": "2XL", "COLOR": "green"}	ATHLETIC-2XL-green	40.44	\N	37	t	\N	t	t	\N	55	2025-11-12 20:50:39.613	2025-11-12 20:50:39.613	37	0	0
27157b5db211114a7c38c95b	b714e56e0dc77578e3457e66	SIZE:OSFM	{"SIZE": "OSFM"}	BASEBALL-OSFM	22.99	\N	19	t	\N	t	t	\N	0	2025-11-12 20:50:39.633	2025-11-12 20:50:39.633	19	0	0
76c9f4942b3c047505a2f765	b714e56e0dc77578e3457e66	SIZE:S/M	{"SIZE": "S/M"}	BASEBALL-S/M	22.99	\N	53	t	\N	t	t	\N	1	2025-11-12 20:50:39.634	2025-11-12 20:50:39.634	53	0	0
cd47be18bd03937067755d22	b714e56e0dc77578e3457e66	SIZE:L/XL	{"SIZE": "L/XL"}	BASEBALL-L/XL	24.99	\N	34	t	\N	t	t	\N	2	2025-11-12 20:50:39.636	2025-11-12 20:50:39.636	34	0	0
21a7bf4418311b11c7139616	cb076411fddaf2dac28d809e	SIZE:OSFM	{"SIZE": "OSFM"}	SNAPBACK-OSFM	24.99	\N	19	t	\N	t	t	\N	0	2025-11-12 20:50:39.661	2025-11-12 20:50:39.661	19	0	0
01a4b598d06ed4635cee7f9f	cb076411fddaf2dac28d809e	SIZE:S/M	{"SIZE": "S/M"}	SNAPBACK-S/M	24.99	\N	32	t	\N	t	t	\N	1	2025-11-12 20:50:39.664	2025-11-12 20:50:39.664	32	0	0
e3f341a57e6dd4b4ac1de402	cb076411fddaf2dac28d809e	SIZE:L/XL	{"SIZE": "L/XL"}	SNAPBACK-L/XL	26.99	\N	40	t	\N	t	t	\N	2	2025-11-12 20:50:39.665	2025-11-12 20:50:39.665	40	0	0
0f94e5391d2fbe6edf83240b	ba61f67d8e2e16bce3a0d5e9	SIZE:OSFM	{"SIZE": "OSFM"}	TRUCKER-OSFM	19.99	\N	41	t	\N	t	t	\N	0	2025-11-12 20:50:39.679	2025-11-12 20:50:39.679	41	0	0
484326d52a9422921d06ac83	ba61f67d8e2e16bce3a0d5e9	SIZE:S/M	{"SIZE": "S/M"}	TRUCKER-S/M	19.99	\N	43	t	\N	t	t	\N	1	2025-11-12 20:50:39.68	2025-11-12 20:50:39.68	43	0	0
0823a3837becf5080f94cb97	ba61f67d8e2e16bce3a0d5e9	SIZE:L/XL	{"SIZE": "L/XL"}	TRUCKER-L/XL	21.99	\N	35	t	\N	t	t	\N	2	2025-11-12 20:50:39.682	2025-11-12 20:50:39.682	35	0	0
978fca5a6910c22d06c49e02	197d12406547e42a6f5bc484	SIZE:OSFM	{"SIZE": "OSFM"}	BEANIE-OSFM	18.99	\N	43	t	\N	t	t	\N	0	2025-11-12 20:50:39.691	2025-11-12 20:50:39.691	43	0	0
0908b7c38f30a80d54d0bec6	197d12406547e42a6f5bc484	SIZE:S/M	{"SIZE": "S/M"}	BEANIE-S/M	18.99	\N	20	t	\N	t	t	\N	1	2025-11-12 20:50:39.693	2025-11-12 20:50:39.693	20	0	0
a129df6b75fc96f4d8f15519	197d12406547e42a6f5bc484	SIZE:L/XL	{"SIZE": "L/XL"}	BEANIE-L/XL	20.99	\N	54	t	\N	t	t	\N	2	2025-11-12 20:50:39.694	2025-11-12 20:50:39.694	54	0	0
194f405d7ab1617b5d958f79	21d4e2f63ebd4fc6822fdca2	SIZE:OSFM	{"SIZE": "OSFM"}	BUCKET-OSFM	21.99	\N	47	t	\N	t	t	\N	0	2025-11-12 20:50:39.703	2025-11-12 20:50:39.703	47	0	0
0ce09e19760e7f43e1c0bb37	21d4e2f63ebd4fc6822fdca2	SIZE:S/M	{"SIZE": "S/M"}	BUCKET-S/M	21.99	\N	27	t	\N	t	t	\N	1	2025-11-12 20:50:39.704	2025-11-12 20:50:39.704	27	0	0
13886b46519273b57816ed04	21d4e2f63ebd4fc6822fdca2	SIZE:L/XL	{"SIZE": "L/XL"}	BUCKET-L/XL	23.99	\N	37	t	\N	t	t	\N	2	2025-11-12 20:50:39.706	2025-11-12 20:50:39.706	37	0	0
2da6b1943a6dbef88c54d8ba	d211d37587626b5dcc801bd2	SIZE:OSFM	{"SIZE": "OSFM"}	FEDORA-OSFM	34.99	\N	48	t	\N	t	t	\N	0	2025-11-12 20:50:39.714	2025-11-12 20:50:39.714	48	0	0
1e9563acdd1bb99e4dd074b4	d211d37587626b5dcc801bd2	SIZE:S/M	{"SIZE": "S/M"}	FEDORA-S/M	34.99	\N	53	t	\N	t	t	\N	1	2025-11-12 20:50:39.716	2025-11-12 20:50:39.716	53	0	0
8c949d83c8bfc4868b0fea7f	d211d37587626b5dcc801bd2	SIZE:L/XL	{"SIZE": "L/XL"}	FEDORA-L/XL	36.99	\N	21	t	\N	t	t	\N	2	2025-11-12 20:50:39.717	2025-11-12 20:50:39.717	21	0	0
0b0cb60dc66547e7416d4f59	91dc2206e5f7a1c0a7eb0b7c	SIZE:OSFM	{"SIZE": "OSFM"}	DAD-OSFM	20.99	\N	46	t	\N	t	t	\N	0	2025-11-12 20:50:39.725	2025-11-12 20:50:39.725	46	0	0
9852baeb8b5e146966a2c7ea	94c805c481cc4efd557699c6	SIZE:XS|COLOR:black	{"SIZE": "XS", "COLOR": "black"}	VINTAGE-XS-black	29.99	\N	23	t	\N	t	t	\N	0	2025-11-12 20:50:39.152	2025-11-12 20:50:39.152	23	0	0
6c5e27c5f7e54d81e15ad927	94c805c481cc4efd557699c6	SIZE:XS|COLOR:gray	{"SIZE": "XS", "COLOR": "gray"}	VINTAGE-XS-gray	29.99	\N	31	t	\N	t	t	\N	2	2025-11-12 20:50:39.155	2025-11-12 20:50:39.155	31	0	0
f2d35eee969947c4becda31e	94c805c481cc4efd557699c6	SIZE:2XL|COLOR:black	{"SIZE": "2XL", "COLOR": "black"}	VINTAGE-2XL-black	34.49	\N	17	t	\N	t	t	\N	50	2025-11-12 20:50:39.188	2025-11-12 20:50:39.188	17	0	0
c81cabb14c8bcbb7b68dc53f	9a6ea3fbecfc23c01f9e3734	SIZE:XS|COLOR:red	{"SIZE": "XS", "COLOR": "red"}	VNECK-XS-red	29.99	\N	11	t	\N	t	t	\N	4	2025-11-12 20:50:39.22	2025-11-12 20:50:39.22	11	0	0
ceaf680af0eacdb0e1cb20ba	9a6ea3fbecfc23c01f9e3734	SIZE:S|COLOR:green	{"SIZE": "S", "COLOR": "green"}	VNECK-S-green	29.49	\N	35	t	\N	t	t	\N	15	2025-11-12 20:50:39.229	2025-11-12 20:50:39.229	35	0	0
c1ca934054eea393a4efc3e3	6b486d564c5c5d2e284c5342	SIZE:S|COLOR:black	{"SIZE": "S", "COLOR": "black"}	POLO-S-black	39.99	\N	22	t	\N	t	t	\N	10	2025-11-12 20:50:39.291	2025-11-12 20:50:39.291	22	0	0
4c01882b1999567a9f06adac	6b486d564c5c5d2e284c5342	SIZE:M|COLOR:black	{"SIZE": "M", "COLOR": "black"}	POLO-M-black	39.99	\N	21	t	\N	t	t	\N	20	2025-11-12 20:50:39.301	2025-11-12 20:50:39.301	21	0	0
ea77d9f466b6824177323fad	06ee32c9ac00f8c475aca3b4	SIZE:S|COLOR:gray	{"SIZE": "S", "COLOR": "gray"}	HENLEY-S-gray	34.99	\N	23	t	\N	t	t	\N	12	2025-11-12 20:50:39.363	2025-11-12 20:50:39.363	23	0	0
b90034e94d166802a2f86f53	dae702177783e835d4d70246	SIZE:XS|COLOR:green	{"SIZE": "XS", "COLOR": "green"}	LONGSLEEVE-XS-green	32.49	\N	24	t	\N	t	t	\N	5	2025-11-12 20:50:39.428	2025-11-12 20:50:39.428	24	0	0
57c63afb57f5bd0044fc3a77	dae702177783e835d4d70246	SIZE:S|COLOR:red	{"SIZE": "S", "COLOR": "red"}	LONGSLEEVE-S-red	32.99	\N	36	t	\N	t	t	\N	14	2025-11-12 20:50:39.434	2025-11-12 20:50:39.434	36	0	0
c2b4184b1141477279dc1abc	dae702177783e835d4d70246	SIZE:XL|COLOR:green	{"SIZE": "XL", "COLOR": "green"}	LONGSLEEVE-XL-green	35.49	\N	31	t	\N	t	t	\N	45	2025-11-12 20:50:39.456	2025-11-12 20:50:39.456	31	0	0
29dc679226774c2a2ced7e59	1eecab038e59821264bbbb23	SIZE:M|COLOR:black	{"SIZE": "M", "COLOR": "black"}	POCKET-M-black	27.99	\N	14	t	\N	t	t	\N	20	2025-11-12 20:50:39.503	2025-11-12 20:50:39.503	14	0	0
8b4dc89e87d0145d31879a60	b296159ba233dd44e6a7b584	SIZE:M|COLOR:gray	{"SIZE": "M", "COLOR": "gray"}	ATHLETIC-M-gray	32.99	\N	16	t	\N	t	t	\N	22	2025-11-12 20:50:39.583	2025-11-12 20:50:39.583	16	0	0
ac98a4c4b672109960e49286	b296159ba233dd44e6a7b584	SIZE:L|COLOR:green	{"SIZE": "L", "COLOR": "green"}	ATHLETIC-L-green	37.14	\N	13	t	\N	t	t	\N	35	2025-11-12 20:50:39.596	2025-11-12 20:50:39.596	13	0	0
aad61c4eeddfa8473864b315	bdfebbd8b3bab6cab71cc6c7	SIZE:XS|COLOR:green	{"SIZE": "XS", "COLOR": "green"}	CREW-XS-green	27.49	\N	33	t	\N	t	t	\N	5	2025-11-12 20:50:39.099	2025-11-12 20:50:39.099	33	0	0
4de4faff265a6a150c09d625	2db4c4ce785e7a3c59225419	SIZE:S/M	{"SIZE": "S/M"}	FITTED-S/M	27.99	\N	32	t	\N	t	t	\N	1	2025-11-12 20:50:39.736	2025-11-12 20:50:39.736	32	0	0
4fa8864a63e12b94d0c61f55	2db4c4ce785e7a3c59225419	SIZE:L/XL	{"SIZE": "L/XL"}	FITTED-L/XL	29.99	\N	50	t	\N	t	t	\N	2	2025-11-12 20:50:39.737	2025-11-12 20:50:39.737	50	0	0
d76a975441f02d95dddec750	7c8c3333aa56a6b5abf198fd	SIZE:OSFM	{"SIZE": "OSFM"}	VISOR-OSFM	16.99	\N	36	t	\N	t	t	\N	0	2025-11-12 20:50:39.746	2025-11-12 20:50:39.746	36	0	0
2b53f1914ea92bbddfc4c49b	7c8c3333aa56a6b5abf198fd	SIZE:S/M	{"SIZE": "S/M"}	VISOR-S/M	16.99	\N	23	t	\N	t	t	\N	1	2025-11-12 20:50:39.748	2025-11-12 20:50:39.748	23	0	0
4a7a84afc1ddf6d62ac81044	7c8c3333aa56a6b5abf198fd	SIZE:L/XL	{"SIZE": "L/XL"}	VISOR-L/XL	18.99	\N	24	t	\N	t	t	\N	2	2025-11-12 20:50:39.75	2025-11-12 20:50:39.75	24	0	0
430f2a125c3601d5a5b6c738	ac3ff669021524948e7b8970	SIZE:OSFM	{"SIZE": "OSFM"}	BERET-OSFM	26.99	\N	25	t	\N	t	t	\N	0	2025-11-12 20:50:39.759	2025-11-12 20:50:39.759	25	0	0
08ed5f984c111b344c87f893	ac3ff669021524948e7b8970	SIZE:S/M	{"SIZE": "S/M"}	BERET-S/M	26.99	\N	24	t	\N	t	t	\N	1	2025-11-12 20:50:39.761	2025-11-12 20:50:39.761	24	0	0
819e1bb3ef04385ce5530cf2	ac3ff669021524948e7b8970	SIZE:L/XL	{"SIZE": "L/XL"}	BERET-L/XL	28.99	\N	41	t	\N	t	t	\N	2	2025-11-12 20:50:39.762	2025-11-12 20:50:39.762	41	0	0
53f4e01ed335782670c56a5d	8571e831a8d37a7376db7883	SIZE:OSFM	{"SIZE": "OSFM"}	NEWSBOY-OSFM	28.99	\N	47	t	\N	t	t	\N	0	2025-11-12 20:50:39.77	2025-11-12 20:50:39.77	47	0	0
29b6c4544f4e0b019f27b37b	8571e831a8d37a7376db7883	SIZE:S/M	{"SIZE": "S/M"}	NEWSBOY-S/M	28.99	\N	30	t	\N	t	t	\N	1	2025-11-12 20:50:39.771	2025-11-12 20:50:39.771	30	0	0
b67eedaac8e63a6156738481	8571e831a8d37a7376db7883	SIZE:L/XL	{"SIZE": "L/XL"}	NEWSBOY-L/XL	30.99	\N	34	t	\N	t	t	\N	2	2025-11-12 20:50:39.772	2025-11-12 20:50:39.772	34	0	0
variantCombination_1763158427226_6d85ldso7	product_1763158427220_zo7i7fjm2	xs-black	{"SIZE": "xs", "COLOR": "black"}	TSHIRT-XS-BLACK	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.226	2025-11-14 22:13:47.226	\N	0	0
variantCombination_1763158427230_yvychuifx	product_1763158427220_zo7i7fjm2	xs-white	{"SIZE": "xs", "COLOR": "white"}	TSHIRT-XS-WHITE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.231	2025-11-14 22:13:47.231	\N	0	0
variantCombination_1763158427231_dw0pu4g2y	product_1763158427220_zo7i7fjm2	xs-navy	{"SIZE": "xs", "COLOR": "navy"}	TSHIRT-XS-NAVY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.232	2025-11-14 22:13:47.232	\N	0	0
variantCombination_1763158427233_yoy7wsvhx	product_1763158427220_zo7i7fjm2	xs-red	{"SIZE": "xs", "COLOR": "red"}	TSHIRT-XS-RED	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.234	2025-11-14 22:13:47.234	\N	0	0
variantCombination_1763158427235_tsc0pt1io	product_1763158427220_zo7i7fjm2	xs-gray	{"SIZE": "xs", "COLOR": "gray"}	TSHIRT-XS-GRAY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.236	2025-11-14 22:13:47.236	\N	0	0
variantCombination_1763158427237_eozgw5bxq	product_1763158427220_zo7i7fjm2	xs-olive	{"SIZE": "xs", "COLOR": "olive"}	TSHIRT-XS-OLIVE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.238	2025-11-14 22:13:47.238	\N	0	0
variantCombination_1763158427238_1xluhl6nj	product_1763158427220_zo7i7fjm2	s-black	{"SIZE": "s", "COLOR": "black"}	TSHIRT-S-BLACK	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.239	2025-11-14 22:13:47.239	\N	0	0
variantCombination_1763158427240_xdoz21are	product_1763158427220_zo7i7fjm2	s-white	{"SIZE": "s", "COLOR": "white"}	TSHIRT-S-WHITE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.241	2025-11-14 22:13:47.241	\N	0	0
variantCombination_1763158427241_g7ux5phgm	product_1763158427220_zo7i7fjm2	s-navy	{"SIZE": "s", "COLOR": "navy"}	TSHIRT-S-NAVY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.242	2025-11-14 22:13:47.242	\N	0	0
variantCombination_1763158427242_8xoyjykaz	product_1763158427220_zo7i7fjm2	s-red	{"SIZE": "s", "COLOR": "red"}	TSHIRT-S-RED	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.243	2025-11-14 22:13:47.243	\N	0	0
variantCombination_1763158427244_si0j25lgx	product_1763158427220_zo7i7fjm2	s-gray	{"SIZE": "s", "COLOR": "gray"}	TSHIRT-S-GRAY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.244	2025-11-14 22:13:47.244	\N	0	0
variantCombination_1763158427245_1yowxdewe	product_1763158427220_zo7i7fjm2	s-olive	{"SIZE": "s", "COLOR": "olive"}	TSHIRT-S-OLIVE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.246	2025-11-14 22:13:47.246	\N	0	0
variantCombination_1763158427246_iwdg67d52	product_1763158427220_zo7i7fjm2	m-black	{"SIZE": "m", "COLOR": "black"}	TSHIRT-M-BLACK	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.247	2025-11-14 22:13:47.247	\N	0	0
variantCombination_1763158427248_vemyr2biq	product_1763158427220_zo7i7fjm2	m-white	{"SIZE": "m", "COLOR": "white"}	TSHIRT-M-WHITE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.248	2025-11-14 22:13:47.248	\N	0	0
variantCombination_1763158427249_nqmdtas5n	product_1763158427220_zo7i7fjm2	m-navy	{"SIZE": "m", "COLOR": "navy"}	TSHIRT-M-NAVY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.249	2025-11-14 22:13:47.249	\N	0	0
variantCombination_1763158427250_12z5gkz8f	product_1763158427220_zo7i7fjm2	m-red	{"SIZE": "m", "COLOR": "red"}	TSHIRT-M-RED	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.251	2025-11-14 22:13:47.251	\N	0	0
variantCombination_1763158427252_b3243axt1	product_1763158427220_zo7i7fjm2	m-gray	{"SIZE": "m", "COLOR": "gray"}	TSHIRT-M-GRAY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.252	2025-11-14 22:13:47.252	\N	0	0
variantCombination_1763158427253_xlvu94eyz	product_1763158427220_zo7i7fjm2	m-olive	{"SIZE": "m", "COLOR": "olive"}	TSHIRT-M-OLIVE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.254	2025-11-14 22:13:47.254	\N	0	0
variantCombination_1763158427254_6o2gtrpad	product_1763158427220_zo7i7fjm2	l-black	{"SIZE": "l", "COLOR": "black"}	TSHIRT-L-BLACK	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.255	2025-11-14 22:13:47.255	\N	0	0
variantCombination_1763158427255_4trcyudb3	product_1763158427220_zo7i7fjm2	l-white	{"SIZE": "l", "COLOR": "white"}	TSHIRT-L-WHITE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.256	2025-11-14 22:13:47.256	\N	0	0
variantCombination_1763158427257_5ltffou1i	product_1763158427220_zo7i7fjm2	l-navy	{"SIZE": "l", "COLOR": "navy"}	TSHIRT-L-NAVY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.257	2025-11-14 22:13:47.257	\N	0	0
variantCombination_1763158427258_9aazx3y51	product_1763158427220_zo7i7fjm2	l-red	{"SIZE": "l", "COLOR": "red"}	TSHIRT-L-RED	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.258	2025-11-14 22:13:47.258	\N	0	0
variantCombination_1763158427259_l7jgofv75	product_1763158427220_zo7i7fjm2	l-gray	{"SIZE": "l", "COLOR": "gray"}	TSHIRT-L-GRAY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.26	2025-11-14 22:13:47.26	\N	0	0
variantCombination_1763158427260_800vsqha6	product_1763158427220_zo7i7fjm2	l-olive	{"SIZE": "l", "COLOR": "olive"}	TSHIRT-L-OLIVE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.261	2025-11-14 22:13:47.261	\N	0	0
variantCombination_1763158427262_g8ildkvna	product_1763158427220_zo7i7fjm2	xl-black	{"SIZE": "xl", "COLOR": "black"}	TSHIRT-XL-BLACK	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.262	2025-11-14 22:13:47.262	\N	0	0
variantCombination_1763158427263_5slwt0wg1	product_1763158427220_zo7i7fjm2	xl-white	{"SIZE": "xl", "COLOR": "white"}	TSHIRT-XL-WHITE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.264	2025-11-14 22:13:47.264	\N	0	0
variantCombination_1763158427264_avc7ulh63	product_1763158427220_zo7i7fjm2	xl-navy	{"SIZE": "xl", "COLOR": "navy"}	TSHIRT-XL-NAVY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.265	2025-11-14 22:13:47.265	\N	0	0
variantCombination_1763158427266_ht8pcbl00	product_1763158427220_zo7i7fjm2	xl-red	{"SIZE": "xl", "COLOR": "red"}	TSHIRT-XL-RED	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.266	2025-11-14 22:13:47.266	\N	0	0
variantCombination_1763158427267_h5ozrbmd2	product_1763158427220_zo7i7fjm2	xl-gray	{"SIZE": "xl", "COLOR": "gray"}	TSHIRT-XL-GRAY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.268	2025-11-14 22:13:47.268	\N	0	0
variantCombination_1763158427268_6vp9pp2na	product_1763158427220_zo7i7fjm2	xl-olive	{"SIZE": "xl", "COLOR": "olive"}	TSHIRT-XL-OLIVE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.269	2025-11-14 22:13:47.269	\N	0	0
variantCombination_1763158427269_7ipz0r4tt	product_1763158427220_zo7i7fjm2	2xl-black	{"SIZE": "2xl", "COLOR": "black"}	TSHIRT-2XL-BLACK	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.27	2025-11-14 22:13:47.27	\N	0	0
variantCombination_1763158427271_r8e90xe6n	product_1763158427220_zo7i7fjm2	2xl-white	{"SIZE": "2xl", "COLOR": "white"}	TSHIRT-2XL-WHITE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.271	2025-11-14 22:13:47.271	\N	0	0
variantCombination_1763158427272_8o6ioj1hc	product_1763158427220_zo7i7fjm2	2xl-navy	{"SIZE": "2xl", "COLOR": "navy"}	TSHIRT-2XL-NAVY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.272	2025-11-14 22:13:47.272	\N	0	0
variantCombination_1763158427273_o3e5rf5mp	product_1763158427220_zo7i7fjm2	2xl-red	{"SIZE": "2xl", "COLOR": "red"}	TSHIRT-2XL-RED	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.274	2025-11-14 22:13:47.274	\N	0	0
variantCombination_1763158427274_menkx1vhi	product_1763158427220_zo7i7fjm2	2xl-gray	{"SIZE": "2xl", "COLOR": "gray"}	TSHIRT-2XL-GRAY	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.275	2025-11-14 22:13:47.275	\N	0	0
variantCombination_1763158427276_yl2wpz1j1	product_1763158427220_zo7i7fjm2	2xl-olive	{"SIZE": "2xl", "COLOR": "olive"}	TSHIRT-2XL-OLIVE	29.99	\N	10	t	\N	t	t	\N	0	2025-11-14 22:13:47.276	2025-11-14 22:13:47.276	\N	0	0
variantCombination_1763158427279_qdqq8c634	product_1763158427277_lsm8a9ymp	7-black-white	{"SIZE": "7", "COLOR": "black-white"}	SHOES-7-BLACK-WHITE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.28	2025-11-14 22:13:47.28	\N	0	0
variantCombination_1763158427281_rsqse7ql7	product_1763158427277_lsm8a9ymp	7-navy-orange	{"SIZE": "7", "COLOR": "navy-orange"}	SHOES-7-NAVY-ORANGE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.282	2025-11-14 22:13:47.282	\N	0	0
variantCombination_1763158427282_cnquszgc1	product_1763158427277_lsm8a9ymp	7-gray-lime	{"SIZE": "7", "COLOR": "gray-lime"}	SHOES-7-GRAY-LIME	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.283	2025-11-14 22:13:47.283	\N	0	0
variantCombination_1763158427284_0wubbqzhs	product_1763158427277_lsm8a9ymp	7-all-black	{"SIZE": "7", "COLOR": "all-black"}	SHOES-7-ALL-BLACK	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.284	2025-11-14 22:13:47.284	\N	0	0
variantCombination_1763158427286_6rr0kxrxm	product_1763158427277_lsm8a9ymp	7.5-black-white	{"SIZE": "7.5", "COLOR": "black-white"}	SHOES-7.5-BLACK-WHITE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.286	2025-11-14 22:13:47.286	\N	0	0
variantCombination_1763158427287_gzxs5ddyp	product_1763158427277_lsm8a9ymp	7.5-navy-orange	{"SIZE": "7.5", "COLOR": "navy-orange"}	SHOES-7.5-NAVY-ORANGE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.288	2025-11-14 22:13:47.288	\N	0	0
variantCombination_1763158427288_m6npl6lw0	product_1763158427277_lsm8a9ymp	7.5-gray-lime	{"SIZE": "7.5", "COLOR": "gray-lime"}	SHOES-7.5-GRAY-LIME	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.289	2025-11-14 22:13:47.289	\N	0	0
variantCombination_1763158427289_8ee3zlit6	product_1763158427277_lsm8a9ymp	7.5-all-black	{"SIZE": "7.5", "COLOR": "all-black"}	SHOES-7.5-ALL-BLACK	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.29	2025-11-14 22:13:47.29	\N	0	0
variantCombination_1763158427290_ghj5cicjp	product_1763158427277_lsm8a9ymp	8-black-white	{"SIZE": "8", "COLOR": "black-white"}	SHOES-8-BLACK-WHITE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.291	2025-11-14 22:13:47.291	\N	0	0
variantCombination_1763158427291_lqlgwq3k0	product_1763158427277_lsm8a9ymp	8-navy-orange	{"SIZE": "8", "COLOR": "navy-orange"}	SHOES-8-NAVY-ORANGE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.292	2025-11-14 22:13:47.292	\N	0	0
variantCombination_1763158427293_inwftjg7b	product_1763158427277_lsm8a9ymp	8-gray-lime	{"SIZE": "8", "COLOR": "gray-lime"}	SHOES-8-GRAY-LIME	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.293	2025-11-14 22:13:47.293	\N	0	0
variantCombination_1763158427294_vfkgsp387	product_1763158427277_lsm8a9ymp	8-all-black	{"SIZE": "8", "COLOR": "all-black"}	SHOES-8-ALL-BLACK	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.294	2025-11-14 22:13:47.294	\N	0	0
variantCombination_1763158427295_ei75ykboj	product_1763158427277_lsm8a9ymp	8.5-black-white	{"SIZE": "8.5", "COLOR": "black-white"}	SHOES-8.5-BLACK-WHITE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.295	2025-11-14 22:13:47.295	\N	0	0
variantCombination_1763158427296_jbgz11xzg	product_1763158427277_lsm8a9ymp	8.5-navy-orange	{"SIZE": "8.5", "COLOR": "navy-orange"}	SHOES-8.5-NAVY-ORANGE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.297	2025-11-14 22:13:47.297	\N	0	0
variantCombination_1763158427297_30yyvsn4l	product_1763158427277_lsm8a9ymp	8.5-gray-lime	{"SIZE": "8.5", "COLOR": "gray-lime"}	SHOES-8.5-GRAY-LIME	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.298	2025-11-14 22:13:47.298	\N	0	0
variantCombination_1763158427298_jofnk2cey	product_1763158427277_lsm8a9ymp	8.5-all-black	{"SIZE": "8.5", "COLOR": "all-black"}	SHOES-8.5-ALL-BLACK	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.299	2025-11-14 22:13:47.299	\N	0	0
variantCombination_1763158427300_e71m05mv0	product_1763158427277_lsm8a9ymp	9-black-white	{"SIZE": "9", "COLOR": "black-white"}	SHOES-9-BLACK-WHITE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.3	2025-11-14 22:13:47.3	\N	0	0
variantCombination_1763158427301_k6f8b3ze3	product_1763158427277_lsm8a9ymp	9-navy-orange	{"SIZE": "9", "COLOR": "navy-orange"}	SHOES-9-NAVY-ORANGE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.302	2025-11-14 22:13:47.302	\N	0	0
variantCombination_1763158427302_exoyv2ua1	product_1763158427277_lsm8a9ymp	9-gray-lime	{"SIZE": "9", "COLOR": "gray-lime"}	SHOES-9-GRAY-LIME	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.303	2025-11-14 22:13:47.303	\N	0	0
variantCombination_1763158427303_zw2whp444	product_1763158427277_lsm8a9ymp	9-all-black	{"SIZE": "9", "COLOR": "all-black"}	SHOES-9-ALL-BLACK	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.304	2025-11-14 22:13:47.304	\N	0	0
variantCombination_1763158427305_250hoytf0	product_1763158427277_lsm8a9ymp	9.5-black-white	{"SIZE": "9.5", "COLOR": "black-white"}	SHOES-9.5-BLACK-WHITE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.305	2025-11-14 22:13:47.305	\N	0	0
variantCombination_1763158427306_oje8cvqya	product_1763158427277_lsm8a9ymp	9.5-navy-orange	{"SIZE": "9.5", "COLOR": "navy-orange"}	SHOES-9.5-NAVY-ORANGE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.307	2025-11-14 22:13:47.307	\N	0	0
variantCombination_1763158427307_hofhgl0ma	product_1763158427277_lsm8a9ymp	9.5-gray-lime	{"SIZE": "9.5", "COLOR": "gray-lime"}	SHOES-9.5-GRAY-LIME	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.308	2025-11-14 22:13:47.308	\N	0	0
variantCombination_1763158427308_0q4vrraim	product_1763158427277_lsm8a9ymp	9.5-all-black	{"SIZE": "9.5", "COLOR": "all-black"}	SHOES-9.5-ALL-BLACK	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.309	2025-11-14 22:13:47.309	\N	0	0
variantCombination_1763158427310_0jlscqi4g	product_1763158427277_lsm8a9ymp	10-black-white	{"SIZE": "10", "COLOR": "black-white"}	SHOES-10-BLACK-WHITE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.31	2025-11-14 22:13:47.31	\N	0	0
variantCombination_1763158427311_qvkfv72kx	product_1763158427277_lsm8a9ymp	10-navy-orange	{"SIZE": "10", "COLOR": "navy-orange"}	SHOES-10-NAVY-ORANGE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.312	2025-11-14 22:13:47.312	\N	0	0
variantCombination_1763158427312_z653av5mi	product_1763158427277_lsm8a9ymp	10-gray-lime	{"SIZE": "10", "COLOR": "gray-lime"}	SHOES-10-GRAY-LIME	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.313	2025-11-14 22:13:47.313	\N	0	0
variantCombination_1763158427313_g610wgtm5	product_1763158427277_lsm8a9ymp	10-all-black	{"SIZE": "10", "COLOR": "all-black"}	SHOES-10-ALL-BLACK	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.314	2025-11-14 22:13:47.314	\N	0	0
variantCombination_1763158427314_wnm03lh9s	product_1763158427277_lsm8a9ymp	10.5-black-white	{"SIZE": "10.5", "COLOR": "black-white"}	SHOES-10.5-BLACK-WHITE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.315	2025-11-14 22:13:47.315	\N	0	0
variantCombination_1763158427316_0a4h4bud0	product_1763158427277_lsm8a9ymp	10.5-navy-orange	{"SIZE": "10.5", "COLOR": "navy-orange"}	SHOES-10.5-NAVY-ORANGE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.316	2025-11-14 22:13:47.316	\N	0	0
variantCombination_1763158427317_4r6szkp40	product_1763158427277_lsm8a9ymp	10.5-gray-lime	{"SIZE": "10.5", "COLOR": "gray-lime"}	SHOES-10.5-GRAY-LIME	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.318	2025-11-14 22:13:47.318	\N	0	0
variantCombination_1763158427318_aiboagnun	product_1763158427277_lsm8a9ymp	10.5-all-black	{"SIZE": "10.5", "COLOR": "all-black"}	SHOES-10.5-ALL-BLACK	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.319	2025-11-14 22:13:47.319	\N	0	0
variantCombination_1763158427319_6js0p5aii	product_1763158427277_lsm8a9ymp	11-black-white	{"SIZE": "11", "COLOR": "black-white"}	SHOES-11-BLACK-WHITE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.32	2025-11-14 22:13:47.32	\N	0	0
variantCombination_1763158427321_hqwi4f89s	product_1763158427277_lsm8a9ymp	11-navy-orange	{"SIZE": "11", "COLOR": "navy-orange"}	SHOES-11-NAVY-ORANGE	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.321	2025-11-14 22:13:47.321	\N	0	0
variantCombination_1763158427322_m2lu9bdq6	product_1763158427277_lsm8a9ymp	11-gray-lime	{"SIZE": "11", "COLOR": "gray-lime"}	SHOES-11-GRAY-LIME	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.322	2025-11-14 22:13:47.322	\N	0	0
variantCombination_1763158427323_gcbgvocca	product_1763158427277_lsm8a9ymp	11-all-black	{"SIZE": "11", "COLOR": "all-black"}	SHOES-11-ALL-BLACK	89.99	\N	5	t	\N	t	t	\N	0	2025-11-14 22:13:47.324	2025-11-14 22:13:47.324	\N	0	0
variantCombination_1763158427326_epndvpt81	product_1763158427324_hs34jtvhr	one-size-classic-logo	{"SIZE": "one-size", "STYLE": "classic-logo"}	HAT-ONE-SIZE-CLASSIC-LOGO	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.327	2025-11-14 22:13:47.327	\N	0	0
variantCombination_1763158427327_982t9y52m	product_1763158427324_hs34jtvhr	one-size-vintage-patch	{"SIZE": "one-size", "STYLE": "vintage-patch"}	HAT-ONE-SIZE-VINTAGE-PATCH	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.328	2025-11-14 22:13:47.328	\N	0	0
variantCombination_1763158427329_9foh7aq9q	product_1763158427324_hs34jtvhr	one-size-minimalist	{"SIZE": "one-size", "STYLE": "minimalist"}	HAT-ONE-SIZE-MINIMALIST	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.329	2025-11-14 22:13:47.329	\N	0	0
variantCombination_1763158427330_p1h38ywgb	product_1763158427324_hs34jtvhr	one-size-bold-print	{"SIZE": "one-size", "STYLE": "bold-print"}	HAT-ONE-SIZE-BOLD-PRINT	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.331	2025-11-14 22:13:47.331	\N	0	0
variantCombination_1763158427331_3p9kzdrs9	product_1763158427324_hs34jtvhr	youth-classic-logo	{"SIZE": "youth", "STYLE": "classic-logo"}	HAT-YOUTH-CLASSIC-LOGO	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.332	2025-11-14 22:13:47.332	\N	0	0
variantCombination_1763158427332_fdexp2as7	product_1763158427324_hs34jtvhr	youth-vintage-patch	{"SIZE": "youth", "STYLE": "vintage-patch"}	HAT-YOUTH-VINTAGE-PATCH	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.333	2025-11-14 22:13:47.333	\N	0	0
variantCombination_1763158427333_r4dlcbuqg	product_1763158427324_hs34jtvhr	youth-minimalist	{"SIZE": "youth", "STYLE": "minimalist"}	HAT-YOUTH-MINIMALIST	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.334	2025-11-14 22:13:47.334	\N	0	0
variantCombination_1763158427335_v8uqirf4j	product_1763158427324_hs34jtvhr	youth-bold-print	{"SIZE": "youth", "STYLE": "bold-print"}	HAT-YOUTH-BOLD-PRINT	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.335	2025-11-14 22:13:47.335	\N	0	0
variantCombination_1763158427336_keywmz7v4	product_1763158427324_hs34jtvhr	xl-classic-logo	{"SIZE": "xl", "STYLE": "classic-logo"}	HAT-XL-CLASSIC-LOGO	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.336	2025-11-14 22:13:47.336	\N	0	0
variantCombination_1763158427337_ch0nk77ok	product_1763158427324_hs34jtvhr	xl-vintage-patch	{"SIZE": "xl", "STYLE": "vintage-patch"}	HAT-XL-VINTAGE-PATCH	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.338	2025-11-14 22:13:47.338	\N	0	0
variantCombination_1763158427338_fwxf7k6xd	product_1763158427324_hs34jtvhr	xl-minimalist	{"SIZE": "xl", "STYLE": "minimalist"}	HAT-XL-MINIMALIST	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.339	2025-11-14 22:13:47.339	\N	0	0
variantCombination_1763158427339_wk5pqldxi	product_1763158427324_hs34jtvhr	xl-bold-print	{"SIZE": "xl", "STYLE": "bold-print"}	HAT-XL-BOLD-PRINT	24.99	\N	20	t	\N	t	t	\N	0	2025-11-14 22:13:47.34	2025-11-14 22:13:47.34	\N	0	0
variantCombination_1763158427342_me6z44ymo	product_1763158427340_3y3zmvz7q	polyester-s	{"SIZE": "s", "MATERIAL": "polyester"}	JACKET-POLYESTER-S	79.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.343	2025-11-14 22:13:47.343	\N	0	0
variantCombination_1763158427343_yrpyrmno7	product_1763158427340_3y3zmvz7q	polyester-m	{"SIZE": "m", "MATERIAL": "polyester"}	JACKET-POLYESTER-M	79.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.344	2025-11-14 22:13:47.344	\N	0	0
variantCombination_1763158427345_6d3cixhn4	product_1763158427340_3y3zmvz7q	polyester-l	{"SIZE": "l", "MATERIAL": "polyester"}	JACKET-POLYESTER-L	79.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.345	2025-11-14 22:13:47.345	\N	0	0
variantCombination_1763158427346_ai8gsg1k6	product_1763158427340_3y3zmvz7q	polyester-xl	{"SIZE": "xl", "MATERIAL": "polyester"}	JACKET-POLYESTER-XL	79.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.347	2025-11-14 22:13:47.347	\N	0	0
variantCombination_1763158427347_ktl8ac4ru	product_1763158427340_3y3zmvz7q	polyester-2xl	{"SIZE": "2xl", "MATERIAL": "polyester"}	JACKET-POLYESTER-2XL	79.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.348	2025-11-14 22:13:47.348	\N	0	0
variantCombination_1763158427348_5dfo56pch	product_1763158427340_3y3zmvz7q	cotton-blend-s	{"SIZE": "s", "MATERIAL": "cotton-blend"}	JACKET-COTTON-BLEND-S	89.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.349	2025-11-14 22:13:47.349	\N	0	0
variantCombination_1763158427350_qexcej4wv	product_1763158427340_3y3zmvz7q	cotton-blend-m	{"SIZE": "m", "MATERIAL": "cotton-blend"}	JACKET-COTTON-BLEND-M	89.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.35	2025-11-14 22:13:47.35	\N	0	0
variantCombination_1763158427351_ksevdykwk	product_1763158427340_3y3zmvz7q	cotton-blend-l	{"SIZE": "l", "MATERIAL": "cotton-blend"}	JACKET-COTTON-BLEND-L	89.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.352	2025-11-14 22:13:47.352	\N	0	0
variantCombination_1763158427352_km84a06oc	product_1763158427340_3y3zmvz7q	cotton-blend-xl	{"SIZE": "xl", "MATERIAL": "cotton-blend"}	JACKET-COTTON-BLEND-XL	89.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.353	2025-11-14 22:13:47.353	\N	0	0
variantCombination_1763158427353_gin3w8w8q	product_1763158427340_3y3zmvz7q	cotton-blend-2xl	{"SIZE": "2xl", "MATERIAL": "cotton-blend"}	JACKET-COTTON-BLEND-2XL	89.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.354	2025-11-14 22:13:47.354	\N	0	0
variantCombination_1763158427354_s5gxnlzsz	product_1763158427340_3y3zmvz7q	premium-fleece-s	{"SIZE": "s", "MATERIAL": "premium-fleece"}	JACKET-PREMIUM-FLEECE-S	109.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.355	2025-11-14 22:13:47.355	\N	0	0
variantCombination_1763158427355_xkf7g8fxj	product_1763158427340_3y3zmvz7q	premium-fleece-m	{"SIZE": "m", "MATERIAL": "premium-fleece"}	JACKET-PREMIUM-FLEECE-M	109.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.356	2025-11-14 22:13:47.356	\N	0	0
variantCombination_1763158427356_r1yf1favx	product_1763158427340_3y3zmvz7q	premium-fleece-l	{"SIZE": "l", "MATERIAL": "premium-fleece"}	JACKET-PREMIUM-FLEECE-L	109.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.357	2025-11-14 22:13:47.357	\N	0	0
variantCombination_1763158427357_ks7jmkii9	product_1763158427340_3y3zmvz7q	premium-fleece-xl	{"SIZE": "xl", "MATERIAL": "premium-fleece"}	JACKET-PREMIUM-FLEECE-XL	109.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.358	2025-11-14 22:13:47.358	\N	0	0
variantCombination_1763158427358_qupi90ysq	product_1763158427340_3y3zmvz7q	premium-fleece-2xl	{"SIZE": "2xl", "MATERIAL": "premium-fleece"}	JACKET-PREMIUM-FLEECE-2XL	109.99	\N	8	t	\N	t	t	\N	0	2025-11-14 22:13:47.359	2025-11-14 22:13:47.359	\N	0	0
\.


--
-- Data for Name: variant_options; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.variant_options (id, "productId", type, value, "displayName", "hexColor", "imageUrl", icon, description, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
48efe76755bea5924ff0d354	bdfebbd8b3bab6cab71cc6c7	SIZE	XS	Extra Small	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.076	2025-11-12 20:50:39.076
ded9b372112978609ca1658d	bdfebbd8b3bab6cab71cc6c7	SIZE	S	Small	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.078	2025-11-12 20:50:39.078
27f0d0d134b1f40c3c34f956	bdfebbd8b3bab6cab71cc6c7	SIZE	M	Medium	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.079	2025-11-12 20:50:39.079
e132fd46047caa9aeb4704f7	bdfebbd8b3bab6cab71cc6c7	SIZE	L	Large	\N	\N	\N	\N	3	t	2025-11-12 20:50:39.08	2025-11-12 20:50:39.08
0e16b312ba97097b61d50744	bdfebbd8b3bab6cab71cc6c7	SIZE	XL	Extra Large	\N	\N	\N	\N	4	t	2025-11-12 20:50:39.082	2025-11-12 20:50:39.082
c7d4b9b1624ab125ca27a390	bdfebbd8b3bab6cab71cc6c7	SIZE	2XL	2X Large	\N	\N	\N	\N	5	t	2025-11-12 20:50:39.083	2025-11-12 20:50:39.083
335589cb6318617add7eb3fe	bdfebbd8b3bab6cab71cc6c7	COLOR	black	Black	#000000	\N	\N	\N	0	t	2025-11-12 20:50:39.084	2025-11-12 20:50:39.084
ae8f36cd7fde065748f0b073	bdfebbd8b3bab6cab71cc6c7	COLOR	white	White	#FFFFFF	\N	\N	\N	1	t	2025-11-12 20:50:39.086	2025-11-12 20:50:39.086
a74a8efa411fbc1b34ac294c	bdfebbd8b3bab6cab71cc6c7	COLOR	gray	Heather Gray	#9CA3AF	\N	\N	\N	2	t	2025-11-12 20:50:39.087	2025-11-12 20:50:39.087
af0d920deee34000eec21cd6	bdfebbd8b3bab6cab71cc6c7	COLOR	navy	Navy Blue	#1E3A8A	\N	\N	\N	3	t	2025-11-12 20:50:39.088	2025-11-12 20:50:39.088
f299295275938ae9bbe35fbc	bdfebbd8b3bab6cab71cc6c7	COLOR	red	Cardinal Red	#DC2626	\N	\N	\N	4	t	2025-11-12 20:50:39.089	2025-11-12 20:50:39.089
57a11027f8ab37c86e1933db	bdfebbd8b3bab6cab71cc6c7	COLOR	green	Forest Green	#15803D	\N	\N	\N	5	t	2025-11-12 20:50:39.09	2025-11-12 20:50:39.09
8646b7afcd42cede7af6072c	94c805c481cc4efd557699c6	SIZE	XS	Extra Small	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.141	2025-11-12 20:50:39.141
9785756550ac12d79c6ef5bb	94c805c481cc4efd557699c6	SIZE	S	Small	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.142	2025-11-12 20:50:39.142
66bc3ae4eaced6b9f535dae2	94c805c481cc4efd557699c6	SIZE	M	Medium	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.143	2025-11-12 20:50:39.143
0b1262fc900cd00c718901a2	94c805c481cc4efd557699c6	SIZE	L	Large	\N	\N	\N	\N	3	t	2025-11-12 20:50:39.144	2025-11-12 20:50:39.144
a27ecee23f84cb7f0d1d6bfc	94c805c481cc4efd557699c6	SIZE	XL	Extra Large	\N	\N	\N	\N	4	t	2025-11-12 20:50:39.145	2025-11-12 20:50:39.145
eb4709d75266b719306499e2	94c805c481cc4efd557699c6	SIZE	2XL	2X Large	\N	\N	\N	\N	5	t	2025-11-12 20:50:39.145	2025-11-12 20:50:39.145
cff5bc65ec6d1355acd58535	94c805c481cc4efd557699c6	COLOR	black	Black	#000000	\N	\N	\N	0	t	2025-11-12 20:50:39.147	2025-11-12 20:50:39.147
97986988ab8987a67adb27f0	94c805c481cc4efd557699c6	COLOR	white	White	#FFFFFF	\N	\N	\N	1	t	2025-11-12 20:50:39.147	2025-11-12 20:50:39.147
6a6f71fddb5852276c9d12d6	94c805c481cc4efd557699c6	COLOR	gray	Heather Gray	#9CA3AF	\N	\N	\N	2	t	2025-11-12 20:50:39.148	2025-11-12 20:50:39.148
f8bd542fec5dddfa907c813b	94c805c481cc4efd557699c6	COLOR	navy	Navy Blue	#1E3A8A	\N	\N	\N	3	t	2025-11-12 20:50:39.15	2025-11-12 20:50:39.15
2dc81bef71bc4ad24549ad7c	94c805c481cc4efd557699c6	COLOR	red	Cardinal Red	#DC2626	\N	\N	\N	4	t	2025-11-12 20:50:39.15	2025-11-12 20:50:39.15
cd3e06ce4254cc2937f309e5	94c805c481cc4efd557699c6	COLOR	green	Forest Green	#15803D	\N	\N	\N	5	t	2025-11-12 20:50:39.151	2025-11-12 20:50:39.151
bb32813d6bb49cac5fe498ba	9a6ea3fbecfc23c01f9e3734	SIZE	XS	Extra Small	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.2	2025-11-12 20:50:39.2
719c124232e426caafa84b5c	9a6ea3fbecfc23c01f9e3734	SIZE	S	Small	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.201	2025-11-12 20:50:39.201
5d47fff4fdc6344b32a6d76d	9a6ea3fbecfc23c01f9e3734	SIZE	M	Medium	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.202	2025-11-12 20:50:39.202
6b0967b56183bdfb24a4532a	9a6ea3fbecfc23c01f9e3734	SIZE	L	Large	\N	\N	\N	\N	3	t	2025-11-12 20:50:39.204	2025-11-12 20:50:39.204
04c3d2c678780c89b8aa01bf	9a6ea3fbecfc23c01f9e3734	SIZE	XL	Extra Large	\N	\N	\N	\N	4	t	2025-11-12 20:50:39.205	2025-11-12 20:50:39.205
2fb6ef83b8f7f495e1f811a4	9a6ea3fbecfc23c01f9e3734	SIZE	2XL	2X Large	\N	\N	\N	\N	5	t	2025-11-12 20:50:39.207	2025-11-12 20:50:39.207
306ff990802d11712d5a7a9a	9a6ea3fbecfc23c01f9e3734	COLOR	black	Black	#000000	\N	\N	\N	0	t	2025-11-12 20:50:39.208	2025-11-12 20:50:39.208
3db4613faafe18a3e1c08f19	9a6ea3fbecfc23c01f9e3734	COLOR	white	White	#FFFFFF	\N	\N	\N	1	t	2025-11-12 20:50:39.209	2025-11-12 20:50:39.209
13a51ce06b93a61ecaf22539	9a6ea3fbecfc23c01f9e3734	COLOR	gray	Heather Gray	#9CA3AF	\N	\N	\N	2	t	2025-11-12 20:50:39.211	2025-11-12 20:50:39.211
461ffe6628398c2e4182f5b4	9a6ea3fbecfc23c01f9e3734	COLOR	navy	Navy Blue	#1E3A8A	\N	\N	\N	3	t	2025-11-12 20:50:39.212	2025-11-12 20:50:39.212
43881303dff7bb2ffa416d02	9a6ea3fbecfc23c01f9e3734	COLOR	red	Cardinal Red	#DC2626	\N	\N	\N	4	t	2025-11-12 20:50:39.213	2025-11-12 20:50:39.213
e47549cfcca560fb1a17493c	9a6ea3fbecfc23c01f9e3734	COLOR	green	Forest Green	#15803D	\N	\N	\N	5	t	2025-11-12 20:50:39.214	2025-11-12 20:50:39.214
2701f0696b67a7400b9e5f3f	6b486d564c5c5d2e284c5342	SIZE	XS	Extra Small	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.27	2025-11-12 20:50:39.27
6f359d4bd10d39d4812e5915	6b486d564c5c5d2e284c5342	SIZE	S	Small	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.272	2025-11-12 20:50:39.272
6d3e5d74ddd12a239dba3ef1	6b486d564c5c5d2e284c5342	SIZE	M	Medium	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.273	2025-11-12 20:50:39.273
0cccff134dbf7973554c4dba	6b486d564c5c5d2e284c5342	SIZE	L	Large	\N	\N	\N	\N	3	t	2025-11-12 20:50:39.274	2025-11-12 20:50:39.274
f1b8595f5a69f9fb2cea6545	6b486d564c5c5d2e284c5342	SIZE	XL	Extra Large	\N	\N	\N	\N	4	t	2025-11-12 20:50:39.275	2025-11-12 20:50:39.275
0834ad57f6409983c1ea89a9	6b486d564c5c5d2e284c5342	SIZE	2XL	2X Large	\N	\N	\N	\N	5	t	2025-11-12 20:50:39.276	2025-11-12 20:50:39.276
dc67d24ebeabfe574e077ab0	6b486d564c5c5d2e284c5342	COLOR	black	Black	#000000	\N	\N	\N	0	t	2025-11-12 20:50:39.277	2025-11-12 20:50:39.277
0ef95e35f0ee2c99a9b86f56	6b486d564c5c5d2e284c5342	COLOR	white	White	#FFFFFF	\N	\N	\N	1	t	2025-11-12 20:50:39.278	2025-11-12 20:50:39.278
0b85713a062e84b1855da579	6b486d564c5c5d2e284c5342	COLOR	gray	Heather Gray	#9CA3AF	\N	\N	\N	2	t	2025-11-12 20:50:39.28	2025-11-12 20:50:39.28
5b6dce6aa7947a5f7de438ce	6b486d564c5c5d2e284c5342	COLOR	navy	Navy Blue	#1E3A8A	\N	\N	\N	3	t	2025-11-12 20:50:39.281	2025-11-12 20:50:39.281
31aa4cdb3df1bc17bb22ad45	6b486d564c5c5d2e284c5342	COLOR	red	Cardinal Red	#DC2626	\N	\N	\N	4	t	2025-11-12 20:50:39.282	2025-11-12 20:50:39.282
3f7ac0096126c8fd70f44dd5	6b486d564c5c5d2e284c5342	COLOR	green	Forest Green	#15803D	\N	\N	\N	5	t	2025-11-12 20:50:39.283	2025-11-12 20:50:39.283
55b903bdd524d947c51e91ef	06ee32c9ac00f8c475aca3b4	SIZE	XS	Extra Small	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.337	2025-11-12 20:50:39.337
698d937aaabbf0760619c804	06ee32c9ac00f8c475aca3b4	SIZE	S	Small	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.338	2025-11-12 20:50:39.338
e8f3afac5c639e44abfcc72d	06ee32c9ac00f8c475aca3b4	SIZE	M	Medium	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.34	2025-11-12 20:50:39.34
bc2eb8915332d2d1a20220a4	06ee32c9ac00f8c475aca3b4	SIZE	L	Large	\N	\N	\N	\N	3	t	2025-11-12 20:50:39.341	2025-11-12 20:50:39.341
a23fca5f100dff9aefa8f4d2	06ee32c9ac00f8c475aca3b4	SIZE	XL	Extra Large	\N	\N	\N	\N	4	t	2025-11-12 20:50:39.342	2025-11-12 20:50:39.342
3bc4a59ae2e591c9393d9ea8	06ee32c9ac00f8c475aca3b4	SIZE	2XL	2X Large	\N	\N	\N	\N	5	t	2025-11-12 20:50:39.343	2025-11-12 20:50:39.343
42a8a5a7e7919605e09930c6	06ee32c9ac00f8c475aca3b4	COLOR	black	Black	#000000	\N	\N	\N	0	t	2025-11-12 20:50:39.344	2025-11-12 20:50:39.344
828636a8cbe33fdcca885197	06ee32c9ac00f8c475aca3b4	COLOR	white	White	#FFFFFF	\N	\N	\N	1	t	2025-11-12 20:50:39.345	2025-11-12 20:50:39.345
453ac040063068fe184cea51	06ee32c9ac00f8c475aca3b4	COLOR	gray	Heather Gray	#9CA3AF	\N	\N	\N	2	t	2025-11-12 20:50:39.346	2025-11-12 20:50:39.346
7c033595067874b3bf185292	06ee32c9ac00f8c475aca3b4	COLOR	navy	Navy Blue	#1E3A8A	\N	\N	\N	3	t	2025-11-12 20:50:39.347	2025-11-12 20:50:39.347
dec46b5306719383cb162ae3	06ee32c9ac00f8c475aca3b4	COLOR	red	Cardinal Red	#DC2626	\N	\N	\N	4	t	2025-11-12 20:50:39.349	2025-11-12 20:50:39.349
45f539144fb0fbe18d17a9dc	06ee32c9ac00f8c475aca3b4	COLOR	green	Forest Green	#15803D	\N	\N	\N	5	t	2025-11-12 20:50:39.351	2025-11-12 20:50:39.351
fa51865f85253aa28a92196e	dae702177783e835d4d70246	SIZE	XS	Extra Small	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.408	2025-11-12 20:50:39.408
148577f17d9cc6d7e27072cd	dae702177783e835d4d70246	SIZE	S	Small	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.409	2025-11-12 20:50:39.409
d2a6a0f1dc0c60d91d730663	dae702177783e835d4d70246	SIZE	M	Medium	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.411	2025-11-12 20:50:39.411
1c67fe55bd43f5cba7b432df	dae702177783e835d4d70246	SIZE	L	Large	\N	\N	\N	\N	3	t	2025-11-12 20:50:39.412	2025-11-12 20:50:39.412
fe03d8cbb9d11b7bc68bd339	dae702177783e835d4d70246	SIZE	XL	Extra Large	\N	\N	\N	\N	4	t	2025-11-12 20:50:39.413	2025-11-12 20:50:39.413
718786263f784e80cd24534b	dae702177783e835d4d70246	SIZE	2XL	2X Large	\N	\N	\N	\N	5	t	2025-11-12 20:50:39.414	2025-11-12 20:50:39.414
199f486522cbd8548b9f5437	dae702177783e835d4d70246	COLOR	black	Black	#000000	\N	\N	\N	0	t	2025-11-12 20:50:39.415	2025-11-12 20:50:39.415
ef3dd07c8542498093bfddef	dae702177783e835d4d70246	COLOR	white	White	#FFFFFF	\N	\N	\N	1	t	2025-11-12 20:50:39.416	2025-11-12 20:50:39.416
535007c8777e0bf1709aa7a3	dae702177783e835d4d70246	COLOR	gray	Heather Gray	#9CA3AF	\N	\N	\N	2	t	2025-11-12 20:50:39.418	2025-11-12 20:50:39.418
81e07ec3b9808cc6c0cb6344	dae702177783e835d4d70246	COLOR	navy	Navy Blue	#1E3A8A	\N	\N	\N	3	t	2025-11-12 20:50:39.419	2025-11-12 20:50:39.419
55fab9f4b9a4900f0ba3f569	dae702177783e835d4d70246	COLOR	red	Cardinal Red	#DC2626	\N	\N	\N	4	t	2025-11-12 20:50:39.42	2025-11-12 20:50:39.42
49f2a5425f5473f2142c6c70	dae702177783e835d4d70246	COLOR	green	Forest Green	#15803D	\N	\N	\N	5	t	2025-11-12 20:50:39.421	2025-11-12 20:50:39.421
b9216bfa2d95ee4fa03ac064	1eecab038e59821264bbbb23	SIZE	XS	Extra Small	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.471	2025-11-12 20:50:39.471
8a6bbefec0e4d9ba5adf34ad	1eecab038e59821264bbbb23	SIZE	S	Small	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.473	2025-11-12 20:50:39.473
9aa9d2c93c543dab3c4d35b9	1eecab038e59821264bbbb23	SIZE	M	Medium	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.474	2025-11-12 20:50:39.474
c5e0bf786999cff65221fda3	1eecab038e59821264bbbb23	SIZE	L	Large	\N	\N	\N	\N	3	t	2025-11-12 20:50:39.475	2025-11-12 20:50:39.475
192ebd5b07bb109e515ad6e4	1eecab038e59821264bbbb23	SIZE	XL	Extra Large	\N	\N	\N	\N	4	t	2025-11-12 20:50:39.476	2025-11-12 20:50:39.476
1b9983c2ff2e90d81edcec8a	1eecab038e59821264bbbb23	SIZE	2XL	2X Large	\N	\N	\N	\N	5	t	2025-11-12 20:50:39.477	2025-11-12 20:50:39.477
ab1b9a5e533f56c8ca118884	1eecab038e59821264bbbb23	COLOR	black	Black	#000000	\N	\N	\N	0	t	2025-11-12 20:50:39.479	2025-11-12 20:50:39.479
dd50fc90575a1582acda5e95	1eecab038e59821264bbbb23	COLOR	white	White	#FFFFFF	\N	\N	\N	1	t	2025-11-12 20:50:39.48	2025-11-12 20:50:39.48
9813dda31b8a0dbe8b44c20e	1eecab038e59821264bbbb23	COLOR	gray	Heather Gray	#9CA3AF	\N	\N	\N	2	t	2025-11-12 20:50:39.481	2025-11-12 20:50:39.481
9e7878d3b6fe8c5b62b0e319	1eecab038e59821264bbbb23	COLOR	navy	Navy Blue	#1E3A8A	\N	\N	\N	3	t	2025-11-12 20:50:39.482	2025-11-12 20:50:39.482
5a1f187a2147b87aeaff9199	1eecab038e59821264bbbb23	COLOR	red	Cardinal Red	#DC2626	\N	\N	\N	4	t	2025-11-12 20:50:39.483	2025-11-12 20:50:39.483
d3b25f6568cac604b8350b8c	1eecab038e59821264bbbb23	COLOR	green	Forest Green	#15803D	\N	\N	\N	5	t	2025-11-12 20:50:39.484	2025-11-12 20:50:39.484
c211355d42f675c145ba4c95	b296159ba233dd44e6a7b584	SIZE	XS	Extra Small	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.543	2025-11-12 20:50:39.543
2f902bba35e50c6d8cb30c14	b296159ba233dd44e6a7b584	SIZE	S	Small	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.544	2025-11-12 20:50:39.544
7e8803e04405290880ab4c9c	b296159ba233dd44e6a7b584	SIZE	M	Medium	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.546	2025-11-12 20:50:39.546
3e31f963b7e878176fff8951	b296159ba233dd44e6a7b584	SIZE	L	Large	\N	\N	\N	\N	3	t	2025-11-12 20:50:39.548	2025-11-12 20:50:39.548
e5b6faa6f991c92de68ab005	b296159ba233dd44e6a7b584	SIZE	XL	Extra Large	\N	\N	\N	\N	4	t	2025-11-12 20:50:39.549	2025-11-12 20:50:39.549
3bab1e74541f4bc5ca039787	b296159ba233dd44e6a7b584	SIZE	2XL	2X Large	\N	\N	\N	\N	5	t	2025-11-12 20:50:39.55	2025-11-12 20:50:39.55
d849aad7778ae149e21cef58	b296159ba233dd44e6a7b584	COLOR	black	Black	#000000	\N	\N	\N	0	t	2025-11-12 20:50:39.551	2025-11-12 20:50:39.551
e49892dea998fdf42646e33f	b296159ba233dd44e6a7b584	COLOR	white	White	#FFFFFF	\N	\N	\N	1	t	2025-11-12 20:50:39.553	2025-11-12 20:50:39.553
737f6e408d7a572d678745d2	b296159ba233dd44e6a7b584	COLOR	gray	Heather Gray	#9CA3AF	\N	\N	\N	2	t	2025-11-12 20:50:39.554	2025-11-12 20:50:39.554
19f88250b73977df4924c43c	b296159ba233dd44e6a7b584	COLOR	navy	Navy Blue	#1E3A8A	\N	\N	\N	3	t	2025-11-12 20:50:39.555	2025-11-12 20:50:39.555
98c25bf1d3a28926d0130291	b296159ba233dd44e6a7b584	COLOR	red	Cardinal Red	#DC2626	\N	\N	\N	4	t	2025-11-12 20:50:39.556	2025-11-12 20:50:39.556
cf614ba77421fbc8e8930726	b296159ba233dd44e6a7b584	COLOR	green	Forest Green	#15803D	\N	\N	\N	5	t	2025-11-12 20:50:39.558	2025-11-12 20:50:39.558
045c42f98c4dbc110e8911c6	b714e56e0dc77578e3457e66	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.626	2025-11-12 20:50:39.626
d0110da3be82616f88f9bbbe	b714e56e0dc77578e3457e66	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.628	2025-11-12 20:50:39.628
712d12dfe0bc709a07654e73	b714e56e0dc77578e3457e66	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.631	2025-11-12 20:50:39.631
3529a090beb39c801895954b	cb076411fddaf2dac28d809e	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.656	2025-11-12 20:50:39.656
ce5c5c005e65742087718a4a	cb076411fddaf2dac28d809e	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.659	2025-11-12 20:50:39.659
46d4dff461d94dfa1810bd8c	cb076411fddaf2dac28d809e	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.66	2025-11-12 20:50:39.66
2eccf938931bbac234eaf331	ba61f67d8e2e16bce3a0d5e9	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.675	2025-11-12 20:50:39.675
2021f574260fb39bfd50910b	ba61f67d8e2e16bce3a0d5e9	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.676	2025-11-12 20:50:39.676
4884ab506021dab50ccc2165	ba61f67d8e2e16bce3a0d5e9	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.677	2025-11-12 20:50:39.677
f34a9b3da3ae74c579aff5dd	197d12406547e42a6f5bc484	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.688	2025-11-12 20:50:39.688
0fdce1b809c82d61c5354e03	197d12406547e42a6f5bc484	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.689	2025-11-12 20:50:39.689
8458beea2d7ffeed174f7145	197d12406547e42a6f5bc484	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.69	2025-11-12 20:50:39.69
74427a7228a1e157dee3ad9d	21d4e2f63ebd4fc6822fdca2	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.699	2025-11-12 20:50:39.699
ba2ea019a912d06707b54b71	21d4e2f63ebd4fc6822fdca2	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.7	2025-11-12 20:50:39.7
bf532bdc39090b812dc2cae0	21d4e2f63ebd4fc6822fdca2	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.701	2025-11-12 20:50:39.701
ed96313783a7f11e795ef144	d211d37587626b5dcc801bd2	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.712	2025-11-12 20:50:39.712
56e9550a3bcbdbd5fdae1fef	d211d37587626b5dcc801bd2	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.713	2025-11-12 20:50:39.713
530e84cff3144ca1b1252e08	d211d37587626b5dcc801bd2	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.713	2025-11-12 20:50:39.713
45619114f764ab29a63d78e8	91dc2206e5f7a1c0a7eb0b7c	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.722	2025-11-12 20:50:39.722
837d904e3a1d6d6a6ccf5d07	91dc2206e5f7a1c0a7eb0b7c	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.723	2025-11-12 20:50:39.723
8debc57711b9b20deb5f61a8	91dc2206e5f7a1c0a7eb0b7c	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.724	2025-11-12 20:50:39.724
826ab57b7750f300032078a8	2db4c4ce785e7a3c59225419	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.732	2025-11-12 20:50:39.732
bc1a652200c04b5766153925	2db4c4ce785e7a3c59225419	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.733	2025-11-12 20:50:39.733
94a3e3506a80f76ff8fde890	2db4c4ce785e7a3c59225419	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.734	2025-11-12 20:50:39.734
adf08562f251691ae9381547	7c8c3333aa56a6b5abf198fd	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.743	2025-11-12 20:50:39.743
1e3140a721b4a87c5def8616	7c8c3333aa56a6b5abf198fd	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.744	2025-11-12 20:50:39.744
a211c345263189423a713626	7c8c3333aa56a6b5abf198fd	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.745	2025-11-12 20:50:39.745
2be08c510fb95192fc80f712	ac3ff669021524948e7b8970	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.756	2025-11-12 20:50:39.756
7654547e5451d1add6053766	ac3ff669021524948e7b8970	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.757	2025-11-12 20:50:39.757
911e3a5268f24b8cddcc23b5	ac3ff669021524948e7b8970	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.758	2025-11-12 20:50:39.758
3a323ca86890077ab6cbb0ff	8571e831a8d37a7376db7883	SIZE	OSFM	One Size Fits Most	\N	\N	\N	\N	0	t	2025-11-12 20:50:39.767	2025-11-12 20:50:39.767
582d1239103593efc85dab4e	8571e831a8d37a7376db7883	SIZE	S/M	Small/Medium	\N	\N	\N	\N	1	t	2025-11-12 20:50:39.768	2025-11-12 20:50:39.768
4d285bf9488699147c39b759	8571e831a8d37a7376db7883	SIZE	L/XL	Large/XL	\N	\N	\N	\N	2	t	2025-11-12 20:50:39.769	2025-11-12 20:50:39.769
\.


--
-- Data for Name: vendor_followers; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.vendor_followers (id, "vendorStoreId", "customerId", "followedAt", "notifyNewProducts", "notifySales") FROM stdin;
\.


--
-- Data for Name: vendor_stores; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.vendor_stores (id, "storeId", "userId", name, slug, tagline, description, "logoUrl", "bannerUrl", email, phone, "shipFromAddress", "shippingRates", "stripeAccountId", "stripeChargesEnabled", "stripeDetailsSubmitted", "platformFeePercent", "totalProducts", "totalOrders", "totalSales", "averageRating", "totalReviews", "isActive", "createdAt", "updatedAt", "primaryPaymentProcessor", "secondaryPaymentProcessor", "paypalEmail", "paypalMerchantId", "squareAccessToken", "squareLocationId", "acceptsCash", "cashInstructions", "tenantId", "bankAccountDetails", "isVerified", "minimumWithdraw", "verifiedAt", "withdrawBalance", "withdrawMethod") FROM stdin;
fe823f7d7c2ca75697705dcf	cdb437b5e92e6b76ffdb80c2	cmhwgs8iy0000jxc455rshrss	Premium Tees Co	premium-tees	\N	High-quality t-shirts for every style	\N	\N	support@premiumtees.com	\N	\N	\N	\N	f	f	7.00	0	0	0.00	\N	0	t	2025-11-12 20:50:39.061	2025-11-12 20:50:39.061	STRIPE	\N	\N	\N	\N	\N	f	\N	\N	\N	f	50.00	\N	0.00	\N
b8c3e336e6cdc2322a1cc2d9	e4728a9d4fc28b73499d8625	cmhwgs8iy0000jxc455rshrss	Headwear Haven	headwear-haven	\N	Premium headwear for every occasion	\N	\N	support@headwearhaven.com	\N	\N	\N	\N	f	f	7.00	0	0	0.00	\N	0	t	2025-11-12 20:50:39.617	2025-11-12 20:50:39.617	STRIPE	\N	\N	\N	\N	\N	f	\N	\N	\N	f	50.00	\N	0.00	\N
vendorStore_1763154499470_eq2etdfh6	store_1763154499466_nzv1jt3di	cmhzcnf800000jxx8qqzm03m9	asdfasdfasd	ira-watkins	asdfasdfasd	adsfasdfasd	\N	\N	ira@irawatkins.com	4046682401	{"city": "Chicago", "state": "Illinois", "address": "2740 west 83rd pl", "country": "United States", "zipCode": "60652"}	\N	acct_1STUE83GYcGXyA4Q	f	f	7.00	0	0	0.00	\N	0	t	2025-11-14 21:08:19.471	2025-11-14 21:08:19.471	STRIPE	\N	\N	\N	\N	\N	f	\N	\N	\N	f	50.00	\N	0.00	\N
\.


--
-- Data for Name: vendor_withdraws; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.vendor_withdraws (id, "vendorStoreId", amount, method, status, "requestedAt", "processedAt", notes, "adminNotes", "bankDetails") FROM stdin;
\.


--
-- Data for Name: writer_profiles; Type: TABLE DATA; Schema: public; Owner: stepperslife
--

COPY public.writer_profiles (id, "userId", "displayName", bio, expertise, "photoUrl", "instagramUrl", "twitterUrl", "websiteUrl", "isApproved", "totalArticles", "totalViews", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Store Store_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: abandoned_carts abandoned_carts_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.abandoned_carts
    ADD CONSTRAINT abandoned_carts_pkey PRIMARY KEY (id);


--
-- Name: announcement_reads announcement_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT announcement_reads_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: article_likes article_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.article_likes
    ADD CONSTRAINT article_likes_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comment_flags comment_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.comment_flags
    ADD CONSTRAINT comment_flags_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: order_promotions order_promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.order_promotions
    ADD CONSTRAINT order_promotions_pkey PRIMARY KEY (id);


--
-- Name: product_addons product_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_addons
    ADD CONSTRAINT product_addons_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: shipping_rates shipping_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_pkey PRIMARY KEY (id);


--
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- Name: shop_ratings shop_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.shop_ratings
    ADD CONSTRAINT shop_ratings_pkey PRIMARY KEY (id);


--
-- Name: store_hours store_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_hours
    ADD CONSTRAINT store_hours_pkey PRIMARY KEY (id);


--
-- Name: store_order_items store_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_order_items
    ADD CONSTRAINT store_order_items_pkey PRIMARY KEY (id);


--
-- Name: store_orders store_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_orders
    ADD CONSTRAINT store_orders_pkey PRIMARY KEY (id);


--
-- Name: store_vacations store_vacations_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_vacations
    ADD CONSTRAINT store_vacations_pkey PRIMARY KEY (id);


--
-- Name: subscription_history subscription_history_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.subscription_history
    ADD CONSTRAINT subscription_history_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: usage_records usage_records_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.usage_records
    ADD CONSTRAINT usage_records_pkey PRIMARY KEY (id);


--
-- Name: variant_combinations variant_combinations_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.variant_combinations
    ADD CONSTRAINT variant_combinations_pkey PRIMARY KEY (id);


--
-- Name: variant_options variant_options_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.variant_options
    ADD CONSTRAINT variant_options_pkey PRIMARY KEY (id);


--
-- Name: vendor_followers vendor_followers_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.vendor_followers
    ADD CONSTRAINT vendor_followers_pkey PRIMARY KEY (id);


--
-- Name: vendor_stores vendor_stores_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.vendor_stores
    ADD CONSTRAINT vendor_stores_pkey PRIMARY KEY (id);


--
-- Name: vendor_withdraws vendor_withdraws_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.vendor_withdraws
    ADD CONSTRAINT vendor_withdraws_pkey PRIMARY KEY (id);


--
-- Name: writer_profiles writer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.writer_profiles
    ADD CONSTRAINT writer_profiles_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Account_userId_provider_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "Account_userId_provider_idx" ON public."Account" USING btree ("userId", provider);


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Store_slug_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "Store_slug_key" ON public."Store" USING btree (slug);


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: abandoned_carts_cartSessionId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "abandoned_carts_cartSessionId_key" ON public.abandoned_carts USING btree ("cartSessionId");


--
-- Name: abandoned_carts_customerEmail_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "abandoned_carts_customerEmail_idx" ON public.abandoned_carts USING btree ("customerEmail");


--
-- Name: abandoned_carts_discountCode_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "abandoned_carts_discountCode_idx" ON public.abandoned_carts USING btree ("discountCode");


--
-- Name: abandoned_carts_discountCode_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "abandoned_carts_discountCode_key" ON public.abandoned_carts USING btree ("discountCode");


--
-- Name: abandoned_carts_expiresAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "abandoned_carts_expiresAt_idx" ON public.abandoned_carts USING btree ("expiresAt");


--
-- Name: abandoned_carts_recoveryToken_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "abandoned_carts_recoveryToken_key" ON public.abandoned_carts USING btree ("recoveryToken");


--
-- Name: abandoned_carts_reminderSentAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "abandoned_carts_reminderSentAt_idx" ON public.abandoned_carts USING btree ("reminderSentAt");


--
-- Name: abandoned_carts_vendorStoreId_isRecovered_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "abandoned_carts_vendorStoreId_isRecovered_idx" ON public.abandoned_carts USING btree ("vendorStoreId", "isRecovered");


--
-- Name: announcement_reads_announcementId_vendorStoreId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "announcement_reads_announcementId_vendorStoreId_key" ON public.announcement_reads USING btree ("announcementId", "vendorStoreId");


--
-- Name: announcement_reads_vendorStoreId_readAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "announcement_reads_vendorStoreId_readAt_idx" ON public.announcement_reads USING btree ("vendorStoreId", "readAt");


--
-- Name: announcements_createdBy_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "announcements_createdBy_idx" ON public.announcements USING btree ("createdBy");


--
-- Name: announcements_status_publishAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "announcements_status_publishAt_idx" ON public.announcements USING btree (status, "publishAt");


--
-- Name: article_likes_articleId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "article_likes_articleId_idx" ON public.article_likes USING btree ("articleId");


--
-- Name: article_likes_articleId_userId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "article_likes_articleId_userId_key" ON public.article_likes USING btree ("articleId", "userId");


--
-- Name: article_likes_userId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "article_likes_userId_idx" ON public.article_likes USING btree ("userId");


--
-- Name: articles_authorId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "articles_authorId_idx" ON public.articles USING btree ("authorId");


--
-- Name: articles_category_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX articles_category_idx ON public.articles USING btree (category);


--
-- Name: articles_publishedAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "articles_publishedAt_idx" ON public.articles USING btree ("publishedAt");


--
-- Name: articles_reviewedBy_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "articles_reviewedBy_idx" ON public.articles USING btree ("reviewedBy");


--
-- Name: articles_slug_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX articles_slug_key ON public.articles USING btree (slug);


--
-- Name: articles_status_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX articles_status_idx ON public.articles USING btree (status);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: comment_flags_commentId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "comment_flags_commentId_idx" ON public.comment_flags USING btree ("commentId");


--
-- Name: comment_flags_commentId_userId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "comment_flags_commentId_userId_key" ON public.comment_flags USING btree ("commentId", "userId");


--
-- Name: comment_flags_userId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "comment_flags_userId_idx" ON public.comment_flags USING btree ("userId");


--
-- Name: comments_articleId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "comments_articleId_idx" ON public.comments USING btree ("articleId");


--
-- Name: comments_deletedAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "comments_deletedAt_idx" ON public.comments USING btree ("deletedAt");


--
-- Name: comments_isFlagged_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "comments_isFlagged_idx" ON public.comments USING btree ("isFlagged");


--
-- Name: comments_userId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "comments_userId_idx" ON public.comments USING btree ("userId");


--
-- Name: coupons_code_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX coupons_code_idx ON public.coupons USING btree (code);


--
-- Name: coupons_endDate_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "coupons_endDate_idx" ON public.coupons USING btree ("endDate");


--
-- Name: coupons_vendorStoreId_code_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "coupons_vendorStoreId_code_key" ON public.coupons USING btree ("vendorStoreId", code);


--
-- Name: coupons_vendorStoreId_isActive_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "coupons_vendorStoreId_isActive_idx" ON public.coupons USING btree ("vendorStoreId", "isActive");


--
-- Name: media_createdAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "media_createdAt_idx" ON public.media USING btree ("createdAt");


--
-- Name: media_mimeType_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "media_mimeType_idx" ON public.media USING btree ("mimeType");


--
-- Name: media_uploadedById_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "media_uploadedById_idx" ON public.media USING btree ("uploadedById");


--
-- Name: order_promotions_status_priority_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX order_promotions_status_priority_idx ON public.order_promotions USING btree (status, priority);


--
-- Name: order_promotions_vendorStoreId_status_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "order_promotions_vendorStoreId_status_idx" ON public.order_promotions USING btree ("vendorStoreId", status);


--
-- Name: product_addons_productId_isActive_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "product_addons_productId_isActive_idx" ON public.product_addons USING btree ("productId", "isActive");


--
-- Name: product_addons_storeId_isActive_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "product_addons_storeId_isActive_idx" ON public.product_addons USING btree ("storeId", "isActive");


--
-- Name: product_images_productId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "product_images_productId_idx" ON public.product_images USING btree ("productId");


--
-- Name: product_reviews_customerId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "product_reviews_customerId_idx" ON public.product_reviews USING btree ("customerId");


--
-- Name: product_reviews_orderItemId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "product_reviews_orderItemId_idx" ON public.product_reviews USING btree ("orderItemId");


--
-- Name: product_reviews_orderItemId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "product_reviews_orderItemId_key" ON public.product_reviews USING btree ("orderItemId");


--
-- Name: product_reviews_productId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "product_reviews_productId_status_createdAt_idx" ON public.product_reviews USING btree ("productId", status, "createdAt");


--
-- Name: product_reviews_vendorStoreId_createdAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "product_reviews_vendorStoreId_createdAt_idx" ON public.product_reviews USING btree ("vendorStoreId", "createdAt");


--
-- Name: product_variants_productId_available_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "product_variants_productId_available_idx" ON public.product_variants USING btree ("productId", available);


--
-- Name: product_variants_productId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "product_variants_productId_idx" ON public.product_variants USING btree ("productId");


--
-- Name: products_category_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX products_category_idx ON public.products USING btree (category);


--
-- Name: products_category_status_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX products_category_status_idx ON public.products USING btree (category, status);


--
-- Name: products_status_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX products_status_idx ON public.products USING btree (status);


--
-- Name: products_useMultiVariants_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "products_useMultiVariants_idx" ON public.products USING btree ("useMultiVariants");


--
-- Name: products_vendorStoreId_slug_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "products_vendorStoreId_slug_key" ON public.products USING btree ("vendorStoreId", slug);


--
-- Name: products_vendorStoreId_status_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "products_vendorStoreId_status_idx" ON public.products USING btree ("vendorStoreId", status);


--
-- Name: shipping_rates_zoneId_isEnabled_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "shipping_rates_zoneId_isEnabled_idx" ON public.shipping_rates USING btree ("zoneId", "isEnabled");


--
-- Name: shipping_zones_vendorStoreId_isEnabled_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "shipping_zones_vendorStoreId_isEnabled_idx" ON public.shipping_zones USING btree ("vendorStoreId", "isEnabled");


--
-- Name: shop_ratings_vendorStoreId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "shop_ratings_vendorStoreId_key" ON public.shop_ratings USING btree ("vendorStoreId");


--
-- Name: store_hours_vendorStoreId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "store_hours_vendorStoreId_key" ON public.store_hours USING btree ("vendorStoreId");


--
-- Name: store_order_items_productId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_order_items_productId_idx" ON public.store_order_items USING btree ("productId");


--
-- Name: store_order_items_storeOrderId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_order_items_storeOrderId_idx" ON public.store_order_items USING btree ("storeOrderId");


--
-- Name: store_orders_couponId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_orders_couponId_idx" ON public.store_orders USING btree ("couponId");


--
-- Name: store_orders_createdAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_orders_createdAt_idx" ON public.store_orders USING btree ("createdAt");


--
-- Name: store_orders_customerEmail_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_orders_customerEmail_idx" ON public.store_orders USING btree ("customerEmail");


--
-- Name: store_orders_customerId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_orders_customerId_idx" ON public.store_orders USING btree ("customerId");


--
-- Name: store_orders_fulfillmentStatus_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_orders_fulfillmentStatus_idx" ON public.store_orders USING btree ("fulfillmentStatus");


--
-- Name: store_orders_orderNumber_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "store_orders_orderNumber_key" ON public.store_orders USING btree ("orderNumber");


--
-- Name: store_orders_paymentIntentId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "store_orders_paymentIntentId_key" ON public.store_orders USING btree ("paymentIntentId");


--
-- Name: store_orders_paymentStatus_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_orders_paymentStatus_idx" ON public.store_orders USING btree ("paymentStatus");


--
-- Name: store_orders_status_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX store_orders_status_idx ON public.store_orders USING btree (status);


--
-- Name: store_orders_vendorStoreId_createdAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_orders_vendorStoreId_createdAt_idx" ON public.store_orders USING btree ("vendorStoreId", "createdAt");


--
-- Name: store_orders_vendorStoreId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_orders_vendorStoreId_status_createdAt_idx" ON public.store_orders USING btree ("vendorStoreId", status, "createdAt");


--
-- Name: store_vacations_vendorStoreId_isActive_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_vacations_vendorStoreId_isActive_idx" ON public.store_vacations USING btree ("vendorStoreId", "isActive");


--
-- Name: store_vacations_vendorStoreId_startDate_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "store_vacations_vendorStoreId_startDate_idx" ON public.store_vacations USING btree ("vendorStoreId", "startDate");


--
-- Name: subscription_history_tenantId_createdAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "subscription_history_tenantId_createdAt_idx" ON public.subscription_history USING btree ("tenantId", "createdAt");


--
-- Name: tenants_customDomain_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "tenants_customDomain_idx" ON public.tenants USING btree ("customDomain");


--
-- Name: tenants_customDomain_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "tenants_customDomain_key" ON public.tenants USING btree ("customDomain");


--
-- Name: tenants_ownerId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "tenants_ownerId_idx" ON public.tenants USING btree ("ownerId");


--
-- Name: tenants_slug_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX tenants_slug_idx ON public.tenants USING btree (slug);


--
-- Name: tenants_slug_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX tenants_slug_key ON public.tenants USING btree (slug);


--
-- Name: tenants_stripeCustomerId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "tenants_stripeCustomerId_key" ON public.tenants USING btree ("stripeCustomerId");


--
-- Name: tenants_stripeSubscriptionId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "tenants_stripeSubscriptionId_key" ON public.tenants USING btree ("stripeSubscriptionId");


--
-- Name: tenants_subscriptionStatus_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "tenants_subscriptionStatus_idx" ON public.tenants USING btree ("subscriptionStatus");


--
-- Name: usage_records_tenantId_metric_timestamp_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "usage_records_tenantId_metric_timestamp_idx" ON public.usage_records USING btree ("tenantId", metric, "timestamp");


--
-- Name: variant_combinations_productId_available_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "variant_combinations_productId_available_idx" ON public.variant_combinations USING btree ("productId", available);


--
-- Name: variant_combinations_productId_combinationKey_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "variant_combinations_productId_combinationKey_key" ON public.variant_combinations USING btree ("productId", "combinationKey");


--
-- Name: variant_combinations_productId_inStock_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "variant_combinations_productId_inStock_idx" ON public.variant_combinations USING btree ("productId", "inStock");


--
-- Name: variant_options_productId_isActive_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "variant_options_productId_isActive_idx" ON public.variant_options USING btree ("productId", "isActive");


--
-- Name: variant_options_productId_type_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "variant_options_productId_type_idx" ON public.variant_options USING btree ("productId", type);


--
-- Name: vendor_followers_customerId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "vendor_followers_customerId_idx" ON public.vendor_followers USING btree ("customerId");


--
-- Name: vendor_followers_vendorStoreId_customerId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "vendor_followers_vendorStoreId_customerId_key" ON public.vendor_followers USING btree ("vendorStoreId", "customerId");


--
-- Name: vendor_followers_vendorStoreId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "vendor_followers_vendorStoreId_idx" ON public.vendor_followers USING btree ("vendorStoreId");


--
-- Name: vendor_stores_isActive_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "vendor_stores_isActive_idx" ON public.vendor_stores USING btree ("isActive");


--
-- Name: vendor_stores_slug_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX vendor_stores_slug_idx ON public.vendor_stores USING btree (slug);


--
-- Name: vendor_stores_slug_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX vendor_stores_slug_key ON public.vendor_stores USING btree (slug);


--
-- Name: vendor_stores_storeId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "vendor_stores_storeId_key" ON public.vendor_stores USING btree ("storeId");


--
-- Name: vendor_stores_stripeAccountId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "vendor_stores_stripeAccountId_key" ON public.vendor_stores USING btree ("stripeAccountId");


--
-- Name: vendor_stores_tenantId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "vendor_stores_tenantId_idx" ON public.vendor_stores USING btree ("tenantId");


--
-- Name: vendor_stores_userId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "vendor_stores_userId_idx" ON public.vendor_stores USING btree ("userId");


--
-- Name: vendor_withdraws_status_requestedAt_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "vendor_withdraws_status_requestedAt_idx" ON public.vendor_withdraws USING btree (status, "requestedAt");


--
-- Name: vendor_withdraws_vendorStoreId_status_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "vendor_withdraws_vendorStoreId_status_idx" ON public.vendor_withdraws USING btree ("vendorStoreId", status);


--
-- Name: writer_profiles_userId_idx; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE INDEX "writer_profiles_userId_idx" ON public.writer_profiles USING btree ("userId");


--
-- Name: writer_profiles_userId_key; Type: INDEX; Schema: public; Owner: stepperslife
--

CREATE UNIQUE INDEX "writer_profiles_userId_key" ON public.writer_profiles USING btree ("userId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: abandoned_carts abandoned_carts_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.abandoned_carts
    ADD CONSTRAINT "abandoned_carts_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: announcement_reads announcement_reads_announcementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT "announcement_reads_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES public.announcements(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: announcement_reads announcement_reads_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.announcement_reads
    ADD CONSTRAINT "announcement_reads_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: announcements announcements_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "announcements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: article_likes article_likes_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.article_likes
    ADD CONSTRAINT "article_likes_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public.articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: article_likes article_likes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.article_likes
    ADD CONSTRAINT "article_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: articles articles_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: articles articles_reviewedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT "articles_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comment_flags comment_flags_commentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.comment_flags
    ADD CONSTRAINT "comment_flags_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES public.comments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment_flags comment_flags_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.comment_flags
    ADD CONSTRAINT "comment_flags_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public.articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_deletedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comments comments_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.comments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupons coupons_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "coupons_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: media media_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT "media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_promotions order_promotions_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.order_promotions
    ADD CONSTRAINT "order_promotions_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_promotions order_promotions_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.order_promotions
    ADD CONSTRAINT "order_promotions_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_addons product_addons_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_addons
    ADD CONSTRAINT "product_addons_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT "product_reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_reviews product_reviews_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT "product_reviews_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public.store_order_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT "product_reviews_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_rates shipping_rates_zoneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT "shipping_rates_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES public.shipping_zones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_zones shipping_zones_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT "shipping_zones_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shop_ratings shop_ratings_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.shop_ratings
    ADD CONSTRAINT "shop_ratings_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_hours store_hours_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_hours
    ADD CONSTRAINT "store_hours_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_order_items store_order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_order_items
    ADD CONSTRAINT "store_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: store_order_items store_order_items_storeOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_order_items
    ADD CONSTRAINT "store_order_items_storeOrderId_fkey" FOREIGN KEY ("storeOrderId") REFERENCES public.store_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_orders store_orders_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_orders
    ADD CONSTRAINT "store_orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: store_orders store_orders_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_orders
    ADD CONSTRAINT "store_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: store_orders store_orders_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_orders
    ADD CONSTRAINT "store_orders_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: store_vacations store_vacations_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.store_vacations
    ADD CONSTRAINT "store_vacations_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscription_history subscription_history_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.subscription_history
    ADD CONSTRAINT "subscription_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tenants tenants_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "tenants_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usage_records usage_records_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.usage_records
    ADD CONSTRAINT "usage_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: variant_combinations variant_combinations_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.variant_combinations
    ADD CONSTRAINT "variant_combinations_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: variant_options variant_options_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.variant_options
    ADD CONSTRAINT "variant_options_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendor_followers vendor_followers_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.vendor_followers
    ADD CONSTRAINT "vendor_followers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendor_followers vendor_followers_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.vendor_followers
    ADD CONSTRAINT "vendor_followers_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendor_stores vendor_stores_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.vendor_stores
    ADD CONSTRAINT "vendor_stores_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vendor_stores vendor_stores_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.vendor_stores
    ADD CONSTRAINT "vendor_stores_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendor_withdraws vendor_withdraws_vendorStoreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.vendor_withdraws
    ADD CONSTRAINT "vendor_withdraws_vendorStoreId_fkey" FOREIGN KEY ("vendorStoreId") REFERENCES public.vendor_stores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: writer_profiles writer_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: stepperslife
--

ALTER TABLE ONLY public.writer_profiles
    ADD CONSTRAINT "writer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2VmvgJyIZXfvieXjDbXNJPBYko2E8ESGyNFDbfNFWETYGtYcDaPyiT5S0ht6oGO

