'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const navLinks = [
  { label: 'Mes interventions', icon: ClipboardList, href: '/technicien' },
  { label: 'Calendrier', icon: CalendarDays, href: '/technicien/calendrier' },
];

export default function LayoutDashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/connexion');
  };

  // Prevent body scroll on mobile menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-800">
      {/* Header mobile */}
      <div className="lg:hidden p-4 flex items-center justify-between border-b bg-white shadow-sm z-30">
        <h1 className="text-xl font-bold">🔧 Technicien</h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed z-20 top-0 left-0 h-full bg-white border-r shadow-sm w-64 p-6
          transform transition-transform duration-300 ease-in-out
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:block lg:w-64
        `}
      >
        <nav className="space-y-2 mb-8 mt-12 lg:mt-0">
          {navLinks.map(({ label, icon: Icon, href }) => (
            <Button
              key={href}
              variant={pathname === href ? 'default' : 'ghost'}
              className="w-full justify-start gap-2 text-left"
              onClick={() => {
                router.push(href);
                setMenuOpen(false);
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </nav>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loading}
            className="w-full justify-start gap-2"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto z-0">
        {children}
      </main>
    </div>
  );
}
