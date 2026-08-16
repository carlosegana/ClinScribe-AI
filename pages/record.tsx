"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth, Protect, UserButton } from '@clerk/nextjs';
import DatePicker from 'react-datepicker';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import Link from 'next/link';

const MedicalCrossIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const MicIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
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

// Vercel serverless functions cap the request body; keep the upload under it.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
// Give up before the platform does, so the user gets a real message instead of a hang.
const UPLOAD_TIMEOUT_MS = 90_000;

type TranscribeResponse = {
    filename: string;
    document: string;
    transcript: string;
    unverified_items: number;
};

/** Local wall-clock stamp as `YYYY-MM-DD HH:mm` — the clinician's timezone, not the server's. */
function localStamp(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatClock(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Pick a container the browser can actually record AND the API accepts. */
function pickMimeType(): string {
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    if (typeof MediaRecorder === 'undefined') return '';
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
}

function extensionFor(mime: string): string {
    if (mime.includes('mp4')) return 'm4a';
    if (mime.includes('ogg')) return 'ogg';
    return 'webm';
}

function ConsultationRecorder() {
    const { getToken } = useAuth();

    const [patientName, setPatientName] = useState('');
    const [visitDate, setVisitDate] = useState<Date | null>(new Date());

    const [recording, setRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [startedAt, setStartedAt] = useState<Date | null>(null);
    const [recordedSeconds, setRecordedSeconds] = useState(0);

    const [processing, setProcessing] = useState(false);
    const [stage, setStage] = useState('');
    const [result, setResult] = useState<TranscribeResponse | null>(null);
    const [error, setError] = useState('');

    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const cleanupStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Release the mic and the object URL if the user navigates away mid-recording.
    useEffect(() => cleanupStream, [cleanupStream]);
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    async function startRecording() {
        setError('');
        setResult(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(null);
        setAudioUrl(null);

        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            setError('This browser cannot access the microphone. Try Chrome, Edge or Safari over HTTPS.');
            return;
        }

        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
            });
        } catch {
            setError('Microphone permission denied. Allow access in your browser and try again.');
            return;
        }

        const mimeType = pickMimeType();
        let recorder: MediaRecorder;
        try {
            recorder = new MediaRecorder(stream, {
                ...(mimeType ? { mimeType } : {}),
                audioBitsPerSecond: 24000, // mono speech — keeps a long consult under the upload cap
            });
        } catch {
            stream.getTracks().forEach((t) => t.stop());
            setError('This browser does not support audio recording.');
            return;
        }

        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
            const type = recorder.mimeType || mimeType || 'audio/webm';
            const blob = new Blob(chunksRef.current, { type });
            setAudioBlob(blob);
            setAudioUrl(URL.createObjectURL(blob));
            cleanupStream();
        };

        streamRef.current = stream;
        recorderRef.current = recorder;
        recorder.start(1000); // emit a chunk per second so nothing is lost on a crash

        const begin = new Date();
        setStartedAt(begin);
        setElapsed(0);
        setRecording(true);
        timerRef.current = setInterval(() => {
            setElapsed(Math.floor((Date.now() - begin.getTime()) / 1000));
        }, 1000);
    }

    function stopRecording() {
        setRecordedSeconds(elapsed);
        recorderRef.current?.stop();
        recorderRef.current = null;
        setRecording(false);
    }

    function discardRecording() {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(null);
        setAudioUrl(null);
        setResult(null);
        setError('');
        setElapsed(0);
        setRecordedSeconds(0);
    }

    async function processRecording() {
        if (!audioBlob) return;
        if (!patientName.trim() || !visitDate) {
            setError('Enter the patient name and the date of visit before processing.');
            return;
        }
        if (audioBlob.size > MAX_UPLOAD_BYTES) {
            setError(
                `Recording is ${(audioBlob.size / 1024 / 1024).toFixed(1)} MB, over the ` +
                `${MAX_UPLOAD_BYTES / 1024 / 1024} MB upload limit. Record a shorter consultation.`
            );
            return;
        }

        setError('');
        setProcessing(true);
        setStage('Transcribing the consultation...');

        try {
            const jwt = await getToken();
            if (!jwt) {
                setError('Your session expired. Please sign in again.');
                return;
            }

            const ext = extensionFor(audioBlob.type);
            const form = new FormData();
            form.append('audio', audioBlob, `consultation.${ext}`);
            form.append('patient_name', patientName.trim());
            form.append('date_of_visit', visitDate.toISOString().slice(0, 10));
            form.append('recorded_at', startedAt ? localStamp(startedAt) : localStamp(new Date()));
            form.append('generated_at', localStamp(new Date()));
            form.append('duration', formatClock(recordedSeconds || elapsed));

            setStage('Structuring the doctor’s instructions...');

            // Fail fast and loudly instead of hanging until the platform kills it.
            const abort = new AbortController();
            const timeout = setTimeout(() => abort.abort(), UPLOAD_TIMEOUT_MS);

            let res: Response;
            try {
                res = await fetch('/api/transcribe', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${jwt}` },
                    body: form,
                    signal: abort.signal,
                });
            } finally {
                clearTimeout(timeout);
            }

            if (!res.ok) {
                // Read the body as text first: a platform-level failure (504, crash page)
                // returns HTML, and blindly calling res.json() would hide the real cause.
                const raw = await res.text().catch(() => '');
                let detail = '';
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed?.detail) detail = String(parsed.detail);
                } catch { /* not JSON — keep the raw text */ }

                if (res.status === 401) {
                    detail = 'Your session expired. Please sign in again.';
                } else if (res.status === 429) {
                    detail = 'Rate limit reached. Wait a minute and try again.';
                } else if (res.status === 404) {
                    detail =
                        'The /api/transcribe endpoint was not found. The Python function is not ' +
                        'running — start the app with `vercel dev`, not `npm run dev`.';
                } else if (!detail) {
                    const snippet = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
                    detail = snippet
                        ? `HTTP ${res.status}: ${snippet}`
                        : `HTTP ${res.status} with an empty response body.`;
                }
                console.error('[transcribe] failed', res.status, raw.slice(0, 2000));
                setError(detail);
                return;
            }

            setResult((await res.json()) as TranscribeResponse);
        } catch (err) {
            const e = err as Error;
            if (e?.name === 'AbortError') {
                setError(
                    `The request did not finish within ${UPLOAD_TIMEOUT_MS / 1000}s. Check the terminal ` +
                    'running the dev server (or the Vercel function logs) for the underlying error.'
                );
            } else {
                setError(`Network error while uploading: ${e?.message || 'unknown'}`);
            }
            console.error('[transcribe] error', err);
        } finally {
            setProcessing(false);
            setStage('');
        }
    }

    function download(extension: 'md' | 'txt') {
        if (!result) return;
        const name = result.filename.replace(/\.md$/, '') + '.' + extension;
        const blob = new Blob([result.document], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    const overLimit = audioBlob ? audioBlob.size > MAX_UPLOAD_BYTES : false;

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/product" className="flex items-center gap-2 text-[var(--medium-gray)] hover:text-[var(--primary)] transition-colors">
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

            <main className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-teal-600" />
                        <span className="text-sm font-medium text-teal-700">Ambient capture</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--dark)] mb-2">Record consultation</h1>
                    <p className="text-[var(--dark-gray)]">
                        Record the visit and get a dated clinical record with the treatment, tests and next
                        steps the doctor actually stated — each one traced back to the transcript.
                    </p>
                </div>

                {/* Patient */}
                <div className="medical-card mb-8" style={{ overflow: 'visible' }}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="patient" className="flex items-center gap-2 text-sm font-semibold text-[var(--dark-gray)]">
                                <UserIcon /> Patient Name
                            </label>
                            <input
                                id="patient"
                                type="text"
                                required
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--off-white)] border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-[var(--dark)]"
                                placeholder="Example: Frank Martin"
                            />
                        </div>
                        <div className="space-y-2 relative z-20">
                            <label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-[var(--dark-gray)]">
                                <CalendarIcon /> Consultation Date
                            </label>
                            <DatePicker
                                id="date"
                                selected={visitDate}
                                onChange={(d: Date | null) => setVisitDate(d)}
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Select date"
                                portalId="datepicker-portal"
                                popperPlacement="bottom-start"
                                popperProps={{ strategy: 'fixed' }}
                                wrapperClassName="w-full"
                                className="w-full px-4 py-3 bg-[var(--off-white)] border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-[var(--dark)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Recorder */}
                <div className="medical-card mb-8 text-center">
                    <div className="flex flex-col items-center gap-5 py-4">
                        <div className={`text-5xl font-mono font-bold tabular-nums ${recording ? 'text-red-600' : 'text-[var(--dark)]'}`}>
                            {formatClock(recording ? elapsed : recordedSeconds || elapsed)}
                        </div>

                        {recording && (
                            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                                <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                                Recording — microphone is live
                            </div>
                        )}

                        {!recording && !audioBlob && (
                            <button
                                type="button"
                                onClick={startRecording}
                                className="group bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-xl shadow-blue-500/20 hover:-translate-y-1 flex items-center gap-3"
                            >
                                <MicIcon /> Start recording
                            </button>
                        )}

                        {recording && (
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-xl flex items-center gap-3"
                            >
                                <StopIcon /> Stop
                            </button>
                        )}

                        {audioBlob && !recording && (
                            <div className="w-full max-w-xl space-y-4">
                                {audioUrl && <audio controls src={audioUrl} className="w-full" />}
                                <p className={`text-sm ${overLimit ? 'text-red-600 font-semibold' : 'text-[var(--medium-gray)]'}`}>
                                    {(audioBlob.size / 1024 / 1024).toFixed(2)} MB
                                    {overLimit && ` — over the ${MAX_UPLOAD_BYTES / 1024 / 1024} MB limit`}
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={processRecording}
                                        disabled={processing || overLimit}
                                        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg flex items-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                {stage || 'Processing...'}
                                            </>
                                        ) : (
                                            <>Generate clinical record</>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={discardRecording}
                                        disabled={processing}
                                        className="border-2 border-[var(--border)] hover:border-red-300 hover:text-red-600 disabled:opacity-50 text-[var(--dark-gray)] font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </div>
                        )}

                        {!recording && !audioBlob && (
                            <p className="text-sm text-[var(--medium-gray)] max-w-md">
                                Audio stays in your browser until you press generate. Get the patient&rsquo;s
                                consent before recording.
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="medical-card mb-8 border-2 border-red-200 bg-red-50">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <section>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold text-[var(--dark)]">Clinical record</h2>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => download('md')}
                                    className="bg-[var(--dark)] hover:opacity-90 text-white font-semibold py-2 px-5 rounded-xl transition-all flex items-center gap-2"
                                >
                                    <DownloadIcon /> .md
                                </button>
                                <button
                                    type="button"
                                    onClick={() => download('txt')}
                                    className="border-2 border-[var(--border)] hover:border-blue-400 text-[var(--dark-gray)] font-semibold py-2 px-5 rounded-xl transition-all flex items-center gap-2"
                                >
                                    <DownloadIcon /> .txt
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-[var(--medium-gray)] mb-4">
                            Saved as <code className="font-mono">{result.filename}</code>
                        </p>

                        {result.unverified_items > 0 && (
                            <div className="medical-card mb-6 border-2 border-amber-300 bg-amber-50">
                                <p className="text-sm font-semibold text-amber-900">
                                    &#9888; {result.unverified_items} item
                                    {result.unverified_items === 1 ? '' : 's'} could not be traced to anything
                                    said in the recording. They are marked &#9888; in the document — verify
                                    before signing.
                                </p>
                            </div>
                        )}

                        <div className="medical-card bg-white">
                            <div className="markdown-content prose prose-blue max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {result.document}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default function Record() {
    return (
        <Protect
            plan="premium_subscription"
            fallback={
                <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
                    <div className="text-center max-w-md">
                        <h1 className="text-3xl font-bold text-[var(--dark)] mb-4">Premium feature</h1>
                        <p className="text-[var(--dark-gray)] mb-8">
                            Consultation recording is part of the professional plan.
                        </p>
                        <Link
                            href="/product"
                            className="inline-block bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                        >
                            See plans
                        </Link>
                    </div>
                </div>
            }
        >
            <ConsultationRecorder />
        </Protect>
    );
}
