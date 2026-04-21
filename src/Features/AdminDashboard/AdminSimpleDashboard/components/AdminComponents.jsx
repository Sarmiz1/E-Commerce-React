import React from 'react';
import { Search, Bell, User, CheckCircle2, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';

export function AdminTopbar() {
  return (
    <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search orders, sellers, users... (Ctrl+K)" 
            className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          All Systems Operational
        </div>
        <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
          AD
        </div>
      </div>
    </div>
  );
}

export function MetricCard({ title, value, change, trend }) {
  const isUp = trend === 'up';
  const isNeutral = trend === 'neutral';
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-sm font-medium text-gray-500 mb-2">{title}</div>
      <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
      
      <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${
        isNeutral ? 'text-gray-500' : isUp ? 'text-green-600' : 'text-red-600'
      }`}>
        {!isNeutral && (isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />)}
        <span>{change}</span>
        <span className="text-gray-400 font-normal ml-1">vs last month</span>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const normalized = status.toLowerCase();
  
  let colorClass = "bg-gray-100 text-gray-700 border-gray-200"; // default
  
  if (['delivered', 'active', 'paid', 'resolved'].includes(normalized)) {
    colorClass = "bg-green-50 text-green-700 border-green-200";
  } else if (['pending', 'shipped', 'open'].includes(normalized)) {
    colorClass = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (['cancelled', 'suspended', 'refunded'].includes(normalized)) {
    colorClass = "bg-red-50 text-red-700 border-red-200";
  } else if (['draft'].includes(normalized)) {
    colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
      {status}
    </span>
  );
}

export function DataTable({ columns, data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">
                {col.header}
              </th>
            ))}
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
              {columns.map((col, j) => (
                <td key={j} className="px-6 py-4 text-gray-900 font-medium">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="py-12 text-center text-gray-500">No records found.</div>
      )}
    </div>
  );
}
