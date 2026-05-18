import { useState, useEffect } from "react";
import { supabase, type Reservation, type ClosedDate } from "./lib/supabase";

type View = "dashboard" | "reservations" | "calendar" | "settings";
type StatusFilter = "all" | "confirmed" | "cancelled" | "no_show";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(timeStr: string) {
  return timeStr.substring(0, 5);
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// --- Login ---
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Email ou password incorrectos.");
    else onLogin();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f0e3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-[#18352a] tracking-[-0.04em]">GiG</h1>
          <p className="text-[#6f8f72] mt-2 text-sm font-semibold uppercase tracking-[0.18em]">Admin</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-lg p-8 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#18352a]/18 px-4 py-3 text-sm outline-none focus:border-[#6f8f72] focus:ring-1 focus:ring-[#6f8f72]/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#18352a]/18 px-4 py-3 text-sm outline-none focus:border-[#6f8f72] focus:ring-1 focus:ring-[#6f8f72]/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#18352a] py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#fff8ea] transition hover:bg-[#6f8f72] disabled:opacity-50"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
        <p className="text-center mt-4 text-xs text-[#18352a]/40">
          <a href="/" className="hover:text-[#6f8f72]">← Voltar ao site</a>
        </p>
      </div>
    </div>
  );
}

// --- Stats Card ---
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72]">{label}</p>
      <p className="mt-2 text-4xl font-semibold text-[#18352a] tracking-[-0.04em]">{value}</p>
      {sub && <p className="mt-1 text-sm text-[#405a4d]">{sub}</p>}
    </div>
  );
}

// --- Reservation Row ---
function ReservationRow({
  r,
  onStatusChange,
}: {
  r: Reservation;
  onStatusChange: (id: string, status: Reservation["status"]) => void;
}) {
  const statusColors = {
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-gray-100 text-gray-600",
  };
  const statusLabels = {
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    no_show: "Não apareceu",
  };

  return (
    <tr className="border-b border-[#18352a]/06 hover:bg-[#18352a]/02 transition">
      <td className="px-4 py-3">
        <p className="font-semibold text-[#18352a] text-sm">{r.name}</p>
        <p className="text-xs text-[#405a4d]">{r.email}</p>
        {r.phone && <p className="text-xs text-[#405a4d]">{r.phone}</p>}
      </td>
      <td className="px-4 py-3 text-sm text-[#18352a]">
        <p>{formatDate(r.date)}</p>
        <p className="text-[#6f8f72] font-semibold">{formatTime(r.time)}</p>
      </td>
      <td className="px-4 py-3 text-sm text-center font-semibold text-[#18352a]">{r.guests}</td>
      <td className="px-4 py-3 text-xs text-[#405a4d] max-w-[200px] truncate">{r.message || "—"}</td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[r.status]}`}>
          {statusLabels[r.status]}
        </span>
      </td>
      <td className="px-4 py-3">
        <select
          value={r.status}
          onChange={(e) => onStatusChange(r.id, e.target.value as Reservation["status"])}
          className="text-xs rounded-lg border border-[#18352a]/18 px-2 py-1.5 outline-none cursor-pointer"
        >
          <option value="confirmed">Confirmada</option>
          <option value="cancelled">Cancelada</option>
          <option value="no_show">Não apareceu</option>
        </select>
      </td>
    </tr>
  );
}

// --- Main Admin ---
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [closedDates, setClosedDates] = useState<ClosedDate[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Modo de adicionar dias fechados: "single" ou "range"
  const [closedMode, setClosedMode] = useState<"single" | "range">("single");
  const [newClosedDate, setNewClosedDate] = useState("");
  const [newClosedDateEnd, setNewClosedDateEnd] = useState("");
  const [newClosedReason, setNewClosedReason] = useState("");
  const [addingClosed, setAddingClosed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: res }, { data: cd }] = await Promise.all([
      supabase.from("reservations").select("*").order("date", { ascending: true }).order("time", { ascending: true }),
      supabase.from("closed_dates").select("*").order("date", { ascending: true }),
    ]);
    setReservations(res || []);
    setClosedDates(cd || []);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: Reservation["status"]) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const handleAddClosedDate = async () => {
    if (!newClosedDate) return;
    setAddingClosed(true);

    if (closedMode === "single") {
      const { data } = await supabase
        .from("closed_dates")
        .insert({ date: newClosedDate, reason: newClosedReason || null })
        .select()
        .single();
      if (data) {
        setClosedDates((prev) => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)));
      }
    } else {
      if (!newClosedDateEnd || newClosedDateEnd < newClosedDate) {
        setAddingClosed(false);
        return;
      }
      const dates = getDatesInRange(newClosedDate, newClosedDateEnd);
      const inserts = dates.map((date) => ({ date, reason: newClosedReason || null }));
      const { data } = await supabase.from("closed_dates").insert(inserts).select();
      if (data) {
        setClosedDates((prev) =>
          [...prev, ...data].sort((a, b) => a.date.localeCompare(b.date))
        );
      }
    }

    setNewClosedDate("");
    setNewClosedDateEnd("");
    setNewClosedReason("");
    setAddingClosed(false);
  };

  const handleRemoveClosedDate = async (id: string) => {
    await supabase.from("closed_dates").delete().eq("id", id);
    setClosedDates((prev) => prev.filter((d) => d.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authed === null) return (
    <div className="min-h-screen bg-[#f7f0e3] flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-[#18352a] border-t-transparent rounded-full" />
    </div>
  );
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const filtered = reservations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    return true;
  });

  const todayRes = reservations.filter((r) => r.date === today() && r.status === "confirmed");
  const todayGuests = todayRes.reduce((s, r) => s + r.guests, 0);
  const upcomingRes = reservations.filter((r) => r.date >= today() && r.status === "confirmed");
  const thisWeek = reservations.filter((r) => {
    const d = new Date(r.date + "T12:00:00");
    const now = new Date();
    const weekEnd = new Date(); weekEnd.setDate(now.getDate() + 7);
    return d >= now && d <= weekEnd && r.status === "confirmed";
  });

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "reservations", label: "Reservas", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "calendar", label: "Dias Fechados", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
    { id: "settings", label: "Definições", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  return (
    <div className="min-h-screen bg-[#f0ede6] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#18352a] text-[#fff8ea] flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="font-serif text-2xl tracking-[-0.04em]">GiG</h1>
          <p className="text-[#6f8f72] text-xs font-semibold uppercase tracking-[0.18em] mt-1">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left ${
                view === item.id ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/08 hover:text-white"
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-6">
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/08 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver site
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/08 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* DASHBOARD */}
          {view === "dashboard" && (
            <div>
              <h2 className="text-2xl font-semibold text-[#18352a] tracking-[-0.04em] mb-6">Dashboard</h2>
              {loading ? (
                <div className="flex items-center justify-center h-40"><div className="animate-spin h-8 w-8 border-2 border-[#18352a] border-t-transparent rounded-full" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Hoje" value={todayRes.length} sub={`${todayGuests} pessoas`} />
                    <StatCard label="Esta semana" value={thisWeek.length} sub="reservas confirmadas" />
                    <StatCard label="Próximas" value={upcomingRes.length} sub="reservas futuras" />
                    <StatCard label="Total" value={reservations.length} sub="todas as reservas" />
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#18352a]/06">
                      <h3 className="font-semibold text-[#18352a]">Reservas de hoje</h3>
                    </div>
                    {todayRes.length === 0 ? (
                      <div className="px-6 py-10 text-center text-[#405a4d] text-sm">Nenhuma reserva para hoje.</div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#18352a]/06 text-xs font-bold uppercase tracking-[0.14em] text-[#6f8f72]">
                            <th className="px-4 py-3 text-left">Cliente</th>
                            <th className="px-4 py-3 text-left">Hora</th>
                            <th className="px-4 py-3 text-center">Pessoas</th>
                            <th className="px-4 py-3 text-left">Nota</th>
                            <th className="px-4 py-3 text-left">Estado</th>
                            <th className="px-4 py-3 text-left">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todayRes.map((r) => (
                            <ReservationRow key={r.id} r={r} onStatusChange={handleStatusChange} />
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* RESERVATIONS */}
          {view === "reservations" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-[#18352a] tracking-[-0.04em]">Todas as Reservas</h2>
                <button onClick={loadData} className="text-xs font-semibold text-[#6f8f72] hover:text-[#18352a] transition uppercase tracking-[0.14em]">
                  Atualizar
                </button>
              </div>
              <div className="flex flex-wrap gap-3 mb-5">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-xl border border-[#18352a]/18 px-3 py-2 text-sm outline-none focus:border-[#6f8f72]"
                />
                {(["all", "confirmed", "cancelled", "no_show"] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      statusFilter === s
                        ? "bg-[#18352a] text-[#fff8ea]"
                        : "bg-white text-[#405a4d] border border-[#18352a]/18 hover:border-[#18352a]"
                    }`}
                  >
                    {s === "all" ? "Todas" : s === "confirmed" ? "Confirmadas" : s === "cancelled" ? "Canceladas" : "Não apareceu"}
                  </button>
                ))}
                {(dateFilter || statusFilter !== "all") && (
                  <button onClick={() => { setDateFilter(""); setStatusFilter("all"); }} className="text-xs text-[#6f8f72] hover:text-[#18352a] transition">
                    Limpar filtros
                  </button>
                )}
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-40"><div className="animate-spin h-8 w-8 border-2 border-[#18352a] border-t-transparent rounded-full" /></div>
                ) : filtered.length === 0 ? (
                  <div className="px-6 py-14 text-center text-[#405a4d] text-sm">Nenhuma reserva encontrada.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#18352a]/06 text-xs font-bold uppercase tracking-[0.14em] text-[#6f8f72]">
                          <th className="px-4 py-3 text-left">Cliente</th>
                          <th className="px-4 py-3 text-left">Data / Hora</th>
                          <th className="px-4 py-3 text-center">Pax</th>
                          <th className="px-4 py-3 text-left">Nota</th>
                          <th className="px-4 py-3 text-left">Estado</th>
                          <th className="px-4 py-3 text-left">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r) => (
                          <ReservationRow key={r.id} r={r} onStatusChange={handleStatusChange} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-[#405a4d]">{filtered.length} reserva(s) encontrada(s)</p>
            </div>
          )}

          {/* CALENDAR / CLOSED DATES */}
          {view === "calendar" && (
            <div>
              <h2 className="text-2xl font-semibold text-[#18352a] tracking-[-0.04em] mb-2">Dias Fechados</h2>
              <p className="text-sm text-[#405a4d] mb-6">
                O café está automaticamente fechado às <strong>quartas-feiras</strong>. Usa esta secção para marcar feriados, férias ou outros dias especiais.
              </p>

              {/* Adicionar data */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-[#18352a] mb-4">Marcar dias fechados</h3>

                {/* Toggle modo */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setClosedMode("single")}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                      closedMode === "single" ? "bg-[#18352a] text-[#fff8ea]" : "bg-[#f0ede6] text-[#405a4d] hover:bg-[#18352a]/10"
                    }`}
                  >
                    Dia único
                  </button>
                  <button
                    onClick={() => setClosedMode("range")}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                      closedMode === "range" ? "bg-[#18352a] text-[#fff8ea]" : "bg-[#f0ede6] text-[#405a4d] hover:bg-[#18352a]/10"
                    }`}
                  >
                    Período (férias)
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {closedMode === "single" ? (
                    <input
                      type="date"
                      value={newClosedDate}
                      onChange={(e) => setNewClosedDate(e.target.value)}
                      className="rounded-xl border border-[#18352a]/18 px-4 py-2.5 text-sm outline-none focus:border-[#6f8f72]"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={newClosedDate}
                        onChange={(e) => setNewClosedDate(e.target.value)}
                        className="rounded-xl border border-[#18352a]/18 px-4 py-2.5 text-sm outline-none focus:border-[#6f8f72]"
                      />
                      <span className="text-sm text-[#405a4d]">até</span>
                      <input
                        type="date"
                        value={newClosedDateEnd}
                        min={newClosedDate}
                        onChange={(e) => setNewClosedDateEnd(e.target.value)}
                        className="rounded-xl border border-[#18352a]/18 px-4 py-2.5 text-sm outline-none focus:border-[#6f8f72]"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Motivo (opcional)"
                    value={newClosedReason}
                    onChange={(e) => setNewClosedReason(e.target.value)}
                    className="flex-1 min-w-[180px] rounded-xl border border-[#18352a]/18 px-4 py-2.5 text-sm outline-none focus:border-[#6f8f72]"
                  />
                  <button
                    onClick={handleAddClosedDate}
                    disabled={!newClosedDate || addingClosed || (closedMode === "range" && !newClosedDateEnd)}
                    className="rounded-full bg-[#18352a] px-6 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-[#fff8ea] hover:bg-[#6f8f72] transition disabled:opacity-40"
                  >
                    {addingClosed ? "A adicionar..." : "Adicionar"}
                  </button>
                </div>
                {closedMode === "range" && newClosedDate && newClosedDateEnd && newClosedDateEnd >= newClosedDate && (
                  <p className="mt-2 text-xs text-[#6f8f72]">
                    {getDatesInRange(newClosedDate, newClosedDateEnd).length} dias serão marcados como fechados.
                  </p>
                )}
              </div>

              {/* Lista de datas fechadas */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#18352a]/06">
                  <h3 className="font-semibold text-[#18352a]">Datas marcadas como fechadas</h3>
                </div>
                {closedDates.length === 0 ? (
                  <div className="px-6 py-10 text-center text-[#405a4d] text-sm">Nenhuma data especial marcada.</div>
                ) : (
                  <div className="divide-y divide-[#18352a]/06">
                    {closedDates.map((d) => (
                      <div key={d.id} className="flex items-center justify-between px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#18352a] text-sm">{formatDate(d.date)}</p>
                          {d.reason && <p className="text-xs text-[#405a4d] mt-0.5">{d.reason}</p>}
                        </div>
                        <button
                          onClick={() => handleRemoveClosedDate(d.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition uppercase tracking-[0.12em]"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {view === "settings" && (
            <div>
              <h2 className="text-2xl font-semibold text-[#18352a] tracking-[-0.04em] mb-6">Definições</h2>
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1">Horário de abertura</p>
                    <p className="text-lg font-semibold text-[#18352a]">10:00</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1">Horário de fecho</p>
                    <p className="text-lg font-semibold text-[#18352a]">16:00</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1">Última reserva</p>
                    <p className="text-lg font-semibold text-[#18352a]">14:30</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1">Nº mesas</p>
                    <p className="text-lg font-semibold text-[#18352a]">15 mesas</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1">Capacidade máx. por slot</p>
                    <p className="text-lg font-semibold text-[#18352a]">30 pessoas</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1">Dia fechado semanal</p>
                    <p className="text-lg font-semibold text-[#18352a]">Quarta-feira</p>
                  </div>
                </div>
                <div className="border-t border-[#18352a]/08 pt-4">
                  <p className="text-xs text-[#405a4d]">
                    Para alterar as configurações do café, contacta o administrador do sistema.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}