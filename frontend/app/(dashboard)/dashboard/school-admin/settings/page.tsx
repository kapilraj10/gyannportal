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

export default function SchoolAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Globe },
  ];

  return (
    <DashboardShell role="SCHOOL_ADMIN">
      <div className="mb-8">
        <div>
          <p className="text-sm text-slate-500">Configure school settings</p>
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
                <h3 className="font-semibold text-slate-900">School Information</h3>
                <p className="mt-1 text-sm text-slate-500">Basic information about your school</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">School Name</label>
                  <input
                    type="text"
                    defaultValue="Demo School"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">School Code</label>
                  <input
                    type="text"
                    defaultValue="GYAN001"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Registration Number</label>
                  <input
                    type="text"
                    defaultValue="DEMO-REG-001"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Address</label>
                  <textarea
                    defaultValue="Kathmandu, Nepal"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="tel"
                    defaultValue="9800000000"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    defaultValue="info@demoschool.gyannportal.com"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Website</label>
                  <input
                    type="url"
                    defaultValue="https://demoschool.gyannportal.com"
                    className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Default Timezone</label>
                  <select className="mt-1 rounded-lg border border-slate-200 w-full px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Asia/Kathmandu">Asia/Kathmandu (NPT)</option>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </select>
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
                <p className="mt-1 text-sm text-slate-500">Manage authentication and access control</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Require 2FA for admin accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 rounded-full bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Session Timeout</p>
                    <p className="text-sm text-slate-500">Auto-logout after inactivity</p>
                  </div>
                  <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60" selected>1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Password Policy</p>
                    <p className="text-sm text-slate-500">Enforce strong passwords</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 rounded-full bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600" />
                  </label>
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
                <p className="mt-1 text-sm text-slate-500">Configure how you receive school notifications</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "New Admissions", description: "When new students enroll" },
                  { label: "Fee Payments", description: "When fees are paid" },
                  { label: "Attendance Alerts", description: "Low attendance warnings" },
                  { label: "Exam Schedules", description: "Upcoming exam notifications" },
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
                  <label className="block text-sm font-medium text-slate-700">Primary Color</label>
                  <div className="mt-2 flex gap-3">
                    {["blue", "teal", "violet", "amber", "pink", "green"].map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-lg border-2 transition ${color === "blue" ? "border-blue-600" : "border-transparent hover:border-slate-300"}`}
                        style={{ backgroundColor: `var(--color-${color}-600)` }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Dark Mode</p>
                    <p className="text-sm text-slate-500">Enable dark theme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 rounded-full bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600" />
                  </label>
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