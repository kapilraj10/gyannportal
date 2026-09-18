 "use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, X, Mail, Lock, UserRound, Building2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getErrorMessage } from "@/lib/errors";

type Tab = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
}

export default function AuthModal({ open, onClose, initialTab = "login" }: AuthModalProps) {
  const router = useRouter();
  const { login, registerSchool } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function navigateToDashboard() {
    onClose();
    router.push("/dashboard");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-fade-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center px-8 pt-8 pb-4">
          <Image
            src="/logo1.png"
            alt="GyannPortal"
            width={1536}
            height={1024}
            className="h-14 w-auto object-contain"
          />
          <p className="mt-2 text-sm text-slate-400">Education Management Platform</p>
        </div>

        {/* Tabs */}
        <div className="mx-8 mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              tab === "login"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              tab === "register"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Register School
          </button>
        </div>

        {/* Forms */}
        <div className="px-8 pb-8">
          {tab === "login" ? (
            <LoginForm onSubmit={login} onSuccess={navigateToDashboard} />
          ) : (
            <RegisterForm onSubmit={registerSchool} onSuccess={navigateToDashboard} />
          )}
        </div>
      </div>
    </div>
  );
}

function LoginForm({
  onSubmit,
  onSuccess,
}: {
  onSubmit: (data: { email: string; password: string }) => Promise<unknown>;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit({ email, password });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err) || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@school.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}

function RegisterForm({
  onSubmit,
  onSuccess,
}: {
  onSubmit: (data: {
    schoolName: string;
    schoolCode: string;
    schoolType: string;
    schoolEmail: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    adminPassword: string;
  }) => Promise<unknown>;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    schoolName: "",
    schoolCode: "",
    schoolType: "PRIVATE",
    schoolEmail: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err) || "Unable to register school");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
        <p className="text-xs font-medium text-blue-700">School Information</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">School Name</label>
          <div className="relative">
            <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              required
              value={form.schoolName}
              onChange={(e) => update("schoolName", e.target.value)}
              placeholder="Springfield Academy"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">School Code</label>
          <input
            required
            value={form.schoolCode}
            onChange={(e) => update("schoolCode", e.target.value.toUpperCase())}
            placeholder="GPS001"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">School Type</label>
          <select
            value={form.schoolType}
            onChange={(e) => update("schoolType", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          >
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
            <option value="COMMUNITY">Community</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">School Email</label>
          <input
            type="email"
            value={form.schoolEmail}
            onChange={(e) => update("schoolEmail", e.target.value)}
            placeholder="info@school.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
        <p className="text-xs font-medium text-emerald-700">Administrator Account</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Your Name</label>
        <div className="relative">
          <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            required
            value={form.adminName}
            onChange={(e) => update("adminName", e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Your Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={form.adminEmail}
              onChange={(e) => update("adminEmail", e.target.value)}
              placeholder="admin@school.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
          <input
            value={form.adminPhone}
            onChange={(e) => update("adminPhone", e.target.value)}
            placeholder="9800000000"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            required
            minLength={8}
            value={form.adminPassword}
            onChange={(e) => update("adminPassword", e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-teal-700 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          "Create School Account"
        )}
      </button>
    </form>
  );
}