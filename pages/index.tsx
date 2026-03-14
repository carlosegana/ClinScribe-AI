"use client"

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

// Medical Icons
const MedicalCrossIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20" />
  </svg>
);

const StethoscopeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const HeartRateIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BrainIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Stats Data
const stats = [
  { value: '10,000+', label: 'Clinical Summaries Generated', icon: DocumentIcon },
  { value: '98.5%', label: 'Accuracy Rate', icon: ActivityIcon },
  { value: '500+', label: 'Healthcare Providers', icon: StethoscopeIcon },
  { value: '75%', label: 'Time Saved', icon: ClockIcon },
];

// Features Data
const features = [
  {
    title: 'AI-Powered Documentation',
    description: 'Generate comprehensive clinical summaries, SOAP notes, and treatment plans using advanced natural language processing.',
    icon: BrainIcon,
    color: 'from-blue-600 to-blue-700',
  },
  {
    title: 'Real-time Analysis',
    description: 'Process patient data instantly with live vital sign interpretation and automated risk assessment algorithms.',
    icon: HeartRateIcon,
    color: 'from-teal-600 to-teal-700',
  },
  {
    title: 'HIPAA Compliant Security',
    description: 'Enterprise-grade encryption and security protocols ensure patient data remains protected at all times.',
    icon: ShieldIcon,
    color: 'from-emerald-600 to-emerald-700',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 animate-slide-left">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <MedicalCrossIcon />
              </div>
              <span className="text-xl font-bold text-[var(--dark)]">
                ClinScribe <span className="text-blue-600">AI</span>
              </span>
            </div>
            <div className="flex items-center gap-4 animate-slide-right">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="medical-button text-sm py-2.5 px-5">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <Link href="/product" className="medical-button text-sm py-2.5 px-5">
                    Go to Dashboard
                  </Link>
                  <UserButton showName={true} />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden tech-grid">
        <div className="particle-bg">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="particle" />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-medical-pulse" />
                <span className="text-sm font-medium text-blue-700">Developed by Carlos Egana</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-[var(--dark)] leading-tight">
                Transform Medical Documentation with{' '}
                <span className="medical-gradient-text">AI Technology</span>
              </h1>
              
              <p className="text-xl text-[var(--dark-gray)] leading-relaxed max-w-xl">
                Advanced clinical intelligence that converts patient encounters into structured, 
                compliant medical records in seconds. Save time, reduce errors, and focus on patient care.
              </p>

              <div className="flex flex-wrap gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="medical-button text-lg">
                      <StethoscopeIcon />
                      Start Free Trial
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/product">
                    <button className="medical-button text-lg">
                      <StethoscopeIcon />
                      Open Clinical Assistant
                    </button>
                  </Link>
                </SignedIn>
                <button className="medical-button-secondary">
                  <DocumentIcon />
                  View Demo
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-[var(--medium-gray)] text-sm">
                  <ShieldIcon />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--medium-gray)] text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--medium-gray)] text-sm">
                  <ActivityIcon />
                  <span>ISO 27001 Certified</span>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative animate-smooth-float">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-teal-500 opacity-20 blur-3xl rounded-full" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
                {/* Mock Dashboard Header */}
                <div className="bg-gradient-to-r from-blue-700 to-teal-700 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <MedicalCrossIcon />
                    <span className="font-semibold">ClinScribe AI</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>
                
                {/* Mock Content */}
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-[var(--medium-gray)] uppercase font-medium">Patient</label>
                      <div className="mt-1 px-4 py-3 bg-[var(--off-white)] rounded-lg border border-[var(--border)] text-[var(--dark)]">
                        Frank Martin
                      </div>
                    </div>
                    <div className="w-32">
                      <label className="text-xs text-[var(--medium-gray)] uppercase font-medium">Date</label>
                      <div className="mt-1 px-4 py-3 bg-[var(--off-white)] rounded-lg border border-[var(--border)] text-[var(--dark)]">
                        2026-03-15
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-[var(--medium-gray)] uppercase font-medium">Clinical Notes</label>
                    <div className="mt-1 px-4 py-3 bg-[var(--off-white)] rounded-lg border border-[var(--border)] h-24 font-mono text-sm text-[var(--dark-gray)]">
                      58yo patient with chest pain...
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-teal-600">
                      <span className="w-2 h-2 bg-teal-600 rounded-full animate-medical-pulse" />
                      <span className="text-sm font-medium">AI Processing...</span>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-slide-up" style={{animationDelay: `${i * 0.1}s`}}>
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <stat.icon />
                </div>
                <div className="text-4xl font-bold text-[var(--dark)] mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--medium-gray)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[var(--off-white)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--dark)] mb-4">
              Clinical Intelligence Platform
            </h2>
            <p className="text-lg text-[var(--dark-gray)]">
              Powered by state-of-the-art machine learning algorithms trained on millions of clinical encounters
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="medical-card group"
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon />
                </div>
                <h3 className="text-xl font-bold text-[var(--dark)] mb-3">{feature.title}</h3>
                <p className="text-[var(--dark-gray)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-[var(--charcoal)] to-[var(--dark)] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for Modern Healthcare
              </h2>
              <p className="text-[var(--light-gray)] text-lg mb-8">
                Every feature is engineered to enhance clinical workflow efficiency 
                while maintaining the highest standards of medical documentation.
              </p>
              
              <div className="space-y-4">
                {[
                  'Reduce documentation time by 75%',
                  'Eliminate transcription errors',
                  'Improve clinical decision support',
                  'Ensure regulatory compliance',
                  'Seamless EHR integration',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span className="text-[var(--light-gray)]">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-teal-600 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-[var(--charcoal)]/80 backdrop-blur-sm border border-[var(--dark-gray)] rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--dark-gray)]">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <ClockIcon />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg">Time Efficiency</div>
                    <div className="text-[var(--medium-gray)]">Per consultation average</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-[var(--dark)] rounded-2xl border border-[var(--dark-gray)]">
                    <div className="text-4xl font-bold text-[var(--medium-gray)] mb-2">15min</div>
                    <div className="text-[var(--medium-gray)] text-sm">Traditional</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-600/20 to-teal-600/20 rounded-2xl border border-blue-500/30">
                    <div className="text-4xl font-bold text-blue-400 mb-2">3min</div>
                    <div className="text-white text-sm">With ClinScribe</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--dark)] mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-lg text-[var(--dark-gray)] mb-8 max-w-2xl mx-auto">
            Join hundreds of healthcare providers who have revolutionized their clinical documentation workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="medical-button text-lg px-10">
                  Get Started Free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/product">
                <button className="medical-button text-lg px-10">
                  Launch Dashboard
                </button>
              </Link>
            </SignedIn>
            <button className="medical-button-secondary text-lg px-10">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--off-white)] border-t border-[var(--border)] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center text-white">
                  <MedicalCrossIcon />
                </div>
                <span className="text-lg font-bold text-[var(--dark)]">
                  ClinScribe <span className="text-blue-600">AI</span>
                </span>
              </div>
              <p className="text-[var(--medium-gray)] max-w-sm">
                Advanced clinical documentation powered by artificial intelligence. 
                Developed by Carlos Egana.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[var(--dark)] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--medium-gray)]">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[var(--dark)] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--medium-gray)]">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[var(--border)] mt-12 pt-8 text-center text-sm text-[var(--medium-gray)]">
            <p>© 2026 ClinScribe AI. Advanced clinical technology. Developed by Carlos Egana.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}