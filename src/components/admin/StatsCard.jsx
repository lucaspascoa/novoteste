import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600", 
  amber: "from-amber-500 to-amber-600",
  purple: "from-purple-500 to-purple-600",
  indigo: "from-indigo-500 to-indigo-600",
  red: "from-red-500 to-red-600"
};

export default function StatsCard({ title, value, icon: Icon, color = "blue", trend }) {
  return (
    <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm shadow-xl border-slate-200/60 hover:shadow-2xl transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${colorClasses[color]} opacity-10 transform translate-x-8 -translate-y-8 rounded-full`} />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <TrendingUp className="w-4 h-4" />
                {trend}
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
