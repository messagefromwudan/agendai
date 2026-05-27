import Link from "next/link";
import {
  Brain,
  Home,
  GraduationCap,
  BookOpen,
  Backpack,
  Calendar,
  MessageSquare,
  User,
  Settings,
} from "lucide-react";
import { useRouter } from "next/router";

const MAIN_NAV = [
  { label: "Acasă", icon: Home, href: "/profesor" },
  { label: "Clasele mele", icon: GraduationCap, href: "/profesor/clasele-mele" },
  { label: "Catalog", icon: BookOpen, href: "/profesor/catalog" },
  { label: "Teme", icon: Backpack, href: "/profesor/teme" },
  { label: "Orar", icon: Calendar, href: "/profesor/orar" },
  { label: "Mesaje", icon: MessageSquare, href: "/profesor/mesaje" },
  { label: "Profil", icon: User, href: "/profil" },
];

interface Props {
  fullName: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function ProfesorSidebar({ fullName }: Props) {
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/profesor") return router.pathname === "/profesor";
    if (href === "/profesor/clasele-mele")
      return (
        router.pathname === "/profesor/clasele-mele" ||
        router.pathname.startsWith("/profesor/clasa")
      );
    return router.pathname === href || router.pathname.startsWith(href + "/");
  }

  const initials = fullName ? getInitials(fullName) : "?";

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#164B2E] rounded-2xl p-2 shrink-0">
            <Brain className="text-white" size={22} />
          </div>
          <span className="font-heading text-lg font-bold text-gray-900 dark:text-white">
            AgendAI
          </span>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 pl-[44px] leading-tight">
          Centru inteligent de învățare
        </p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {MAIN_NAV.map(({ label, icon: Icon, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-[#164B2E] text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 space-y-0.5 shrink-0">
        <Link
          href="/setari"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
        >
          <Settings size={17} />
          Setări
        </Link>
      </div>

      {/* Profile footer */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#164B2E] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {fullName || "—"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Profesor</p>
        </div>
      </div>
    </aside>
  );
}
