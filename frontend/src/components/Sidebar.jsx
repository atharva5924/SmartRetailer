import { useState } from "react";
import {
  LayoutDashboard,
  Network,
  CircleDot,
  Briefcase,
  FileText,
  ChevronDown,
  ChevronRight,
  Zap,
  CheckCircle,
  Ban,
  XCircle,
  FileCheck,
  FilePlus,
} from "lucide-react";
import { cn } from "../libs/utils";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: "nexus",
    label: "Nexus",
    icon: <Network className="w-5 h-5" />,
  },
  {
    id: "intake",
    label: "Intake",
    icon: <CircleDot className="w-5 h-5" />,
  },
  {
    id: "services",
    label: "Services",
    icon: <Briefcase className="w-5 h-5" />,
    children: [
      {
        id: "pre-active",
        label: "Pre-active",
        icon: <Zap className="w-4 h-4" />,
      },
      {
        id: "active",
        label: "Active",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      { id: "blocked", label: "Blocked", icon: <Ban className="w-4 h-4" /> },
      { id: "closed", label: "Closed", icon: <XCircle className="w-4 h-4" /> },
    ],
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: <FileText className="w-5 h-5" />,
    children: [
      {
        id: "proforma",
        label: "Proforma Invoices",
        icon: <FilePlus className="w-4 h-4" />,
      },
      {
        id: "final",
        label: "Final Invoices",
        icon: <FileCheck className="w-4 h-4" />,
      },
    ],
  },
];

export function Sidebar() {
  const [expandedItems, setExpandedItems] = useState(["services", "invoices"]);
  const [activeItem, setActiveItem] = useState("dashboard");

  const toggleExpand = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderMenuItem = (item, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeItem === item.id;

    return (
      <div key={item.id}>
        <div
          className={cn(
            "sidebar-item sidebar-item-hover text-sidebar-foreground/80",
            isChild && "pl-10",
            isActive && "sidebar-item-active text-white"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else {
              setActiveItem(item.id);
            }
          }}
        >
          <span
            className={cn(
              isActive ? "text-white" : "text-sidebar-foreground/70"
            )}
          >
            {item.icon}
          </span>
          <span className="flex-1">{item.label}</span>
          {hasChildren && (
            <span className="text-sidebar-foreground/50">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 animate-fade-in">
            {item.children?.map((child) => renderMenuItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-muted">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sidebar-foreground">Vault</h2>
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/50" />
            </div>
            <p className="text-xs text-sidebar-foreground/60">Anurag Yadav</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
    </aside>
  );
}
