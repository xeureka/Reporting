import type { IconType } from 'react-icons';
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineCalendarDays,
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentList,
  HiOutlineHome,
  HiOutlinePencilSquare,
  HiOutlineUser,
  HiOutlineUserGroup,
} from 'react-icons/hi2';

import type { User } from '../api';

export type NavItem = {
  to: string;
  icon: IconType;
  label: string;
};

export const ADMIN_ONLY_PATHS = [
  '/',
  '/courses',
  '/assignments',
  '/sessions',
  '/homework',
  '/reports',
] as const;

export function getNavItems(user: User): NavItem[] {
  if (user.role === 'admin') {
    return [
      { to: '/', icon: HiOutlineHome, label: 'Dashboard' },
      { to: '/students', icon: HiOutlineUserGroup, label: 'Students' },
      { to: '/courses', icon: HiOutlineBookOpen, label: 'Courses' },
      { to: '/assignments', icon: HiOutlineClipboardDocumentList, label: 'Assignments' },
      { to: '/sessions', icon: HiOutlineCalendarDays, label: 'Sessions' },
      { to: '/homework', icon: HiOutlinePencilSquare, label: 'Homework' },
      { to: '/reports', icon: HiOutlineChartBarSquare, label: 'Reports' },
    ];
  }

  if (user.role === 'teacher') {
    return [
      { to: '/teacher', icon: HiOutlineAcademicCap, label: 'Teacher Dashboard' },
      { to: '/students', icon: HiOutlineUserGroup, label: 'Students' },
    ];
  }

  return [
    { to: `/students/${user.studentId}`, icon: HiOutlineUser, label: 'My Page' },
  ];
}
