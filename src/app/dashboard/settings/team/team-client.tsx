'use client'

import { useState } from 'react'
import { Plus, Users, Shield, Trash2, Phone, Loader2, Edit2, X } from 'lucide-react'
import { createAgentAction, deleteAgentAction, updateAgentAction, sendAgentCredentialsWhatsappAction } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Member = {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
    role: string
    created_at: string
}

const WhatsappIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
)

export function TeamClient({ initialMembers: members }: { initialMembers: Member[] }) {
    const [isCreating, setIsCreating] = useState(false)
    const [editingMember, setEditingMember] = useState<Member | null>(null)
    const [phoneStr, setPhoneStr] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
    const router = useRouter()

    const [sendingCredsMember, setSendingCredsMember] = useState<Member | null>(null)
    const [credMessage, setCredMessage] = useState("")
    const [isSendingCreds, setIsSendingCreds] = useState(false)

    const formatPhoneUI = (val: string) => {
        if (!val) return "";
        let cleaned = val.replace(/\D/g, '')
        if (cleaned.length === 11 && cleaned.startsWith('1')) cleaned = cleaned.substring(1);
        if (cleaned.length > 10) cleaned = cleaned.substring(0, 10);
        
        let formatted = cleaned
        if (cleaned.length > 6) {
            formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
        } else if (cleaned.length > 3) {
            formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`
        } else if (cleaned.length > 0) {
            formatted = `(${cleaned}`
        }
        return formatted
    }

    const agentCount = members.filter(m => m.role === 'agent' || m.role === 'admin').length - 1 // Count excludes one owner
    const capacityCount = members.length
    const MAX_CAPACITY = 4 // 1 Owner + 3 Members

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (isCreating && capacityCount >= MAX_CAPACITY) return toast.error('Capacity reached')

        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const rawPhone = phoneStr.replace(/\D/g, '')
        if (rawPhone.length > 0 && rawPhone.length !== 10) {
            setIsSubmitting(false)
            return toast.error('Phone must be exactly 10 digits (Area Code + Number)')
        }
        const finalPhone = rawPhone.length === 10 ? `+1${rawPhone}` : (rawPhone ? `+1${rawPhone}` : undefined);

        const payload = {
            id: editingMember?.id, // Only present when editing
            name: formData.get('name'),
            email: formData.get('email'),
            phone: finalPhone,
            password: formData.get('password'),
            roleLevel: formData.get('roleLevel')
        }

        const res = editingMember 
            ? await updateAgentAction(payload)
            : await createAgentAction(payload)
            
        setIsSubmitting(false)

        if (!res.success) {
            toast.error(res.error || `Failed to ${editingMember ? 'update' : 'create'} agent`)
        } else {
            toast.success(`Team member ${editingMember ? 'updated' : 'added'} successfully!`)
            setIsCreating(false)
            setEditingMember(null)
            setPhoneStr("")
            
            // Auto open the modal with the typed password
            if (payload.password) {
                const memberForCreds: Member = {
                    id: payload.id || 'temp',
                    full_name: payload.name as string,
                    email: payload.email as string,
                    phone: payload.phone as string,
                    role: payload.roleLevel as string,
                    created_at: new Date().toISOString()
                }
                setSendingCredsMember(memberForCreds);
                setCredMessage(`Olá ${memberForCreds.full_name || ''}! Seu acesso ao Mentor CRM foi configurado.\n\nLogin: ${memberForCreds.email}\nSenha: ${payload.password}\n\nAcesse no link: https://www.mentorcrm.site/login`);
            }
            
            router.refresh()
        }
    }

    function handleDeleteAction(id: string) {
        setDeletingMemberId(id)
    }

    async function performDelete(id: string) {
        setIsSubmitting(true)
        toast.loading('Removing member...', { id: 'del' })
        const res = await deleteAgentAction(id)
        setIsSubmitting(false)
        
        if (!res.success) {
            toast.error(res.error || 'Failed to remove', { id: 'del' })
        } else {
            toast.success('Member removed', { id: 'del' })
            setDeletingMemberId(null)
            router.refresh()
        }
    }

    const showForm = isCreating || editingMember !== null;

    function openCreate() {
        setEditingMember(null)
        setPhoneStr("")
        setIsCreating(true)
    }

    // When closing the form
    function clearForm() {
        setIsCreating(false)
        setEditingMember(null)
        setPhoneStr("")
    }

    return (
        <div className="space-y-6 relative">
            {deletingMemberId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 p-6">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Remove Member</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                            Are you sure you want to remove this member from your team? This action cannot be undone.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setDeletingMemberId(null)} 
                                disabled={isSubmitting}
                                className="px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-700 dark:text-zinc-300 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => performDelete(deletingMemberId)}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Yes, remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {sendingCredsMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <WhatsappIcon className="w-5 h-5 text-emerald-500" /> WhatsApp Integration
                            </h3>
                            <button
                                onClick={() => setSendingCredsMember(null)}
                                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 font-medium">
                                Review the message before sending credentials to the agent&apos;s phone over your connected integration.
                            </p>
                            <textarea
                                value={credMessage}
                                onChange={(e) => setCredMessage(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm mb-6 h-48 resize-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-zinc-700 dark:text-zinc-300"
                            />
                            <div className="flex justify-end gap-3">
                                <button disabled={isSendingCreds} onClick={() => setSendingCredsMember(null)} className="px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                    Cancel
                                </button>
                                <button 
                                    disabled={isSendingCreds} 
                                    onClick={async () => {
                                        setIsSendingCreds(true);
                                        const res = await sendAgentCredentialsWhatsappAction(sendingCredsMember.phone!, credMessage);
                                        setIsSendingCreds(false);
                                        if (res.success) {
                                            toast.success('Message queued successfully!')
                                            setSendingCredsMember(null)
                                        } else {
                                            toast.error(res.error || 'Failed to send message via Evolution')
                                        }
                                    }} 
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                                >
                                    {isSendingCreds ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Send Integration Message'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">My Team</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your CRM agents and co-admins.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-300">
                        Limits: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.max(0, capacityCount - 1)} / 3</span> Agents
                    </div>
                    {capacityCount < MAX_CAPACITY && (
                        <button
                            onClick={showForm ? clearForm : openCreate}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${showForm ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        >
                            {!showForm && <Plus className="w-4 h-4" />}
                            {showForm ? 'Cancel' : 'Add Member'}
                        </button>
                    )}
                </div>
            </div>

            {showForm && (
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                        {editingMember ? `Edit Member: ${editingMember.full_name}` : 'Add New Team Member'}
                    </h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">FullName</label>
                                <input name="name" defaultValue={editingMember?.full_name || ''} required className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" placeholder="John Doe" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Email Login {editingMember && "(Cannot be changed)"}</label>
                                <input name="email" defaultValue={editingMember?.email || ''} readOnly={!!editingMember} type="email" required className={`w-full px-3 py-2 border rounded-lg text-sm ${editingMember ? 'bg-zinc-100 dark:bg-zinc-900 border-transparent text-zinc-500 cursor-not-allowed' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'}`} placeholder="agent@company.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Phone</label>
                                <input 
                                    name="phone" 
                                    value={phoneStr}
                                    onChange={(e) => setPhoneStr(formatPhoneUI(e.target.value))}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" 
                                    placeholder="(201) 555-0123" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Password {editingMember && "(Leave blank to keep)"}</label>
                                <input name="password" required={!editingMember} type="text" className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" placeholder={editingMember ? "Enter new custom password..." : "Minimum 6 chars"} />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-2">Permission Level</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className="relative flex cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-3 px-4 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none has-[:checked]:border-indigo-600 has-[:checked]:ring-1 has-[:checked]:ring-indigo-600">
                                    <input type="radio" name="roleLevel" value="agent" defaultChecked={editingMember ? editingMember.role === 'agent' : true} className="sr-only" />
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><Users className="w-4 h-4"/></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Agent</span>
                                            <span className="text-xs text-zinc-500">Lives in Kanban and Chat. No settings access.</span>
                                        </div>
                                    </div>
                                </label>
                                <label className="relative flex cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-3 px-4 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none has-[:checked]:border-indigo-600 has-[:checked]:ring-1 has-[:checked]:ring-indigo-600">
                                    <input type="radio" name="roleLevel" value="admin" defaultChecked={editingMember ? editingMember.role === 'admin' : false} className="sr-only" />
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400"><Shield className="w-4 h-4"/></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Co-Admin</span>
                                            <span className="text-xs text-zinc-500">Full access to settings, billing, and team.</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button disabled={isSubmitting} type="submit" className="flex items-center justify-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingMember ? 'Save Changes' : 'Create and Send Access')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member, idx) => (
                    <div key={member.id} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                        {member.full_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex flex-col min-w-0 pr-2">
                                        <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">{member.full_name || 'Unnamed Agent'}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                            {member.role === 'admin' ? (idx === 0 ? 'Owner' : 'Co-Admin') : 'Agent'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 min-w-0">
                                        <span className="truncate break-all">{member.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    {member.phone && (
                                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            <Phone className="w-3.5 h-3.5 shrink-0" />
                                            <span>{member.phone}</span>
                                        </div>
                                    )}
                                    {member.phone && idx !== 0 && (
                                        <button 
                                            onClick={() => {
                                                setSendingCredsMember(member);
                                                setCredMessage(`Olá ${member.full_name || ''}! Seu acesso ao Mentor CRM foi criado.\n\nLogin: ${member.email}\nSenha temporária: [DIGITE A SENHA AQUI]\n\nAcesse no link: https://www.mentorcrm.site/login`);
                                            }}
                                            title="Enviar credenciais via integração"
                                            className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-lg transition-colors shrink-0 cursor-pointer"
                                        >
                                            <WhatsappIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                            <button 
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingMember(member);
                                    setPhoneStr(formatPhoneUI(member.phone || ""));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            {idx !== 0 && (
                                <button 
                                    onClick={() => handleDeleteAction(member.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                {capacityCount < MAX_CAPACITY && !showForm && (
                    <button 
                        onClick={openCreate}
                        className="p-5 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all min-h-[180px] cursor-pointer"
                    >
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="text-sm font-bold">Add Member</span>
                        <span className="text-xs mt-1">Free slots: {MAX_CAPACITY - capacityCount}</span>
                    </button>
                )}
            </div>
        </div>
    )
}
