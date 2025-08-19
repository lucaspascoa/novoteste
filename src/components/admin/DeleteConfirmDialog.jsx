import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteConfirmDialog({ isOpen, productName, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Excluir Produto
                </h3>
                <p className="text-slate-600 mb-6">
                  Tem certeza que deseja excluir o produto <strong>"{productName}"</strong>? 
                  Esta ação não pode ser desfeita.
                </p>
                
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onConfirm}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir Produto
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
