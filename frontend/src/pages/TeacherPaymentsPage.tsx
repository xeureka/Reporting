import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineBanknotes, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

import { api } from '../api';
import { useAuth } from '../auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

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

export function TeacherPaymentsPage() {
  const { user } = useAuth();
  const teacherId = user?.teacherId ?? '';

  const [historySearch, setHistorySearch] = useState('');

  const paymentQuery = useQuery({
    queryKey: ['payment-detail', teacherId],
    queryFn: () => api.teacherPayments(teacherId),
    retry: false,
    enabled: !!teacherId,
  });

  const historyQuery = useQuery({
    queryKey: ['payment-history', teacherId],
    queryFn: () => api.paymentHistory({ teacherId }),
    retry: false,
    enabled: !!teacherId,
  });

  const data = paymentQuery.data;
  const totalEarned = useMemo(() => {
    if (!data) return 0;
    return data.classes.reduce((s, c) => s + c.timePaid * c.hourlyRate, 0);
  }, [data]);

  const filteredHistory = useMemo(() => {
    const records = historyQuery.data ?? [];
    if (!historySearch) return records;
    const q = historySearch.toLowerCase();
    return records.filter(r =>
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Payments</h1>
        <p className="text-muted-foreground mt-1">View your payment history and hours breakdown.</p>
      </div>

      {paymentQuery.isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />)}
        </div>
      )}

      {paymentQuery.isError && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Failed to load payment data.
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={HiOutlineCheckCircle} label="Time Paid" value={`${data.totalTimePaid.toFixed(1)}h`} accent="text-emerald-600" />
            <StatCard icon={HiOutlineClock} label="Time Unpaid" value={`${data.totalTimeLeft.toFixed(1)}h`} accent="text-amber-600" />
            <StatCard icon={HiOutlineBanknotes} label="Total Earned" value={`Br${totalEarned.toFixed(2)}`} accent="text-primary" />
          </div>

          {/* Sections Breakdown */}
          <Card>
            <CardHeader><CardTitle>My Sections</CardTitle></CardHeader>
            <CardContent>
              {data.classes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No sections assigned yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Total Time</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Unpaid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.classes.map((c) => {
                      const totalTime = c.timePaid + c.timeLeft;
                      return (
                        <TableRow key={c.sectionId}>
                          <TableCell className="font-medium">{c.sectionName}</TableCell>
                          <TableCell><Badge variant="neutral">{c.classType}</Badge></TableCell>
                          <TableCell className="text-right">Br{c.hourlyRate}/hr</TableCell>
                          <TableCell className="text-right">{c.sessionsWorked}</TableCell>
                          <TableCell className="text-right font-medium">{totalTime.toFixed(1)}h</TableCell>
                          <TableCell className="text-right">
                            <span className="text-emerald-600 font-medium">{c.timePaid.toFixed(1)}h</span>
                          </TableCell>
                          <TableCell className="text-right">
                            {c.timeLeft > 0
                              ? <span className="text-amber-600 font-medium">{c.timeLeft.toFixed(1)}h</span>
                              : <span className="text-muted-foreground">0h</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Payment Totals by Section */}
          <Card>
            <CardHeader><CardTitle>Payment Totals by Section</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Total Time</TableHead>
                    <TableHead className="text-right">Time Paid</TableHead>
                    <TableHead className="text-right">Time Unpaid</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead className="text-right">Amount Unpaid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.classes.map((c) => {
                    const totalTime = c.timePaid + c.timeLeft;
                    return (
                      <TableRow key={c.sectionId}>
                        <TableCell className="font-medium">{c.sectionName}</TableCell>
                        <TableCell className="text-right">{totalTime.toFixed(1)}h</TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">{c.timePaid.toFixed(1)}h</TableCell>
                        <TableCell className="text-right">
                          {c.timeLeft > 0
                            ? <span className="text-amber-600 font-medium">{c.timeLeft.toFixed(1)}h</span>
                            : <span className="text-muted-foreground">0h</span>}
                        </TableCell>
                        <TableCell className="text-right">Br{(c.timePaid * c.hourlyRate).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          {c.timeLeft > 0
                            ? <span className="text-amber-600">Br{(c.timeLeft * c.hourlyRate).toFixed(2)}</span>
                            : <span className="text-muted-foreground">Br0.00</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-t-2 border-border font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{(data.totalTimePaid + data.totalTimeLeft).toFixed(1)}h</TableCell>
                    <TableCell className="text-right text-emerald-600">{data.totalTimePaid.toFixed(1)}h</TableCell>
                    <TableCell className="text-right">
                      {data.totalTimeLeft > 0
                        ? <span className="text-amber-600">{data.totalTimeLeft.toFixed(1)}h</span>
                        : <span className="text-muted-foreground">0h</span>}
                    </TableCell>
                    <TableCell className="text-right">Br{totalEarned.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {data.totalTimeLeft > 0
                        ? <span className="text-amber-600">Br{data.classes.reduce((s, c) => s + c.timeLeft * c.hourlyRate, 0).toFixed(2)}</span>
                        : <span className="text-muted-foreground">Br0.00</span>}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3 mb-6">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <Label className="text-xs">Search</Label>
                  <div className="relative">
                    <HiOutlineMagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Search by section or notes..."
                      className="pl-9 h-10"
                    />
                  </div>
                </div>
                {historySearch && (
                  <button onClick={() => setHistorySearch('')} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                    Clear
                  </button>
                )}
              </div>

              {historyQuery.isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-muted/50 rounded-xl animate-pulse" />)}
                </div>
              )}
              {historyQuery.data && filteredHistory.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No payment records yet.</p>
              )}
              {filteredHistory.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
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
                        <TableCell className="font-medium">{r.sectionName ?? '—'}</TableCell>
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
        </>
      )}
    </div>
  );
}
