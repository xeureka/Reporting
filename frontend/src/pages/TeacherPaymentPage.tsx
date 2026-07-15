import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from '@tanstack/react-router';
import { HiOutlineArrowLeft, HiOutlineClock, HiOutlineCheckCircle, HiOutlineBanknotes } from 'react-icons/hi2';
import { api } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

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

export function TeacherPaymentPage() {
  const router = useRouter();
  const { teacherId } = useParams({ from: '/protected/payments/$teacherId' });
  const queryClient = useQueryClient();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [payHours, setPayHours] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);

  const detailQuery = useQuery({
    queryKey: ['payment-detail', teacherId],
    queryFn: () => api.teacherPayments(teacherId),
    retry: false,
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (body: { teacherId: string; sectionId: string; hoursPaid: number; amountPaid: number; notes?: string }) =>
      api.recordPayment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-detail', teacherId] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      closeModal();
    },
  });

  const data = detailQuery.data;

  const sectionsWithUnpaid = useMemo(() => {
    if (!data) return [];
    return data.classes.filter(c => c.timeLeft > 0);
  }, [data]);

  const selectedSection = useMemo(() => {
    if (!data || !selectedSectionId) return null;
    return data.classes.find(c => c.sectionId === selectedSectionId) ?? null;
  }, [data, selectedSectionId]);

  const maxHours = selectedSection?.timeLeft ?? 0;
  const hoursNum = parseFloat(payHours) || 0;
  const amountNum = selectedSection ? Math.round(hoursNum * selectedSection.hourlyRate * 100) / 100 : 0;
  const canPay = hoursNum > 0 && hoursNum <= maxHours && selectedSection && !recordPaymentMutation.isPending;

  function openPayModal(sectionId?: string) {
    const targetId = sectionId ?? sectionsWithUnpaid[0]?.sectionId ?? '';
    setSelectedSectionId(targetId);
    const sec = data?.classes.find(c => c.sectionId === targetId);
    setPayHours(sec ? String(Math.min(sec.timeLeft, 1)) : '');
    setPayNotes('');
    setConfirmStep(false);
    setPayModalOpen(true);
  }

  function closeModal() {
    setPayModalOpen(false);
    setSelectedSectionId('');
    setPayHours('');
    setPayNotes('');
    setConfirmStep(false);
  }

  function handleSectionChange(newSectionId: string) {
    setSelectedSectionId(newSectionId);
    const sec = data?.classes.find(c => c.sectionId === newSectionId);
    setPayHours(sec ? String(Math.min(sec.timeLeft, 1)) : '');
    setConfirmStep(false);
  }

  function handleHoursChange(val: string) {
    const num = parseFloat(val) || 0;
    if (num > maxHours) {
      setPayHours(String(maxHours));
    } else if (num < 0) {
      setPayHours('0');
    } else {
      setPayHours(val);
    }
    setConfirmStep(false);
  }

  function handlePayConfirm() {
    if (!canPay) return;
    setConfirmStep(true);
  }

  function handlePayFinal() {
    if (!canPay || !selectedSection) return;
    recordPaymentMutation.mutate({
      teacherId,
      sectionId: selectedSectionId,
      hoursPaid: hoursNum,
      amountPaid: amountNum,
      notes: payNotes || undefined,
    });
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.navigate({ to: '/payments' })} className="shrink-0">
          <HiOutlineArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {detailQuery.isLoading ? 'Loading...' : data?.teacherName ?? 'Teacher'}
          </h1>
          <p className="text-muted-foreground mt-1">Payment details and section breakdown.</p>
        </div>
        {data && data.totalTimeLeft > 0 && (
          <Button onClick={() => openPayModal()}>
            <HiOutlineBanknotes size={18} className="mr-2" />
            Make Payment
          </Button>
        )}
      </div>

      {detailQuery.isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />)}
        </div>
      )}

      {detailQuery.isError && (
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
            <StatCard
              icon={HiOutlineBanknotes}
              label="Total Earned"
              value={`Br${data.classes.reduce((s, c) => s + c.timePaid * c.hourlyRate, 0).toFixed(2)}`}
              accent="text-primary"
            />
          </div>

          {/* Sections Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Sections</CardTitle>
            </CardHeader>
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
                      <TableHead className="text-right">Action</TableHead>
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
                          <TableCell className="text-right">
                            {c.timeLeft > 0 && (
                              <Button size="sm" onClick={() => openPayModal(c.sectionId)}>
                                Pay
                              </Button>
                            )}
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
            <CardHeader>
              <CardTitle>Payment Totals by Section</CardTitle>
            </CardHeader>
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
                    <TableCell>Total (All Sections)</TableCell>
                    <TableCell className="text-right">{(data.totalTimePaid + data.totalTimeLeft).toFixed(1)}h</TableCell>
                    <TableCell className="text-right text-emerald-600">{data.totalTimePaid.toFixed(1)}h</TableCell>
                    <TableCell className="text-right">
                      {data.totalTimeLeft > 0
                        ? <span className="text-amber-600">{data.totalTimeLeft.toFixed(1)}h</span>
                        : <span className="text-muted-foreground">0h</span>}
                    </TableCell>
                    <TableCell className="text-right">Br{(data.totalTimePaid * (data.classes[0]?.hourlyRate ?? 10)).toFixed(2)}</TableCell>
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
        </>
      )}

      {/* Payment Modal */}
      <Dialog open={payModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="max-w-md">
          {!confirmStep ? (
            <>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* Teacher Name */}
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground">Teacher</p>
                  <p className="font-semibold">{data?.teacherName}</p>
                </div>

                {/* Section Selector */}
                <div className="space-y-1">
                  <Label className="text-xs">Section</Label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                  >
                    {data?.classes
                      .filter(c => c.timeLeft > 0)
                      .map(c => (
                        <option key={c.sectionId} value={c.sectionId}>
                          {c.sectionName} — {c.timeLeft.toFixed(1)}h unpaid
                        </option>
                      ))}
                  </select>
                </div>

                {/* Section Details */}
                {selectedSection && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 rounded-lg bg-emerald-50">
                        <p className="text-xs text-muted-foreground">Paid</p>
                        <p className="font-bold text-emerald-600">{selectedSection.timePaid.toFixed(1)}h</p>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50">
                        <p className="text-xs text-muted-foreground">Unpaid</p>
                        <p className="font-bold text-amber-600">{selectedSection.timeLeft.toFixed(1)}h</p>
                      </div>
                      <div className="p-2 rounded-lg bg-primary/5">
                        <p className="text-xs text-muted-foreground">Rate</p>
                        <p className="font-bold">Br{selectedSection.hourlyRate}/hr</p>
                      </div>
                    </div>

                    {/* Hours Input */}
                    <div className="space-y-1">
                      <Label className="text-xs">Hours to Pay</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max={maxHours}
                          value={payHours}
                          onChange={(e) => handleHoursChange(e.target.value)}
                          placeholder="0"
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">hrs</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">Max: {maxHours.toFixed(1)}h available</p>
                        {hoursNum > 0 && (
                          <p className="text-xs text-muted-foreground">
                            = Br{amountNum.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 5, maxHours].filter((v, i, a) => a.indexOf(v) === i && v <= maxHours && v > 0).map(h => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => { setPayHours(String(h)); setConfirmStep(false); }}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                              parseFloat(payHours) === h
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                            }`}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-1">
                      <Label className="text-xs">Amount (Br)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amountNum > 0 ? String(amountNum) : ''}
                        readOnly
                        className="bg-muted/50"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <Label className="text-xs">Notes (optional)</Label>
                      <Input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="Payment notes..." />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>Cancel</Button>
                <Button onClick={handlePayConfirm} disabled={!canPay}>
                  Review Payment
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="p-4 rounded-xl border border-border space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teacher</span>
                    <span className="font-semibold">{data?.teacherName}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Section</span>
                    <span className="font-medium">{selectedSection?.sectionName}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours</span>
                    <span className="font-bold text-lg">{hoursNum.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg text-emerald-600">Br{amountNum.toFixed(2)}</span>
                  </div>
                  {payNotes && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Notes</span>
                        <span className="text-sm">{payNotes}</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Date</span>
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Time</span>
                    <span>{formattedTime}</span>
                  </div>
                </div>
                {recordPaymentMutation.isError && (
                  <p className="text-sm text-destructive text-center">
                    {recordPaymentMutation.error?.message ?? 'Payment failed. Please try again.'}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmStep(false)} disabled={recordPaymentMutation.isPending}>
                  Back
                </Button>
                <Button onClick={handlePayFinal} disabled={recordPaymentMutation.isPending}>
                  {recordPaymentMutation.isPending ? 'Processing...' : 'Confirm & Record Payment'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
