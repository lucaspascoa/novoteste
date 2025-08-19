import React from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

export default function CategoryGrid({ categories, onCategorySelect }) {
  if (!categories || categories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Categorias</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onCategorySelect(category.name)}
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/60 hover:border-blue-300"
          >
            <div className="flex flex-col items-center gap-3">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-12 h-12 object-cover rounded-xl"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Package className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors duration-200">
                {category.name}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
