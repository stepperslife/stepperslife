"use client";

import { ChevronDown, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateUserInitials } from "@/lib/navigation/utils";
import Link from "next/link";

interface WorkspaceHeaderProps {
  /** Whether the sidebar is collapsed to icon-only mode */
  isCollapsed?: boolean;
}

/**
 * WorkspaceHeader
 *
 * A prominent header for the desktop sidebar showing the current workspace.
 * Replaces the old RoleSwitcher with a more visual, clickable workspace indicator.
 *
 * Features:
 * - Large colored workspace icon for quick visual identification
 * - Workspace name prominently displayed
 * - Click anywhere to open workspace switcher
 * - Works in collapsed sidebar mode (icon-only)
 */
export function WorkspaceHeader({ isCollapsed = false }: WorkspaceHeaderProps) {
  const {
    user,
    currentWorkspace,
    currentRole,
    hasMultipleWorkspaces,
    isBottomSheetOpen,
    setBottomSheetOpen,
    getRoleDisplayName,
  } = useWorkspace();

  if (!user || !currentWorkspace) {
    return null;
  }

  const WorkspaceIcon = currentWorkspace.icon;
  const userInitials = user.initials || generateUserInitials(user.name, user.email);

  // Collapsed state - just show the workspace icon
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-3">
        {/* Home Link */}
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors"
          title="Go to Homepage"
        >
          <Home className="w-4 h-4 text-sidebar-foreground/60" />
        </Link>

        {/* Workspace Icon Button */}
        {hasMultipleWorkspaces ? (
          <WorkspaceSwitcher isCollapsed>
            <button
              className={cn(
                "flex items-center justify-center",
                "w-10 h-10 rounded-xl",
                currentWorkspace.bgColor,
                "text-white",
                "hover:opacity-90 active:scale-95",
                "transition-all"
              )}
              aria-label={`Current workspace: ${currentWorkspace.name}. Click to switch.`}
            >
              <WorkspaceIcon className="w-5 h-5" />
            </button>
          </WorkspaceSwitcher>
        ) : (
          <div
            className={cn(
              "flex items-center justify-center",
              "w-10 h-10 rounded-xl",
              currentWorkspace.bgColor,
              "text-white"
            )}
          >
            <WorkspaceIcon className="w-5 h-5" />
          </div>
        )}
      </div>
    );
  }

  // Expanded state - full header with workspace info
  return (
    <div className="px-4 py-3">
      {/* User Info Row with Home Link */}
      <div className="flex items-center gap-3 mb-3">
        <Link
          href="/"
          className="flex items-center gap-3 flex-1 min-w-0 group"
          title="Go to Homepage"
        >
          <div className="relative">
            <Avatar className="w-10 h-10 group-hover:ring-2 group-hover:ring-primary/50 transition-all">
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
              <Home className="w-3 h-3 text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sidebar-foreground truncate group-hover:text-primary transition-colors">
              SteppersLife
            </h2>
            {user.name && (
              <p className="text-xs text-sidebar-foreground/80 truncate">
                {user.name}
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Workspace Switcher */}
      {hasMultipleWorkspaces ? (
        <WorkspaceSwitcher>
          <button
            className={cn(
              "flex items-center gap-3 w-full",
              "px-3 py-2.5 rounded-xl",
              "bg-muted/50 hover:bg-muted",
              "border border-border/50",
              "active:scale-[0.98] transition-all",
              "text-left"
            )}
          >
            {/* Workspace Icon */}
            <div
              className={cn(
                "flex items-center justify-center",
                "w-9 h-9 rounded-lg",
                currentWorkspace.bgColor,
                "text-white shrink-0"
              )}
            >
              <WorkspaceIcon className="w-4 h-4" />
            </div>

            {/* Workspace Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-sidebar-foreground truncate">
                {currentWorkspace.name}
              </div>
              {currentRole && (
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {getRoleDisplayName(currentRole)}
                </div>
              )}
            </div>

            {/* Dropdown Indicator */}
            <ChevronDown className="w-4 h-4 text-sidebar-foreground/50 shrink-0" />
          </button>
        </WorkspaceSwitcher>
      ) : (
        <div
          className={cn(
            "flex items-center gap-3",
            "px-3 py-2.5 rounded-xl",
            "bg-muted/30",
            "border border-border/30"
          )}
        >
          {/* Workspace Icon */}
          <div
            className={cn(
              "flex items-center justify-center",
              "w-9 h-9 rounded-lg",
              currentWorkspace.bgColor,
              "text-white shrink-0"
            )}
          >
            <WorkspaceIcon className="w-4 h-4" />
          </div>

          {/* Workspace Info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-sidebar-foreground truncate">
              {currentWorkspace.name}
            </div>
            {currentRole && (
              <div className="text-xs text-sidebar-foreground/60 truncate">
                {getRoleDisplayName(currentRole)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
