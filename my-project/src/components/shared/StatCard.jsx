import React from "react";

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      
      {/* Top Section */}
      <div className="flex items-center justify-between mb-4">
        
        {/* Icon */}
        <div
          className={`p-3 rounded-lg ${
            colorClasses[color] || colorClasses.blue
          }`}
        >
          {Icon && <Icon size={24} />}
        </div>

        {/* Trend */}
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      {/* Value */}
      <h3 className="text-3xl font-bold mb-1">{value}</h3>

      {/* Title */}
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};