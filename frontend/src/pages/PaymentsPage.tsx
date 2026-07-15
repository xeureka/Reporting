import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineMagnifyingGlass, HiOutlineArrowRight } from 'react-icons/hi2';
import { api } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center gap-4 p-5 border border-border/60 rounded-2xl bg-white">
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 ${accent ?? 'text-primary'}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

type View = 'overview' | 'history';

export function PaymentsPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('overview');

  const [historySearch, setHistorySearch] = useState('');
  const [historyTeacherFilter, setHistoryTeacherFilter] = useState('');
  const [historySectionFilter, setHistorySectionFilter] = useState('');

  const payments = useQuery({ queryKey: ['payments'], queryFn: () => api.payments(), retry: false });

  const historyQuery = useQuery({
    queryKey: ['payment-history', historyTeacherFilter, historySectionFilter],
    queryFn: () => api.paymentHistory({ teacherId: historyTeacherFilter || undefined, sectionId: historySectionFilter || undefined }),
    enabled: view === 'history',
  });

  const allData = payments.data ?? [];
  const totalTimePaid = allData.reduce((s, t) => s + t.totalTimePaid, 0);
  const totalTimeLeft = allData.reduce((s, t) => s + t.totalTimeLeft, 0);

  const allTeachers = useMemo(() => {
    if (!payments.data) return [];
    return payments.data.map(t => ({ id: t.teacherId, name: t.teacherName }));
  }, [payments.data]);

  const allSections = useMemo(() => {
    if (!payments.data) return [];
    const map = new Map<string, string>();
    for (const t of payments.data) {
      for (const c of t.classes) map.set(c.sectionId, c.sectionName);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [payments.data]);

  const filteredHistory = useMemo(() => {
    const data = historyQuery.data ?? [];
    if (!historySearch) return data;
    const q = historySearch.toLowerCase();
    return data.filter(r =>
      r.teacherName.toLowerCase().includes(q) ||
      (r.sectionName && r.sectionName.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  }, [historyQuery.data, historySearch]);

  function formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-8">
      {/* Header + tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">Track teaching time and record payments.</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${view === 'overview' ? 'bg-white text-foreground border border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${view === 'history' ? 'bg-white text-foreground border border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Payment History
          </button>
        </div>
      </div>

      {view === 'overview' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard icon={HiOutlineCheckCircle} label="Total Time Paid" value={`${totalTimePaid.toFixed(1)}h`} accent="text-emerald-600" />
            <StatCard icon={HiOutlineClock} label="Total Time Unpaid" value={`${totalTimeLeft.toFixed(1)}h`} accent="text-amber-600" />
          </div>

          {/* Teacher Table */}
          <Card>
            <CardHeader><CardTitle>Teachers</CardTitle></CardHeader>
            <CardContent>
              {payments.isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />)}
                </div>
              )}
              {payments.data && payments.data.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No teacher payment data yet.</p>
              )}
              {payments.data && payments.data.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead className="text-right">Time Paid</TableHead>
                      <TableHead className="text-right">Time Unpaid</TableHead>
                      <TableHead className="text-right">Sections</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.data.map((t) => (
                      <TableRow key={t.teacherId}>
                        <TableCell className="font-semibold">{t.teacherName}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-emerald-600 font-medium">{t.totalTimePaid.toFixed(1)}h</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {t.totalTimeLeft > 0
                            ? <span className="text-amber-600 font-medium">{t.totalTimeLeft.toFixed(1)}h</span>
                            : <span className="text-muted-foreground">0h</span>}
                        </TableCell>
                        <TableCell className="text-right">{t.classes.length}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.navigate({ to: `/payments/$teacherId`, params: { teacherId: t.teacherId } })}
                            className="gap-1.5"
                          >
                            View Details
                            <HiOutlineArrowRight size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {view === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3 mb-6">
              <div className="flex-1 min-w-[200px] space-y-1">
                <Label className="text-xs">Search</Label>
                <div className="relative">
                  <HiOutlineMagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search by teacher, section, notes..."
                    className="pl-9 h-10"
                  />
                </div>
              </div>
              <div className="min-w-[180px] space-y-1">
                <Label className="text-xs">Teacher</Label>
                <select
                  value={historyTeacherFilter}
                  onChange={(e) => { setHistoryTeacherFilter(e.target.value); setHistorySectionFilter(''); }}
                  className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                >
                  <option value="">All Teachers</option>
                  {allTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="min-w-[180px] space-y-1">
                <Label className="text-xs">Section</Label>
                <select
                  value={historySectionFilter}
                  onChange={(e) => setHistorySectionFilter(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                >
                  <option value="">All Sections</option>
                  {allSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {(historySearch || historyTeacherFilter || historySectionFilter) && (
                <Button variant="outline" size="sm" onClick={() => { setHistorySearch(''); setHistoryTeacherFilter(''); setHistorySectionFilter(''); }}>
                  Clear
                </Button>
              )}
            </div>

            {historyQuery.isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-muted/50 rounded-xl animate-pulse" />)}
              </div>
            )}
            {historyQuery.data && filteredHistory.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No payment records found.</p>
            )}
            {filteredHistory.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Hours Paid</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{formatDateTime(r.createdAt)}</TableCell>
                      <TableCell className="font-medium">{r.teacherName}</TableCell>
                      <TableCell>{r.sectionName ?? '—'}</TableCell>
                      <TableCell className="text-right">{r.hoursPaid.toFixed(1)}h</TableCell>
                      <TableCell className="text-right font-medium">Br{r.amountPaid.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.notes ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
