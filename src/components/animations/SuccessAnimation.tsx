'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="flex flex-col items-center justify-center text-green-600 space-y-2"
    >
      <CheckCircle size={64} />
      <p className="text-lg font-semibold">Intervention finalisée avec succès.</p>
    </motion.div>
  );
}
