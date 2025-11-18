"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, Check, Clock, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function NotificationsPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  const isLoading = currentUser === undefined;

  if (isLoading || currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // TODO: Fetch actual notifications from database
  const mockNotifications = [
    {
      id: "1",
      title: "New ticket sale",
      message: "Someone purchased 2 tickets for your event",
      time: "5 minutes ago",
      read: false,
      type: "sale",
    },
    {
      id: "2",
      title: "Payout processed",
      message: "Your weekly payout of $1,250 has been sent",
      time: "2 hours ago",
      read: true,
      type: "payout",
    },
    {
      id: "3",
      title: "Event starting soon",
      message: "Your event 'Summer Dance Workshop' starts in 2 days",
      time: "1 day ago",
      read: true,
      type: "reminder",
    },
  ];

  const getNotificationIcon = (type: string, read: boolean) => {
    const iconClass = read ? "text-gray-400" : "text-primary";
    const bgClass = read ? "bg-gray-100" : "bg-primary/10";

    switch (type) {
      case "sale":
        return (
          <div className={`${bgClass} p-2 rounded-lg`}>
            <Check className={`w-5 h-5 ${iconClass}`} />
          </div>
        );
      case "payout":
        return (
          <div className={`${bgClass} p-2 rounded-lg`}>
            <Clock className={`w-5 h-5 ${iconClass}`} />
          </div>
        );
      default:
        return (
          <div className={`${bgClass} p-2 rounded-lg`}>
            <Info className={`w-5 h-5 ${iconClass}`} />
          </div>
        );
    }
  };

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">Stay updated with your events and sales</p>
            </div>
            {unreadCount > 0 && (
              <button className="px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors">
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        {mockNotifications.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="divide-y divide-gray-200">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {getNotificationIcon(notification.type, notification.read)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`text-sm font-medium ${
                            notification.read ? "text-gray-900" : "text-gray-900 font-semibold"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      {!notification.read && (
                        <button className="mt-2 text-xs text-primary hover:underline">
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600">
              You'll see updates about your events, sales, and payouts here
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
