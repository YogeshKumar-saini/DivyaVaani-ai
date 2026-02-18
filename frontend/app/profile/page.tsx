'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-provider';
import { authService } from '@/lib/api/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldCheck, BadgeCheck, Clock3 } from 'lucide-react';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsProfileLoading(true);
    setProfileMessage('');
    setProfileError('');

    try {
      await authService.updateProfile(token, {
        full_name: fullName,
        avatar_url: avatarUrl,
      });
      setProfileMessage('Profile updated successfully.');
      window.location.reload();
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsPasswordLoading(true);
    setPasswordMessage('');
    setPasswordError('');

    try {
      await authService.updatePassword(token, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordMessage('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-cyan-200/20 bg-slate-900/55 p-8 backdrop-blur-xl">
          <h1 className="text-4xl text-slate-50" style={{ fontFamily: 'var(--font-playfair)' }}>Account Settings</h1>
          <p className="mt-2 text-slate-300">Manage your profile, security, and account hygiene.</p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-cyan-200/15 bg-slate-900/70 p-3 text-sm text-slate-200 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-cyan-200" /> Profile completion: Active
            </div>
            <div className="rounded-xl border border-cyan-200/15 bg-slate-900/70 p-3 text-sm text-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-200" /> Security posture: Good
            </div>
            <div className="rounded-xl border border-cyan-200/15 bg-slate-900/70 p-3 text-sm text-slate-200 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-cyan-200" /> Last updated: just now
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1 border-cyan-200/15 bg-slate-900/55 backdrop-blur-xl">
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4 ring-2 ring-cyan-200/25">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-cyan-300/20 text-slate-100 text-2xl">
                  {user.full_name?.charAt(0) || user.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg text-center text-slate-100">{user.full_name || 'User'}</h2>
              <p className="text-sm text-slate-300 text-center mb-4 break-all">{user.email}</p>
              <Button variant="outline" className="w-full border-cyan-200/30 text-slate-100 hover:bg-cyan-300/10" onClick={logout}>
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-4 bg-slate-900/60 border border-cyan-200/20">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="border-cyan-200/15 bg-slate-900/55 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Profile Information</CardTitle>
                    <CardDescription className="text-slate-300">Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">Email</Label>
                        <Input id="email" value={user.email} disabled className="bg-slate-800/60 border-cyan-200/20 text-slate-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-slate-200">Full Name</Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-slate-800/60 border-cyan-200/20 text-slate-100" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl" className="text-slate-200">Avatar URL</Label>
                        <Input
                          id="avatarUrl"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="bg-slate-800/60 border-cyan-200/20 text-slate-100"
                        />
                      </div>

                      {profileError && <p className="text-sm text-rose-200">{profileError}</p>}
                      {profileMessage && <p className="text-sm text-emerald-200">{profileMessage}</p>}

                      <Button type="submit" disabled={isProfileLoading} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                        {isProfileLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card className="border-cyan-200/15 bg-slate-900/55 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Change Password</CardTitle>
                    <CardDescription className="text-slate-300">Set a stronger password for your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="oldPassword" className="text-slate-200">Current Password</Label>
                        <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="bg-slate-800/60 border-cyan-200/20 text-slate-100" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-slate-200">New Password</Label>
                        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} className="bg-slate-800/60 border-cyan-200/20 text-slate-100" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-200">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="bg-slate-800/60 border-cyan-200/20 text-slate-100" />
                      </div>

                      {passwordError && <p className="text-sm text-rose-200">{passwordError}</p>}
                      {passwordMessage && <p className="text-sm text-emerald-200">{passwordMessage}</p>}

                      <Button type="submit" disabled={isPasswordLoading} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                        {isPasswordLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
