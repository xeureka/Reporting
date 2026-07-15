import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineBanknotes } from 'react-icons/hi2';

import { api } from '../api';
import { useAuth } from '../auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

function MetricCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[3rem] ${color} opacity-10`} />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold mt-1.5 tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export function TeacherDashboardPage() {
  const { user } = useAuth();
  const teacherId = user?.teacherId ?? '';

  const sections = useQuery({ queryKey: ['sections', teacherId], queryFn: () => api.sections({ teacherId }), retry: false });
  const sessions = useQuery({ queryKey: ['sessions', 'today', teacherId], queryFn: () => api.classSessions({ view: 'today', teacherId }), retry: false });
  const paymentQuery = useQuery({ queryKey: ['payment-detail', teacherId], queryFn: () => api.teacherPayments(teacherId), retry: false });

  const activeSections = sections.data?.filter(s => s.status === 'active') ?? [];
  const todaySessions = sessions.data ?? [];
  const paymentData = paymentQuery.data;

  const sectionPayments = useMemo(() => {
    if (!paymentData) return new Map<string, { paid: number; unpaid: number; rate: number }>();
    const map = new Map<string, { paid: number; unpaid: number; rate: number }>();
    for (const c of paymentData.classes) map.set(c.sectionId, { paid: c.timePaid, unpaid: c.timeLeft, rate: c.hourlyRate });
    return map;
  }, [paymentData]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0] ?? 'Teacher'}</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your classes today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="My Sections" value={activeSections.length} color="bg-primary" />
        <MetricCard label="Today's Sessions" value={todaySessions.length} color="bg-emerald-500" />
        <MetricCard label="Completed Today" value={todaySessions.filter(s => s.status === 'completed').length} color="bg-amber-500" />
        <MetricCard label="Time Paid" value={`${(paymentData?.totalTimePaid ?? 0).toFixed(1)}h`} color="bg-emerald-600" />
        <MetricCard label="Time Unpaid" value={`${(paymentData?.totalTimeLeft ?? 0).toFixed(1)}h`} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Sections</CardTitle>
              {paymentData && paymentData.totalTimeLeft > 0 && (
                <Link to="/teacher/payments" className="text-sm text-primary hover:underline">View Payments</Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {sections.isLoading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />)}</div>}
            {activeSections.length === 0 && !sections.isLoading && <p className="text-sm text-muted-foreground py-8 text-center">No active sections assigned.</p>}
            {activeSections.length > 0 && (
              <div className="space-y-2">
                {activeSections.map((section) => {
                  const pay = sectionPayments.get(section.id);
                  return (
                    <Link key={section.id} to={`/sections/$sectionId`} params={{ sectionId: section.id }} className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm group-hover:text-primary transition-colors truncate">{section.sectionName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{section.scheduleDays} &middot; {section.startTime}-{section.endTime}</div>
                        {pay && (
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-emerald-600 font-medium">{pay.paid.toFixed(1)}h paid</span>
                            {pay.unpaid > 0 && <span className="text-xs text-amber-600 font-medium">{pay.unpaid.toFixed(1)}h unpaid</span>}
                          </div>
                        )}
                      </div>
                      <Badge variant={section.classType === 'Private' ? 'neutral' : 'success'} className="shrink-0 ml-3">{section.classType}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader>
          <CardContent>
            {sessions.isLoading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />)}</div>}
            {todaySessions.length === 0 && !sessions.isLoading && <p className="text-sm text-muted-foreground py-8 text-center">No sessions today.</p>}
            {todaySessions.length > 0 && (
              <div className="space-y-2">
                {todaySessions.map((session) => (
                  <Link key={session.id} to={`/sessions/$sessionId`} params={{ sessionId: session.id }} className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                    <div className="min-w-0">
                      <div className="font-medium text-sm group-hover:text-primary transition-colors truncate">{session.lessonTitle ?? `Session #${session.sessionNumber}`}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{session.sessionDate} &middot; {session.durationMinutes}min</div>
                    </div>
                    <Badge variant={session.status === 'completed' ? 'success' : 'neutral'} className="shrink-0 ml-3">{session.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
