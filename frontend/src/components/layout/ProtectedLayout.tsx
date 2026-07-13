import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from 'react-icons/hi2';
import { Link, Outlet, useLocation, useRouter } from '@tanstack/react-router';

import { useAuth } from '../../auth';
import { ADMIN_ONLY_PATHS, getNavItems } from '../../lib/navigation';
import { Badge } from '../ui/Badge';
import { PremiumLoadingScreen } from '../ui/PremiumLoadingScreen';

const SIDEBAR_COMPACT_KEY = 'sidebar-compact';

const ROLE_LABELS = {
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
} as const;

export function ProtectedLayout() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const location = useLocation();
  const [sidebarCompact, setSidebarCompact] = useState(
    () => localStorage.getItem(SIDEBAR_COMPACT_KEY) === 'true',
  );
  const [ready, setReady] = useState(false);

  const handleLoadingComplete = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.navigate({ to: '/login' });
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    if (user.role !== 'admin' && ADMIN_ONLY_PATHS.includes(location.pathname as (typeof ADMIN_ONLY_PATHS)[number])) {
      router.navigate({
        to: user.role === 'teacher' ? '/teacher' : `/students/${user.studentId}`,
      });
      return;
    }

    if (user.role === 'student') {
      const myPage = user.studentId ? `/students/${user.studentId}` : '/login';
      if (location.pathname !== myPage) {
        router.navigate({ to: myPage });
      }
    }
  }, [user, location.pathname, router]);

  const navItems = useMemo(() => (user ? getNavItems(user) : []), [user]);

  const toggleCompact = () => {
    const next = !sidebarCompact;
    setSidebarCompact(next);
    localStorage.setItem(SIDEBAR_COMPACT_KEY, String(next));
  };

  if (isLoading || !user || !ready) {
    return <PremiumLoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`app-shell premium-content-enter ${sidebarCompact ? 'app-shell-compact' : ''}`}>
      <aside className={`sidebar ${sidebarCompact ? 'sidebar-compact' : ''}`} aria-label="Application sidebar">
        <div className="brand">
          <div className="brand-icon">
            <HiOutlineChatBubbleLeftRight size={24} aria-hidden />
          </div>
          <div>
            <strong>Speak To Reach</strong>
            {!sidebarCompact && (
              <small>
                {user.name}
                <Badge variant="neutral">{ROLE_LABELS[user.role]}</Badge>
              </small>
            )}
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link"
              activeOptions={{ exact: item.to === '/' }}
              activeProps={{ className: 'active', 'aria-current': 'page' }}
            >
              <item.icon size={20} aria-hidden />
              {!sidebarCompact && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!sidebarCompact && (
            <div className="sidebar-user">
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          )}
          <button
            onClick={() => {
              logout();
              router.navigate({ to: '/login' });
            }}
            type="button"
            className="logout-btn"
          >
            <HiOutlineArrowRightOnRectangle size={18} aria-hidden />
            {!sidebarCompact && <span>Sign Out</span>}
          </button>
          <button
            onClick={toggleCompact}
            type="button"
            className="logout-btn"
            aria-label={sidebarCompact ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCompact ? <HiOutlineChevronDoubleRight size={18} /> : <HiOutlineChevronDoubleLeft size={18} />}
          </button>
        </div>
      </aside>

      <main className="content" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
