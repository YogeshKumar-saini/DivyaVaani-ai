
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-provider';
import { authService } from '@/lib/api/auth-service';
import { memoryService, UserMemoryProfile, MemoryFact } from '@/lib/api/memory-service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef } from 'react';
import {
  ShieldCheck, BadgeCheck, Clock3, LogOut, User, Lock, Mail,
  Camera, CheckCircle2, Pencil, BrainCircuit, LibraryBig, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const fadeUp: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (d: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: d, ease: [0.4, 0, 0.2, 1] } }),
};

type Tab = 'profile' | 'security' | 'memory';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Memory tab states
  const [memoryProfile, setMemoryProfile] = useState<UserMemoryProfile | null>(null);
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>([]);
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);
  const [isErasingMemory, setIsErasingMemory] = useState(false);

  // File upload state & ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      await authService.updateProfile(token, { full_name: fullName });
      toast.success('Profile updated successfully');
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const updatedUser = await authService.uploadProfileImage(token, file);
      setAvatarUrl(updatedUser.avatar_url || '');
      toast.success('Profile image updated successfully');
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      // Reset input unneeded since we refresh or can just clear value
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      await authService.updatePassword(token, { old_password: oldPassword, new_password: newPassword });
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

  const loadMemoryData = async () => {
    if (!user) return;
    setIsMemoryLoading(true);
    try {
      const [profile, factsPage] = await Promise.all([
        memoryService.getProfile(user.id),
        memoryService.getFacts(user.id, 50, 0)
      ]);
      setMemoryProfile(profile);
      setMemoryFacts(factsPage.items);
    } catch (err) {
      console.warn('Failed to load memory profile', err);
    } finally {
      setIsMemoryLoading(false);
    }
  };

  const handleDeleteFact = async (factId: string) => {
    if (!user) return;
    try {
      await memoryService.deleteFact(user.id, factId);
      setMemoryFacts(prev => prev.filter(f => f.id !== factId));
      toast.success('Memory deleted successfully');
    } catch {
      toast.error('Failed to delete memory');
    }
  };

  const handleEraseAllMemory = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to completely erase the AI's memory of you? This cannot be undone.")) return;

    setIsErasingMemory(true);
    try {
      await memoryService.eraseAllMemory(user.id);
      setMemoryProfile(null);
      setMemoryFacts([]);
      toast.success('All memory history erased');
    } catch {
      toast.error('Failed to erase memory');
    } finally {
      setIsErasingMemory(false);
    }
  };

  // Load memory data when switching tabs
  useEffect(() => {
    if (activeTab === 'memory' && !memoryProfile) {
      loadMemoryData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, memoryProfile, user]);

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'memory', label: 'Memory', icon: BrainCircuit },
  ];

  const statusItems = [
    { icon: BadgeCheck, label: 'Profile active', color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/15' },
    { icon: ShieldCheck, label: 'Account secure', color: 'text-blue-400', bg: 'bg-blue-500/8 border-blue-500/15' },
    { icon: Clock3, label: 'Last update: now', color: 'text-violet-400', bg: 'bg-violet-500/8 border-violet-500/15' },
  ];

  return (
    <div className="min-h-screen py-6 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-900/8 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-900/6 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10 space-y-6">

        {/* Page header */}
        <motion.div
          variants={fadeUp} custom={0} initial="hidden" animate="visible"
          className="rounded-2xl bg-white/3 border border-white/7 p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-violet-600/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-white/40 mb-3">
                <User className="h-3 w-3 text-violet-400" />
                Account
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">Account Settings</h1>
              <p className="mt-1 text-white/40 text-[14px] font-light">Manage your profile information and security.</p>
            </div>
            <div className="sm:ml-auto flex flex-wrap items-center gap-2">
              {statusItems.map((item) => (
                <div key={item.label}
                  className={`flex items-center gap-2 rounded-xl border ${item.bg} px-3 py-1.5 text-[12px] text-white/60`}
                >
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar / Avatar card */}
          <motion.div
            variants={fadeUp} custom={0.08} initial="hidden" animate="visible"
            className="lg:col-span-1"
          >
            <div className="rounded-2xl bg-white/3 border border-white/7 p-6 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative group mb-4">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  title="Upload profile image"
                >
                  <Avatar className="h-24 w-24 ring-2 ring-white/10 group-hover:ring-violet-500/40 transition-all duration-500 shadow-2xl relative">
                    <AvatarImage src={user.avatar_url} className="object-cover" crossOrigin="anonymous" />
                    <AvatarFallback className="bg-linear-to-br from-violet-600/50 to-indigo-600/50 text-white text-2xl font-bold tracking-tight">
                      {initials}
                    </AvatarFallback>
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                        <span className="h-6 w-6 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      </div>
                    )}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer shadow-lg">
                    <Camera className="h-3.5 w-3.5 text-white/60" />
                  </div>
                </button>
              </div>

              <h2 className="font-bold text-white text-[16px] leading-tight">{user.full_name || 'User'}</h2>
              <p className="text-[12px] text-white/35 mt-1 break-all font-mono">{user.email}</p>

              {/* Divider */}
              <div className="w-full h-px bg-white/6 my-4" />

              {/* Nav tabs (on mobile/col) */}
              <nav className="w-full space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200',
                        active
                          ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/4'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', active ? 'text-violet-400' : 'text-white/30')} />
                      {tab.label}
                      {active && (
                        <motion.div layoutId="tab-dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="w-full h-px bg-white/6 my-4" />

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/15 bg-red-500/8 text-red-400/80 hover:bg-red-500/15 hover:text-red-300 text-[13px] font-medium transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Tab content */}
          <motion.div
            variants={fadeUp} custom={0.15} initial="hidden" animate="visible"
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl bg-white/3 border border-white/7 overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-6 py-5 border-b border-white/6">
                    <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/15">
                      <Pencil className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold text-[15px]">Profile Information</h2>
                      <p className="text-white/35 text-[12px]">Update your personal details</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="p-6 space-y-5">
                    {/* Email (read-only) */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] uppercase tracking-widest text-white/35 font-semibold flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          value={user.email}
                          disabled
                          className="bg-white/2 border-white/6 text-white/40 cursor-not-allowed font-mono text-[13px] h-11 rounded-xl"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded-full">read-only</span>
                        </div>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-[11px] uppercase tracking-widest text-white/35 font-semibold flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your display name"
                        className="bg-white/3 border-white/8 text-white h-11 rounded-xl focus:border-violet-500/40 focus:bg-white/5 transition-all placeholder:text-white/20"
                      />
                    </div>

                    {/* Avatar URL 
                        Removed manually entering avatar URL since we directly upload files now 
                     */}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isProfileLoading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[13px] font-semibold shadow-lg shadow-violet-900/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isProfileLoading ? (
                          <>
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl bg-white/3 border border-white/7 overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-6 py-5 border-b border-white/6">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/15">
                      <Lock className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold text-[15px]">Change Password</h2>
                      <p className="text-white/35 text-[12px]">Keep your account safe with a strong password</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordUpdate} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="oldPassword" className="text-[11px] uppercase tracking-widest text-white/35 font-semibold">
                        Current Password
                      </Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="bg-white/3 border-white/8 text-white h-11 rounded-xl focus:border-violet-500/40 focus:bg-white/5 transition-all placeholder:text-white/15"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="newPassword" className="text-[11px] uppercase tracking-widest text-white/35 font-semibold">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Min. 8 characters"
                          className="bg-white/3 border-white/8 text-white h-11 rounded-xl focus:border-violet-500/40 focus:bg-white/5 transition-all placeholder:text-white/15"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-[11px] uppercase tracking-widest text-white/35 font-semibold">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Repeat new password"
                          className={cn(
                            'bg-white/3 border-white/8 text-white h-11 rounded-xl focus:bg-white/5 transition-all placeholder:text-white/15',
                            confirmPassword && newPassword !== confirmPassword
                              ? 'border-red-500/40 focus:border-red-500/40'
                              : 'focus:border-violet-500/40'
                          )}
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-[11px] text-red-400/70 mt-1">Passwords do not match</p>
                        )}
                      </div>
                    </div>

                    {/* Password strength hint */}
                    <div className="rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-[12px] text-white/30 space-y-1">
                      <p className="font-semibold text-white/25 text-[10px] uppercase tracking-wider mb-1.5">Password tips</p>
                      <p>• At least 8 characters long</p>
                      <p>• Mix uppercase, numbers & symbols</p>
                      <p>• Avoid reusing old passwords</p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isPasswordLoading || (!!confirmPassword && newPassword !== confirmPassword)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[13px] font-semibold shadow-lg shadow-violet-900/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isPasswordLoading ? (
                          <>
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'memory' && (
                <motion.div
                  key="memory-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl bg-white/3 border border-white/7 overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-6 py-5 border-b border-white/6">
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/15">
                      <BrainCircuit className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold text-[15px]">AI Memory & Preferences</h2>
                      <p className="text-white/35 text-[12px]">Manage what the AI has learned about you</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {isMemoryLoading ? (
                      <div className="flex justify-center py-10">
                        <span className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      </div>
                    ) : (
                      <>
                        {/* Summary Stats */}
                        {memoryProfile && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="rounded-xl border border-white/6 bg-white/2 p-4 text-center">
                              <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Spiritual Stage</p>
                              <p className="text-sm font-semibold text-white capitalize">{memoryProfile.spiritual_stage || 'Unknown'}</p>
                            </div>
                            <div className="rounded-xl border border-white/6 bg-white/2 p-4 text-center">
                              <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Top Language</p>
                              <p className="text-sm font-semibold text-white uppercase">{memoryProfile.preferred_language || 'Auto'}</p>
                            </div>
                            <div className="rounded-xl border border-white/6 bg-white/2 p-4 text-center">
                              <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Total Memories</p>
                              <p className="text-sm font-semibold text-violet-300">{memoryProfile.total_facts || 0}</p>
                            </div>
                          </div>
                        )}

                        {/* Top Topics */}
                        {memoryProfile?.top_topics && memoryProfile.top_topics.length > 0 && (
                          <div>
                            <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3 flex items-center gap-2">
                              <LibraryBig className="w-3.5 h-3.5" /> Frequent Topics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {memoryProfile.top_topics.map((topic, i) => (
                                <span key={i} className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/70 border border-white/10">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Stored Facts */}
                        <div>
                          <h3 className="text-xs uppercase tracking-widest text-white/50 mb-3 flex items-center gap-2">
                            <BrainCircuit className="w-3.5 h-3.5" /> Long-Term Memories
                          </h3>

                          {memoryFacts.length === 0 ? (
                            <p className="text-sm text-white/40 italic text-center py-6 border border-dashed border-white/10 rounded-xl">
                              The AI hasn&apos;t gathered any specific facts about you yet. Keep chatting to build your profile!
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {memoryFacts.map(fact => (
                                <li key={fact.id} className="flex justify-between items-center bg-white/3 border border-white/5 px-4 py-3 rounded-xl group/fact">
                                  <div className="max-w-[85%]">
                                    <span className="text-[10px] uppercase text-violet-400 font-semibold mb-0.5 block tracking-widest">{fact.fact_type.replace('_', ' ')}</span>
                                    <span className="text-sm text-white/90">{fact.content}</span>
                                  </div>
                                  <button onClick={() => handleDeleteFact(fact.id)} className="p-2 bg-red-500/0 hover:bg-red-500/20 rounded-lg text-white/20 hover:text-red-400 transition-colors" title="Delete memory">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-8 pt-6 border-t border-red-500/20">
                          <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
                          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-red-500/10 bg-red-500/5">
                            <p className="text-xs text-red-200/60 max-w">Permanently erase all your memory profile, stored facts, and previous conversation summaries. The AI will forget everything it learned about you.</p>
                            <button onClick={handleEraseAllMemory} disabled={isErasingMemory} className="whitespace-nowrap px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs rounded-lg border border-red-500/30 transition-colors font-semibold">
                              {isErasingMemory ? "Erasing..." : "Erase All Memory"}
                            </button>
                          </div>
                        </div>

                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

