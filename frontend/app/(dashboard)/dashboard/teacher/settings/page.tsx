"use client";

import { useState } from "react";
import {
  Bell,
  Building2,
  Globe,
  Lock,
  Mail,
  Save,
  Shield,
  User,
} from "lucide-react";

import DashboardShell from "@/components/DashboardShell";

export default function TeacherSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Globe },
  ];

  return (
    <DashboardShell role="TEACHER">
      <div className="mb-8">
        <div>
          <p className="text-sm text-slate-500">Manage your teacher account settings</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200">
          <nav className="flex gap-1 px-3" aria-label="Settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {saved && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
              Settings saved successfully!
            </div>
          )}

          {activeTab === "general" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-semibold text-slate-900">Profile Information</h3>
                <p className="mt-1 text-sm text-slate-500">Your personal information</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Anita Gurung"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    defaultValue="teacher1@gyannportal.com"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="tel"
                    defaultValue="9800000002"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Employee Code</label>
                  <input
                    type="text"
                    defaultValue="TCH-001"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Qualification</label>
                  <input
                    type="text"
                    defaultValue="M.Sc. Mathematics"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Joining Date</label>
                  <input
                    type="date"
                    defaultValue="2022-04-01"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => setSaved(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-semibold text-slate-900">Security Settings</h3>
                <p className="mt-1 text-sm text-slate-500">Manage your account security</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Add an extra layer of security</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 rounded-full bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Change Password</p>
                    <p className="text-sm text-slate-500">Update your login password</p>
                  </div>
                  <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Change Password
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Save size={18} />
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-semibold text-slate-900">Notification Preferences</h3>
                <p className="mt-1 text-sm text-slate-500">Configure how you receive notifications</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Assignment Submissions", description: "When students submit assignments" },
                  { label: "Assignment Graded", description: "When you grade assignments" },
                  { label: "Attendance Reminders", description: "Daily attendance reminders" },
                  { label: "New Announcements", description: "School-wide announcements" },
                  { label: "System Alerts", description: "Critical system notifications" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 rounded-full bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Save size={18} />
                  Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-semibold text-slate-900">Appearance</h3>
                <p className="mt-1 text-sm text-slate-500">Customize the look and feel</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Theme</label>
                  <div className="mt-2 flex gap-3">
                    {["Light", "Dark", "System"].map((theme) => (
                      <button
                        key={theme}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${theme === "Light" ? "border-blue-600 text-blue-600 bg-blue-50" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Compact Mode</p>
                    <p className="text-sm text-slate-500">Reduce spacing for denser information</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 rounded-full bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Save size={18} />
                  Save Appearance Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}