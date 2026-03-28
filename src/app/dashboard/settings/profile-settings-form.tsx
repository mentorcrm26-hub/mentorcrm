'use client';

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useState } from 'react';
import { toast } from 'sonner';
import { updateProfile } from './profile-actions';
import { Save, User, Mail, Phone, Video, Link as LinkIcon } from 'lucide-react';

interface ProfileData {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    google_meet_link: string;
    other_meet_link: string;
}

export function ProfileSettingsForm({ initialData }: { initialData: ProfileData }) {
    const [formData, setFormData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 10);
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Strip mask and ensure +1
        let rawPhone = formData.phone.replace(/\D/g, '');
        if (rawPhone.length === 10) {
            rawPhone = `+1${rawPhone}`;
        } else if (rawPhone.length > 10) {
            rawPhone = `+${rawPhone}`; // Assume it already has a country code if > 10
        }

        const res = await updateProfile({
            full_name: formData.full_name,
            phone: rawPhone,
            google_meet_link: formData.google_meet_link,
            other_meet_link: formData.other_meet_link
        });

        setIsLoading(false);

        if (res.success) {
            toast.success('Profile updated successfully!');
        } else {
            toast.error(res.error || 'Failed to update profile.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-500" />
                    Personal Profile
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Your personal information and meeting links for templates.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-tight text-zinc-400">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        {/* Email - Readonly for now as it's the auth account */}
                        <div className="space-y-2 opacity-70">
                            <label className="text-xs font-bold uppercase tracking-tight text-zinc-400">Account Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-tight text-zinc-400">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                                    placeholder="(123) 456-7890"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-white/5 pt-6 space-y-4">
                        <label className="text-xs font-bold uppercase tracking-[0.1em] text-indigo-500">Meeting Links</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Google Meet */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-tight text-zinc-400">Google Meet Link</label>
                                <div className="relative">
                                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="url"
                                        value={formData.google_meet_link}
                                        onChange={(e) => setFormData({ ...formData, google_meet_link: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                                        placeholder="meet.google.com/xxx-xxxx-xxx"
                                    />
                                </div>
                            </div>

                            {/* Other Meet Link */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-tight text-zinc-400">Other Meeting Link (Zoom, etc)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="url"
                                        value={formData.other_meet_link}
                                        onChange={(e) => setFormData({ ...formData, other_meet_link: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                                        placeholder="zoom.us/j/xxx-xxx-xxx"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/30 px-6 py-4 flex items-center justify-end border-t border-zinc-200 dark:border-white/10">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 h-9 px-6 py-2 shrink-0 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        {isLoading ? 'Saving...' : (
                            <span className="flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Profile
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
