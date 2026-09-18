"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  CreditCard,
  Download,
  Search,
  XCircle,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
  description: string;
}

const mockFees: FeeRecord[] = [
  { id: "1", studentId: "1", studentName: "Aayush Thapa", amount: 50000, paidAmount: 40000, dueDate: "2026-12-28", status: "PARTIAL", description: "Term 1 Tuition" },
  { id: "2", studentId: "2", studentName: "Bina Thapa", amount: 50000, paidAmount: 50000, dueDate: "2026-12-28", status: "PAID", description: "Term 1 Tuition" },
  { id: "3", studentId: "1", studentName: "Aayush Thapa", amount: 15000, paidAmount: 0, dueDate: "2026-11-15", status: "PENDING", description: "Transport Fee" },
  { id: "4", studentId: "2", studentName: "Bina Thapa", amount: 15000, paidAmount: 15000, dueDate: "2026-11-15", status: "PAID", description: "Transport Fee" },
  { id: "5", studentId: "1", studentName: "Aayush Thapa", amount: 8000, paidAmount: 0, dueDate: "2026-12-01", status: "OVERDUE", description: "Exam Fee" },
];

export default function ParentFeesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredFees = mockFees.filter((fee) => {
    const matchesSearch = fee.studentName.toLowerCase().includes(search.toLowerCase()) ||
      fee.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = mockFees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = mockFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = totalAmount - totalPaid;

  const statusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "PARTIAL":
        return "bg-amber-100 text-amber-700";
      case "PENDING":
        return "bg-blue-100 text-blue-700";
      case "OVERDUE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle size={14} className="text-green-600" />;
      case "PARTIAL":
        return <CalendarDays size={14} className="text-amber-600" />;
      case "PENDING":
        return <CalendarDays size={14} className="text-blue-600" />;
      case "OVERDUE":
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <CreditCard size={14} className="text-slate-600" />;
    }
  };

  return (
    <DashboardShell role="PARENT">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Manage and track fee payments</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Fees & Payments</h2>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Fees</p>
              <p className="text-2xl font-bold text-slate-900">NPR {totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Paid</p>
              <p className="text-2xl font-bold text-slate-900">NPR {totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Outstanding</p>
              <p className="text-2xl font-bold text-slate-900">NPR {totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-semibold text-slate-900">Fee Records</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search fees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{fee.studentName}</div>
                    <div className="text-sm text-slate-500">{fee.studentId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{fee.description}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-900">NPR {fee.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">NPR {fee.paidAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-900">NPR {(fee.amount - fee.paidAmount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(fee.status)}`}>
                      {statusIcon(fee.status)}
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                      {fee.status === "PAID" ? "View Receipt" : "Pay Now"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";
    case "PARTIAL":
      return "bg-amber-100 text-amber-700";
    case "PENDING":
      return "bg-blue-100 text-blue-700";
    case "OVERDUE":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "PAID":
      return <CheckCircle size={12} className="text-green-600" />;
    case "PARTIAL":
      return <CalendarDays size={12} className="text-amber-600" />;
    case "PENDING":
      return <CalendarDays size={12} className="text-blue-600" />;
    case "OVERDUE":
      return <XCircle size={12} className="text-red-600" />;
    default:
      return <CreditCard size={12} className="text-slate-600" />;
  }
}