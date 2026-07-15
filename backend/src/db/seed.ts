import { getDb, closeDb } from './connection.js';
import {
  users, teachers, students, courses, sections, enrollments, classSessions,
  sessionAttendance, sessionReports, teacherActivityLog, teacherPayments, paymentRecords,
} from './schema.js';
import process from 'node:process';
import bcrypt from 'bcryptjs';
import { loadEnv } from '../load-env.js';
loadEnv();

async function seed() {
  const db = getDb();
  console.log('Seeding database...');

  // Clear in dependency order
  await db.delete(paymentRecords);
  await db.delete(teacherPayments);
  await db.delete(teacherActivityLog);
  await db.delete(sessionReports);
  await db.delete(sessionAttendance);
  await db.delete(classSessions);
  await db.delete(enrollments);
  await db.delete(sections);
  await db.delete(students);
  await db.delete(courses);
  await db.delete(teachers);
  await db.delete(users);

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ── Users ──────────────────────────────────────────────────────────────────
  await db.insert(users).values([
    { id: 'user-admin', name: 'Admin User', email: 'admin@speaktoreach.local', passwordHash: hash('admin123'), role: 'admin' },
    { id: 'user-teacher-1', name: 'Maya Tesfaye', email: 'maya@speaktoreach.local', passwordHash: hash('teacher123'), role: 'teacher', teacherId: 'teacher-1' },
    { id: 'user-teacher-2', name: 'Jonas Bekele', email: 'jonas@speaktoreach.local', passwordHash: hash('teacher123'), role: 'teacher', teacherId: 'teacher-2' },
  ]);

  // ── Teachers ───────────────────────────────────────────────────────────────
  await db.insert(teachers).values([
    { id: 'teacher-1', teacherName: 'Maya Tesfaye', phone: '+251 911 000 101', email: 'maya@speaktoreach.local', status: 'active', hireDate: '2025-09-01', notes: 'Conversation and IELTS specialist.' },
    { id: 'teacher-2', teacherName: 'Jonas Bekele', phone: '+251 911 000 202', email: 'jonas@speaktoreach.local', status: 'active', hireDate: '2026-01-15', notes: 'Beginner and elementary groups.' },
  ]);

  // ── Courses ────────────────────────────────────────────────────────────────
  await db.insert(courses).values([
    { id: 'course-1', courseName: 'English Foundations', level: 'Beginner', totalUnits: 8, totalLessons: 32, description: 'Core survival English, grammar basics, and guided speaking.' },
    { id: 'course-2', courseName: 'Confident Conversation', level: 'Intermediate', totalUnits: 10, totalLessons: 40, description: 'Fluency, pronunciation, vocabulary expansion, and discussion practice.' },
    { id: 'course-3', courseName: 'SAT Preparation', level: 'Advanced', totalUnits: 12, totalLessons: 48, description: 'Test strategy, critical reading, writing, and math review.' },
  ]);

  // ── Students ───────────────────────────────────────────────────────────────
  await db.insert(students).values([
    { id: 'student-1', studentName: 'Sara Ahmed', phone: '+251 922 111 111', email: 'sara@example.com', level: 'Intermediate', classType: 'Private', status: 'Active', registrationDate: '2026-06-20', notes: 'Prefers evening sessions.' },
    { id: 'student-2', studentName: 'Dawit Alemu', phone: '+251 922 222 222', email: 'dawit@example.com', level: 'Beginner', classType: 'Group', status: 'Active', registrationDate: '2026-07-01', notes: 'Needs speaking confidence.' },
    { id: 'student-3', studentName: 'Hana Getachew', phone: '+251 922 333 333', email: 'hana@example.com', level: 'Advanced', classType: 'Private', status: 'Active', registrationDate: '2026-05-10' },
    { id: 'student-4', studentName: 'Yonas Tadesse', phone: '+251 922 444 444', email: 'yonas@example.com', level: 'Advanced', classType: 'Private', status: 'Active', registrationDate: '2026-05-15' },
    { id: 'student-5', studentName: 'Liya Berhanu', phone: '+251 922 555 555', email: 'liya@example.com', level: 'Beginner', classType: 'Group', status: 'Active', registrationDate: '2026-07-05' },
  ]);

  // ── Sections ───────────────────────────────────────────────────────────────
  // Maya (teacher-1): 3 sections
  // Jonas (teacher-2): 2 sections
  await db.insert(sections).values([
    { id: 'section-1', sectionName: 'Sara Private - Confident Conversation', classType: 'Private', teacherId: 'teacher-1', courseId: 'course-2', scheduleDays: 'Mon,Wed,Fri', startTime: '18:00', endTime: '19:00', startDate: '2026-06-24', maxStudents: 1, hourlyRate: 15, status: 'active' },
    { id: 'section-2', sectionName: 'Beginner Group A', classType: 'Group', teacherId: 'teacher-2', courseId: 'course-1', scheduleDays: 'Tue,Thu', startTime: '17:00', endTime: '18:30', startDate: '2026-07-02', maxStudents: 20, hourlyRate: 8, status: 'active' },
    { id: 'section-3', sectionName: 'Hana & Yonas SAT Prep', classType: 'Private', teacherId: 'teacher-1', courseId: 'course-3', scheduleDays: 'Tue,Sat', startTime: '10:00', endTime: '12:00', startDate: '2026-06-01', maxStudents: 2, hourlyRate: 20, status: 'active' },
    { id: 'section-4', sectionName: 'Beginner Group B', classType: 'Mini Group', teacherId: 'teacher-2', courseId: 'course-1', scheduleDays: 'Mon,Wed', startTime: '15:00', endTime: '16:30', startDate: '2026-07-10', maxStudents: 8, hourlyRate: 10, status: 'active' },
  ]);

  // ── Enrollments ────────────────────────────────────────────────────────────
  await db.insert(enrollments).values([
    { id: 'enr-1', studentId: 'student-1', sectionId: 'section-1', enrollmentDate: '2026-06-24', status: 'active' },
    { id: 'enr-2', studentId: 'student-2', sectionId: 'section-2', enrollmentDate: '2026-07-02', status: 'active' },
    { id: 'enr-3', studentId: 'student-3', sectionId: 'section-3', enrollmentDate: '2026-06-01', status: 'active' },
    { id: 'enr-4', studentId: 'student-4', sectionId: 'section-3', enrollmentDate: '2026-06-01', status: 'active' },
    { id: 'enr-5', studentId: 'student-2', sectionId: 'section-4', enrollmentDate: '2026-07-10', status: 'active' },
    { id: 'enr-6', studentId: 'student-5', sectionId: 'section-4', enrollmentDate: '2026-07-10', status: 'active' },
  ]);

  // ── Class Sessions ─────────────────────────────────────────────────────────
  // Maya - section-1 (Confident Conversation): 6 sessions, 5 reported
  // Maya - section-3 (SAT Prep): 4 sessions, all reported
  // Jonas - section-2 (Beginner Group A): 5 sessions, 4 reported
  // Jonas - section-4 (Beginner Group B): 3 sessions, 2 reported
  await db.insert(classSessions).values([
    // Maya - section-1
    { id: 'cs-1', sectionId: 'section-1', sessionDate: '2026-06-25', sessionNumber: 1, lessonNumber: 1, lessonTitle: 'Introduction & ice breakers', sessionType: 'private', durationMinutes: 60, status: 'completed' },
    { id: 'cs-2', sectionId: 'section-1', sessionDate: '2026-06-27', sessionNumber: 2, lessonNumber: 2, lessonTitle: 'Describing daily routines', sessionType: 'private', durationMinutes: 60, status: 'completed' },
    { id: 'cs-3', sectionId: 'section-1', sessionDate: '2026-06-30', sessionNumber: 3, lessonNumber: 3, lessonTitle: 'Expressing opinions', sessionType: 'private', durationMinutes: 60, status: 'completed' },
    { id: 'cs-4', sectionId: 'section-1', sessionDate: '2026-07-02', sessionNumber: 4, lessonNumber: 4, lessonTitle: 'Comparing and contrasting', sessionType: 'private', durationMinutes: 60, status: 'completed' },
    { id: 'cs-5', sectionId: 'section-1', sessionDate: '2026-07-04', sessionNumber: 5, lessonNumber: 5, lessonTitle: 'Agreeing and disagreeing politely', sessionType: 'private', durationMinutes: 60, status: 'completed' },
    { id: 'cs-6', sectionId: 'section-1', sessionDate: '2026-07-07', sessionNumber: 6, lessonNumber: 6, lessonTitle: 'Role-play: restaurant scenario', sessionType: 'private', durationMinutes: 60, status: 'completed' },
    // Maya - section-3 (SAT Prep, 2hr sessions)
    { id: 'cs-7', sectionId: 'section-3', sessionDate: '2026-06-03', sessionNumber: 1, lessonNumber: 1, lessonTitle: 'SAT overview & diagnostic test', sessionType: 'private', durationMinutes: 120, status: 'completed' },
    { id: 'cs-8', sectionId: 'section-3', sessionDate: '2026-06-07', sessionNumber: 2, lessonNumber: 2, lessonTitle: 'Critical reading strategies', sessionType: 'private', durationMinutes: 120, status: 'completed' },
    { id: 'cs-9', sectionId: 'section-3', sessionDate: '2026-06-10', sessionNumber: 3, lessonNumber: 3, lessonTitle: 'Evidence-based writing', sessionType: 'private', durationMinutes: 120, status: 'completed' },
    { id: 'cs-10', sectionId: 'section-3', sessionDate: '2026-06-14', sessionNumber: 4, lessonNumber: 4, lessonTitle: 'Math problem solving', sessionType: 'private', durationMinutes: 120, status: 'completed' },
    // Jonas - section-2 (Beginner Group A)
    { id: 'cs-11', sectionId: 'section-2', sessionDate: '2026-07-03', sessionNumber: 1, lessonNumber: 1, lessonTitle: 'Greetings and introductions', sessionType: 'group', durationMinutes: 90, status: 'completed' },
    { id: 'cs-12', sectionId: 'section-2', sessionDate: '2026-07-08', sessionNumber: 2, lessonNumber: 2, lessonTitle: 'Numbers and counting', sessionType: 'group', durationMinutes: 90, status: 'completed' },
    { id: 'cs-13', sectionId: 'section-2', sessionDate: '2026-07-10', sessionNumber: 3, lessonNumber: 3, lessonTitle: 'Colors and descriptions', sessionType: 'group', durationMinutes: 90, status: 'completed' },
    { id: 'cs-14', sectionId: 'section-2', sessionDate: '2026-07-15', sessionNumber: 4, lessonNumber: 4, lessonTitle: 'Simple present tense', sessionType: 'group', durationMinutes: 90, status: 'completed' },
    { id: 'cs-15', sectionId: 'section-2', sessionDate: '2026-07-17', sessionNumber: 5, lessonNumber: 5, lessonTitle: 'Asking for directions', sessionType: 'group', durationMinutes: 90, status: 'completed' },
    // Jonas - section-4 (Beginner Group B)
    { id: 'cs-16', sectionId: 'section-4', sessionDate: '2026-07-11', sessionNumber: 1, lessonNumber: 1, lessonTitle: 'Self-introduction practice', sessionType: 'group', durationMinutes: 90, status: 'completed' },
    { id: 'cs-17', sectionId: 'section-4', sessionDate: '2026-07-14', sessionNumber: 2, lessonNumber: 2, lessonTitle: 'Family vocabulary', sessionType: 'group', durationMinutes: 90, status: 'completed' },
    { id: 'cs-18', sectionId: 'section-4', sessionDate: '2026-07-16', sessionNumber: 3, lessonNumber: 3, lessonTitle: 'Daily activities', sessionType: 'group', durationMinutes: 90, status: 'completed' },
  ]);

  // ── Attendance (one per session for simplicity) ────────────────────────────
  const attEntries: Array<{ id: string; classSessionId: string; studentId: string; attendanceStatus: 'Present' | 'Absent' | 'Late' | 'Cancelled' }> = [
    { id: 'att-1', classSessionId: 'cs-1', studentId: 'student-1', attendanceStatus: 'Present' },
    { id: 'att-2', classSessionId: 'cs-2', studentId: 'student-1', attendanceStatus: 'Present' },
    { id: 'att-3', classSessionId: 'cs-3', studentId: 'student-1', attendanceStatus: 'Late' },
    { id: 'att-4', classSessionId: 'cs-4', studentId: 'student-1', attendanceStatus: 'Present' },
    { id: 'att-5', classSessionId: 'cs-5', studentId: 'student-1', attendanceStatus: 'Present' },
    { id: 'att-6', classSessionId: 'cs-6', studentId: 'student-1', attendanceStatus: 'Present' },
    { id: 'att-7', classSessionId: 'cs-7', studentId: 'student-3', attendanceStatus: 'Present' },
    { id: 'att-8', classSessionId: 'cs-8', studentId: 'student-3', attendanceStatus: 'Present' },
    { id: 'att-9', classSessionId: 'cs-9', studentId: 'student-3', attendanceStatus: 'Present' },
    { id: 'att-10', classSessionId: 'cs-10', studentId: 'student-3', attendanceStatus: 'Present' },
  ];
  await db.insert(sessionAttendance).values(attEntries.map(e => ({ ...e, present: e.attendanceStatus === 'Present', absent: e.attendanceStatus === 'Absent', late: e.attendanceStatus === 'Late', cancelled: e.attendanceStatus === 'Cancelled' })));

  // ── Session Reports ────────────────────────────────────────────────────────
  await db.insert(sessionReports).values([
    // Maya - section-1: all 6 reported
    { id: 'rep-1', classSessionId: 'cs-1', teacherId: 'teacher-1', reportStatus: 'submitted', generalNotes: 'Good first session. Sara is motivated.' },
    { id: 'rep-2', classSessionId: 'cs-2', teacherId: 'teacher-1', reportStatus: 'submitted', grammarCovered: 'present simple', generalNotes: 'Needs practice with third person -s.' },
    { id: 'rep-3', classSessionId: 'cs-3', teacherId: 'teacher-1', reportStatus: 'submitted', vocabularyCovered: 'opinion phrases', generalNotes: 'Strong participation.' },
    { id: 'rep-4', classSessionId: 'cs-4', teacherId: 'teacher-1', reportStatus: 'submitted', grammarCovered: 'comparatives', generalNotes: 'Good progress with comparisons.' },
    { id: 'rep-5', classSessionId: 'cs-5', teacherId: 'teacher-1', reportStatus: 'submitted', grammarCovered: 'conditionals review', generalNotes: 'Excellent session.' },
    { id: 'rep-6', classSessionId: 'cs-6', teacherId: 'teacher-1', reportStatus: 'submitted', generalNotes: 'Role-play went well. More practice needed on polite refusals.' },
    // Maya - section-3: all 4 reported
    { id: 'rep-7', classSessionId: 'cs-7', teacherId: 'teacher-1', reportStatus: 'submitted', generalNotes: 'Diagnostic completed. Weak in reading comprehension.' },
    { id: 'rep-8', classSessionId: 'cs-8', teacherId: 'teacher-1', reportStatus: 'submitted', generalNotes: 'Practiced main idea and detail questions.' },
    { id: 'rep-9', classSessionId: 'cs-9', teacherId: 'teacher-1', reportStatus: 'submitted', generalNotes: 'Essay structure review. Good improvement.' },
    { id: 'rep-10', classSessionId: 'cs-10', teacherId: 'teacher-1', reportStatus: 'submitted', generalNotes: 'Algebra and geometry review.' },
    // Jonas - section-2: 4 of 5 reported
    { id: 'rep-11', classSessionId: 'cs-11', teacherId: 'teacher-2', reportStatus: 'submitted', generalNotes: 'Students were shy but warmed up by the end.' },
    { id: 'rep-12', classSessionId: 'cs-12', teacherId: 'teacher-2', reportStatus: 'submitted', generalNotes: 'Practiced counting to 100. Some students struggled with teens.' },
    { id: 'rep-13', classSessionId: 'cs-13', teacherId: 'teacher-2', reportStatus: 'submitted', generalNotes: 'Color vocabulary game was a hit.' },
    { id: 'rep-14', classSessionId: 'cs-14', teacherId: 'teacher-2', reportStatus: 'submitted', generalNotes: 'Present tense introduction. Needs reinforcement.' },
    // Jonas - section-4: 2 of 3 reported
    { id: 'rep-15', classSessionId: 'cs-16', teacherId: 'teacher-2', reportStatus: 'submitted', generalNotes: 'Great energy. Students practiced introductions.' },
    { id: 'rep-16', classSessionId: 'cs-17', teacherId: 'teacher-2', reportStatus: 'submitted', generalNotes: 'Family tree vocabulary. Homework assigned.' },
  ]);

  // ── Teacher Payments (auto-credited hours from reported sessions) ──────────
  // Maya - section-1: 6 sessions x 1h = 6h
  // Maya - section-3: 4 sessions x 2h = 8h
  // Jonas - section-2: 4 sessions x 1.5h = 6h (1 more unreported)
  // Jonas - section-4: 2 sessions x 1.5h = 3h (1 more unreported)
  await db.insert(teacherPayments).values([
    // Maya section-1 (all 6 paid by pre-1 payment, 2 remaining unpaid)
    { id: 'tpay-1', teacherId: 'teacher-1', sectionId: 'section-1', classSessionId: 'cs-1', hours: 1, paymentRecordId: 'pay-1' },
    { id: 'tpay-2', teacherId: 'teacher-1', sectionId: 'section-1', classSessionId: 'cs-2', hours: 1, paymentRecordId: 'pay-1' },
    { id: 'tpay-3', teacherId: 'teacher-1', sectionId: 'section-1', classSessionId: 'cs-3', hours: 1, paymentRecordId: 'pay-1' },
    { id: 'tpay-4', teacherId: 'teacher-1', sectionId: 'section-1', classSessionId: 'cs-4', hours: 1, paymentRecordId: 'pay-1' },
    { id: 'tpay-5', teacherId: 'teacher-1', sectionId: 'section-1', classSessionId: 'cs-5', hours: 1, paymentRecordId: null },
    { id: 'tpay-6', teacherId: 'teacher-1', sectionId: 'section-1', classSessionId: 'cs-6', hours: 1, paymentRecordId: null },
    // Maya section-3 (4 sessions x 2h = 8h, all paid)
    { id: 'tpay-7', teacherId: 'teacher-1', sectionId: 'section-3', classSessionId: 'cs-7', hours: 2, paymentRecordId: 'pay-2' },
    { id: 'tpay-8', teacherId: 'teacher-1', sectionId: 'section-3', classSessionId: 'cs-8', hours: 2, paymentRecordId: 'pay-2' },
    { id: 'tpay-9', teacherId: 'teacher-1', sectionId: 'section-3', classSessionId: 'cs-9', hours: 2, paymentRecordId: 'pay-2' },
    { id: 'tpay-10', teacherId: 'teacher-1', sectionId: 'section-3', classSessionId: 'cs-10', hours: 2, paymentRecordId: 'pay-2' },
    // Jonas section-2 (4 reported sessions x 1.5h = 6h, 2 paid)
    { id: 'tpay-11', teacherId: 'teacher-2', sectionId: 'section-2', classSessionId: 'cs-11', hours: 1.5, paymentRecordId: 'pay-3' },
    { id: 'tpay-12', teacherId: 'teacher-2', sectionId: 'section-2', classSessionId: 'cs-12', hours: 1.5, paymentRecordId: 'pay-3' },
    { id: 'tpay-13', teacherId: 'teacher-2', sectionId: 'section-2', classSessionId: 'cs-13', hours: 1.5, paymentRecordId: null },
    { id: 'tpay-14', teacherId: 'teacher-2', sectionId: 'section-2', classSessionId: 'cs-14', hours: 1.5, paymentRecordId: null },
    // Jonas section-4 (2 reported sessions x 1.5h = 3h, all unpaid)
    { id: 'tpay-15', teacherId: 'teacher-2', sectionId: 'section-4', classSessionId: 'cs-16', hours: 1.5, paymentRecordId: null },
    { id: 'tpay-16', teacherId: 'teacher-2', sectionId: 'section-4', classSessionId: 'cs-17', hours: 1.5, paymentRecordId: null },
  ]);

  // ── Payment Records ────────────────────────────────────────────────────────
  await db.insert(paymentRecords).values([
    // Maya - paid for 4h of section-1 ($15/hr = $60)
    { id: 'pay-1', teacherId: 'teacher-1', hoursPaid: 4, amountPaid: 60, notes: 'June payment for Confident Conversation (4 sessions)', paidBy: 'user-admin' },
    // Maya - paid for 8h of section-3 ($20/hr = $160)
    { id: 'pay-2', teacherId: 'teacher-1', hoursPaid: 8, amountPaid: 160, notes: 'June payment for SAT Prep (4 sessions)', paidBy: 'user-admin' },
    // Jonas - paid for 3h of section-2 ($8/hr = $24)
    { id: 'pay-3', teacherId: 'teacher-2', hoursPaid: 3, amountPaid: 24, notes: 'Partial payment for Beginner Group A', paidBy: 'user-admin' },
  ]);

  // Summary:
  // Maya (teacher-1):
  //   section-1: 6h total, 4h paid, 2h left ($60 paid, $30 remaining)
  //   section-3: 8h total, 8h paid, 0h left ($160 paid, $0 remaining)
  //   TOTAL: 14h paid, 2h left
  // Jonas (teacher-2):
  //   section-2: 6h total, 3h paid, 3h left ($24 paid, $24 remaining)
  //   section-4: 3h total, 0h paid, 3h left ($0 paid, $30 remaining)
  //   TOTAL: 3h paid, 6h left

  console.log('Seed complete!');
  await closeDb();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
