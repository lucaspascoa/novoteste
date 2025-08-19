import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminFab() {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
    >
      {/* Botão Principal - Dashboard */}
      <Button
        asChild
        className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-full shadow-2xl h-14 w-auto px-6 gap-3 hover:scale-105 transition-transform"
      >
        <Link to={createPageUrl('AdminDashboard')}>
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-semibold">Painel Admin</span>
        </Link>
      </Button>

      {/* Botão Secundário - Configurações */}
      <Button
        asChild
        size="icon"
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl h-12 w-12 hover:scale-105 transition-transform"
      >
        <Link to={createPageUrl('StoreSettings')}>
          <Settings className="w-5 h-5" />
        </Link>
      </Button>
    </motion.div>
  );
}
