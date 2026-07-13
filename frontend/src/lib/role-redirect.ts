import type { User } from '../api';

export function roleRedirect(user: User): string {
  if (user.role === 'teacher') return '/teacher';
  if (user.role === 'student' && user.studentId) return `/students/${user.studentId}`;
  return '/';
}
