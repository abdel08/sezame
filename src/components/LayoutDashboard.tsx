// components/LayoutDashboard.tsx
'use client'

import { PropsWithChildren } from 'react';
import { Sidebar } from './Sidebar';

export default function LayoutDashboard({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
