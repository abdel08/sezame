'use client';

import { motion } from 'framer-motion';
import HeaderIntervention from '@/components/HeaderIntervention';
import TimelineÉtapes from '@/components/TimelineÉtapes';

export default function LayoutTechnicien({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderIntervention />
      <TimelineÉtapes />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="p-6 space-y-6 max-w-4xl mx-auto"
      >
        {children}
      </motion.main>
    </div>
  );
}
