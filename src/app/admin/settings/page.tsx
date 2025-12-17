"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Settings as SettingsIcon,
  Bell,
  CreditCard,
  Shield,
  Database,
  Mail,
  Zap,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "payments" | "notifications" | "security">(
    "general"
  );

  const tabs = [
    { id: "general", name: "General", icon: SettingsIcon },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Configure platform-wide settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    isActive
                      ? "border-destructive text-destructive"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "payments" && <PaymentSettings />}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "security" && <SecuritySettings />}
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">General Settings</h2>
        <p className="text-muted-foreground text-sm">Configure basic platform settings and defaults</p>
      </div>

      {/* Platform Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Platform Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Platform Name</label>
            <input
              type="text"
              defaultValue="Steppers Life Events"
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-destructive focus:border-transparent"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Support Email</label>
            <input
              type="email"
              defaultValue="support@stepperslife.com"
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-destructive focus:border-transparent"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Default Settings */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="font-semibold text-foreground">Default Settings</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Default Platform Fee</p>
              <p className="text-sm text-muted-foreground">Fee charged per ticket sale</p>
            </div>
            <span className="text-lg font-bold text-foreground">10%</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Default Organizer Credits</p>
              <p className="text-sm text-muted-foreground">Credits given to new organizers</p>
            </div>
            <span className="text-lg font-bold text-foreground">100</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Maximum File Upload Size</p>
              <p className="text-sm text-muted-foreground">For event images and assets</p>
            </div>
            <span className="text-lg font-bold text-foreground">5 MB</span>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="font-semibold text-foreground">Feature Flags</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">Testing Mode</p>
                <p className="text-sm text-muted-foreground">Bypass Square payment processing</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-success text-white rounded-full text-xs font-medium">
              ENABLED
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">Staff Commission System</p>
                <p className="text-sm text-muted-foreground">Referral tracking and commissions</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-success text-white rounded-full text-xs font-medium">
              ENABLED
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send automated emails to users</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs font-medium">
              DISABLED
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Event Analytics</p>
                <p className="text-sm text-muted-foreground">Advanced analytics for organizers</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs font-medium">
              DISABLED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Payment Settings</h2>
        <p className="text-muted-foreground text-sm">Configure payment processing and financial settings</p>
      </div>

      {/* Square Integration */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Square Integration</h3>

        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div>
              <p className="font-semibold text-success">Square Connected</p>
              <p className="text-sm text-success">Production environment active</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Application ID</p>
              <p className="font-mono text-foreground">sq0idp-XG8i...H6Q</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location ID</p>
              <p className="font-mono text-foreground">L0Q2...BGD8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Configuration */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="font-semibold text-foreground">Payment Configuration</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Minimum Order Amount</p>
              <p className="text-sm text-muted-foreground">Minimum ticket purchase value</p>
            </div>
            <span className="text-lg font-bold text-foreground">$1.00</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Maximum Order Amount</p>
              <p className="text-sm text-muted-foreground">Maximum ticket purchase value</p>
            </div>
            <span className="text-lg font-bold text-foreground">$10,000</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Payment Methods Accepted</p>
              <p className="text-sm text-muted-foreground">Supported payment options</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">Card, Cash App</p>
              <p className="text-sm text-muted-foreground">Google Pay, Apple Pay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testing Mode Warning */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="text-sm text-warning">
          <p className="font-medium mb-1">Testing Mode Active</p>
          <p>
            Payment processing is currently bypassed for testing. No real charges will be made.
            Disable testing mode in production.
          </p>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Notification Settings</h2>
        <p className="text-muted-foreground text-sm">Configure email and system notifications</p>
      </div>

      {/* Email Notifications */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Email Notifications</h3>

        <div className="bg-accent border border-border rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-accent-foreground">
            <p className="font-medium mb-1">Email System Not Configured</p>
            <p>
              Email notifications are currently disabled. Configure an email service provider (e.g.,
              SendGrid, Mailgun) to enable automated emails.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="font-semibold text-foreground">Notification Types</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Order Confirmation</p>
                <p className="text-sm text-muted-foreground">Send receipt after ticket purchase</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs font-medium">
              DISABLED
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Event Reminder</p>
                <p className="text-sm text-muted-foreground">Remind attendees 24h before event</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs font-medium">
              DISABLED
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Welcome Email</p>
                <p className="text-sm text-muted-foreground">Welcome new users and organizers</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs font-medium">
              DISABLED
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Admin Alerts</p>
                <p className="text-sm text-muted-foreground">System alerts for administrators</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs font-medium">
              DISABLED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<any>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const resetDatabase = useMutation(api.admin.cleanup.resetAll);

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetDatabase({ keepUserEmail: "thestepperslife@gmail.com" });
      setResetResult(result);
      setConfirmReset(false);
    } catch (error: any) {
      alert("Reset failed: " + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Security Settings</h2>
        <p className="text-muted-foreground text-sm">Configure security and access control settings</p>
      </div>

      {/* Authentication */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Authentication</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">Clerk Authentication</p>
                <p className="text-sm text-muted-foreground">OAuth and email authentication</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-success text-white rounded-full text-xs font-medium">
              ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-foreground">Testing Mode Authentication</p>
                <p className="text-sm text-muted-foreground">Bypass auth for development</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-warning text-white rounded-full text-xs font-medium">
              ENABLED
            </span>
          </div>
        </div>
      </div>

      {/* Access Control */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="font-semibold text-foreground">Access Control</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Role-Based Access</p>
              <p className="text-sm text-muted-foreground">Admin, Organizer, User roles</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">Admin Dashboard Protection</p>
              <p className="text-sm text-muted-foreground">Admin-only access control</p>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              <span className="text-sm text-warning font-medium">Temporarily Disabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-foreground">API Rate Limiting</p>
              <p className="text-sm text-muted-foreground">Prevent abuse and DoS attacks</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
        </div>
      </div>

      {/* Database */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="font-semibold text-foreground">Database & Infrastructure</h3>

        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-6 h-6 text-success" />
            <div>
              <p className="font-semibold text-success">Convex Backend</p>
              <p className="text-sm text-success">Real-time database and serverless functions</p>
            </div>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">Deployment URL</p>
            <p className="font-mono text-foreground">fearless-dragon-613.convex.cloud</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
        <Shield className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="text-sm text-destructive">
          <p className="font-medium mb-1">Security Notice</p>
          <p>
            Admin dashboard access control is currently disabled for testing. Re-enable
            authentication before deploying to production to prevent unauthorized access.
          </p>
        </div>
      </div>

      {/* Database Reset - DANGER ZONE */}
      <div className="space-y-4 pt-6 border-t-2 border-destructive">
        <h3 className="font-semibold text-destructive flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone - Database Reset
        </h3>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive mb-4">
            <strong>WARNING:</strong> This will permanently delete ALL events, tickets, orders,
            ticket tiers, payment configs, and users (except thestepperslife@gmail.com).
            This action cannot be undone!
          </p>

          {resetResult && (
            <div className="bg-white rounded-lg p-4 mb-4 text-sm">
              <p className="font-semibold text-success mb-2">Reset Complete!</p>
              <ul className="space-y-1 text-foreground">
                <li>Events deleted: {resetResult.events}</li>
                <li>Tickets deleted: {resetResult.tickets}</li>
                <li>Orders deleted: {resetResult.orders}</li>
                <li>Ticket tiers deleted: {resetResult.ticketTiers}</li>
                <li>Payment configs deleted: {resetResult.paymentConfigs}</li>
                <li>Staff records deleted: {resetResult.staff}</li>
                <li>Bundles deleted: {resetResult.bundles}</li>
                <li>Users deleted: {resetResult.users}</li>
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            {confirmReset ? (
              <>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Yes, Delete Everything
                    </>
                  )}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  disabled={isResetting}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Reset Database
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
