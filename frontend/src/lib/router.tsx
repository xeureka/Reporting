import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { RootLayout } from '../components/layout/RootLayout';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AssignmentsPage } from '../pages/AssignmentsPage';
import { CoursesPage } from '../pages/CoursesPage';
import { HomeworkPage } from '../pages/HomeworkPage';
import { LoginRoute } from '../pages/LoginPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SessionsPage } from '../pages/SessionsPage';
import { StudentPage } from '../pages/StudentPage';
import { StudentsPage } from '../pages/StudentsPage';
import { TeacherDashboardPage } from '../pages/TeacherDashboardPage';

const rootRoute = createRootRoute({ component: RootLayout });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginRoute });
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedLayout,
});
const indexRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: AdminDashboardPage,
});
const teacherRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/teacher',
  component: TeacherDashboardPage,
});
const studentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/students',
  component: StudentsPage,
});
const studentRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/students/$studentId',
  component: StudentPage,
});
const coursesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/courses',
  component: CoursesPage,
});
const assignmentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/assignments',
  component: AssignmentsPage,
});
const sessionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/sessions',
  component: SessionsPage,
});
const homeworkRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/homework',
  component: HomeworkPage,
});
const reportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/reports',
  component: ReportsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    indexRoute,
    teacherRoute,
    studentsRoute,
    studentRoute,
    coursesRoute,
    assignmentsRoute,
    sessionsRoute,
    homeworkRoute,
    reportsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
