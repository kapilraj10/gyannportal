"use client";

import { useState } from "react";
import { KeyRound, Lock, Save } from "lucide-react";

import { authApi } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/providers/auth-provider";

import DashboardShell from "@/components/DashboardShell";
import { Button, Card, Field, Input } from "@/components/ui";
import type { UserRole } from "@/lib/roles";

export default function AccountSettingsPage({ role }: { role: UserRole }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSaveProfile() {
    setProfileSaving(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      await authApi.updateProfile({
        name: profile.name,
        phone: profile.phone,
      });
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileError(getErrorMessage(error));
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword() {
    setPasswordSaving(true);
    setPasswordMessage(null);
    setPasswordError(null);

    try {
      if (password.newPassword !== password.confirmNewPassword) {
        setPasswordError("New passwords do not match.");
        return;
      }

      await authApi.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
        confirmNewPassword: password.confirmNewPassword,
      });
      setPasswordMessage("Password changed successfully. Please log in again on your next session.");
      setPassword({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <DashboardShell role={role}>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card title="Profile" description="Your basic account information">
            <div className="space-y-4">
              <Field label="Full name">
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </Field>

              <Field label="Email">
                <Input value={user?.email ?? ""} disabled />
              </Field>

              <Field label="Phone">
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </Field>

              {profileMessage && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {profileMessage}
                </p>
              )}
              {profileError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {profileError}
                </p>
              )}

              <Button loading={profileSaving} onClick={() => void handleSaveProfile()}>
                <Save className="h-4 w-4" />
                Save profile
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card
            title="Change password"
            description="Rotates your access and refresh tokens, signing you out elsewhere."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Current password">
                  <Input
                    type="password"
                    value={password.currentPassword}
                    onChange={(e) =>
                      setPassword({ ...password, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                  />
                </Field>
              </div>

              <Field label="New password">
                <Input
                  type="password"
                  value={password.newPassword}
                  onChange={(e) =>
                    setPassword({ ...password, newPassword: e.target.value })
                  }
                  placeholder="At least 8 characters"
                />
              </Field>

              <Field label="Confirm new password">
                <Input
                  type="password"
                  value={password.confirmNewPassword}
                  onChange={(e) =>
                    setPassword({ ...password, confirmNewPassword: e.target.value })
                  }
                  placeholder="Repeat new password"
                />
              </Field>
            </div>

            {passwordMessage && (
              <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {passwordMessage}
              </p>
            )}
            {passwordError && (
              <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {passwordError}
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <Button
                loading={passwordSaving}
                onClick={() => void handleChangePassword()}
              >
                <KeyRound className="h-4 w-4" />
                Update password
              </Button>
              <Lock className="h-4 w-4 text-slate-300" />
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}