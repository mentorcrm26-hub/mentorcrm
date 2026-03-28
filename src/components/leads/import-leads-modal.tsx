'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createManyLeads } from '@/app/dashboard/leads/actions'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { X, UploadCloud, FileSpreadsheet, ArrowRight, CheckCircle2, User, Mail, Phone, Calendar, FileText, Loader2, Zap, Info } from 'lucide-react'

type ColumnMapping = {
    name: string
    email: string
    phone: string
    birth_date: string
    notes: string
    status: string
    product_interest: string
}

interface HeaderSelectProps {
    label: string
    icon: React.ElementType
    field: string
    mapping: ColumnMapping
    setMapping: React.Dispatch<React.SetStateAction<ColumnMapping>>
    fileHeaders: string[]
    required?: boolean
}

const HeaderSelect = ({ label, icon: Icon, field, mapping, setMapping, fileHeaders, required = false }: HeaderSelectProps) => (
    <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200/50 dark:border-zinc-700">
                <Icon className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {label} {required && <span className="text-xs text-red-500 font-bold">*</span>}
                </p>
            </div>
        </div>
        <select
            value={mapping[field as keyof ColumnMapping] || ''}
            onChange={(e) => setMapping((prev: ColumnMapping) => ({ ...prev, [field]: e.target.value }))}
            className="w-1/2 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-blue-500 font-medium"
        >
            <option value="">-- Ignore this field --</option>
            {fileHeaders.map((h: string) => (
                <option key={h} value={h}>{h}</option>
            ))}
        </select>
    </div>
)

export function ImportLeadsModal() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0)
        return () => clearTimeout(timer)
    }, [])

    // File State
    const [fileName, setFileName] = useState<string>('')
    const [fileHeaders, setFileHeaders] = useState<string[]>([])
    const [rawRows, setRawRows] = useState<Record<string, string>[]>([])

    // Mapping State
    const [mapping, setMapping] = useState<ColumnMapping>({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        notes: '',
        status: '',
        product_interest: ''
    })

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setFileName(file.name)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: 'greedy',
            transformHeader: (h) => h.trim().replace(/^\uFEFF/g, ''),
            transform: (v) => v.trim(),
            complete: (results) => {
                const headers = results.meta.fields || []
                setFileHeaders(headers)
                setRawRows(results.data as Record<string, string>[])

                // Smart auto-mapping prediction
                const predictedMapping: ColumnMapping = {
                    name: headers.find(h => /name|nome/i.test(h)) || '',
                    email: headers.find(h => /email|e-mail/i.test(h)) || '',
                    phone: headers.find(h => /phone|telefone|whatsapp|celular/i.test(h)) || '',
                    birth_date: headers.find(h => /birth|nascimento|data|dob/i.test(h)) || '',
                    notes: headers.find(h => /note|nota|obs/i.test(h)) || '',
                    status: headers.find(h => /status|stage|etapa/i.test(h)) || '',
                    product_interest: headers.find(h => /product|interesse|produto/i.test(h)) || ''
                }
                setMapping(predictedMapping)
                setStep(2)
            },
            error: (error) => {
                toast.error('Failed to parse file: ' + error.message)
            }
        })
    }

    const formatPhone = (rawPhone: string) => {
        let val = String(rawPhone || '').replace(/\D/g, '')
        if (val.length > 11) val = val.substring(0, 11)

        if (val.length === 11) return `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`
        if (val.length === 10) return `(${val.substring(0, 2)}) ${val.substring(2, 6)}-${val.substring(6)}`
        return val
    }

    const parseDate = (rawDate: string) => {
        if (!rawDate) return undefined
        const clean = rawDate.trim()

        // Handle DD/MM/YYYY
        if (clean.includes('/')) {
            const parts = clean.split('/')
            if (parts.length === 3) {
                const [d, m, y] = parts
                // Ensure padding
                const day = d.padStart(2, '0')
                const month = m.padStart(2, '0')
                const year = y.length === 2 ? `20${y}` : y // handle 2-digit years
                return `${year}-${month}-${day}`
            }
        }

        // Handle YYYY-MM-DD or other
        try {
            const d = new Date(clean)
            if (!isNaN(d.getTime())) {
                return d.toISOString().split('T')[0]
            }
        } catch {
            return undefined
        }
        return undefined
    }

    const resetState = () => {
        setIsOpen(false)
        setStep(1)
        setFileName('')
        setFileHeaders([])
        setRawRows([])
        setMapping({ name: '', email: '', phone: '', birth_date: '', notes: '', status: '', product_interest: '' })
        setIsSubmitting(false)
    }

    const processImport = async () => {
        if (!mapping.name) {
            toast.error('You must map the Full Name field at a minimum.')
            return
        }

        setIsSubmitting(true)
        setStep(3)

        // Process rows according to mapping
        const processedLeads = rawRows.map(row => {
            return {
                name: String(row[mapping.name] || '').trim(),
                email: mapping.email ? String(row[mapping.email] || '').trim() : undefined,
                phone: mapping.phone ? formatPhone(row[mapping.phone]) : undefined,
                birth_date: mapping.birth_date ? parseDate(String(row[mapping.birth_date] || '')) : undefined,
                notes: mapping.notes ? String(row[mapping.notes] || '').trim() : undefined,
                status: mapping.status ? String(row[mapping.status] || '').trim() : undefined,
                product_interest: mapping.product_interest ? String(row[mapping.product_interest] || '').trim() : undefined
            }
        }).filter(lead => lead.name && lead.name.length > 0)

        if (processedLeads.length === 0) {
            toast.error("No valid leads found after mapping.")
            resetState()
            return
        }

        const res = await createManyLeads(processedLeads)

        if (!res.success) {
            toast.error(res.error || 'Failed to import leads')
            resetState()
        } else {
            toast.success(`Successfully imported ${res.count} leads!`)
            router.refresh()
            setTimeout(() => {
                resetState()
            }, 1000)
        }
    }

    if (!isMounted) return null

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
                <FileSpreadsheet className="w-4 h-4" />
                Import (CSV / TXT)
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={resetState}>
                    <div
                        className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Import Leads Validation
                                    </h2>
                                    <p className="text-sm text-zinc-500 font-medium">
                                        Step {step} of 3 • {step === 1 ? 'Upload File' : step === 2 ? 'Map Columns' : 'Processing'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={resetState} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 rounded-full transition-colors disabled:opacity-50" disabled={isSubmitting}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="overflow-y-auto flex-1 p-6">

                            {/* STEP 1: UPLOAD */}
                            {step === 1 && (
                                <div className="py-8 animate-in fade-in zoom-in">
                                    <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-12 text-center transition-colors bg-zinc-50/50 dark:bg-zinc-900/20 group">
                                        <input
                                            type="file"
                                            accept=".csv, .txt, text/csv, text/plain"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex justify-center mb-4">
                                            <div className="p-4 bg-white dark:bg-zinc-900 shadow-sm rounded-full group-hover:scale-110 transition-transform duration-300">
                                                <UploadCloud className="w-10 h-10 text-indigo-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Click to upload or drag & drop</h3>
                                        <p className="text-sm text-zinc-500">Supported formats: CSV and TXT (tab or comma separated).</p>
                                        
                                        <div className="mt-6">
                                            <button 
                                                onClick={() => {
                                                    const csvString = "Name,Email,Phone,Date of Birth,Notes,Status,Product Interest\nJohn Doe,john@example.com,(11) 98888-7777,1990-05-15,Lead warm,New Lead,Car Insurance"
                                                    const blob = new Blob([csvString], { type: 'text/csv' })
                                                    const url = window.URL.createObjectURL(blob)
                                                    const a = document.createElement('a')
                                                    a.setAttribute('hidden', '')
                                                    a.setAttribute('href', url)
                                                    a.setAttribute('download', 'mentor-crm-leads-template.csv')
                                                    document.body.appendChild(a)
                                                    a.click()
                                                    document.body.removeChild(a)
                                                }}
                                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto"
                                            >
                                                Download CSV Template
                                            </button>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-left">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                                                <Info className="w-3.5 h-3.5 text-indigo-500" /> How to prepare your file
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-indigo-500/30">
                                                    <p className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-tighter">CSV / TXT Format</p>
                                                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                                        Use comma (<code>,</code>) to separate fields. The first line must be the header with column names.
                                                    </p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-indigo-500/30">
                                                    <p className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-tighter">Structure Example</p>
                                                    <code className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block bg-white dark:bg-black/20 p-2 rounded border border-indigo-100 dark:border-indigo-900/10 whitespace-nowrap overflow-x-auto">
                                                        Name,Phone,Email,Notes...
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: MAPPING */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-400">
                                        We found <strong>{fileHeaders.length} columns</strong> and <strong>{rawRows.length} rows</strong> in <strong>{fileName}</strong>. Please confirm how they map to our CRM fields. We auto-selected the best matches.
                                    </div>

                                    <div className="space-y-3">
                                        <HeaderSelect label="Full Name" icon={User} field="name" mapping={mapping} setMapping={setMapping} fileHeaders={fileHeaders} required={true} />
                                        <HeaderSelect label="Email Address" icon={Mail} field="email" mapping={mapping} setMapping={setMapping} fileHeaders={fileHeaders} />
                                        <HeaderSelect label="Phone Number" icon={Phone} field="phone" mapping={mapping} setMapping={setMapping} fileHeaders={fileHeaders} />
                                        <HeaderSelect label="Date of Birth" icon={Calendar} field="birth_date" mapping={mapping} setMapping={setMapping} fileHeaders={fileHeaders} />
                                        <HeaderSelect label="Internal Notes" icon={FileText} field="notes" mapping={mapping} setMapping={setMapping} fileHeaders={fileHeaders} />
                                        <HeaderSelect label="Kanban Status" icon={ArrowRight} field="status" mapping={mapping} setMapping={setMapping} fileHeaders={fileHeaders} />
                                        <HeaderSelect label="Product Interest" icon={Zap} field="product_interest" mapping={mapping} setMapping={setMapping} fileHeaders={fileHeaders} />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: PROCESSING */}
                            {step === 3 && (
                                <div className="py-16 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="flex justify-center mb-6">
                                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-pulse">
                                            {isSubmitting ? (
                                                <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                        {isSubmitting ? 'Importing your leads...' : 'Import Complete!'}
                                    </h3>
                                    <p className="text-sm text-zinc-500">
                                        {isSubmitting ? 'Please wait while we securely process and format your data.' : 'Your leads have been added to the Kanban board.'}
                                    </p>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        {step === 2 && (
                            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center shrink-0">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    Back to Upload
                                </button>
                                <button
                                    onClick={processImport}
                                    disabled={!mapping.name || isSubmitting}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                                >
                                    Confirm Validation
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
