"use client"

import { useState, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import DatePicker from 'react-datepicker';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Protect, PricingTable, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

// Medical Icons
const MedicalCrossIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const NotesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z" />
  </svg>
);

// --- Fidelity verification types (mirrors the backend `grounding` SSE frame) ---
type Claim = {
    claim: string;
    kind: 'factual' | 'guidance';
    quote: string;
    supported: boolean;
};

type Grounding = {
    score: number;
    factual_claims: number;
    unsupported_claims: number;
    claims: Claim[];
};

/**
 * Fidelity panel. Every patient-specific claim in the generated document is
 * anchored back to a verbatim span of the doctor's own notes. Anything that
 * could not be anchored is surfaced here instead of being quietly trusted.
 */
function FidelityPanel({ grounding, verifying }: { grounding: Grounding | null; verifying: boolean }) {
    if (verifying) {
        return (
            <div className="medical-card bg-white mb-6 flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-medium text-[var(--dark-gray)]">
                    Verifying every claim against your notes...
                </span>
            </div>
        );
    }

    if (!grounding) return null;

    const pct = Math.round(grounding.score * 100);
    const unsupported = grounding.claims.filter((c) => c.kind === 'factual' && !c.supported);
    const clean = unsupported.length === 0;

    const tone = clean
        ? { bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-800', ring: 'border-emerald-200' }
        : pct >= 80
            ? { bar: 'bg-amber-500', chip: 'bg-amber-100 text-amber-900', ring: 'border-amber-300' }
            : { bar: 'bg-red-500', chip: 'bg-red-100 text-red-800', ring: 'border-red-300' };

    return (
        <div className={`medical-card bg-white mb-6 border-2 ${tone.ring}`}>
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${clean ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`}>
                        {clean ? <ShieldIcon /> : <AlertIcon />}
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--dark)]">Source fidelity</h3>
                        <p className="text-sm text-[var(--medium-gray)]">
                            {grounding.factual_claims - unsupported.length} of {grounding.factual_claims} patient-specific
                            claims traced back to your notes
                        </p>
                    </div>
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-full text-sm font-bold ${tone.chip}`}>{pct}%</span>
            </div>

            <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden mb-4">
                <div className={`h-full ${tone.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>

            {clean ? (
                <p className="text-sm text-emerald-800">
                    Every clinical claim about this patient is supported by a span of your original note.
                    General guidance is excluded from this check. Review before signing.
                </p>
            ) : (
                <div>
                    <p className="text-sm font-semibold text-amber-900 mb-3">
                        Not supported by your notes — verify before signing:
                    </p>
                    <ul className="space-y-2">
                        {unsupported.map((c, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                            >
                                <span className="text-amber-600 mt-0.5 shrink-0">&#9888;</span>
                                <span className="text-sm text-amber-900">{c.claim}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function ConsultationForm() {
    const { getToken } = useAuth();

    const [patientName, setPatientName] = useState('');
    const [visitDate, setVisitDate] = useState<Date | null>(new Date());
    const [notes, setNotes] = useState('');

    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [grounding, setGrounding] = useState<Grounding | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setOutput('');
        setGrounding(null);
        setVerifying(false);
        setLoading(true);

        const jwt = await getToken();
        if (!jwt) {
            setOutput('Authentication required');
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        let buffer = '';

        await fetchEventSource('/api', {
            signal: controller.signal,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                patient_name: patientName,
                date_of_visit: visitDate?.toISOString().slice(0, 10),
                notes,
            }),
            openWhenHidden: true,
            async onopen(res) {
                if (res.ok) return;
                if (res.status === 429) {
                    setOutput('⚠️ Rate limit reached. Please wait a minute and try again.');
                } else if (res.status === 401) {
                    setOutput('⚠️ Your session expired. Please sign in again.');
                } else {
                    setOutput('⚠️ Could not start generation. Please try again.');
                }
                setLoading(false);
                throw new Error(`Bad response status: ${res.status}`);
            },
            onmessage(ev) {
                if (!ev.data) return;
                let payload: {
                    text?: string;
                    error?: string;
                    done?: boolean;
                    valid?: boolean;
                    missing_sections?: string[];
                    verifying?: boolean;
                    grounding?: Grounding | null;
                };
                try {
                    payload = JSON.parse(ev.data);
                } catch {
                    return; // ignore keep-alives / non-JSON frames
                }
                if (payload.error) {
                    setOutput((prev) => `${prev}\n\n⚠️ ${payload.error}`);
                    setLoading(false);
                    setVerifying(false);
                    controller.abort();
                    return;
                }
                if (payload.text) {
                    buffer += payload.text; // newlines preserved via JSON
                    setOutput(buffer);
                }
                if (payload.verifying) {
                    setLoading(false);   // the document itself is complete
                    setVerifying(true);  // the fidelity check is still running
                }
                if ('grounding' in payload) {
                    setGrounding(payload.grounding ?? null);
                    setVerifying(false);
                }
                if (payload.done) {
                    if (!payload.valid) {
                        console.warn('Incomplete summary, missing sections:', payload.missing_sections);
                    }
                    setLoading(false);
                    setVerifying(false);
                }
            },
            onclose() {
                setLoading(false);
                setVerifying(false);
            },
            onerror(err) {
                console.error('SSE error:', err);
                controller.abort();
                setLoading(false);
                setVerifying(false);
                throw err; // stop fetchEventSource's automatic retry loop
            },
        });
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2 text-[var(--medium-gray)] hover:text-[var(--primary)] transition-colors">
                                <ArrowLeftIcon />
                                <span className="text-sm font-medium">Back</span>
                            </Link>
                            <div className="h-6 w-px bg-[var(--border)]" />
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                                    <MedicalCrossIcon />
                                </div>
                                <span className="text-lg font-bold text-[var(--dark)]">
                                    ClinScribe <span className="text-blue-600">AI</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/record"
                                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 border-2 border-teal-200 hover:border-teal-300 rounded-xl px-4 py-2 transition-all"
                            >
                                <span className="w-2 h-2 rounded-full bg-teal-600" />
                                Record consultation
                            </Link>
                            <UserButton showName={true} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
                        <SparklesIcon />
                        <span className="text-sm font-medium text-blue-700">AI Clinical Assistant</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--dark)] mb-2">
                        New Consultation
                    </h1>
                    <p className="text-[var(--dark-gray)]">
                        Enter patient data and the application will automatically generate a professional medical summary.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Patient Info Card */}
                    <div className="medical-card" style={{ overflow: 'visible' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <UserIcon />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--dark)]">Patient Information</h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="patient" className="flex items-center gap-2 text-sm font-semibold text-[var(--dark-gray)]">
                                    <UserIcon />
                                    Patient Name
                                </label>
                                <input
                                    id="patient"
                                    type="text"
                                    required
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--off-white)] border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-[var(--dark)] placeholder-[var(--medium-gray)]"
                                    placeholder="Example: Frank Martin"
                                />
                            </div>

                            <div className="space-y-2 relative z-20">
                                <label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-[var(--dark-gray)]">
                                    <CalendarIcon />
                                    Consultation Date
                                </label>
                                <div className="relative">
                                  <DatePicker
                                      id="date"
                                      selected={visitDate}
                                      onChange={(d: Date | null) => setVisitDate(d)}
                                      dateFormat="yyyy-MM-dd"
                                      placeholderText="Select date"
                                      required
                                      portalId="datepicker-portal"
                                      popperPlacement="bottom-start"
                                      popperProps={{ strategy: 'fixed' }}
                                      wrapperClassName="w-full"
                                      className="w-full px-4 py-3 bg-[var(--off-white)] border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-[var(--dark)]"
                                  />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Card */}
                    <div className="medical-card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <NotesIcon />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--dark)]">Consultation Notes</h2>
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="notes" className="block text-sm font-semibold text-[var(--dark-gray)] mb-2">
                                Describe the medical consultation
                            </label>
                            <textarea
                                id="notes"
                                required
                                rows={10}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--off-white)] border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-[var(--dark)] placeholder-[var(--medium-gray)] resize-none"
                                placeholder="Example: 58-year-old patient reports chest pain for 3 days. History of hypertension. Blood pressure 140/90. EKG requested..."
                            />
                            <p className="text-sm text-[var(--medium-gray)]">
                                Include symptoms, vital signs, relevant history, and clinical observations.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full group bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:from-blue-400 disabled:to-teal-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-1 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating Clinical Summary...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon />
                                <span>Generate Documentation</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Output Section */}
                {output && (
                    <section className="mt-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <DocumentIcon />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--dark)]">Generated Documentation</h2>
                            {loading && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                                    Generating...
                                </span>
                            )}
                        </div>
                        
                        <FidelityPanel grounding={grounding} verifying={verifying} />

                        <div className="medical-card bg-white">
                            <div className="markdown-content prose prose-blue max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {output}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default function Product() {
    return (
        <Protect
            plan="premium_subscription"
            fallback={
                <div className="min-h-screen bg-[var(--background)]">
                    {/* Header */}
                    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
                        <div className="max-w-5xl mx-auto px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16">
                                <div className="flex items-center gap-4">
                                    <Link href="/" className="flex items-center gap-2 text-[var(--medium-gray)] hover:text-[var(--primary)] transition-colors">
                                        <ArrowLeftIcon />
                                        <span className="text-sm font-medium">Back</span>
                                    </Link>
                                    <div className="h-6 w-px bg-[var(--border)]" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                                            <MedicalCrossIcon />
                                        </div>
                                        <span className="text-lg font-bold text-[var(--dark)]">
                                            ClinScribe <span className="text-blue-600">AI</span>
                                        </span>
                                    </div>
                                </div>
                                <UserButton showName={true} />
                            </div>
                        </div>
                    </header>

                    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
                        <header className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
                                <SparklesIcon />
                                <span className="text-sm font-medium text-blue-700">Professional Plan</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-[var(--dark)] mb-4">
                                Unlock the Power of{' '}
                                <span className="medical-gradient-text">Medical AI</span>
                            </h1>
                            <p className="text-xl text-[var(--dark-gray)] max-w-2xl mx-auto">
                                Access unlimited clinical summaries and improve your medical practice efficiency.
                            </p>
                        </header>
                        <div className="max-w-4xl mx-auto">
                            <PricingTable />
                        </div>
                    </div>
                </div>
            }
        >
            <ConsultationForm />
        </Protect>
    );
}