"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Users,
  UserCheck,
  CalendarDays,
  AlertTriangle,
  Activity,
  Cake,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Briefcase,
  BarChart3,
  ArrowUpRight,
  Plus,
  ClipboardList,
  Megaphone,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Local State for Real Data
  const [metrics, setMetrics] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<any[]>([]);

  // Calendar State
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setTime(new Date()), 1000);
    
    // Simple Fetch calls for each dynamic segment
    async function hydrateDashboard() {
      try {
        const [m, e, l, att] = await Promise.all([
          apiFetch('/dashboard/metrics'),
          apiFetch('/employees'),
          apiFetch('/leave-requests'),
          apiFetch('/attendance/report?range=6m').catch(() => []),
        ]);
        setMetrics(m);
        setEmployees(e || []);
        setLeaveRequests(l || []);
        setAttendanceReport(att || []);
      } catch (err) {
        console.error('Dashboard hydration failed:', err);
      }
    }

    hydrateDashboard();
    return () => clearInterval(t);
  }, []);

  // Derived Distribution Charts from Real Data
  const deptDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    const colors = ["#1565c0", "#1b7a4e", "#b06000", "#00695c", "#37474f", "#6a1b9a", "#ad1457"];
    return Object.entries(counts).map(([name, value], i) => ({
      name, value, color: colors[i % colors.length]
    }));
  }, [employees]);

  const empTypeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(emp => {
      const type = emp.employmentType || 'Full Time';
      counts[type] = (counts[type] || 0) + 1;
    });
    const colors = ["#1565c0", "#1b7a4e", "#b06000", "#00695c"];
    return Object.entries(counts).map(([name, value], i) => ({
      name, value, color: colors[i % colors.length]
    }));
  }, [employees]);

  const branchDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(emp => {
      const loc = emp.workLocation || 'Head Office';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    const colors = ["#1565c0", "#1b7a4e", "#b06000"];
    return Object.entries(counts).map(([name, value], i) => ({
      name, value, color: colors[i % colors.length]
    }));
  }, [employees]);

  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = time.toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = time.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  
  const totalCount = employees.length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending').length;

  // Calendar logic
  const calendarEvents = useMemo(() => {
    const events: Record<string, any[]> = {};
    employees.forEach(emp => {
      if (emp.dob) {
        const d = new Date(emp.dob);
        if (d.getMonth() === calMonth) {
          const day = d.getDate();
          if (!events[day]) events[day] = [];
          events[day].push({ type: "birthday", label: emp.name, color: "#e91e63" });
        }
      }
    });
    return events;
  }, [employees, calMonth]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  if (!mounted) return null;

  return (
    <div className="dashboard-real">
      <div className="pg-head">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="pg-greet" style={{ fontSize: 24, fontWeight: 800 }}>
              {greeting}, {user?.role === 'super_admin' ? 'Administrator' : 'HR Manager'} 👋
            </div>
            <div className="live-badge">
              <div className="live-dot" /> LIVE
            </div>
          </div>
          <div className="pg-sub" style={{ marginTop: 4 }}>
            📅 {dateStr} · 🕐 <span className="mono">{timeStr}</span> PKT
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => router.push("/employees/add")}>
          <Plus size={13} /> Add New Employee
        </button>
      </div>

      {/* KPI Section */}
      <div className="g4" style={{ marginBottom: 20 }}>
        <StatCard 
          icon={<Users size={20} />} 
          label="Total Headcount" 
          value={totalCount.toString()} 
          sub="Active employees in system" 
          color="var(--p)"
        />
        <StatCard 
          icon={<UserCheck size={20} />} 
          label="Present Today" 
          value={metrics?.present_today || "0"} 
          sub={`${metrics?.attendance_rate || 0}% attendance rate`} 
          color="var(--green)"
        />
        <StatCard 
          icon={<CalendarDays size={20} />} 
          label="Pending Leaves" 
          value={pendingLeaves.toString()} 
          sub="Awaiting HR approval" 
          color="var(--amber)"
        />
        <StatCard 
          icon={<AlertTriangle size={20} />} 
          label="Total Penalties" 
          value={metrics?.total_penalties_month || "0"} 
          sub="Recorded this month (PKR)" 
          color="var(--red)"
        />
      </div>

      <div className="g2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="ch"><div className="ct"><BarChart3 size={14} /> Monthly Attendance</div></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceReport.length ? attendanceReport : MOCK_ATT}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--br1)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
              <Tooltip cursor={{fill: 'var(--steell)'}} />
              <Bar dataKey="present" fill="var(--p)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="ch"><div className="ct"><TrendingUp size={14} /> Headcount Distribution</div></div>
          <div style={{ display: 'flex', gap: 20, height: 220, alignItems: 'center' }}>
            <DonutChart data={deptDistribution} total={totalCount} />
            <div style={{ flex: 1 }}>
              {deptDistribution.slice(0, 5).map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} /> {d.name}
                  </span>
                  <span className="mono" style={{ fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="g2" style={{ gridTemplateColumns: '1fr 320px' }}>
        <div className="card">
          <div className="ch">
            <div className="ct"><CalendarDays size={14} /> Events Calendar</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setCalMonth(m => m === 0 ? 11 : m - 1)}><ChevronLeft size={14} /></button>
              <span style={{ fontSize: 13, fontWeight: 700, minWidth: 100, textAlign: 'center' }}>{monthNames[calMonth]} {calYear}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => setCalMonth(m => m === 11 ? 0 : m + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
             {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textAlign: 'center', padding: 5 }}>{d}</div>)}
             {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={i} />)}
             {Array.from({ length: daysInMonth }).map((_, i) => {
               const day = i + 1;
               const hasEvent = !!calendarEvents[day];
               return (
                 <div key={day} style={{ height: 60, padding: 6, border: '1px solid var(--br2)', borderRadius: 6, position: 'relative', background: hasEvent ? 'var(--steell)' : 'transparent' }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{day}</div>
                    {calendarEvents[day]?.map((e, idx) => (
                      <div key={idx} style={{ fontSize: 8, background: e.color, color: 'white', padding: '1px 3px', borderRadius: 2, marginTop: 2, overflow: 'hidden', whiteSpace: 'nowrap' }}>{e.label}</div>
                    ))}
                 </div>
               )
             })}
          </div>
        </div>

        <div className="card">
          <div className="ch"><div className="ct"><Megaphone size={14} /> Announcements</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.length ? announcements.map((a, i) => (
              <div key={i} style={{ paddingBottom: 10, borderBottom: '1px solid var(--br2)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{a.date}</div>
              </div>
            )) : <div style={{ textAlign: 'center', color: 'var(--t3)', padding: 20 }}>No active announcements</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: any) {
  return (
    <div className="card" style={{ borderTop: `4px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ padding: 8, borderRadius: 8, background: color + '15', color }}>{icon}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>{label}</div>
      </div>
      <div className="mono" style={{ fontSize: 32, fontWeight: 800, color: 'var(--t1)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function DonutChart({ data, total }: any) {
  return (
    <div style={{ width: 140, height: 140, position: 'relative' }}>
      <PieChart width={140} height={140}>
        <Pie data={data} innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
          {data.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
        </Pie>
      </PieChart>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{total}</div>
        <div style={{ fontSize: 8, color: 'var(--t3)' }}>TOTAL</div>
      </div>
    </div>
  );
}

const MOCK_ATT = [
  { month: 'Oct', present: 180 }, { month: 'Nov', present: 195 }, { month: 'Dec', present: 210 },
  { month: 'Jan', present: 225 }, { month: 'Feb', present: 235 }, { month: 'Mar', present: 247 }
];
