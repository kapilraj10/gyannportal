"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import {
  Building2,
  ChevronRight,
  GraduationCap,
  Loader2,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

import { getErrorMessage } from "@/lib/errors";

const initialForm = {
  schoolName: "",
  schoolCode: "",
  registrationNumber: "",
  schoolType: "PRIVATE",
  level: "SECONDARY",
  establishedYear: "",
  schoolEmail: "",
  phone: "",
  website: "",
  address: "",

  adminName: "",
  adminEmail: "",
  adminPhone: "",
  adminPassword: "",

  branchName: "Main Branch",
  branchAddress: "",
};

export default function RegisterSchoolPage() {
  const router = useRouter();

  const { registerSchool } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await registerSchool({
        ...form,
        establishedYear: form.establishedYear
          ? Number(form.establishedYear)
          : undefined,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err) || "Unable to register school");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <GraduationCap size={30} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Register your school
          </h1>

          <p className="mt-2 text-slate-500">
            Create your GyannPortal education management account
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                <Building2 size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  School information
                </h2>

                <p className="text-sm text-slate-500">
                  Basic information about your institution
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="School name"
                value={form.schoolName}
                onChange={(v) => update("schoolName", v)}
                required
              />

              <Input
                label="School code"
                value={form.schoolCode}
                onChange={(v) => update("schoolCode", v.toUpperCase())}
                placeholder="GPS001"
                required
              />

              <Input
                label="Registration number"
                value={form.registrationNumber}
                onChange={(v) => update("registrationNumber", v)}
              />

              <Select
                label="School type"
                value={form.schoolType}
                onChange={(v) => update("schoolType", v)}
                options={[
                  ["PUBLIC", "Public"],
                  ["PRIVATE", "Private"],
                  ["COMMUNITY", "Community"],
                  ["OTHER", "Other"],
                ]}
              />

              <Select
                label="Education level"
                value={form.level}
                onChange={(v) => update("level", v)}
                options={[
                  ["PRIMARY", "Primary"],
                  ["SECONDARY", "Secondary"],
                  ["HIGHER_SECONDARY", "Higher Secondary"],
                  ["COLLEGE", "College"],
                  ["UNIVERSITY", "University"],
                  ["OTHER", "Other"],
                ]}
              />

              <Input
                label="Established year"
                type="number"
                value={form.establishedYear}
                onChange={(v) => update("establishedYear", v)}
              />

              <Input
                label="School email"
                type="email"
                value={form.schoolEmail}
                onChange={(v) => update("schoolEmail", v)}
              />

              <Input
                label="Phone"
                value={form.phone}
                onChange={(v) => update("phone", v)}
              />

              <Input
                label="Website"
                value={form.website}
                onChange={(v) => update("website", v)}
              />

              <Input
                label="Address"
                value={form.address}
                onChange={(v) => update("address", v)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                <UserRound size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  School administrator
                </h2>

                <p className="text-sm text-slate-500">
                  This account will manage your school
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Full name"
                value={form.adminName}
                onChange={(v) => update("adminName", v)}
                required
              />

              <Input
                label="Email"
                type="email"
                value={form.adminEmail}
                onChange={(v) => update("adminEmail", v)}
                required
              />

              <Input
                label="Phone"
                value={form.adminPhone}
                onChange={(v) => update("adminPhone", v)}
              />

              <Input
                label="Password"
                type="password"
                value={form.adminPassword}
                onChange={(v) => update("adminPassword", v)}
                required
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Main branch</h2>

            <p className="mb-5 text-sm text-slate-500">
              You can add more branches later.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Branch name"
                value={form.branchName}
                onChange={(v) => update("branchName", v)}
              />

              <Input
                label="Branch address"
                value={form.branchAddress}
                onChange={(v) => update("branchAddress", v)}
              />
            </div>
          </section>

          <button
            disabled={loading}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating school...
              </>
            ) : (
              <>
                Create school account
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}