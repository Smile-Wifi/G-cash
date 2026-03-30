import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, History, Scan, User, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useNotifications } from '../hooks/useNotifications';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: History, label: 'History', path: '/transactions' },
    { icon: Scan, label: 'Scan', path: '/scan' },
    { icon: Bell, label: 'Alerts', path: '/notifications', badge: unreadCount },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  if (isAdmin) {
    navItems.push({ icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-md mx-auto p-4">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors relative",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <item.icon size={22} />
              <span className="text-[9px] font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-0 right-0 -translate-y-1 translate-x-1 bg-red-500 text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
