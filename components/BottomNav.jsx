'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/schedule', icon: Calendar, label: 'Schedule' },
    { href: '/photos', icon: Camera, label: 'Photos' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 shadow-lg"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href ||
            (href !== '/' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full min-w-touch",
                "transition-all duration-200 active:scale-95",
                "hover:bg-gray-50"
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute top-1 w-1 h-1 bg-primary-green rounded-full animate-pulse-slow" />
              )}

              <Icon
                className={cn(
                  "w-6 h-6 mb-1 transition-all duration-200",
                  isActive
                    ? "text-primary-green transform scale-110"
                    : "text-gray-500"
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-xs transition-all duration-200",
                  isActive
                    ? "text-primary-green font-semibold"
                    : "text-gray-500 font-medium"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
