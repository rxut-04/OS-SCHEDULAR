"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Search as SearchIcon,
  Dashboard,
  Task,
  Folder,
  Calendar as CalendarIcon,
  UserMultiple,
  Analytics,
  DocumentAdd,
  Settings as SettingsIcon,
  User as UserIcon,
  ChevronDown as ChevronDownIcon,
  AddLarge,
  Filter,
  Time,
  InProgress,
  CheckmarkOutline,
  Flag,
  Archive,
  View,
  Report,
  StarFilled,
  Group,
  ChartBar,
  FolderOpen,
  Share,
  CloudUpload,
  Security,
  Notification,
  Integration,
  Code,
  DataClass,
  VirtualMachine,
  Result,
  Education,
  Logout,
} from "@carbon/icons-react";
import { createClient } from "@/lib/supabase/client";

/** ======================= Local SVG paths (inline) ======================= */
// Kept original paths for the logo/brand components
const svgPaths = {
  p36880f80:
    "M0.32 0C0.20799 0 0.151984 0 0.109202 0.0217987C0.0715695 0.0409734 0.0409734 0.0715695 0.0217987 0.109202C0 0.151984 0 0.20799 0 0.32V6.68C0 6.79201 0 6.84801 0.0217987 6.8908C0.0409734 6.92843 0.0715695 6.95902 0.109202 6.9782C0.151984 7 0.207989 7 0.32 7L3.68 7C3.79201 7 3.84802 7 3.8908 6.9782C3.92843 6.95903 3.95903 6.92843 3.9782 6.8908C4 6.84801 4 6.79201 4 6.68V4.32C4 4.20799 4 4.15198 4.0218 4.1092C4.04097 4.07157 4.07157 4.04097 4.1092 4.0218C4.15198 4 4.20799 4 4.32 4L19.68 4C19.792 4 19.848 4 19.8908 4.0218C19.9284 4.04097 19.959 4.07157 19.9782 4.1092C20 4.15198 20 4.20799 20 4.32V6.68C20 6.79201 20 6.84802 20.0218 6.8908C20.041 6.92843 20.0716 6.95903 20.1092 6.9782C20.152 7 20.208 7 20.32 7L23.68 7C23.792 7 23.848 7 23.8908 6.9782C23.9284 6.95903 23.959 6.92843 23.9782 6.8908C24 6.84802 24 6.79201 24 6.68V0.32C24 0.20799 24 0.151984 23.9782 0.109202C23.959 0.0715695 23.9284 0.0409734 23.8908 0.0217987C23.848 0 23.792 0 23.68 0H0.32Z",
  p355df480:
    "M0.32 16C0.20799 16 0.151984 16 0.109202 15.9782C0.0715695 15.959 0.0409734 15.9284 0.0217987 15.8908C0 15.848 0 15.792 0 15.68V9.32C0 9.20799 0 9.15198 0.0217987 9.1092C0.0409734 9.07157 0.0715695 9.04097 0.109202 9.0218C0.151984 9 0.207989 9 0.32 9H3.68C3.79201 9 3.84802 9 3.8908 9.0218C3.92843 9.04097 3.95903 9.07157 3.9782 9.1092C4 9.15198 4 9.20799 4 9.32V11.68C4 11.792 4 11.848 4.0218 11.8908C4.04097 11.9284 4.07157 11.959 4.1092 11.9782C4.15198 12 4.20799 12 4.32 12L19.68 12C19.792 12 19.848 12 19.8908 11.9782C19.9284 11.959 19.959 11.9284 19.9782 11.8908C20 11.848 20 11.792 20 11.68V9.32C20 9.20799 20 9.15199 20.0218 9.1092C20.041 9.07157 20.0716 9.04098 20.1092 9.0218C20.152 9 20.208 9 20.32 9H23.68C23.792 9 23.848 9 23.8908 9.0218C23.9284 9.04098 23.959 9.07157 23.9782 9.1092C24 9.15199 24 9.20799 24 9.32V15.68C24 15.792 24 15.848 23.9782 15.8908C23.959 15.9284 23.9284 15.959 23.8908 15.9782C23.848 16 23.792 16 23.68 16H0.32Z",
  pfa0d600:
    "M6.32 10C6.20799 10 6.15198 10 6.1092 9.9782C6.07157 9.95903 6.04097 9.92843 6.0218 9.8908C6 9.84802 6 9.79201 6 9.68C6 9.56799 6 9.51198 6.0218 9.4692C6.04097 9.43157 6.07157 9.40097 6.1092 9.3818C6.15198 9.36 6.20799 9.36 6.32 9.36L17.68 9.36C17.792 9.36 17.848 9.36 17.8908 9.3818C17.9284 9.40097 17.959 9.43157 17.9782 9.4692C18 9.51198 18 9.56799 18 9.68V6.32C18 6.20799 18 6.15198 17.9782 6.1092C17.959 6.07157 17.9284 6.04097 17.8908 6.0218C17.848 6 17.792 6 17.68 6H6.32C6.20799 6 6.15198 6 6.1092 6.0218C6.04097 6.07157 6.07157 6.10217 6.0218 6.14097C6 6.18376 6 6.23976 6 6.35175V9.68Z", // Approximate fix for the path provided
};

/** ======================================================================= */

// Softer spring animation curve
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

/* ----------------------------- Brand / Logos ----------------------------- */

function InterfacesLogoSquare() {
  return (
     <Image 
        src="https://cdn-icons-png.flaticon.com/512/12460/12460828.png" 
        alt="AlgoViz OS Logo" 
        width={32} 
        height={32} 
        className="w-8 h-8 rounded-lg"
      />
  );
}

function BrandBadge() {
  return (
    <div className="relative shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity">
      <a href="/" className="flex items-center p-1 w-full text-inherit no-underline">
        <div className="h-10 w-8 flex items-center justify-center pl-2">
          <InterfacesLogoSquare />
        </div>
        <div className="px-2 py-1">
          <div className="font-semibold text-[16px]" style={{ color: 'var(--alg-primary)' }}>
            AlgoLogic
          </div>
        </div>
      </a>
    </div>
  );
}

/* --------------------------------- Avatar -------------------------------- */

function AvatarCircle() {
  return (
    <div className="relative rounded-full shrink-0 size-8 flex items-center justify-center" style={{ background: 'var(--alg-secondary)' }}>
      <div className="font-bold text-xs text-white">U</div>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border pointer-events-none"
        style={{ borderColor: 'var(--border-color)' }}
      />
    </div>
  );
}

/* ------------------------------ Search Input ----------------------------- */

function SearchContainer({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`h-10 relative rounded-lg flex items-center transition-all duration-500 ${
          isCollapsed ? "w-10 min-w-10 justify-center" : "w-full"
        }`}
        style={{ transitionTimingFunction: softSpringEasing, background: 'var(--alg-bg)', border: '1px solid var(--border-color)' }}
      >
        <div
          className={`flex items-center justify-center shrink-0 transition-all duration-500 ${
            isCollapsed ? "p-1" : "px-1"
          }`}
          style={{ transitionTimingFunction: softSpringEasing, color: 'var(--alg-primary)' }}
        >
          <div className="size-8 flex items-center justify-center">
            <SearchIcon size={16} />
          </div>
        </div>

        <div
          className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="flex flex-col justify-center size-full">
            <div className="flex flex-col gap-2 items-start justify-center pr-2 py-1 w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[14px] leading-[20px]"
                style={{ color: 'var(--alg-text)' }}
                tabIndex={isCollapsed ? -1 : 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Types / Content Map -------------------------- */

interface MenuItemT {
  icon?: React.ReactNode;
  label: string;
  hasDropdown?: boolean;
  isActive?: boolean;
  children?: MenuItemT[];
  href?: string;
}
interface MenuSectionT {
  title: string;
  items: MenuItemT[];
}
interface SidebarContent {
  title: string;
  sections: MenuSectionT[];
}

function getSidebarContent(activeSection: string): SidebarContent {
  const contentMap: Record<string, SidebarContent> = {
    dashboard: {
      title: "Dashboard",
      sections: [
        {
          title: "Overview",
          items: [
            { icon: <View size={16} className="text-[var(--alg-text)]" />, label: "Main Dashboard", isActive: true, href: "/dashboard" },
            { icon: <Activity size={16} className="text-[var(--alg-text)]" />, label: "Learning Stats", href: "/dashboard/progress" },
          ],
        },
        {
          title: "Quick Access",
          items: [
             { icon: <Education size={16} className="text-[var(--alg-text)]" />, label: "Modules", href: "/modules" },
             { icon: <Task size={16} className="text-[var(--alg-text)]" />, label: "Daily Quiz", href: "/dashboard/quiz" },
          ]
        }
      ],
    },

    algorithms: {
      title: "Algorithms",
      sections: [
        {
          title: "Process Management",
          items: [
            { icon: <Code size={16} className="text-[var(--alg-text)]" />, label: "CPU Scheduling", href: "/cpu-scheduling" },
            { icon: <Task size={16} className="text-[var(--alg-text)]" />, label: "Multithreading", href: "/multithreading" },
            { icon: <DataClass size={16} className="text-[var(--alg-text)]" />, label: "Scheduling Queues", href: "/scheduling-queues" },
          ],
        },
        {
          title: "Memory",
          items: [
            { icon: <VirtualMachine size={16} className="text-[var(--alg-text)]" />, label: "Memory Mgmt", href: "/memory-management" },
            { icon: <Result size={16} className="text-[var(--alg-text)]" />, label: "Page Replacement", href: "/page-replacement" },
            { icon: <FolderOpen size={16} className="text-[var(--alg-text)]" />, label: "Contiguous Memory", href: "/contiguous-memory" },
          ],
        },
        {
          title: "Storage",
          items: [
            { icon: <Folder size={16} className="text-[var(--alg-text)]" />, label: "Disk Scheduling", href: "/disk-scheduling" },
            { icon: <Folder size={16} className="text-[var(--alg-text)]" />, label: "File Allocation", href: "/file-allocation" },
          ],
        },
      ],
    },

    quiz: {
      title: "Quiz & Practice",
      sections: [
        {
          title: "Quizzes",
          items: [
            { icon: <Task size={16} className="text-[var(--alg-text)]" />, label: "Daily Quiz", href: "/dashboard/quiz" },
            { icon: <Result size={16} className="text-[var(--alg-text)]" />, label: "Past Results" },
          ],
        },
      ],
    },

    progress: {
      title: "Progress",
      sections: [
        {
          title: "Stats",
          items: [
            { icon: <Analytics size={16} className="text-[var(--alg-text)]" />, label: "My Progress", href: "/dashboard/progress" },
            { icon: <StarFilled size={16} className="text-[var(--alg-text)]" />, label: "Achievements" },
          ],
        },
      ],
    },
    
    settings: {
      title: "Settings",
      sections: [
        {
          title: "Account",
          items: [
            { icon: <UserIcon size={16} className="text-[var(--alg-text)]" />, label: "Profile" },
            { icon: <Security size={16} className="text-[var(--alg-text)]" />, label: "Security" },
          ],
        },
      ],
    },
  };

  // Activity icon component helper (locally defined since we don't have lucide here)
  function Activity(props: any) {
      return <ChartBar {...props} />
  }

  return contentMap[activeSection] || contentMap.dashboard;
}

/* ---------------------------- Left Icon Nav Rail -------------------------- */

function IconNavButton({
  children,
  isActive = false,
  onClick,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="flex items-center justify-center rounded-lg size-10 min-w-10 transition-colors duration-500"
      style={{
        transitionTimingFunction: softSpringEasing,
        ...(isActive ? { background: 'var(--alg-mint)', color: 'var(--alg-primary)' } : { color: 'var(--text-secondary)' }),
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function IconNavigation({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const navItems = [
    { id: "dashboard", icon: <Dashboard size={16} />, label: "Dashboard" },
    { id: "algorithms", icon: <Code size={16} />, label: "Algorithms" },
    { id: "quiz", icon: <Task size={16} />, label: "Quiz" },
    { id: "progress", icon: <Analytics size={16} />, label: "Progress" },
  ];

  return (
    <aside className="flex flex-col gap-2 items-center p-4 w-16 h-full border-r rounded-l-2xl z-50" style={{ background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}>
      {/* Logo */}
      <div className="mb-2 size-10 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
        <a href="/" className="size-7 flex items-center justify-center">
          <InterfacesLogoSquare />
        </a>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-2 w-full items-center">
        {navItems.map((item) => (
          <IconNavButton
            key={item.id}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          >
            {item.icon}
          </IconNavButton>
        ))}
      </div>

      <div className="flex-1" />

      {/* Bottom section */}
      <div className="flex flex-col gap-2 w-full items-center">
        <IconNavButton isActive={activeSection === "settings"} onClick={() => onSectionChange("settings")}>
          <SettingsIcon size={16} />
        </IconNavButton>
        <div className="size-8">
          <AvatarCircle />
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------ Right Sidebar ----------------------------- */

function SectionTitle({
  title,
  onToggleCollapse,
  isCollapsed,
}: {
  title: string;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}) {
  if (isCollapsed) {
    return (
      <div className="w-full flex justify-center transition-all duration-500" style={{ transitionTimingFunction: softSpringEasing }}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center justify-center rounded-lg size-10 min-w-10 transition-all duration-500 hover:bg-[var(--alg-mint)]"
          style={{ color: 'var(--text-secondary)', transitionTimingFunction: softSpringEasing }}
          aria-label="Expand sidebar"
        >
          <span className="inline-block rotate-180">
            <ChevronDownIcon size={16} />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden transition-all duration-500" style={{ transitionTimingFunction: softSpringEasing }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center h-10">
          <div className="px-2 py-1">
            <div className="font-semibold text-[18px] leading-[27px]" style={{ color: 'var(--alg-text)' }}>
              {title}
            </div>
          </div>
        </div>
        <div className="pr-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center justify-center rounded-lg size-10 min-w-10 transition-all duration-500 hover:bg-[var(--alg-mint)]"
          style={{ color: 'var(--text-secondary)', transitionTimingFunction: softSpringEasing }}
            aria-label="Collapse sidebar"
          >
            <ChevronDownIcon size={16} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSidebar({ activeSection }: { activeSection: string }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const content = getSidebarContent(activeSection);
  const router = useRouter();

  const toggleExpanded = (itemKey: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const toggleCollapse = () => setIsCollapsed((s) => !s);

  return (
    <aside
      className={`flex flex-col gap-4 items-start p-4 rounded-r-2xl transition-all duration-500 h-full border-r ${
        isCollapsed ? "w-16 min-w-16 !px-0 justify-center" : "w-64"
      }`}
      style={{ transitionTimingFunction: softSpringEasing, background: 'var(--alg-white)', borderColor: 'var(--border-color)' }}
    >
      {!isCollapsed && <BrandBadge />}

      <SectionTitle title={content.title} onToggleCollapse={toggleCollapse} isCollapsed={isCollapsed} />
      <SearchContainer isCollapsed={isCollapsed} />

      <div
        className={`flex flex-col w-full overflow-y-auto transition-all duration-500 ${
          isCollapsed ? "gap-2 items-center" : "gap-4 items-start"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        {content.sections.map((section, index) => (
          <MenuSection
            key={`${activeSection}-${index}`}
            section={section}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
            isCollapsed={isCollapsed}
            router={router}
          />
        ))}
      </div>

      <div className="w-full mt-auto pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        {isCollapsed ? (
          <button
            type="button"
            onClick={async () => {
              const supabase = createClient();
              if (supabase) await supabase.auth.signOut();
              router.push("/");
            }}
            className="w-full flex items-center justify-center size-10 rounded-lg transition-colors hover:bg-[var(--alg-mint)]"
            style={{ color: 'var(--alg-text)' }}
            title="Logout"
            aria-label="Logout"
          >
            <Logout size={20} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 px-2 py-2">
              <AvatarCircle />
              <div className="text-[14px]" style={{ color: 'var(--alg-text)' }}>User</div>
              <button
                type="button"
                className="ml-auto size-8 rounded-md flex items-center justify-center hover:bg-[var(--alg-mint)]"
                aria-label="More"
              >
                <svg className="size-4" viewBox="0 0 16 16" fill="none" style={{ fill: 'var(--alg-text)' }}>
                  <circle cx="4" cy="8" r="1" />
                  <circle cx="8" cy="8" r="1" />
                  <circle cx="12" cy="8" r="1" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                if (supabase) await supabase.auth.signOut();
                router.push("/");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors hover:bg-[var(--alg-mint)]"
              style={{ color: 'var(--alg-text)' }}
            >
              <Logout size={18} />
              Logout
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------ Menu Elements ---------------------------- */

function MenuItem({
  item,
  isExpanded,
  onToggle,
  onItemClick,
  isCollapsed,
}: {
  item: MenuItemT;
  isExpanded?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
  isCollapsed?: boolean;
}) {
  const handleClick = () => {
    if (item.hasDropdown && onToggle) onToggle();
    else onItemClick?.();
  };

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`rounded-lg cursor-pointer transition-all duration-500 flex items-center relative ${
          item.isActive ? "" : ""
        } ${isCollapsed ? "w-10 min-w-10 h-10 justify-center p-4" : "w-full h-10 px-4 py-2"}`}
        style={{ ...(item.isActive ? { background: 'var(--alg-mint)', color: 'var(--alg-primary)' } : {}) }}
        style={{ transitionTimingFunction: softSpringEasing }}
        onClick={handleClick}
        title={isCollapsed ? item.label : undefined}
      >
        <div className="flex items-center justify-center shrink-0">{item.icon}</div>

        <div
          className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-3"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="text-[14px] leading-[20px] truncate" style={{ color: 'var(--alg-text)' }}>
            {item.label}
          </div>
        </div>

        {item.hasDropdown && (
          <div
            className={`flex items-center justify-center shrink-0 transition-opacity duration-500 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-2"
            }`}
            style={{ transitionTimingFunction: softSpringEasing }}
          >
            <ChevronDownIcon
              size={16}
              className="transition-transform duration-500"
              style={{ color: 'var(--alg-text)' }}
              style={{
                transitionTimingFunction: softSpringEasing,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SubMenuItem({ item, onItemClick }: { item: MenuItemT; onItemClick?: () => void }) {
  return (
    <div className="w-full pl-9 pr-1 py-[1px]">
      <div
        className="h-10 w-full rounded-lg cursor-pointer transition-colors hover:bg-[var(--alg-mint)] flex items-center px-3 py-1"
        onClick={onItemClick}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[14px] leading-[18px] truncate" style={{ color: 'var(--text-secondary)' }}>
            {item.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuSection({
  section,
  expandedItems,
  onToggleExpanded,
  isCollapsed,
  router,
}: {
  section: MenuSectionT;
  expandedItems: Set<string>;
  onToggleExpanded: (itemKey: string) => void;
  isCollapsed?: boolean;
  router: any;
}) {
  return (
    <div className="flex flex-col w-full">
      <div
        className={`relative shrink-0 w-full transition-all duration-500 overflow-hidden ${
          isCollapsed ? "h-0 opacity-0" : "h-10 opacity-100"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div className="flex items-center h-10 px-4">
          <div className="text-[12px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {section.title}
          </div>
        </div>
      </div>

      {section.items.map((item, index) => {
        const itemKey = `${section.title}-${index}`;
        const isExpanded = expandedItems.has(itemKey);
        return (
          <div key={itemKey} className="w-full flex flex-col">
            <MenuItem
              item={item}
              isExpanded={isExpanded}
              onToggle={() => onToggleExpanded(itemKey)}
              onItemClick={() => {
                  if (item.href) router.push(item.href);
              }}
              isCollapsed={isCollapsed}
            />
            {isExpanded && item.children && !isCollapsed && (
              <div className="flex flex-col gap-1 mb-2">
                {item.children.map((child, childIndex) => (
                  <SubMenuItem
                    key={`${itemKey}-${childIndex}`}
                    item={child}
                    onItemClick={() => {
                         if (child.href) router.push(child.href);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Layout -------------------------------- */

export function TwoLevelSidebar() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="flex flex-row h-full">
      <IconNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      <DetailSidebar activeSection={activeSection} />
    </div>
  );
}

export default TwoLevelSidebar;
