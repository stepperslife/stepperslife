"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { HelpCircle, MessageCircle, FileText, Mail, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SupportPage() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const [message, setMessage] = useState("");

  const isLoading = currentUser === undefined;

  if (isLoading || currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading support...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement support ticket submission
    alert("Support ticket submitted! We'll get back to you soon.");
    setMessage("");
  };

  const supportOptions = [
    {
      title: "Documentation",
      description: "Browse our comprehensive guides and tutorials",
      icon: FileText,
      href: "https://docs.stepperslife.com",
      color: "bg-blue-500",
    },
    {
      title: "FAQs",
      description: "Quick answers to common questions",
      icon: HelpCircle,
      href: "#faqs",
      color: "bg-purple-500",
    },
    {
      title: "Email Support",
      description: "Send us an email at support@stepperslife.com",
      icon: Mail,
      href: "mailto:support@stepperslife.com",
      color: "bg-green-500",
    },
  ];

  const faqs = [
    {
      question: "How do I purchase tickets for my event?",
      answer:
        "Navigate to Tickets > Purchase Tickets, select your event, choose the quantity, and complete the purchase using your credits.",
    },
    {
      question: "When will I receive my payouts?",
      answer:
        "Payouts are processed weekly, typically every Monday, and sent to your connected Stripe account.",
    },
    {
      question: "How do I add team members to my events?",
      answer:
        "Go to Team Management, click 'Add Team Member', enter their email, and assign their role and permissions.",
    },
    {
      question: "Can I get a refund on credits?",
      answer:
        "Credits are non-refundable, but they never expire and can be used for any of your events.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support & Help</h1>
            <p className="text-gray-600 mt-1">We're here to help you succeed</p>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        {/* Support Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {supportOptions.map((option, index) => (
            <a
              key={index}
              href={option.href}
              target={option.href.startsWith("http") ? "_blank" : undefined}
              rel={option.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={`${option.color} p-3 rounded-lg text-white w-fit mb-4`}>
                <option.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                {option.title}
                {option.href.startsWith("http") && <ExternalLink className="w-4 h-4" />}
              </h3>
              <p className="text-gray-600">{option.description}</p>
            </a>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Have a question or need help? Send us a message and we'll respond within 24 hours.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe your issue or question..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
            id="faqs"
          >
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
