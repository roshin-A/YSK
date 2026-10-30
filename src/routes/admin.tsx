import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Layers,
  ShoppingCart,
  BarChart3,
  FileSpreadsheet,
  History,
  Settings,
  LogOut,
  Search,
  Filter,
  Upload,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  Lock,
  Shield,
  User,
  Image as ImageIcon,
  X,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  Loader2,
  Menu,
  Phone,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — YSK 4X4 Parts & Equipment" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRouteComponent,
});

/* ─── Main Admin Route Component ─── */
function AdminRouteComponent() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  // Check existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setAuthLoading(true);
      const res = await fetch("/api/admin/session", {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setAdminUser(data.username);
      } else {
        setIsAuthenticated(false);
        setAdminUser(null);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSuccess = (username: string) => {
    setIsAuthenticated(true);
    setAdminUser(username);
    toast.success("Welcome back!", {
      description: `Signed in as ${username}`,
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setIsAuthenticated(false);
    setAdminUser(null);
    toast.info("Logged out successfully");
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Verifying Admin Authorization…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboardLayout adminUser={adminUser} onLogout={handleLogout} />;
}

/* ══════════════════════════════════════════════════════════════════════
   1. SECURE ADMIN LOGIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
function AdminLoginPage({
  onLoginSuccess,
}: {
  onLoginSuccess: (username: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!username.trim() || !password) {
      setErrorMsg("Please enter both username and password");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid username or password");
      }

      onLoginSuccess(data.username || username);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-950 px-4 py-12 text-slate-100">
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md transition-colors hover:border-slate-600 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Store
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-xl shadow-amber-500/20 text-slate-950 font-bold">
            <Shield className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white font-display">
            YSK 4X4 Admin Portal
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Sign in with administrative credentials to access management controls
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Administrator Username
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 text-[11px] text-slate-400">
              Default credentials: <span className="font-mono text-amber-400">admin</span> /{" "}
              <span className="font-mono text-amber-400">YSK@admin2024</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Authenticate & Enter Dashboard
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Protected Administrative Area · Encrypted Session · YSK 4X4
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   2. DASHBOARD LAYOUT & NAVIGATION
   ══════════════════════════════════════════════════════════════════════ */
type NavTab =
  | "overview"
  | "products"
  | "add-product"
  | "categories"
  | "orders"
  | "analytics"
  | "excel"
  | "activity"
  | "settings";

function AdminDashboardLayout({
  adminUser,
  onLogout,
}: {
  adminUser: string | null;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Stats summary for header & badges
  const [stats, setStats] = useState<any>(null);
  const [syncingExcel, setSyncingExcel] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    try {
      setSyncingExcel(true);
      const res = await fetch("/api/admin/excel/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Excel Catalog Synchronized", {
          description: `Loaded ${data.count} products from products.xlsx`,
        });
        fetchStats();
      } else {
        toast.error("Sync failed", { description: data.error });
      }
    } catch (err: any) {
      toast.error("Sync Error", { description: err.message });
    } finally {
      setSyncingExcel(false);
    }
  };

  const navItems = [
    { id: "overview" as NavTab, label: "Overview", icon: LayoutDashboard },
    {
      id: "products" as NavTab,
      label: "Products",
      icon: Package,
      badge: stats?.products?.total,
    },
    { id: "add-product" as NavTab, label: "Add Product", icon: PlusCircle },
    { id: "categories" as NavTab, label: "Categories", icon: Layers },
    {
      id: "orders" as NavTab,
      label: "Orders",
      icon: ShoppingCart,
      badge: stats?.orders?.pending > 0 ? stats.orders.pending : undefined,
      badgeColor: "bg-amber-500 text-slate-950",
    },
    { id: "analytics" as NavTab, label: "Visitor Analytics", icon: BarChart3 },
    { id: "excel" as NavTab, label: "Excel Data", icon: FileSpreadsheet },
    { id: "activity" as NavTab, label: "Activity Log", icon: History },
    { id: "settings" as NavTab, label: "Admin Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* ─── SIDEBAR (Desktop & Mobile) ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold shadow-xs">
              <Shield className="size-5 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 font-display">
                YSK 4X4
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Admin Control
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                  if (item.id === "add-product") setEditingProductId(null);
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`size-4 transition-colors ${
                      isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.badgeColor || (isActive ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600")
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer & logout */}
        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 font-bold text-amber-800 text-xs">
                {(adminUser || "A")[0].toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                  {adminUser || "admin"}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">● Connected</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="size-3" />
            View Live Website
          </Link>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 capitalize">
                {activeTab.replace("-", " ")}
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                YSK 4X4 E-Commerce Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {stats?.lastExcelUpdate && (
              <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500 lg:inline-flex">
                <Clock className="size-3 text-slate-400" />
                Excel Synced: {new Date(stats.lastExcelUpdate).toLocaleTimeString()}
              </span>
            )}

            <button
              onClick={handleManualSync}
              disabled={syncingExcel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`size-3.5 ${syncingExcel ? "animate-spin text-amber-600" : ""}`} />
              <span className="hidden sm:inline">Sync Excel</span>
            </button>

            <button
              onClick={() => {
                setEditingProductId(null);
                setActiveTab("add-product");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all"
            >
              <PlusCircle className="size-3.5 text-amber-400" />
              <span>Add Product</span>
            </button>
          </div>
        </header>

        {/* Tab Page Contents */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === "overview" && (
            <OverviewSection
              stats={stats}
              onNavigate={(tab) => {
                setActiveTab(tab);
                if (tab === "add-product") setEditingProductId(null);
              }}
            />
          )}

          {activeTab === "products" && (
            <ProductsSection
              onEdit={(id) => {
                setEditingProductId(id);
                setActiveTab("add-product");
              }}
              onAddNew={() => {
                setEditingProductId(null);
                setActiveTab("add-product");
              }}
              onDataChanged={fetchStats}
            />
          )}

          {activeTab === "add-product" && (
            <ProductFormSection
              productId={editingProductId}
              onSaved={() => {
                setEditingProductId(null);
                setActiveTab("products");
                fetchStats();
              }}
              onCancel={() => {
                setEditingProductId(null);
                setActiveTab("products");
              }}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesSection
              onFilterCategory={() => {
                setActiveTab("products");
              }}
            />
          )}

          {activeTab === "orders" && <OrdersSection onDataChanged={fetchStats} />}

          {activeTab === "analytics" && <AnalyticsSection />}

          {activeTab === "excel" && <ExcelSection onSynced={fetchStats} />}

          {activeTab === "activity" && <ActivitySection />}

          {activeTab === "settings" && <SettingsSection adminUser={adminUser} />}
        </main>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   3. OVERVIEW SECTION (Real-Time Metrics & Charts)
   ══════════════════════════════════════════════════════════════════════ */
function OverviewSection({
  stats,
  onNavigate,
}: {
  stats: any;
  onNavigate: (tab: NavTab) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              Live Operations Dashboard
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight font-display">
              YSK 4X4 Store Management
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              All metrics update dynamically from customer store interactions and Excel database.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate("add-product")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/25 hover:bg-amber-400 transition-all"
            >
              <PlusCircle className="size-4" />
              Add New Product
            </button>
            <button
              onClick={() => onNavigate("orders")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <ShoppingCart className="size-4 text-amber-400" />
              Manage Orders
            </button>
            <button
              onClick={() => onNavigate("excel")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <FileSpreadsheet className="size-4 text-emerald-400" />
              Excel Synchronization
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Visitors Today */}
        <StatCard
          title="Visitors Today"
          value={stats?.visitors?.today ?? "0"}
          subtitle={`${stats?.visitors?.total ?? 0} total visitors`}
          icon={Users}
          color="bg-blue-50 text-blue-600 border-blue-100"
        />

        {/* Total Products */}
        <StatCard
          title="Products Catalog"
          value={stats?.products?.total ?? "0"}
          subtitle={`${stats?.products?.totalStock ?? 0} stock units available`}
          icon={Package}
          color="bg-amber-50 text-amber-600 border-amber-100"
        />

        {/* Orders Received */}
        <StatCard
          title="Orders Received"
          value={stats?.orders?.total ?? "0"}
          subtitle={`${stats?.orders?.pending ?? 0} pending fulfillment`}
          icon={ShoppingCart}
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
        />

        {/* Revenue / Units Sold */}
        <StatCard
          title="Total Products Sold"
          value={stats?.orders?.totalSold ?? "0"}
          subtitle={`Revenue: ${formatPrice(stats?.orders?.totalRevenue ?? 0)}`}
          icon={TrendingUp}
          color="bg-purple-50 text-purple-600 border-purple-100"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Monthly Visitors</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{stats?.visitors?.thisMonth ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Out of Stock</p>
          <p className="mt-1 text-xl font-bold text-rose-600">{stats?.products?.outOfStock ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Completed Orders</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">{stats?.orders?.delivered ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Categories</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{stats?.products?.categoriesCount ?? 0}</p>
        </div>
      </div>

      {/* Recent Activity & Timestamps */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Admin & Store Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <History className="size-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Latest Website Activity</h3>
            </div>
            <button
              onClick={() => onNavigate("activity")}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              View Full Audit Log →
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
              <p className="py-6 text-center text-xs text-slate-400">No activity logged yet</p>
            ) : (
              stats.recentActivity.slice(0, 5).map((act: any) => (
                <div key={act.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{act.action}</p>
                      <p className="text-[11px] text-slate-500">{act.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-500">
                      by {act.admin || "system"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Database & Sync Metadata Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-emerald-600" />
              Excel Data Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Target File:</span>
                <span className="font-mono font-semibold text-slate-900">products.xlsx</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Last Product Added:</span>
                <span className="font-semibold text-slate-800">
                  {stats?.lastProductAdded ? new Date(stats.lastProductAdded).toLocaleString() : "None"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Last Excel Update:</span>
                <span className="font-semibold text-slate-800">
                  {stats?.lastExcelUpdate ? new Date(stats.lastExcelUpdate).toLocaleString() : "Up to date"}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Sync Mode:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-Synchronized
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Order Breakdown</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-amber-50 p-2.5 text-amber-900 border border-amber-100">
                <span className="block text-[10px] uppercase font-bold text-amber-700">Pending</span>
                <span className="text-lg font-bold">{stats?.orders?.pending ?? 0}</span>
              </div>
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-900 border border-blue-100">
                <span className="block text-[10px] uppercase font-bold text-blue-700">Processing</span>
                <span className="text-lg font-bold">{stats?.orders?.processing ?? 0}</span>
              </div>
              <div className="rounded-lg bg-purple-50 p-2.5 text-purple-900 border border-purple-100">
                <span className="block text-[10px] uppercase font-bold text-purple-700">Shipped</span>
                <span className="text-lg font-bold">{stats?.orders?.shipped ?? 0}</span>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-900 border border-emerald-100">
                <span className="block text-[10px] uppercase font-bold text-emerald-700">Delivered</span>
                <span className="text-lg font-bold">{stats?.orders?.delivered ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className={`flex size-9 items-center justify-center rounded-xl border ${color}`}>
          <Icon className="size-4.5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 font-display">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   4. PRODUCT MANAGEMENT SECTION
   ══════════════════════════════════════════════════════════════════════ */
function ProductsSection({
  onEdit,
  onAddNew,
  onDataChanged,
}: {
  onEdit: (id: string) => void;
  onAddNew: () => void;
  onDataChanged: () => void;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.id && String(p.id).toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));

      const matchCat = categoryFilter === "all" || p.category === categoryFilter;

      let matchStock = true;
      if (stockFilter === "in") matchStock = Number(p.stock) > 0;
      else if (stockFilter === "out") matchStock = Number(p.stock) === 0;
      else if (stockFilter === "low") matchStock = Number(p.stock) > 0 && Number(p.stock) < 5;

      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" (${id})? This will also remove it from Excel.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted successfully");
        setProducts((prev) => prev.filter((p) => p.id !== id && p["Product ID"] !== id));
        onDataChanged();
      } else {
        toast.error(data.error || "Failed to delete product");
      }
    } catch (err: any) {
      toast.error("Delete Error", { description: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickStockUpdate = async (product: any, newStock: number) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
        );
        toast.success(`Stock updated for ${product.name}`);
        onDataChanged();
      }
    } catch {
      toast.error("Stock update failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Product Management</h2>
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {products.length} products synced with Excel
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all"
        >
          <PlusCircle className="size-4 text-amber-400" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Product ID, Name, Brand…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9.5 pr-4 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in">In Stock Only</option>
            <option value="low">Low Stock (&lt; 5)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Images</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-amber-500" />
                    <p className="mt-2 text-xs text-slate-400">Loading products from Excel…</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const stockNum = Number(p.stock) || 0;
                  const isOut = stockNum === 0;
                  const isLow = stockNum > 0 && stockNum < 5;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                      {/* Product Name & Brand */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {p.image ? (
                              <img
                                src={p.image.startsWith("/") ? p.image : `/images/products/${p.image}`}
                                alt={p.name}
                                className="size-full object-cover"
                                onError={(e) => {
                                  (e.target as any).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-slate-400">
                                <ImageIcon className="size-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[11px] text-slate-400">{p.brand || "YSK 4x4"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Product ID */}
                      <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-600">
                        {p.id}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 uppercase">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatPrice(p.price)}
                        {p.compareAt && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            {formatPrice(p.compareAt)}
                          </span>
                        )}
                      </td>

                      {/* Stock Quick-Adjust */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickStockUpdate(p, Math.max(0, stockNum - 1))}
                            className="size-6 rounded border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-100 text-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-slate-900">
                            {stockNum}
                          </span>
                          <button
                            onClick={() => handleQuickStockUpdate(p, stockNum + 1)}
                            className="size-6 rounded border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-100 text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Images Count */}
                      <td className="py-3 px-4 text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium">
                          <ImageIcon className="size-3 text-slate-400" />
                          {[p.image, p.image2, p.image3].filter(Boolean).length}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                            Low ({stockNum})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(p.id)}
                            title="Edit Product"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Edit className="size-4" />
                          </button>
                          <Link
                            to="/products/$slug"
                            params={{ slug: p.id }}
                            target="_blank"
                            title="Preview on Website"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deletingId === p.id}
                            title="Delete Product"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          >
                            {deletingId === p.id ? (
                              <Loader2 className="size-4 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   5. ADD / EDIT PRODUCT FORM WITH MULTI-IMAGE UPLOAD
   ══════════════════════════════════════════════════════════════════════ */
function ProductFormSection({
  productId,
  onSaved,
  onCancel,
}: {
  productId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(productId);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [form, setForm] = useState({
    id: "",
    name: "",
    brand: "YSK 4x4",
    category: "suspension",
    price: "",
    compareAt: "",
    stock: "10",
    offer: "",
    fits: "Wrangler, Jimny, Thar",
    description: "",
    isNew: false,
    bestSeller: false,
  });

  // Multiple product images preview array
  const [images, setImages] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setAvailableCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // If editing, load product details
  useEffect(() => {
    if (!productId) {
      // Suggest automatic ID for new product
      fetch("/api/admin/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            let maxNum = 0;
            data.products.forEach((p: any) => {
              const m = String(p.id || "").match(/YSK(\d+)/i);
              if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
            });
            setForm((prev) => ({
              ...prev,
              id: `YSK${String(maxNum + 1).padStart(3, "0")}`,
            }));
          }
        })
        .catch(() => {});
      return;
    }

    const loadProduct = async () => {
      try {
        setFetching(true);
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        const found = data.products?.find((p: any) => p.id === productId || p["Product ID"] === productId);
        if (found) {
          setForm({
            id: found.id || productId,
            name: found.name || "",
            brand: found.brand || "YSK 4x4",
            category: found.category || "suspension",
            price: String(found.price || "0"),
            compareAt: found.compareAt ? String(found.compareAt) : "",
            stock: String(found.stock !== undefined ? found.stock : "10"),
            offer: found.offer || "",
            fits: found.fits || "Wrangler, Jimny, Thar",
            description: found.description || "",
            isNew: found.isNew === true || found.isNew === "TRUE",
            bestSeller: found.bestSeller === true || found.bestSeller === "TRUE",
          });

          const existingImages = [found.image, found.image2, found.image3].filter(Boolean) as string[];
          setImages(existingImages);
        }
      } catch {
        toast.error("Failed to load product details");
      } finally {
        setFetching(false);
      }
    };

    loadProduct();
  }, [productId]);

  // Handle image files selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not a valid image file`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 10MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    try {
      setLoading(true);
      const url = "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        compareAt: form.compareAt ? parseFloat(form.compareAt) : undefined,
        stock: parseInt(form.stock, 10) || 0,
        images, // base64 array + existing paths
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product");
      }

      toast.success(isEdit ? "Product Updated Successfully!" : "New Product Added!", {
        description: `Saved to products.xlsx and synced with live store`,
      });
      onSaved();
    } catch (err: any) {
      toast.error("Save Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 font-display">
            {isEdit ? `Edit Product: ${form.name}` : "Add New Product"}
          </h2>
          <p className="text-xs text-slate-500">
            Product details and uploaded images will be saved directly into{" "}
            <span className="font-mono font-semibold text-slate-700">products.xlsx</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Information Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">General Information</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Product Name *
              </label>
              <input
                required
                placeholder="e.g. Heavy Duty Front Winch Bumper"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Product ID *
              </label>
              <input
                required
                disabled={isEdit}
                placeholder="YSK001"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 font-mono text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:outline-none"
              >
                {availableCategories.length > 0 ? (
                  availableCategories.map((c: any) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="suspension">Suspension</option>
                    <option value="armor">Armor</option>
                    <option value="wheels">Wheels</option>
                    <option value="lighting">Lighting</option>
                    <option value="recovery">Recovery</option>
                    <option value="drivetrain">Drivetrain</option>
                    <option value="accessories">Accessories</option>
                  </>
                )}
                {!availableCategories.some((c: any) => c.slug === form.category) && form.category && (
                  <option value={form.category}>{form.category}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Brand
              </label>
              <input
                placeholder="YSK 4x4"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Fitment / Models
              </label>
              <input
                placeholder="Wrangler JL, Thar, Jimny"
                value={form.fits}
                onChange={(e) => setForm({ ...form, fits: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the product features, engineering details, and durability specifications…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Pricing & Stock Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Pricing & Inventory</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Selling Price ($) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="899"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Compare At Price ($)
              </label>
              <input
                type="number"
                step="any"
                placeholder="1099"
                value={form.compareAt}
                onChange={(e) => setForm({ ...form, compareAt: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min={0}
                placeholder="15"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Offer Tag
              </label>
              <input
                placeholder="15% OFF"
                value={form.offer}
                onChange={(e) => setForm({ ...form, offer: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                className="size-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              Mark as New Arrival
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.bestSeller}
                onChange={(e) => setForm({ ...form, bestSeller: e.target.checked })}
                className="size-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              Mark as Best Seller
            </label>
          </div>
        </div>

        {/* Multiple Product Images Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multiple Product Images</h3>
              <p className="text-xs text-slate-500">
                Upload 2, 3 or more images. Images will be saved to server uploads and referenced in Excel (Image 1, Image 2, Image 3).
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Upload className="size-3.5" />
              Upload Photos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-amber-500 hover:bg-amber-50/20"
          >
            <ImageIcon className="size-8 text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-700">Click or Drag & Drop images here</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports PNG, JPG, WebP up to 10MB each</p>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-600">
                Uploaded Images ({images.length} photos):
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs"
                  >
                    <img
                      src={img.startsWith("/") || img.startsWith("data:") ? img : `/images/products/${img}`}
                      alt={`Product view ${idx + 1}`}
                      className="size-full object-cover"
                    />
                    <div className="absolute top-2 left-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      {idx === 0 ? "Main (Image 1)" : `Image ${idx + 1}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 rounded-lg bg-rose-600/90 p-1 text-white opacity-0 transition-opacity hover:bg-rose-700 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/25 hover:bg-amber-400 disabled:opacity-50 transition-all"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Update Product in Excel" : "Save Product to Excel & Store"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   6. CATEGORIES MANAGEMENT SECTION
   ══════════════════════════════════════════════════════════════════════ */
function CategoriesSection({
  onFilterCategory,
}: {
  onFilterCategory: (slug: string) => void;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const d = await res.json();
      if (d.success && Array.isArray(d.categories)) {
        setCategories(d.categories);
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormImage("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormName(cat.name || "");
    setFormSlug(cat.slug || "");
    setFormDescription(cat.description || "");
    setFormImage(cat.image || "");
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file must be under 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = !!editingCategory;
      const endpoint = "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          slug: formSlug.trim() || formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: formDescription.trim(),
          image: formImage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save category");
      }

      toast.success(isEdit ? "Category updated successfully" : "Category created successfully", {
        description: `"${formName}" is now active in "Shop by category" on the website.`,
      });

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!confirm(`Are you sure you want to delete the category "${cat.name}"?`)) return;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: cat.slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete");

      toast.success(`Category "${cat.name}" deleted`);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Could not delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Category Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage product categories. Any added category automatically appears on the homepage under &quot;Shop by category&quot;.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition-colors cursor-pointer"
        >
          <PlusCircle className="size-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-3 py-16 text-center">
            <Loader2 className="mx-auto size-7 animate-spin text-amber-500" />
            <p className="mt-2 text-xs text-slate-400">Loading categories…</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-3 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No categories found</p>
            <p className="mt-1 text-xs text-slate-400">Click &quot;Add New Category&quot; above to create one.</p>
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.slug}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 relative group">
                <img
                  src={c.image || "/images/categories/cat-suspension.jpg"}
                  alt={c.name}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/categories/cat-suspension.jpg";
                  }}
                />
                <div className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                  {c.count || 0} {(c.count === 1) ? "Product" : "Products"}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900">{c.name}</h3>
                    <code className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {c.slug}
                    </code>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                    {c.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      title="Edit Category"
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c)}
                      title="Delete Category"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onFilterCategory(c.slug)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    <span>View Parts</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydraulic, Bumpers, Lighting, Fortuner Accessories"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Slug / URL Identifier
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-"))}
                  placeholder="e.g. hydraulic"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description for category card on homepage..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Cover Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center">
                    {formImage ? (
                      <img src={formImage} alt="Preview" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Upload className="size-3.5" />
                      <span>{formImage ? "Change Image" : "Upload Image"}</span>
                    </button>
                    {formImage && (
                      <button
                        type="button"
                        onClick={() => setFormImage("")}
                        className="ml-2 text-xs text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Recommended: 16:9 ratio, JPG or PNG format.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{editingCategory ? "Update Category" : "Save & Add Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   7. ORDER MANAGEMENT SECTION
   ══════════════════════════════════════════════════════════════════════ */
function OrdersSection({ onDataChanged }: { onDataChanged: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order ${orderId} status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        onDataChanged();
      }
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer?.email && o.customer.email.toLowerCase().includes(q));

      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Order Management</h2>
          <p className="text-xs text-slate-500">
            Track customer orders, review shipping addresses, and manage fulfillment
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, email…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9.5 pr-4 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-amber-500" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders found. When customers place orders on the website, they will appear here.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {order.id}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{order.customer?.name}</p>
                      <p className="text-[11px] text-slate-400">{order.customer?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {order.items?.length || 1} items
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatPrice(order.total || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                        {order.paymentMethod || "cod"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`rounded-lg border px-2 py-1 text-[11px] font-bold uppercase transition-colors ${
                          order.status === "delivered"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : order.status === "pending"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : order.status === "shipped"
                            ? "border-purple-200 bg-purple-50 text-purple-700"
                            : order.status === "processing"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600">{selectedOrder.id}</span>
                <h3 className="text-lg font-bold text-slate-900">Order Information</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Customer Box */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/75 p-4 space-y-1.5">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Customer & Shipping Address
                </p>
                <p className="font-bold text-sm text-slate-900">{selectedOrder.customer?.name}</p>
                <p className="text-slate-600">Email: {selectedOrder.customer?.email}</p>
                <p className="text-slate-600">Phone: {selectedOrder.customer?.phone || "N/A"}</p>
                <p className="text-slate-600">
                  Address: {selectedOrder.customer?.address}, {selectedOrder.customer?.city},{" "}
                  {selectedOrder.customer?.state} {selectedOrder.customer?.zip}
                </p>
              </div>

              {/* Items List */}
              <div>
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
                  Ordered Items
                </p>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image.startsWith("/") ? item.image : `/images/products/${item.image}`}
                            alt=""
                            className="size-10 rounded-md border object-cover"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{item.name || item.slug}</p>
                          <p className="text-slate-400">Qty: {item.qty} × {formatPrice(item.price)}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900">
                        {formatPrice((item.price || 0) * (item.qty || 1))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1 rounded-xl bg-slate-50 p-4 font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(selectedOrder.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{selectedOrder.shipping === 0 ? "Free" : formatPrice(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-sm">
                  <span>Total Amount:</span>
                  <span className="text-primary">{formatPrice(selectedOrder.total || 0)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   8. VISITOR ANALYTICS SECTION
   ══════════════════════════════════════════════════════════════════════ */
function AnalyticsSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Website Visitor Analytics</h2>
        <p className="text-xs text-slate-500">
          Privacy-preserving analytics tracking real visitors, page traffic, and product views
        </p>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Visitors</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 font-display">
            {data?.totalVisitors ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Unique IP fingerprints</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Today's Visitors</p>
          <p className="mt-2 text-2xl font-extrabold text-blue-600 font-display">
            {data?.todayVisitors ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Since 00:00 UTC</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Weekly Visitors</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 font-display">
            {data?.weeklyVisitors ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Last 7 rolling days</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Total Page Views</p>
          <p className="mt-2 text-2xl font-extrabold text-purple-600 font-display">
            {data?.totalPageViews ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">Browse requests</p>
        </div>
      </div>

      {/* Visitor Trend Area Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Visitor Traffic Trend (Last 14 Days)
        </h3>
        <div className="h-64 w-full">
          {data?.dailyVisitors && data.dailyVisitors.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyVisitors} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#visitorGradient)"
                  name="Visitors"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No traffic data recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Most Visited Pages & Top Product Views */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Most Visited Pages</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {(!data?.topPages || data.topPages.length === 0) ? (
              <p className="py-4 text-center text-slate-400">No page views recorded yet</p>
            ) : (
              data.topPages.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                  <span className="font-mono text-slate-700">{p.page}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
                    {p.views} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Viewed Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Most Viewed Products</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {(!data?.productViews || data.productViews.length === 0) ? (
              <p className="py-4 text-center text-slate-400">No product page clicks yet</p>
            ) : (
              data.productViews.map((pv: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="font-bold text-slate-900">{pv.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{pv.productId}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700 border border-amber-200">
                    {pv.views} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   9. EXCEL DATA MANAGEMENT SECTION
   ══════════════════════════════════════════════════════════════════════ */
function ExcelSection({ onSynced }: { onSynced: () => void }) {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/excel/info");
      const data = await res.json();
      if (data.success) setInfo(data);
    } catch {
      toast.error("Failed to load Excel metadata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/admin/excel/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Excel File Synchronized Successfully", {
          description: `Loaded ${data.count} product records`,
        });
        fetchInfo();
        onSynced();
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      toast.error("Please upload a valid .xlsx Excel workbook");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImporting(true);
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        const res = await fetch("/api/admin/excel/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64 }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to import Excel");
        }

        toast.success(`Excel Import Complete!`, {
          description: `Successfully loaded ${data.count} items into the system.`,
        });
        fetchInfo();
        onSynced();
      } catch (err: any) {
        toast.error("Import Failed", { description: err.message });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
    if (e.target) e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Excel Data Synchronization</h2>
        <p className="text-xs text-slate-500">
          Manage the master Excel database (<span className="font-mono">products.xlsx</span>) powering the website catalog
        </p>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Excel Workbook</h3>
              <p className="text-xs text-slate-500 font-mono">{info?.path || "products.xlsx"}</p>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
            Force Re-Sync
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Workbook Rows</span>
            <span className="mt-1 text-lg font-extrabold text-slate-900">{info?.rowCount ?? 0}</span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">File Status</span>
            <span className="mt-1 text-sm font-bold text-emerald-600">
              {info?.exists ? "Active & Linked" : "Creating on Save"}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">File Size</span>
            <span className="mt-1 text-sm font-bold text-slate-900">
              {info?.sizeBytes ? `${(info.sizeBytes / 1024).toFixed(1)} KB` : "0 KB"}
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Last Modified</span>
            <span className="mt-1 text-xs font-semibold text-slate-700 truncate block">
              {info?.lastModified ? new Date(info.lastModified).toLocaleTimeString() : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Export / Import Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Export Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Download className="size-4 text-amber-500" />
            Export Catalog as Excel
          </h3>
          <p className="text-xs text-slate-500">
            Download the current product catalog as an Excel spreadsheet with all columns, IDs, and image paths.
          </p>
          <a
            href="/api/admin/excel/export"
            download="products.xlsx"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all"
          >
            <Download className="size-3.5" />
            Download products.xlsx
          </a>
        </div>

        {/* Import Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Upload className="size-4 text-blue-500" />
            Import / Overwrite from Excel
          </h3>
          <p className="text-xs text-slate-500">
            Upload an existing Excel file (<span className="font-mono">.xlsx</span>) to replace or batch-import products into the store.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            {importing ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            Choose .xlsx File to Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {/* Excel Structure Reference */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Excel Structure Guidelines</h3>
        <p className="text-xs text-slate-500 mb-4">
          Columns supported in <span className="font-mono font-semibold">products.xlsx</span>:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border border-slate-200 rounded-lg">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-2 border-r">Product ID</th>
                <th className="p-2 border-r">Product Name</th>
                <th className="p-2 border-r">Category</th>
                <th className="p-2 border-r">Price</th>
                <th className="p-2 border-r">Stock</th>
                <th className="p-2 border-r">Description</th>
                <th className="p-2 border-r">Image 1</th>
                <th className="p-2 border-r">Image 2</th>
                <th className="p-2">Image 3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-2 border-r">YSK001</td>
                <td className="p-2 border-r">Jimny Front Bumper</td>
                <td className="p-2 border-r">Accessories</td>
                <td className="p-2 border-r">1500</td>
                <td className="p-2 border-r">10</td>
                <td className="p-2 border-r">Premium bumper</td>
                <td className="p-2 border-r">/uploads/products/1.jpg</td>
                <td className="p-2 border-r">/uploads/products/2.jpg</td>
                <td className="p-2">/uploads/products/3.jpg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   10. ACTIVITY HISTORY LOG SECTION
   ══════════════════════════════════════════════════════════════════════ */
function ActivitySection() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/activity")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLogs(d.activity);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        !q ||
        l.action?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q) ||
        l.admin?.toLowerCase().includes(q)
    );
  }, [logs, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Admin Activity History</h2>
          <p className="text-xs text-slate-500">
            Immutable audit trail of administrator and system actions
          </p>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity logs…"
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8.5 pr-3 text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-amber-500" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No activity found
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber-500" />
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.details}</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 text-[10px]">
                        {log.admin || "system"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   11. ADMIN SETTINGS SECTION
   ══════════════════════════════════════════════════════════════════════ */
function SettingsSection({ adminUser }: { adminUser: string | null }) {
  const [username, setUsername] = useState(adminUser || "admin");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [sysInfo, setSysInfo] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setSysInfo(d);
        if (d.whatsappNumber) setWhatsappNumber(d.whatsappNumber);
      })
      .catch(() => {});
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          whatsappNumber: whatsappNumber.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Update failed");
      }

      toast.success("Admin Settings & WhatsApp Number Updated Successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Admin Settings</h2>
        <p className="text-xs text-slate-500">
          Configure security credentials and view server deployment parameters
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Credentials Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Security Credentials</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Administrator Username
            </label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <p className="text-xs font-bold text-slate-800">Change Password (Optional)</p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* WhatsApp Order Integration Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Phone className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Order Integration</h3>
              <p className="text-xs text-slate-500">
                When customers click &quot;Order via WhatsApp&quot; on product pages or in the cart, it directs to this number.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase">
              WhatsApp Phone Number (with Country Code)
            </label>
            <div className="mt-1.5 flex gap-3">
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. +91 9876543210 or 919876543210"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-hidden"
              />
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=Hello%20from%20YSK%204X4!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  Test Chat
                </a>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Enter with international code without plus or spaces (e.g. 919876543210 for India).
            </p>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">System Diagnostics</h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Excel Data Path:</span>
              <span className="font-mono text-slate-800">{sysInfo?.excelPath || "products.xlsx"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Uploads Directory:</span>
              <span className="font-mono text-slate-800">{sysInfo?.uploadDir || "public/uploads/products"}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Security Encryption:</span>
              <span className="font-semibold text-emerald-600">Scrypt + SHA-256 + HMAC JWT</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
