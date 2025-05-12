'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarDays, ClipboardList, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const navLinks = [
  { label: 'Mes interventions', icon: ClipboardList, href: '/technicien' },
  { label: 'Calendrier', icon: CalendarDays, href: '/technicien/calendrier' },
];

export default function LayoutDashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/connexion');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold mb-8">🔧 Technicien</h1>
          <nav className="space-y-2">
            {navLinks.map(({ label, icon: Icon, href }) => (
              <Button
                key={href}
                variant={pathname === href ? 'default' : 'ghost'}
                className="w-full justify-start gap-2 text-left"
                onClick={() => router.push(href)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>

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
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
