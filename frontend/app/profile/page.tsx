"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-provider";
import { authService } from "@/lib/api/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
    const { user, token, logout, login } = useAuth(); // login used to refresh user context if needed
    const router = useRouter();

    // Profile State
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // Password State
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/"); // Redirect to home if not logged in
        } else {
            setFullName(user.full_name || "");
            setAvatarUrl(user.avatar_url || "");
        }
    }, [user, router]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsProfileLoading(true);
        setProfileMessage("");
        setProfileError("");

        try {
            const updatedUser = await authService.updateProfile(token, {
                full_name: fullName,
                avatar_url: avatarUrl
            });
            setProfileMessage("Profile updated successfully!");
            // Ideally update context user here, but for now page refresh or re-login works
            // A full implementation would expose a 'refreshUser' method in AuthContext
            window.location.reload();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
            setProfileError(errorMessage);
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        setIsPasswordLoading(true);
        setPasswordMessage("");
        setPasswordError("");

        try {
            await authService.updatePassword(token, {
                old_password: oldPassword,
                new_password: newPassword
            });
            setPasswordMessage("Password updated successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update password";
            setPasswordError(errorMessage);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="text-2xl">{user.full_name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h2 className="font-semibold text-lg text-center">{user.full_name || "User"}</h2>
                            <p className="text-sm text-gray-500 text-center mb-4">{user.email}</p>
                            <Button variant="outline" className="w-full" onClick={logout}>Sign Out</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-3">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your personal information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" value={user.email} disabled className="bg-gray-100" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="avatarUrl">Avatar URL</Label>
                                            <Input
                                                id="avatarUrl"
                                                value={avatarUrl}
                                                onChange={(e) => setAvatarUrl(e.target.value)}
                                                placeholder="https://example.com/avatar.jpg"
                                            />
                                        </div>

                                        {profileError && <p className="text-sm text-red-500">{profileError}</p>}
                                        {profileMessage && <p className="text-sm text-green-600">{profileMessage}</p>}

                                        <Button type="submit" disabled={isProfileLoading}>
                                            {isProfileLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="password">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>Update your password associated with this account</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="oldPassword">Current Password</Label>
                                            <Input
                                                id="oldPassword"
                                                type="password"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                minLength={8}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                minLength={8}
                                            />
                                        </div>

                                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                                        {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}

                                        <Button type="submit" disabled={isPasswordLoading}>
                                            {isPasswordLoading ? "Updating..." : "Update Password"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
