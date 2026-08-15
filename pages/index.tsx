"use client"

import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

/* ------------------------------------------------------------------
   SSR-safe layout effect
------------------------------------------------------------------ */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ------------------------------------------------------------------
   Icons (SVG, 1.5 stroke — thinner reads more premium than 2)
------------------------------------------------------------------ */
type IconProps = { className?: string };

const Mark = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const Pulse = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h4l2-7 4 14 2.5-7H22" />
  </svg>
);

const Brain = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 3A3.5 3.5 0 0 0 6 6.5v.34A3 3 0 0 0 4 9.7a3 3 0 0 0 1 2.24A3.2 3.2 0 0 0 4.4 14a3 3 0 0 0 2.1 2.86A3 3 0 0 0 9.5 21a2.5 2.5 0 0 0 2.5-2.5V5.5A2.5 2.5 0 0 0 9.5 3Z" />
    <path d="M14.5 3A3.5 3.5 0 0 1 18 6.5v.34a3 3 0 0 1 2 2.86 3 3 0 0 1-1 2.24 3.2 3.2 0 0 1 .6 2.06 3 3 0 0 1-2.1 2.86A3 3 0 0 1 14.5 21a2.5 2.5 0 0 1-2.5-2.5" />
  </svg>
);

const Shield = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.4-7.5 9.5-4.4-1.1-7.5-4.9-7.5-9.5V6L12 3Z" />
    <path d="M9.2 12.2l2 2 3.6-3.8" />
  </svg>
);

const Clock = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

const Doc = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

const Mail = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);

const Bolt = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 4.5 13.5H11L10.5 22 19.5 10.5H13L13 2Z" />
  </svg>
);

const List = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </svg>
);

const Heart = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.5C5.5 16.5 3 12.9 3 9.3 3 6.6 5.1 4.5 7.8 4.5c1.7 0 3.2.9 4.2 2.3 1-1.4 2.5-2.3 4.2-2.3C18.9 4.5 21 6.6 21 9.3c0 3.6-2.5 7.2-9 11.2Z" />
  </svg>
);

const Arrow = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Chevron = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/* ------------------------------------------------------------------
   Data
------------------------------------------------------------------ */
const ECG_PATH =
  'M0,60 H70 c8,-9 16,-9 24,0 H118 L128,16 L140,106 L150,54 H180 c13,-17 27,-17 40,0 H300 ' +
  'H370 c8,-9 16,-9 24,0 H418 L428,16 L440,106 L450,54 H480 c13,-17 27,-17 40,0 H600 ' +
  'H670 c8,-9 16,-9 24,0 H718 L728,16 L740,106 L750,54 H780 c13,-17 27,-17 40,0 H900 ' +
  'H970 c8,-9 16,-9 24,0 H1018 L1028,16 L1040,106 L1050,54 H1080 c13,-17 27,-17 40,0 H1200';

const MARQUEE_ITEMS = [
  'Structured visit summaries',
  'Prioritized follow-ups',
  'Patient-ready messages',
  'Drafted in one pass',
  'You review and approve',
  'Nothing kept afterward',
];

const STEPS = [
  {
    n: '01',
    title: 'Bring the encounter as-is',
    body: 'Type or paste your raw consultation notes — abbreviations, vitals, fragments and all. There is no template to fill in and no fields to arrange first.',
    icon: List,
  },
  {
    n: '02',
    title: 'It organizes the clinical detail',
    body: 'The assistant reads the notes and sorts them into a clean clinical structure — history, findings, vitals, and plan. Your notes are used only to produce this output.',
    icon: Brain,
  },
  {
    n: '03',
    title: 'Three documents, one pass',
    body: 'A visit summary for the record, a prioritized list of next steps, and a plain-language message for the patient — checked for completeness before you ever see them.',
    icon: Doc,
  },
];

const STEP_PANELS = [
  {
    lines: [
      { c: 'd', t: '— visit notes —' },
      { c: '', t: '58yo M, chest pain x3d, non-radiating.' },
      { c: '', t: 'Hx HTN, on lisinopril 10mg.' },
      { c: '', t: 'BP 140/90  HR 88  SpO2 97%' },
      { c: '', t: 'EKG ordered. Trop pending.' },
      { c: 'd', t: '_' },
    ],
  },
  {
    lines: [
      { c: 'k', t: 'organizing the encounter' },
      { c: 'd', t: 'reading your notes …' },
      { c: 'g', t: '▸ vitals ............... sorted' },
      { c: 'g', t: '▸ history .............. sorted' },
      { c: 'g', t: '▸ next steps ........... drafted' },
      { c: 'k', t: '▸ patient message ......' },
    ],
  },
  {
    lines: [
      { c: 'k', t: 'Summary of visit' },
      { c: '', t: '58yo male, 3-day non-radiating' },
      { c: '', t: 'chest pain. Hypertensive, on ACE-I.' },
      { c: 'k', t: 'Next steps' },
      { c: 'g', t: '1. Review EKG + troponin' },
      { c: 'g', t: '2. Cardiology referral if elevated' },
    ],
  },
];

const FEATURES = [
  {
    icon: Doc,
    title: 'Record-ready summaries',
    body: 'Consultation notes become a structured summary written for the chart — not for marketing.',
    span: 'lg:col-span-3',
  },
  {
    icon: List,
    title: 'Prioritized next steps',
    body: 'Follow-ups are pulled out as an ordered, ready-to-act list.',
    span: 'lg:col-span-3',
  },
  {
    icon: Mail,
    title: 'Patient-language message',
    body: 'A draft written at a reading level patients actually understand — ready to edit and send.',
    span: 'lg:col-span-2',
  },
  {
    icon: Bolt,
    title: 'Drafts as you watch',
    body: 'The output appears while it is being written, so you are reading and editing sooner.',
    span: 'lg:col-span-2',
  },
  {
    icon: Shield,
    title: 'Notes stay yours',
    body: 'Your notes are used to produce the output and nothing else — the app keeps no record of them.',
    span: 'lg:col-span-2',
  },
];

const STATS = [
  { to: 15, suffix: ' min', label: 'Typical manual write-up' },
  { to: 3, suffix: ' min', label: 'With ClinScribe' },
  { to: 3, suffix: '', label: 'Documents per pass' },
  { to: 0, suffix: '', label: 'Notes kept afterward' },
];

/* ------------------------------------------------------------------
   Page
------------------------------------------------------------------ */
export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Mark that JS is running so reveal elements can start hidden.
  useEffect(() => {
    document.documentElement.classList.add('js-on');
    return () => document.documentElement.classList.remove('js-on');
  }, []);

  useIsoLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ---------- Always on: scroll progress + nav state ---------- */
      gsap.to('.cs-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      });

      let wasScrolled = false;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const now = self.scroll() > 80;
          if (now !== wasScrolled) {
            wasScrolled = now;
            setScrolled(now);
          }
        },
      });

      /* Workflow step activation: whichever step sits closest to the viewport
         centre wins. Two earlier approaches were wrong — one ScrollTrigger per
         step desyncs on jump-scroll (every onToggle fires in creation order and
         the last wins), and floor(progress * n) assumes uniform step heights.
         Measuring against the centre is exact regardless of height or origin. */
      const stepEls = STEPS.map((_, i) => document.querySelector<HTMLElement>(`.flow-step-${i}`));
      let lastStep = -1;
      ScrollTrigger.create({
        trigger: '.flow-rail',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: () => {
          const mid = window.innerHeight / 2;
          let best = 0;
          let bestDist = Infinity;
          stepEls.forEach((el, i) => {
            if (!el) return;
            const r = el.getBoundingClientRect();
            const d = Math.abs(r.top + r.height / 2 - mid);
            if (d < bestDist) {
              bestDist = d;
              best = i;
            }
          });
          if (best !== lastStep) {
            lastStep = best;
            setActiveStep(best);
          }
        },
      });

      /* ---------- Motion-safe block ---------- */
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        /* Hero intro timeline */
        const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
        intro
          .from('.hero-pill', { opacity: 0, y: 18, duration: 0.7 })
          .from('.hero-word', { opacity: 0, yPercent: 115, rotateX: -55, duration: 1, stagger: 0.06 }, '-=0.35')
          .from('.hero-lead', { opacity: 0, y: 22, duration: 0.8 }, '-=0.55')
          .from('.hero-cta', { opacity: 0, y: 18, duration: 0.6 }, '-=0.5')
          .from('.hero-trust', { opacity: 0, y: 14, duration: 0.6 }, '-=0.4')
          .from('.hero-panel', { opacity: 0, y: 46, scale: 0.95, duration: 1.1 }, '-=0.9')
          .from('.hero-scrollcue', { opacity: 0, duration: 0.6 }, '-=0.3');

        /* ECG stroke draw — loops */
        const ecg = document.querySelector<SVGPathElement>('.cs-ecg-path');
        if (ecg) {
          const len = ecg.getTotalLength();
          gsap.set(ecg, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(ecg, {
            strokeDashoffset: 0,
            duration: 3.2,
            ease: 'none',
            repeat: -1,
            repeatDelay: 0.5,
          });
        }

        /* PIN #1 — hero dissolves into the page as you scroll */
        gsap
          .timeline({
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: '+=110%',
              scrub: 1,
              pin: '.hero-inner',
              pinSpacing: true,
            },
          })
          .to('.hero-content', { yPercent: -14, opacity: 0, scale: 0.94, ease: 'none' }, 0)
          .to('.hero-panel', { yPercent: -6, opacity: 0, scale: 0.97, ease: 'none' }, 0.05)
          .to('.hero-aurora-a', { yPercent: -34, scale: 1.5, ease: 'none' }, 0)
          .to('.hero-aurora-b', { yPercent: -18, xPercent: 12, ease: 'none' }, 0)
          .to('.hero-mesh', { yPercent: -12, opacity: 0.25, ease: 'none' }, 0);

        /* Marquee — continuous drift, nudged by scroll velocity */
        const track = document.querySelector<HTMLElement>('.cs-marquee');
        if (track) {
          const half = track.scrollWidth / 2;
          gsap.to(track, {
            x: -half,
            duration: 26,
            ease: 'none',
            repeat: -1,
            modifiers: { x: (v) => `${parseFloat(v) % -half}px` },
          });
        }

        /* Generic staggered reveals */
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
          gsap.fromTo(
            group.children,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: { trigger: group, start: 'top 85%', toggleActions: 'play none none reverse' },
            }
          );
        });

        /* Section headline mask-reveal */
        gsap.utils.toArray<HTMLElement>('[data-mask-lines]').forEach((el) => {
          gsap.fromTo(
            el.querySelectorAll('.mask-line > span'),
            { yPercent: 108 },
            {
              yPercent: 0,
              duration: 0.95,
              ease: 'expo.out',
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none reverse' },
            }
          );
        });

        /* Counters */
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(obj.v));
            },
          });
        });

        /* Comparison bars */
        gsap.utils.toArray<HTMLElement>('.cs-bar').forEach((bar) => {
          gsap.to(bar, {
            scaleX: Number(bar.dataset.scale ?? 1),
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: { trigger: bar, start: 'top 92%', once: true },
          });
        });

        /* Subtle parallax on decorative layers */
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          gsap.to(el, {
            yPercent: Number(el.dataset.parallax),
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement as HTMLElement, scrub: 0.8 },
          });
        });

        /* CTA glow breathes */
        gsap.to('.cta-glow', {
          scale: 1.18,
          opacity: 0.85,
          duration: 4.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });

      /* ---------- Reduced motion: render final state ---------- */
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-reveal], [data-reveal-group] > *, .hero-word, .hero-pill, .hero-lead, .hero-cta, .hero-trust, .hero-panel', {
          opacity: 1,
          y: 0,
          yPercent: 0,
          rotateX: 0,
          scale: 1,
          clearProps: 'transform',
        });
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          el.textContent = String(el.dataset.count);
        });
      });
    }, root);

    // Recalculate once webfonts have settled — pinned sections need real heights.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, []);

  /* Cursor-tracked card sheen */
  const trackPointer = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <>
      <Head>
        <title>ClinScribe AI — Clinical documentation, structured in one pass</title>
        <meta
          name="description"
          content="Turn raw consultation notes into a visit summary, prioritized next steps, and a patient-friendly message — a clinical documentation assistant that keeps you in the editor's seat."
        />
        <meta name="theme-color" content="#F2F9FB" />
      </Head>

      <div ref={root} className="cs-app relative">
        <div className="cs-progress" aria-hidden="true" />

        {/* ============ NAV ============ */}
        <nav className="cs-nav" data-scrolled={scrolled}>
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="flex items-center justify-between h-[72px]">
              <Link href="/" className="flex items-center gap-3 no-underline">
                <span className="cs-mark">
                  <Mark className="w-[18px] h-[18px]" />
                </span>
                <span className="text-[17px] font-bold tracking-[-0.02em] text-[var(--cs-fg)]">
                  ClinScribe<span className="text-[var(--cs-cyan)]"> AI</span>
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-9">
                <a href="#how" className="cs-navlink">How it works</a>
                <a href="#capabilities" className="cs-navlink">What you get</a>
                <a href="#speed" className="cs-navlink">Time saved</a>
              </div>

              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="cs-btn !py-2.5 !px-6 !text-[14px]">Sign in</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/product" className="cs-btn !py-2.5 !px-6 !text-[14px]">
                    Dashboard <Arrow />
                  </Link>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </nav>

        {/* ============ HERO (light) ============ */}
        <section className="hero relative">
          <div className="hero-inner relative min-h-screen flex items-center overflow-hidden cs-noise">
            {/* Atmosphere — soft clinical wash */}
            <div
              className="cs-aurora cs-aurora--teal hero-aurora-a"
              style={{ width: 760, height: 760, top: '-26%', left: '52%', transform: 'translateX(-50%)' }}
            />
            <div
              className="cs-aurora cs-aurora--emerald hero-aurora-b"
              style={{ width: 600, height: 600, bottom: '-30%', left: '-14%' }}
            />
            <div
              className="cs-aurora cs-aurora--cyan"
              style={{ width: 500, height: 500, top: '16%', right: '-18%' }}
            />
            <div className="cs-mesh hero-mesh" />
            <div className="cs-halo" />

            <div className="relative w-full max-w-[1240px] mx-auto px-6 lg:px-10 pt-28 pb-16">
              <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-16 items-center">
                {/* Left */}
                <div className="hero-content">
                  <div className="hero-pill">
                    <span className="cs-pill">
                      <span className="cs-dot" />
                      Public beta
                    </span>
                  </div>

                  <h1 className="cs-display text-[clamp(2.6rem,7vw,4.9rem)] mt-7">
                    <span className="block overflow-hidden pb-[0.08em]">
                      <span className="hero-word inline-block">Clinical</span>{' '}
                      <span className="hero-word inline-block">notes</span>{' '}
                      <span className="hero-word inline-block">in.</span>
                    </span>
                    <span className="block overflow-hidden pb-[0.08em]">
                      <span className="hero-word inline-block cs-shimmer-text">Structured</span>
                    </span>
                    <span className="block overflow-hidden pb-[0.08em]">
                      <span className="hero-word inline-block cs-shimmer-text">records</span>{' '}
                      <span className="hero-word inline-block">out.</span>
                    </span>
                  </h1>

                  <p className="hero-lead cs-lead text-[17px] lg:text-[19px] mt-7 max-w-[31rem]">
                    Paste the encounter exactly as you scribbled it. Get back a visit summary, a
                    prioritized follow-up list, and a message your patient can actually read —
                    drafted in a single pass, with you as the editor.
                  </p>

                  <div className="hero-cta flex flex-wrap gap-3.5 mt-9">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="cs-btn">
                          <Pulse className="w-[18px] h-[18px]" />
                          Open the assistant
                        </button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/product" className="cs-btn">
                        <Pulse className="w-[18px] h-[18px]" />
                        Open the assistant
                      </Link>
                    </SignedIn>
                    <a href="#how" className="cs-btn-ghost">
                      See how it works
                    </a>
                  </div>

                  <div className="hero-trust flex flex-wrap items-center gap-x-7 gap-y-3 mt-10 text-[13px] text-[var(--cs-fg-dim)]">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[var(--cs-teal)]" /> Notes never stored
                    </span>
                    <span className="flex items-center gap-2">
                      <Bolt className="w-4 h-4 text-[var(--cs-teal)]" /> Ready in one pass
                    </span>
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[var(--cs-teal)]" /> You stay the editor
                    </span>
                  </div>
                </div>

                {/* Right — clinical monitor (deep) */}
                <div className="hero-panel relative">
                  <div className="cs-glass cs-deep p-0">
                    {/* Titlebar */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--cs-line)]">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2E4A5C]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2E4A5C]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2E4A5C]" />
                      </div>
                      <span className="cs-eyebrow !text-[10px] !tracking-[0.18em]">consultation · live</span>
                      <span className="cs-dot" />
                    </div>

                    {/* ECG */}
                    <div className="px-5 pt-5">
                      <svg viewBox="0 0 1200 120" className="w-full h-[68px]" preserveAspectRatio="none" aria-hidden="true">
                        <defs>
                          <linearGradient id="csEcgGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#0EA5A5" />
                            <stop offset="50%" stopColor="#22C0DC" />
                            <stop offset="100%" stopColor="#34D399" />
                          </linearGradient>
                        </defs>
                        <path className="cs-ecg-track" d={ECG_PATH} />
                        <path className="cs-ecg-path" d={ECG_PATH} />
                      </svg>
                    </div>

                    {/* Vitals */}
                    <div className="grid grid-cols-3 gap-3 px-5 pt-4">
                      {[
                        { l: 'BP', v: '140/90' },
                        { l: 'HR', v: '88' },
                        { l: 'SpO₂', v: '97%' },
                      ].map((m) => (
                        <div key={m.l} className="rounded-xl border border-[var(--cs-line)] bg-white/[0.03] px-3.5 py-3">
                          <div className="font-[family-name:var(--cs-mono)] text-[10px] tracking-[0.16em] text-[var(--cs-fg-dim)] uppercase">
                            {m.l}
                          </div>
                          <div className="text-[19px] font-semibold text-[var(--cs-fg)] tracking-[-0.02em] mt-0.5">
                            {m.v}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Output stream */}
                    <div className="mx-5 my-5 rounded-xl border border-[var(--cs-line)] bg-[var(--cs-inset-bg)] px-4 py-4">
                      <div className="cs-terminal">
                        <div className="k">Summary of visit</div>
                        <div>58yo male, 3-day non-radiating chest pain.</div>
                        <div>Hypertensive, on lisinopril 10mg.</div>
                        <div className="k mt-1">Next steps</div>
                        <div className="g">1. Review EKG and troponin</div>
                        <div className="g">
                          2. Cardiology referral if elevated<span className="cs-caret ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating chip */}
                  <div
                    className="hidden xl:flex w-max absolute -left-14 -bottom-7 cs-glass cs-deep !rounded-2xl px-4 py-3 items-center gap-3 shadow-2xl"
                    data-parallax="-14"
                  >
                    <span className="w-9 h-9 rounded-lg grid place-items-center bg-[rgba(52,211,153,0.14)] text-[var(--cs-emerald)]">
                      <Clock className="w-[18px] h-[18px]" />
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--cs-fg)]">~12 min saved</div>
                      <div className="text-[11px] text-[var(--cs-fg-dim)]">every consultation</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scroll cue */}
              <div className="hero-scrollcue hidden lg:flex flex-col items-center gap-2 absolute left-1/2 -translate-x-1/2 bottom-6 text-[var(--cs-fg-dim)]">
                <span className="font-[family-name:var(--cs-mono)] text-[10px] tracking-[0.24em] uppercase">Scroll</span>
                <Chevron className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <section className="relative py-7 border-y border-[var(--cs-line)] bg-[var(--cs-abyss)]">
          <div className="cs-marquee-mask overflow-hidden">
            <div className="cs-marquee gap-10">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="flex items-center gap-10 shrink-0">
                  <span className="font-[family-name:var(--cs-mono)] text-[12px] tracking-[0.16em] uppercase text-[var(--cs-fg-dim)] whitespace-nowrap">
                    {item}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[var(--cs-teal)]" />
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PROBLEM (light) ============ */}
        <section className="relative py-28 lg:py-36 overflow-hidden">
          <div
            className="cs-aurora cs-aurora--teal"
            style={{ width: 640, height: 640, top: '-20%', right: '-18%' }}
            data-parallax="-10"
          />
          <div className="relative max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="max-w-[52rem]">
              <span className="cs-eyebrow" data-reveal>The problem</span>
              <h2 className="cs-h2 text-[clamp(2rem,4.6vw,3.4rem)] mt-6" data-mask-lines>
                <span className="mask-line block overflow-hidden pb-[0.06em]">
                  <span className="inline-block">Documentation is the tax</span>
                </span>
                <span className="mask-line block overflow-hidden pb-[0.06em]">
                  <span className="inline-block text-[var(--cs-fg-dim)]">clinicians pay for seeing patients.</span>
                </span>
              </h2>
              <p className="cs-lead text-[17px] lg:text-[18px] mt-7 max-w-[38rem]" data-reveal>
                Every visit ends the same way: a blank field and fifteen minutes spent retyping what
                you already know. ClinScribe turns that into one drafted pass — and keeps you in the
                editing seat, where the judgment belongs.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mt-16" data-reveal-group>
              {STATS.map((s) => (
                <div key={s.label} className="cs-card !p-7" onMouseMove={trackPointer}>
                  <div className="cs-stat-num text-[clamp(2.2rem,5vw,3.2rem)] leading-none">
                    <span data-count={s.to}>0</span>
                    <span className="text-[0.5em] font-medium tracking-[-0.01em]">{s.suffix}</span>
                  </div>
                  <div className="text-[13px] text-[var(--cs-fg-dim)] mt-3 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ WORKFLOW — scroll-telling (deep) ============ */}
        <section id="how" className="flow cs-deep relative">
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
            <div className="max-w-[46rem] mb-16 lg:mb-24">
              <span className="cs-eyebrow" data-reveal>How it works</span>
              <h2 className="cs-h2 text-[clamp(2rem,4.6vw,3.2rem)] mt-6" data-mask-lines>
                <span className="mask-line block overflow-hidden pb-[0.06em]">
                  <span className="inline-block">Three steps.</span>
                </span>
                <span className="mask-line block overflow-hidden pb-[0.06em]">
                  <span className="inline-block text-[var(--cs-fg-dim)]">Nothing to set up.</span>
                </span>
              </h2>
            </div>

            {/* No items-start: both columns must stretch to the row height,
                otherwise the sticky column has no travel distance. */}
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20">
              {/* Steps rail */}
              <div className="flow-rail order-2 lg:order-1">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.n}
                      className={`flow-step-${i} cs-step py-12 lg:py-0 lg:min-h-[74vh] lg:flex lg:flex-col lg:justify-center`}
                      data-active={activeStep === i}
                    >
                      <div className="flex items-center gap-4 mb-5">
                        <span className="cs-step-index">{s.n}</span>
                        <span className="w-10 h-10 rounded-xl grid place-items-center border border-[var(--cs-line)] bg-white/[0.04] text-[var(--cs-cyan)]">
                          <Icon className="w-[19px] h-[19px]" />
                        </span>
                      </div>
                      <h3 className="text-[22px] lg:text-[26px] font-bold tracking-[-0.025em] text-[var(--cs-fg)] mb-4">
                        {s.title}
                      </h3>
                      <p className="cs-lead text-[16px] max-w-[27rem]">{s.body}</p>

                      {/* Mobile panel (pinning is desktop-only) */}
                      <div className="lg:hidden mt-8">
                        <Panel index={i} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pinned visual */}
              <div className="flow-visual order-1 lg:order-2 hidden lg:block">
                <div className="sticky top-[92px] h-[calc(100vh-92px)] flex items-center">
                  <div className="w-full relative">
                    <div
                      className="cs-aurora cs-aurora--cyan"
                      style={{ width: 460, height: 460, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.5 }}
                    />
                    <div className="relative">
                      <Panel index={activeStep} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CAPABILITIES (light) ============ */}
        <section id="capabilities" className="relative py-28 lg:py-36 overflow-hidden bg-[var(--cs-abyss)] border-y border-[var(--cs-line)]">
          <div className="cs-mesh" style={{ opacity: 0.5 }} />
          <div className="relative max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="max-w-[46rem] mb-14">
              <span className="cs-eyebrow" data-reveal>What you get</span>
              <h2 className="cs-h2 text-[clamp(2rem,4.6vw,3.2rem)] mt-6" data-mask-lines>
                <span className="mask-line block overflow-hidden pb-[0.06em]">
                  <span className="inline-block">Built narrow.</span>
                </span>
                <span className="mask-line block overflow-hidden pb-[0.06em]">
                  <span className="inline-block text-[var(--cs-fg-dim)]">Built to be correct.</span>
                </span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-6 gap-4 lg:gap-5" data-reveal-group>
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className={`cs-card ${f.span}`} onMouseMove={trackPointer}>
                    <span className="w-11 h-11 rounded-xl grid place-items-center bg-[rgba(14,143,176,0.09)] border border-[rgba(14,143,176,0.18)] text-[var(--cs-cyan)] mb-6">
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[var(--cs-fg)] mb-2.5">{f.title}</h3>
                    <p className="text-[14.5px] leading-[1.65] text-[var(--cs-fg-soft)]">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ SPEED (light + deep monitor card) ============ */}
        <section id="speed" className="relative py-28 lg:py-36 overflow-hidden">
          <div
            className="cs-aurora cs-aurora--emerald"
            style={{ width: 700, height: 700, bottom: '-30%', left: '-14%' }}
            data-parallax="-8"
          />
          <div className="relative max-w-[1240px] mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div>
                <span className="cs-eyebrow" data-reveal>Time per visit</span>
                <h2 className="cs-h2 text-[clamp(2rem,4.4vw,3.1rem)] mt-6" data-mask-lines>
                  <span className="mask-line block overflow-hidden pb-[0.06em]">
                    <span className="inline-block">Fifteen minutes,</span>
                  </span>
                  <span className="mask-line block overflow-hidden pb-[0.06em]">
                    <span className="inline-block cs-shimmer-text">compressed to three.</span>
                  </span>
                </h2>
                <p className="cs-lead text-[16.5px] mt-7 max-w-[30rem]" data-reveal>
                  The assistant drafts; you review and refine. The bottleneck moves from typing to
                  judgment — the only part that ever needed a clinician.
                </p>
              </div>

              {/* Deep monitor card */}
              <div
                className="cs-deep cs-card !p-8 lg:!p-10"
                style={{ background: 'var(--h-deep)' }}
                onMouseMove={trackPointer}
                data-reveal
              >
                <div className="space-y-9">
                  <div>
                    <div className="flex items-baseline justify-between mb-3.5">
                      <span className="font-[family-name:var(--cs-mono)] text-[11px] tracking-[0.18em] uppercase text-[var(--cs-fg-dim)]">
                        Manual write-up
                      </span>
                      <span className="text-[26px] font-bold text-[var(--cs-fg-dim)] tracking-[-0.03em]">15 min</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="cs-bar cs-bar--old" data-scale="1" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mb-3.5">
                      <span className="font-[family-name:var(--cs-mono)] text-[11px] tracking-[0.18em] uppercase text-[var(--cs-cyan)]">
                        With ClinScribe
                      </span>
                      <span className="cs-stat-num text-[26px] tracking-[-0.03em]">3 min</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="cs-bar cs-bar--new" data-scale="0.2" />
                    </div>
                  </div>
                </div>

                <div className="cs-rule my-9" />

                <div className="grid grid-cols-3 gap-5">
                  {[
                    { v: '3', l: 'Documents' },
                    { v: '1', l: 'Pass' },
                    { v: '0', l: 'Notes kept' },
                  ].map((x) => (
                    <div key={x.l}>
                      <div className="text-[24px] font-bold text-[var(--cs-fg)] tracking-[-0.03em]">{x.v}</div>
                      <div className="text-[12px] text-[var(--cs-fg-dim)] mt-1">{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CTA (deep) ============ */}
        <section className="cs-deep relative py-32 lg:py-40 overflow-hidden">
          <div
            className="cta-glow cs-aurora cs-aurora--cyan"
            style={{ width: 820, height: 560, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.6 }}
          />
          <div className="cs-mesh" style={{ opacity: 0.6 }} />

          <div className="relative max-w-[820px] mx-auto px-6 text-center">
            <span className="cs-pill mb-8 inline-flex" data-reveal>
              <span className="cs-dot" />
              Ready when you are
            </span>
            <h2 className="cs-h2 text-[clamp(2.2rem,5.4vw,3.9rem)]" data-mask-lines>
              <span className="mask-line block overflow-hidden pb-[0.06em]">
                <span className="inline-block">Give the paperwork</span>
              </span>
              <span className="mask-line block overflow-hidden pb-[0.06em]">
                <span className="inline-block cs-shimmer-text">back its twelve minutes.</span>
              </span>
            </h2>
            <p className="cs-lead text-[17px] mt-7 max-w-[34rem] mx-auto" data-reveal>
              Sign in and run your first visit through it. No setup, no template library to build,
              nothing to migrate.
            </p>
            <div className="flex flex-wrap gap-3.5 justify-center mt-10" data-reveal>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="cs-btn !px-9 !py-[17px] !text-[16px]">
                    Get started <Arrow />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/product" className="cs-btn !px-9 !py-[17px] !text-[16px]">
                  Launch dashboard <Arrow />
                </Link>
              </SignedIn>
              <a href="#how" className="cs-btn-ghost !px-9 !py-[17px] !text-[16px]">
                Read the flow
              </a>
            </div>
          </div>
        </section>

        {/* ============ FOOTER (deep) ============ */}
        <footer className="cs-deep relative border-t border-[var(--cs-line)] pt-16 pb-10">
          <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
            {/* Disclaimer — accurate, not decorative */}
            <div className="rounded-2xl border border-[rgba(245,181,70,0.28)] bg-[rgba(245,181,70,0.07)] px-6 py-5 mb-14 flex gap-4 items-start">
              <span className="mt-0.5 text-[#F5B546] shrink-0">
                <Shield className="w-5 h-5" />
              </span>
              <p className="text-[13.5px] leading-[1.7] text-[#EBD3A1]">
                <strong className="font-semibold text-[#F5B546]">Demo project.</strong>{' '}
                Consultation notes are sent to an external AI service to generate the output. This is
                not a certified or HIPAA-compliant medical service and should not be used for care —
                do not enter real protected health information (PHI).
              </p>
            </div>

            <div className="grid md:grid-cols-[1.6fr_1fr_1fr] gap-12">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="cs-mark">
                    <Mark className="w-[18px] h-[18px]" />
                  </span>
                  <span className="text-[17px] font-bold tracking-[-0.02em] text-[var(--cs-fg)]">
                    ClinScribe<span className="text-[var(--cs-cyan)]"> AI</span>
                  </span>
                </div>
                <p className="text-[14px] leading-[1.7] text-[var(--cs-fg-soft)] max-w-[24rem]">
                  A clinical documentation assistant. Notes in, structured records out — so the
                  write-up stops competing with the patient in front of you.
                </p>
              </div>

              <div>
                <h4 className="cs-eyebrow !text-[10px] mb-5">Explore</h4>
                <ul className="space-y-3 text-[14px]">
                  {[
                    { l: 'How it works', h: '#how' },
                    { l: 'What you get', h: '#capabilities' },
                    { l: 'Time saved', h: '#speed' },
                  ].map((x) => (
                    <li key={x.l}>
                      <a href={x.h} className="cs-navlink">{x.l}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="cs-eyebrow !text-[10px] mb-5">About</h4>
                <ul className="space-y-3 text-[14px] text-[var(--cs-fg-soft)]">
                  <li>Built by Carlos Egana</li>
                  <li>Public beta</li>
                  <li>Not for clinical use</li>
                </ul>
              </div>
            </div>

            <div className="cs-rule my-10" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[13px] text-[var(--cs-fg-dim)]">
              <p>© 2026 ClinScribe AI · Developed by Carlos Egana</p>
              <p className="font-[family-name:var(--cs-mono)] text-[11px] tracking-[0.14em] uppercase">
                Demo build · Not for clinical use
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------
   Workflow panel
------------------------------------------------------------------ */
function Panel({ index }: { index: number }) {
  const panel = STEP_PANELS[index] ?? STEP_PANELS[0];
  const labels = ['input', 'organizing', 'output'];

  return (
    <div className="cs-glass">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--cs-line)]">
        <span className="cs-eyebrow !text-[10px] !tracking-[0.18em]">
          step {String(index + 1).padStart(2, '0')} · {labels[index] ?? ''}
        </span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: i === index ? 22 : 8,
                background: i === index ? 'var(--cs-cyan)' : 'rgba(150,205,225,0.22)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="px-5 py-6 min-h-[236px]">
        <div className="cs-terminal">
          {panel.lines.map((l, i) => (
            <div key={`${index}-${i}`} className={l.c}>
              {l.t}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-[var(--cs-line)] flex items-center gap-2.5">
        <span className="cs-dot" />
        <span className="font-[family-name:var(--cs-mono)] text-[11px] tracking-[0.14em] uppercase text-[var(--cs-fg-dim)]">
          {index === 2 ? 'complete' : 'working'}
        </span>
      </div>
    </div>
  );
}
