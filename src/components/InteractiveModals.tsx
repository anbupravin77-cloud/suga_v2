import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import {
  TreatmentCategoryId,
  validateConsultationIntake,
} from '../utils/treatments';

interface ConsultationModalProps {
  isOpen: boolean;
  initialCategory: TreatmentCategoryId;
  sourceLabel?: string;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<TreatmentCategoryId, string> = {
  'weight-loss': 'Medical weight loss',
  'hair-growth': 'Hair growth',
  'sexual-health': 'Sexual Health',
};

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  initialCategory,
  sourceLabel,
  onClose,
}) => {
  const [category, setCategory] = useState<TreatmentCategoryId>(initialCategory);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    setCategory(initialCategory);
    setError(null);
    setSubmitted(false);
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateConsultationIntake({
      category,
      fullName,
      email,
      age,
    });
    if (!validation.valid) {
      setError(validation.error ?? 'Please check your information.');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14352B]/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[#F6F3EC] border border-[#14352B]/15 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close consultation dialog"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white hover:bg-[#14352B] text-[#14352B] hover:text-white flex items-center justify-center border border-[#14352B]/15 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <>
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#5C7068]">
              100% ONLINE PROCESS · FULLY CONFIDENTIAL
            </p>
            <h2
              id="consultation-modal-title"
              className="mt-1.5 text-2xl font-bold tracking-tight text-[#14352B]"
            >
              Start your expert consultation
            </h2>
            {sourceLabel && (
              <p className="mt-1 text-sm text-[#5C7068]">
                Selected care pathway: <span className="font-semibold text-[#14352B]">{sourceLabel}</span>
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7068] mb-2">
                  Treatment Focus
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['weight-loss', 'hair-growth', 'sexual-health'] as TreatmentCategoryId[]).map(
                    (catId) => (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => setCategory(catId)}
                        className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap truncate cursor-pointer ${
                          category === catId
                            ? 'bg-[#14352B] text-white border-[#14352B]'
                            : 'bg-white text-[#14352B] border-[#14352B]/20 hover:border-[#14352B]'
                        }`}
                      >
                        {CATEGORY_LABELS[catId]}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="intake-full-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#5C7068] mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="intake-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your legal name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#14352B]/20 focus:border-[#14352B] focus:outline-none text-sm text-[#14352B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="intake-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#5C7068] mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="intake-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#14352B]/20 focus:border-[#14352B] focus:outline-none text-sm text-[#14352B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="intake-age"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#5C7068] mb-1.5"
                  >
                    Age
                  </label>
                  <input
                    id="intake-age"
                    type="number"
                    min={18}
                    max={110}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="32"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#14352B]/20 focus:border-[#14352B] focus:outline-none text-sm text-[#14352B] tabular-nums"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs font-semibold text-[#B82927]">
                  {error}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#5C7068] hover:text-[#14352B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#14352B] hover:bg-[#0E261E] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Continue to medical intake
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#14352B] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-[#14352B]">
              Intake Profile Created for {fullName}
            </h3>
            <p className="mt-2 text-sm text-[#5C7068] max-w-md mx-auto">
              Your confidential{' '}
              <span className="font-semibold text-[#14352B]">
                {CATEGORY_LABELS[category]}
              </span>{' '}
              questionnaire has been prepared and sent to <span className="font-semibold">{email}</span>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-full bg-[#14352B] text-white text-sm font-semibold cursor-pointer"
            >
              Return to suga.health
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setStatusMessage('Please enter both your email and password.');
      return;
    }
    setStatusMessage(`Signed in as ${email}. Redirecting to your patient care dashboard...`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14352B]/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#F6F3EC] border border-[#14352B]/15 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white hover:bg-[#14352B] text-[#14352B] hover:text-white flex items-center justify-center border border-[#14352B]/15 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#5C7068]">
          <Lock className="w-3.5 h-3.5" />
          <span>PATIENT PORTAL</span>
        </div>
        <h2 id="login-modal-title" className="mt-1 text-2xl font-bold text-[#14352B]">
          Sign in to suga.health
        </h2>
        <p className="mt-1 text-sm text-[#5C7068]">
          Access your prescriptions, clinician messages, and discreet shipment tracking.
        </p>

        <form onSubmit={handleLogin} className="mt-5 space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#5C7068] mb-1.5"
            >
              Patient Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@suga.health"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#14352B]/20 focus:border-[#14352B] focus:outline-none text-sm text-[#14352B]"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#5C7068] mb-1.5"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#14352B]/20 focus:border-[#14352B] focus:outline-none text-sm text-[#14352B]"
            />
          </div>

          {statusMessage && (
            <p role="status" className="text-xs font-semibold text-[#14352B]">
              {statusMessage}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#14352B] hover:bg-[#0E261E] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConsultation: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onStartConsultation,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14352B]/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[#F6F3EC] border border-[#14352B]/15 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close about dialog"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white hover:bg-[#14352B] text-[#14352B] hover:text-white flex items-center justify-center border border-[#14352B]/15 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#5C7068]">
          <ShieldCheck className="w-4 h-4" />
          <span>ABOUT SUGA.HEALTH</span>
        </div>
        <h2 id="about-modal-title" className="mt-1.5 text-2xl font-bold text-[#14352B]">
          Clinically proven, FDA (USA) approved care
        </h2>
        <p className="mt-3 text-sm text-[#5C7068] leading-relaxed">
          suga.health connects patients with licensed medical specialists for evidence-based
          weight management, hair restoration, and private sexual health treatments—100% online
          with free, discreet shipping.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#5C7068] hover:text-[#14352B] cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartConsultation();
            }}
            className="px-5 py-2.5 rounded-full bg-[#B82927] text-white text-xs font-semibold cursor-pointer"
          >
            Start consultation
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProtocolModalProps {
  pathway: {
    id: TreatmentCategoryId;
    categoryLabel: string;
    title: string;
    description: string;
    stats: {
      efficacyLabel: string;
      efficacyValue: string;
      resultsLabel: string;
      resultsValue: string;
    };
    checklist: string[];
    protocolDetails: {
      activeIngredients: string;
      clinicalSchedule: string;
      pharmacyDispensing: string;
    };
  } | null;
  onClose: () => void;
  onStartConsultation: (category: TreatmentCategoryId, title: string) => void;
}

export const ProtocolModal: React.FC<ProtocolModalProps> = ({
  pathway,
  onClose,
  onStartConsultation,
}) => {
  if (!pathway) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="protocol-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14352B]/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[#F6F3EC] border border-[#14352B]/15 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close protocol dialog"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white hover:bg-[#14352B] text-[#14352B] hover:text-white flex items-center justify-center border border-[#14352B]/15 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#5C7068]">
          {pathway.categoryLabel}
        </p>
        <h2
          id="protocol-modal-title"
          className="mt-1.5 text-2xl font-bold tracking-tight text-[#14352B]"
        >
          {pathway.title} — Clinical Protocol
        </h2>
        <p className="mt-2 text-sm text-[#5C7068] leading-relaxed">
          {pathway.description}
        </p>

        <div className="mt-5 space-y-3 rounded-xl bg-white p-4 border border-[#14352B]/10 text-sm">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C7068] block">
              Active Formulation
            </span>
            <span className="font-semibold text-[#14352B]">
              {pathway.protocolDetails.activeIngredients}
            </span>
          </div>
          <div className="pt-2 border-t border-[#14352B]/10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C7068] block">
              Dosing & Titration Schedule
            </span>
            <span className="font-semibold text-[#14352B]">
              {pathway.protocolDetails.clinicalSchedule}
            </span>
          </div>
          <div className="pt-2 border-t border-[#14352B]/10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C7068] block">
              Dispensing & Fulfilment
            </span>
            <span className="font-semibold text-[#14352B]">
              {pathway.protocolDetails.pharmacyDispensing}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#5C7068] hover:text-[#14352B] cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              const id = pathway.id;
              const title = pathway.title;
              onClose();
              onStartConsultation(id, title);
            }}
            className="px-5 py-2.5 rounded-full bg-[#B82927] hover:bg-[#A32220] text-white text-xs font-semibold cursor-pointer"
          >
            Start consultation
          </button>
        </div>
      </div>
    </div>
  );
};
