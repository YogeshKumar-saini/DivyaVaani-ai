
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
import { ShieldCheck, BadgeCheck, Clock3, LogOut, User, Lock, Mail, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { GrainOverlay } from '@/components/ui/GrainOverlay';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    try {
      await authService.updateProfile(token, {
        full_name: fullName,
        avatar_url: avatarUrl,
      });
      toast.success('Profile updated successfully');
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsPasswordLoading(true);

    try {
      await authService.updatePassword(token, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <GrainOverlay />

      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

      <motion.div
        className="mx-auto max-w-6xl space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <section className="rounded-3xl border border-white/10 bg-black/20 p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70">Account Settings</h1>
            <p className="mt-2 text-white/60 text-lg font-light">Manage your profile, security, and account hygiene.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: BadgeCheck, text: "Profile completion: Active", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { icon: ShieldCheck, text: "Security posture: Good", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                { icon: Clock3, text: "Last updated: just now", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" }
              ].map((item, i) => (
                <div key={i} className={`rounded-xl border ${item.bg} p-4 text-sm text-white/80 flex items-center gap-3 backdrop-blur-sm`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="lg:col-span-1 border-white/10 bg-black/20 backdrop-blur-2xl shadow-xl h-fit">
            <CardContent className="pt-8 pb-8 flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <Avatar className="h-32 w-32 mb-6 ring-4 ring-white/10 shadow-2xl group-hover:ring-primary/50 transition-all duration-500">
                  <AvatarImage src={user.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                    {user.full_name?.charAt(0) || user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 p-2 bg-black/80 rounded-full border border-white/20 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4" />
                </div>
              </div>

              <h2 className="font-bold text-xl text-center text-white mb-1">{user.full_name || 'User'}</h2>
              <p className="text-sm text-white/50 text-center mb-6 break-all font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5">{user.email}</p>

              <Button
                variant="outline"
                className="w-full bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-medium h-10 transition-all"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6 bg-black/20 border border-white/10 p-1 w-full sm:w-auto h-12 rounded-xl backdrop-blur-md">
                <TabsTrigger value="profile" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 h-10 px-6 rounded-lg transition-all">Profile Details</TabsTrigger>
                <TabsTrigger value="password" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 h-10 px-6 rounded-lg transition-all">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-0">
                <Card className="border-white/10 bg-black/20 backdrop-blur-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile Information</CardTitle>
                    <CardDescription className="text-white/50">Update your personal details visible to others.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/80">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                          <Input id="email" value={user.email} disabled className="pl-10 bg-white/5 border-white/10 text-white/50 cursor-not-allowed selection:bg-white/20" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-white/80">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-white/20 transition-all h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl" className="text-white/80">Avatar URL</Label>
                        <Input
                          id="avatarUrl"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-white/20 transition-all h-11"
                        />
                        <p className="text-xs text-white/40">Link to an image file (PNG, JPG) for your profile picture.</p>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isProfileLoading} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11 px-8 rounded-xl font-semibold">
                          {isProfileLoading ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password" className="mt-0">
                <Card className="border-white/10 bg-black/20 backdrop-blur-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Change Password</CardTitle>
                    <CardDescription className="text-white/50">Ensure your account uses a strong, unique password.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="oldPassword" className="text-white/80">Current Password</Label>
                        <Input
                          id="oldPassword"
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                          className="bg-white/5 border-white/10 text-white focus:bg-white/10 h-11"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-white/80">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            className="bg-white/5 border-white/10 text-white focus:bg-white/10 h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-white/80">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            className="bg-white/5 border-white/10 text-white focus:bg-white/10 h-11"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isPasswordLoading} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11 px-8 rounded-xl font-semibold">
                          {isPasswordLoading ? 'Updating...' : 'Update Password'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
