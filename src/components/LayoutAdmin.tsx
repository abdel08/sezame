'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  LogOut,
  BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '../../lib/supabaseClient';

const adminLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Interventions', icon: CalendarCheck, href: '/admin/interventions' },
  { label: 'Techniciens', icon: Users, href: '/admin/techniciens' },
  { label: 'Statistiques', icon: BarChart2, href: '/admin/stats' },
];

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/connexion');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white border-r shadow-sm p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6">📊 Admin</h1>
          <nav className="space-y-2">
            {adminLinks.map(({ label, icon: Icon, href }) => (
              <Button
                key={href}
                variant={pathname === href ? 'default' : 'ghost'}
                className="w-full justify-start gap-2 text-left"
                onClick={() => router.push(href)}
              >
                <Icon className="w-4 h-4" /> {label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
            disabled={loading}
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
