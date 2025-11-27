"use client";

import { usePathname } from "next/navigation";
import { NavItem } from "./NavItem";
import { RoleSwitcher } from "./RoleSwitcher";
import { getNavigationForRole } from "@/lib/navigation/config";
import { AllRoles, NavUser } from "@/lib/navigation/types";
import {
  isNavItemActive,
  hasActiveSubmenu,
  generateUserInitials,
} from "@/lib/navigation/utils";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface RoleBasedSidebarProps {
  user: NavUser;
  activeRole?: AllRoles;
  onRoleSwitch?: (role: AllRoles) => void;
}

export function RoleBasedSidebar({
  user,
  activeRole,
  onRoleSwitch,
}: RoleBasedSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Determine which role's navigation to show
  const currentRole = activeRole || user.role;
  const navigation = getNavigationForRole(currentRole);

  if (!navigation) {
    console.error(`No navigation found for role: ${currentRole}`);
    return null;
  }

  const userInitials = user.initials || generateUserInitials(user.name, user.email);

  return (
    <Sidebar collapsible="icon">
      {/* Header with User Info */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className={cn("shrink-0", isCollapsed ? "w-8 h-8" : "w-10 h-10")}>
            <AvatarImage src={user.avatar} alt={user.name || user.email} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sidebar-foreground truncate">
                  {navigation.dashboardTitle}
                </h2>
              </div>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {navigation.roleDescription}
              </p>
              {user.name && (
                <p className="text-xs text-sidebar-foreground/80 truncate mt-0.5">
                  {user.name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Role Switcher - only shown when user has multiple roles */}
        {!isCollapsed && (
          <div className="px-4 pb-3">
            <RoleSwitcher user={user} activeRole={currentRole} />
          </div>
        )}
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
  );
}
