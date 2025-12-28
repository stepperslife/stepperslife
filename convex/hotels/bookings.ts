import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../lib/auth";

// Generate a unique confirmation number
function generateConfirmationNumber(): string {
  const prefix = "HR"; // Hotel Reservation
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Create a hotel reservation (customer booking)
export const createReservation = mutation({
  args: {
    packageId: v.id("hotelPackages"),
    roomTypeId: v.string(),
    checkInDate: v.number(),
    checkOutDate: v.number(),
    numberOfRooms: v.number(),
    numberOfGuests: v.number(),
    guestName: v.string(),
    guestEmail: v.string(),
    guestPhone: v.optional(v.string()),
    specialRequests: v.optional(v.string()),
    paymentMethod: v.union(v.literal("STRIPE"), v.literal("PAYPAL")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Get the hotel package
    const pkg = await ctx.db.get(args.packageId);
    if (!pkg) throw new Error("Hotel package not found");
    if (!pkg.isActive) throw new Error("This hotel is no longer available");

    // Find the room type
    const roomType = pkg.roomTypes.find((rt) => rt.id === args.roomTypeId);
    if (!roomType) throw new Error("Room type not found");

    // Check availability
    const remainingRooms = roomType.quantity - roomType.sold;
    if (args.numberOfRooms > remainingRooms) {
      throw new Error(
        `Only ${remainingRooms} rooms available for this room type`
      );
    }

    // Validate dates
    if (args.checkOutDate <= args.checkInDate) {
      throw new Error("Check-out date must be after check-in date");
    }

    // Validate guest count
    const maxGuestsForBooking = roomType.maxGuests * args.numberOfRooms;
    if (args.numberOfGuests > maxGuestsForBooking) {
      throw new Error(
        `Maximum ${maxGuestsForBooking} guests allowed for ${args.numberOfRooms} room(s)`
      );
    }

    // Check booking cutoff
    if (pkg.bookingCutoffHours) {
      const event = await ctx.db.get(pkg.eventId);
      if (event?.startDate) {
        const cutoffTime =
          event.startDate - pkg.bookingCutoffHours * 60 * 60 * 1000;
        if (Date.now() > cutoffTime) {
          throw new Error(
            `Booking closed ${pkg.bookingCutoffHours} hours before event`
          );
        }
      }
    }

    // Calculate pricing
    const nights = Math.ceil(
      (args.checkOutDate - args.checkInDate) / (1000 * 60 * 60 * 24)
    );
    const subtotalCents =
      roomType.pricePerNightCents * nights * args.numberOfRooms;
    const platformFeeCents = Math.round(subtotalCents * 0.05); // 5% platform fee
    const totalCents = subtotalCents + platformFeeCents;

    const now = Date.now();
    const confirmationNumber = generateConfirmationNumber();

    // Create the reservation (PENDING until payment)
    const reservationId = await ctx.db.insert("hotelReservations", {
      packageId: args.packageId,
      eventId: pkg.eventId,
      roomTypeId: args.roomTypeId,
      userId: user._id,
      guestName: args.guestName,
      guestEmail: args.guestEmail,
      guestPhone: args.guestPhone,
      checkInDate: args.checkInDate,
      checkOutDate: args.checkOutDate,
      numberOfNights: nights,
      numberOfRooms: args.numberOfRooms,
      numberOfGuests: args.numberOfGuests,
      pricePerNightCents: roomType.pricePerNightCents,
      subtotalCents,
      platformFeeCents,
      totalCents,
      paymentMethod: args.paymentMethod,
      status: "PENDING",
      specialRequests: args.specialRequests,
      confirmationNumber,
      createdAt: now,
      updatedAt: now,
    });

    return {
      reservationId,
      confirmationNumber,
      totalCents,
    };
  },
});

// Confirm a reservation after payment
export const confirmReservation = mutation({
  args: {
    reservationId: v.id("hotelReservations"),
    stripePaymentIntentId: v.optional(v.string()),
    paypalOrderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) throw new Error("Reservation not found");
    if (reservation.status !== "PENDING") {
      throw new Error("Reservation is not pending");
    }

    // Update the hotel package sold count
    const pkg = await ctx.db.get(reservation.packageId);
    if (!pkg) throw new Error("Hotel package not found");

    const updatedRoomTypes = pkg.roomTypes.map((rt) => {
      if (rt.id === reservation.roomTypeId) {
        return {
          ...rt,
          sold: rt.sold + reservation.numberOfRooms,
        };
      }
      return rt;
    });

    // Update package with new sold counts
    await ctx.db.patch(reservation.packageId, {
      roomTypes: updatedRoomTypes,
      updatedAt: Date.now(),
    });

    // Confirm the reservation
    await ctx.db.patch(args.reservationId, {
      status: "CONFIRMED",
      stripePaymentIntentId: args.stripePaymentIntentId,
      paypalOrderId: args.paypalOrderId,
      updatedAt: Date.now(),
    });

    return { success: true, confirmationNumber: reservation.confirmationNumber };
  },
});

// Cancel a reservation
export const cancelReservation = mutation({
  args: {
    reservationId: v.id("hotelReservations"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) throw new Error("Reservation not found");

    // Verify ownership or organizer access
    const pkg = await ctx.db.get(reservation.packageId);
    const event = pkg ? await ctx.db.get(pkg.eventId) : null;

    const isGuest = reservation.userId === user._id;
    const isOrganizer = event?.organizerId === user._id;

    if (!isGuest && !isOrganizer) {
      throw new Error("Not authorized to cancel this reservation");
    }

    if (
      reservation.status === "CANCELLED" ||
      reservation.status === "REFUNDED"
    ) {
      throw new Error("Reservation is already cancelled");
    }

    // If reservation was confirmed, restore room availability
    if (reservation.status === "CONFIRMED" && pkg) {
      const updatedRoomTypes = pkg.roomTypes.map((rt) => {
        if (rt.id === reservation.roomTypeId) {
          return {
            ...rt,
            sold: Math.max(0, rt.sold - reservation.numberOfRooms),
          };
        }
        return rt;
      });

      await ctx.db.patch(reservation.packageId, {
        roomTypes: updatedRoomTypes,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.patch(args.reservationId, {
      status: "CANCELLED",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mark reservation as refunded (admin/organizer only)
export const refundReservation = mutation({
  args: {
    reservationId: v.id("hotelReservations"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) throw new Error("Reservation not found");

    // Verify organizer access
    const pkg = await ctx.db.get(reservation.packageId);
    const event = pkg ? await ctx.db.get(pkg.eventId) : null;

    if (!event || event.organizerId !== user._id) {
      throw new Error("Not authorized to refund this reservation");
    }

    if (reservation.status !== "CONFIRMED") {
      throw new Error("Can only refund confirmed reservations");
    }

    // Restore room availability
    if (pkg) {
      const updatedRoomTypes = pkg.roomTypes.map((rt) => {
        if (rt.id === reservation.roomTypeId) {
          return {
            ...rt,
            sold: Math.max(0, rt.sold - reservation.numberOfRooms),
          };
        }
        return rt;
      });

      await ctx.db.patch(reservation.packageId, {
        roomTypes: updatedRoomTypes,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.patch(args.reservationId, {
      status: "REFUNDED",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update reservation details (organizer only)
export const updateReservation = mutation({
  args: {
    reservationId: v.id("hotelReservations"),
    guestName: v.optional(v.string()),
    guestEmail: v.optional(v.string()),
    guestPhone: v.optional(v.string()),
    specialRequests: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) throw new Error("Reservation not found");

    // Verify ownership or organizer access
    const pkg = await ctx.db.get(reservation.packageId);
    const event = pkg ? await ctx.db.get(pkg.eventId) : null;

    const isGuest = reservation.userId === user._id;
    const isOrganizer = event?.organizerId === user._id;

    if (!isGuest && !isOrganizer) {
      throw new Error("Not authorized to update this reservation");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.guestName !== undefined) updates.guestName = args.guestName;
    if (args.guestEmail !== undefined) updates.guestEmail = args.guestEmail;
    if (args.guestPhone !== undefined) updates.guestPhone = args.guestPhone;
    if (args.specialRequests !== undefined)
      updates.specialRequests = args.specialRequests;

    await ctx.db.patch(args.reservationId, updates);

    return { success: true };
  },
});
