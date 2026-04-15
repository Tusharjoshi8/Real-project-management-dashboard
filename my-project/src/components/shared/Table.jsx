import React from "react";

// Table Component
export const Table = ({ headers = [], children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] border-b"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-50">
          {children}
        </tbody>
      </table>
    </div>
  );
};

// Table Row
export const TableRow = ({ children, onClick }) => {
  return (
    <tr
      onClick={onClick}
      className={`group transition-all ${onClick ? "cursor-pointer hover:bg-indigo-50/30" : "hover:bg-gray-50/50"}`}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({ children }) => {
  return (
    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-600">
      {children}
    </td>
  );
};