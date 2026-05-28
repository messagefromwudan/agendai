import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["admin", "director", "director_adjunct", "secretary"];
const PROFESSOR_ROLES = ["professor", "teacher"];

// Accessible by any authenticated user regardless of role
const SHARED_ROUTES = ["/setari", "/profil", "/mesaje"];

// Only students may access these
const STUDENT_ONLY_ROUTES = [
  "/dashboard", "/catalog", "/teme", "/orar", "/progres", "/tutore",
];

function homeForRole(role: string): string {
  if (ADMIN_ROLES.includes(role)) return "/admin";
  if (PROFESSOR_ROLES.includes(role)) return "/profesor";
  return "/dashboard";
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });
  const { pathname } = req.nextUrl;

  // Skip API routes and auth pages — they handle their own auth
  if (
    pathname.startsWith("/api/") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session token so auth cookies stay fresh
  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = pathname.startsWith("/admin");
  const isProfessorRoute = pathname.startsWith("/profesor");
  const isSharedRoute = SHARED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  const isStudentOnlyRoute = STUDENT_ONLY_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  // Not a protected route — let it through
  if (!isAdminRoute && !isProfessorRoute && !isSharedRoute && !isStudentOnlyRoute) {
    return res;
  }

  // Unauthenticated — send to login
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Shared routes are accessible by any authenticated user — no role check needed
  if (isSharedRoute) {
    return res;
  }

  // Fetch role to enforce per-route access
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";
  const home = homeForRole(role);

  if (isAdminRoute && !ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL(home, req.url));
  }
  if (isProfessorRoute && !PROFESSOR_ROLES.includes(role)) {
    return NextResponse.redirect(new URL(home, req.url));
  }
  if (isStudentOnlyRoute && (ADMIN_ROLES.includes(role) || PROFESSOR_ROLES.includes(role))) {
    return NextResponse.redirect(new URL(home, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
