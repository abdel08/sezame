'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CalendarDays,
  LogOut,
  ClipboardList,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useEffect, useState } from 'react';

const navLinks = [
  { label: 'Mes interventions', icon: ClipboardList, href: '/technicien' },
  { label: 'Calendrier', icon: CalendarDays, href: '/technicien/calendrier' },
];

export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/connexion');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r p-4 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Technicien</h2>

        <nav className="space-y-2">
          {navLinks.map(({ label, icon: Icon, href }) => (
            <Button
              key={href}
              variant={pathname === href ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => router.push(href)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4">
          <Button variant="outline" onClick={handleLogout} disabled={loading} className="gap-2">
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      <main className="flex-1 bg-muted/50 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
