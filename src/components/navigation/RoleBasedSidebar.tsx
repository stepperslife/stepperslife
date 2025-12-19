"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { NavItem } from "./NavItem";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { MobileWorkspaceBar } from "./MobileWorkspaceBar";
import { getNavigationForRole } from "@/lib/navigation/config";
import { AllRoles, NavUser } from "@/lib/navigation/types";
import {
  isNavItemActive,
  hasActiveSubmenu,
} from "@/lib/navigation/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface RoleBasedSidebarProps {
  user: NavUser;
  activeRole?: AllRoles;
  onRoleSwitch?: (role: AllRoles) => void;
}

export function RoleBasedSidebar({
  user,
  activeRole,
}: RoleBasedSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { setUser, currentRole: contextRole } = useWorkspace();

  // Sync user with workspace context
  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  // Use role from context if available, otherwise fall back to props
  const currentRole = contextRole || activeRole || user.role;
  const navigation = getNavigationForRole(currentRole);

  if (!navigation) {
    console.error(`No navigation found for role: ${currentRole}`);
    return null;
  }

  return (
    <>
      <Sidebar collapsible="icon">
        {/* Header with Workspace Switcher */}
        <SidebarHeader className="border-b border-sidebar-border">
          <WorkspaceHeader isCollapsed={isCollapsed} />
        </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent>
        <div className="space-y-6 py-4">
          {navigation.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1">
              {/* Section Title */}
              {section.title && !isCollapsed && (
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}

              {/* Section Items */}
              <SidebarMenu>
                {section.items.map((item, itemIndex) => {
                  const itemIsActive = isNavItemActive(item.href, pathname);
                  const itemHasActiveSubmenu = hasActiveSubmenu(item.submenu, pathname);

                  return (
                    <SidebarMenuItem key={itemIndex}>
                      <NavItem
                        item={item}
                        isCollapsed={isCollapsed}
                        isActive={itemIsActive}
                        hasActiveSubmenu={itemHasActiveSubmenu}
                      />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>

              {/* Separator between sections */}
              {sectionIndex < navigation.sections.length - 1 && !isCollapsed && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </SidebarContent>

      {/* Footer Items (Logout, etc.) */}
      {navigation.footerItems && navigation.footerItems.length > 0 && (
        <SidebarFooter className="border-t border-sidebar-border">
          <div className="py-2">
            <SidebarMenu>
              {navigation.footerItems.map((item, index) => {
                const itemIsActive = isNavItemActive(item.href, pathname);

                return (
                  <SidebarMenuItem key={index}>
                    <NavItem
                      item={item}
                      isCollapsed={isCollapsed}
                      isActive={itemIsActive}
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>

      {/* Mobile Workspace Bar - Fixed at bottom on mobile */}
      <MobileWorkspaceBar />
    </>
  );
}
