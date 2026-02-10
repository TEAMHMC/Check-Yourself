
import React, { useState, useEffect } from 'react';
import { Language, AssessmentState, SCORING_OPTIONS, SDOH_OPTIONS, LIFE_EVENT_OPTIONS, TOOL_OPTIONS } from './types';
import { QUESTIONS, STRINGS, INTERPRETATIONS } from './constants';
import { calculatePHQ9, calculateGAD7 } from './services/scoring';

const BRAND = {
  blue: '#233dff',
  blueDark: '#1a2b99',
  pink: '#FF6F91',
  yellow: '#f9c74f',
  orange: '#ff6e40',
  red: '#e63946',
  black: '#000000',
  white: '#ffffff',
  bg: '#faf9f6'
};

// --- ICONS ---
const RestartIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
  </svg>
);

// --- SUB-COMPONENTS ---

const ActionButton: React.FC<{
  onClick?: () => void,
  children: React.ReactNode,
  variant?: 'primary' | 'outline',
  color?: string,
  className?: string,
  icon?: React.ReactNode,
  noDot?: boolean,
  href?: string
}> = ({ onClick, children, variant = 'primary', color = BRAND.blue, className, icon, noDot, href }) => {
  const isPrimary = variant === 'primary';
  const dotColorClass = isPrimary ? 'bg-white' : 'bg-black';
  const baseClasses = `inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 active:scale-95 border border-black tracking-wide ${className} ${isPrimary ? 'text-white hover:shadow-[0_4px_16px_rgba(35,61,255,0.35)]' : 'text-[#1a1a1a] bg-white hover:bg-gray-50 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]'}`;

  const inner = (
    <>
      {!noDot && !icon && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColorClass}`}></span>}
      {icon && <span className="flex items-center justify-center flex-shrink-0">{icon}</span>}
      {children}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses} style={isPrimary ? { backgroundColor: color } : {}}>
        {inner}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses} style={isPrimary ? { backgroundColor: color } : {}}>
      {inner}
    </button>
  );
};

const Layout: React.FC<{ children: React.ReactNode, state: AssessmentState, restart: () => void, toggleLanguage: () => void, hideProgress?: boolean }> = ({ children, state, restart, toggleLanguage, hideProgress }) => {
  const progress = ((state.currentStep + 1) / (QUESTIONS.length || 1)) * 100;
  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-['Inter'] antialiased">
      <style>
        {`
          @media print {
            .print\\:hidden { display: none !important; }
            body { background: white !important; margin: 0; padding: 0; }
            main { padding: 0 !important; width: 100% !important; max-width: none !important; display: block !important; }
            #root { padding: 0 !important; }
            .min-h-screen { min-height: 0 !important; height: auto !important; }
            .bg-\\[\\#faf9f6\\] { background: white !important; }
            .shadow-2xl, .shadow-xl, .shadow-lg, .shadow-md { box-shadow: none !important; }
            .border-stone-100 { border-color: #f1f1f1 !important; border-width: 1px !important; }
            .rounded-\\[2\\.5rem\\], .rounded-\\[3rem\\] { border-radius: 1rem !important; }
            button, .sticky, header, footer { display: none !important; }
            .max-w-2xl { max-width: 100% !important; margin: 0 !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}
      </style>
      <div className="sticky top-0 z-10 bg-[#faf9f6]/90 backdrop-blur-lg border-b border-stone-100/80 print:hidden">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={restart} aria-label="Close and restart" className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-sm hover:bg-stone-50 hover:border-stone-300 transition-all">
             <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          {!hideProgress && (
            <div className="flex-1 px-6">
              <div className="w-full bg-stone-200/60 h-1 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(state.section === 'assessment' ? progress : 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${state.section === 'assessment' ? progress : 100}%`, background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})` }}></div>
              </div>
            </div>
          )}
          <button onClick={toggleLanguage} aria-label={`Switch to ${state.language === 'en' ? 'Spanish' : 'English'}`} className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-white px-3.5 py-1.5 border border-stone-200 rounded-full hover:text-stone-800 hover:border-stone-300 transition-all">
            {state.language === 'en' ? 'ES' : 'EN'}
          </button>
        </div>
      </div>
      <main className="flex-1 flex items-center justify-center p-6 pb-20">
        {children}
      </main>
      <footer className="py-8 text-center print:hidden">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Health Matters Clinic. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const defaultState: AssessmentState = {
    answers: {},
    rootCauses: [],
    lifeEvents: [],
    currentStep: -1,
    section: 'intro',
    language: Language.EN,
    gamePlanStep: 0,
    gamePlan: {
      grounding: '',
      tools: [],
      customTools: '',
      checkpoint: '',
      contact1: { name: '', phone: '' },
      contact2: { name: '', phone: '' },
      therapist: { name: '', phone: '' },
      emergency: '988 Suicide & Crisis Lifeline\n1-800-854-7771 LA County ACCESS\n1-888-624-4752 CHIRLA',
      playlist: '',
      creative: '',
      content: '',
      physical: '',
      forward: '',
      message: '',
      smsOptIn: false,
      appOptIn: false
    }
  };

  const [state, setState] = useState<AssessmentState>(defaultState);
  const [savedState, setSavedState] = useState<AssessmentState | null>(null);

  // Restore session on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('vibeCheckState');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.section && parsed.section !== 'intro') {
          setSavedState(parsed);
        }
      }
    } catch {}
  }, []);

  // Save session on every state change (except intro)
  useEffect(() => {
    if (state.section !== 'intro') {
      sessionStorage.setItem('vibeCheckState', JSON.stringify(state));
    }
  }, [state]);

  const t = STRINGS[state.language];

  // --- HANDLERS ---
  const handleStart = () => {
    setState(prev => ({ ...prev, section: 'assessment', currentStep: 0, answers: {}, rootCauses: [], lifeEvents: [] }));
  };

  const handleAnswer = (value: number) => {
    const currentQ = QUESTIONS[state.currentStep];
    if (!currentQ) return;
    const newAnswers = { ...state.answers, [currentQ.id]: value };
    if (state.currentStep === QUESTIONS.length - 1) {
      setState(prev => ({ ...prev, answers: newAnswers, section: 'life-events' }));
    } else {
      setState(prev => ({ ...prev, answers: newAnswers, currentStep: prev.currentStep + 1 }));
    }
  };

  const toggleList = (field: 'rootCauses' | 'lifeEvents', id: string) => {
    setState(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(i => i !== id) : [...prev[field], id]
    }));
  };

  const goToResults = () => {
    setState(prev => ({ ...prev, section: 'results' }));
    window.scrollTo(0, 0);
  };

  const startGamePlan = () => {
    setState(prev => ({ ...prev, section: 'game-plan', gamePlanStep: 1 }));
    window.scrollTo(0, 0);
  };

  const updateGamePlan = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      gamePlan: { ...prev.gamePlan, [field]: value }
    }));
  };

  const updateGamePlanNested = (parent: 'contact1' | 'contact2' | 'therapist', field: string, value: string) => {
    setState(prev => ({
      ...prev,
      gamePlan: {
        ...prev.gamePlan,
        [parent]: { ...prev.gamePlan[parent], [field]: value }
      }
    }));
  };

  const toggleGamePlanTool = (id: string) => {
    setState(prev => ({
      ...prev,
      gamePlan: {
        ...prev.gamePlan,
        tools: prev.gamePlan.tools.includes(id) 
          ? prev.gamePlan.tools.filter(t => t !== id) 
          : [...prev.gamePlan.tools, id]
      }
    }));
  };

  const restart = () => {
    sessionStorage.removeItem('vibeCheckState');
    setState(prev => ({
      ...prev,
      answers: {},
      rootCauses: [],
      lifeEvents: [],
      currentStep: -1,
      section: 'intro',
      gamePlanStep: 0,
      gamePlan: {
        ...prev.gamePlan,
        grounding: '',
        tools: [],
        playlist: '',
        creative: '',
        forward: '',
        message: '',
        contact1: { name: '', phone: '' },
        contact2: { name: '', phone: '' }
      }
    }));
  };

  const toggleLanguage = () => {
    setState(prev => ({
      ...prev,
      language: prev.language === Language.EN ? Language.ES : Language.EN
    }));
  };

  const handleShare = async () => {
    const shareText = `I just built my recovery plan on The Vibe Check! Check it out at healthmatters.clinic. Message to self: "${state.gamePlan.message || 'You are unstoppable.'}"`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Recovery Play',
          text: shareText,
          url: 'https://www.healthmatters.clinic',
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    const phq = calculatePHQ9(state.answers, state.language);
    const gad = calculateGAD7(state.answers, state.language);
    const lang = state.language;
    const isEn = lang === Language.EN;
    const date = new Date().toLocaleDateString();
    const optionLabels = SCORING_OPTIONS.map(o => o.label[lang]);

    let text = '';
    text += '═══════════════════════════════════════\n';
    text += isEn ? '  YOUR ENERGY REPORT\n' : '  TU REPORTE DE ENERGÍA\n';
    text += '  Health Matters Clinic\n';
    text += `  ${date}\n`;
    text += '═══════════════════════════════════════\n\n';

    text += `${t.moodLabel.toUpperCase()} (PHQ-9)\n`;
    text += `${isEn ? 'Score' : 'Puntuación'}: ${phq.score}/27 — ${phq.label}\n`;
    text += `"${phq.clinicalTranslation}"\n\n`;

    text += `${t.anxietyLabel.toUpperCase()} (GAD-7)\n`;
    text += `${isEn ? 'Score' : 'Puntuación'}: ${gad.score}/21 — ${gad.label}\n`;
    text += `"${gad.clinicalTranslation}"\n\n`;

    text += '───────────────────────────────────────\n';
    text += isEn ? 'YOUR RESPONSES\n' : 'TUS RESPUESTAS\n';
    text += '───────────────────────────────────────\n\n';

    QUESTIONS.forEach((q, i) => {
      const answer = state.answers[q.id];
      const answerLabel = answer !== undefined ? optionLabels[answer] : '—';
      text += `${i + 1}. ${q.text[lang]}\n`;
      text += `   → ${answerLabel} (${answer ?? 0}/3)\n\n`;
    });

    if (state.lifeEvents.length > 0) {
      text += '───────────────────────────────────────\n';
      text += isEn ? 'LIFE CONTEXT\n' : 'CONTEXTO DE VIDA\n';
      text += '───────────────────────────────────────\n';
      text += (isEn ? 'Life Events: ' : 'Eventos de Vida: ') +
        state.lifeEvents.map(id => LIFE_EVENT_OPTIONS.find(o => o.id === id)?.label[lang]).filter(Boolean).join(', ') + '\n\n';
    }

    if (state.rootCauses.length > 0) {
      text += (isEn ? 'Environmental Stressors: ' : 'Estresores Ambientales: ') +
        state.rootCauses.map(id => SDOH_OPTIONS.find(o => o.id === id)?.label[lang]).filter(Boolean).join(', ') + '\n\n';
    }

    const isMinimal = phq.score < 5 && gad.score < 5;
    const script = isMinimal
      ? (isEn
          ? `"I completed a wellness screening using validated PHQ-9 and GAD-7 tools. My results indicate minimal clinical symptoms (Score ${phq.score}/${gad.score}). I am currently doing alright and would like to proactively discuss maintaining my wellness and staying on top of my mental health."`
          : `"Completé un chequeo de bienestar usando las herramientas validadas PHQ-9 y GAD-7. Mis resultados indican síntomas clínicos mínimos (Puntuación ${phq.score}/${gad.score}). Me siento bien por ahora y me gustaría hablar proactivamente sobre cómo mantener mi bienestar y mi salud mental."`)
      : (isEn
          ? `"I completed a wellness screening using validated PHQ-9 and GAD-7 tools. My results indicate a score of ${phq.score} for mood and ${gad.score} for anxiety. I would like to discuss how my current environmental stressors and life transitions are impacting my daily quality of life."`
          : `"Completé un chequeo de bienestar usando las herramientas validadas PHQ-9 y GAD-7. Mis resultados indican una puntuación de ${phq.score} para el ánimo y ${gad.score} para la ansiedad. Me gustaría hablar sobre cómo mis factores de estrés ambientales y transiciones de vida actuales están afectando mi calidad de vida diaria."`);

    text += '───────────────────────────────────────\n';
    text += isEn ? 'PATIENT ADVOCACY SCRIPT\n' : 'GUION DE DEFENSA DEL PACIENTE\n';
    text += '───────────────────────────────────────\n';
    text += script + '\n\n';

    text += '───────────────────────────────────────\n';
    text += isEn ? 'CRISIS RESOURCES\n' : 'RECURSOS DE CRISIS\n';
    text += '───────────────────────────────────────\n';
    text += '988 Suicide & Crisis Lifeline\n';
    text += '741741 Crisis Text Line (Text HOME)\n';
    text += 'LA County ACCESS: 1-800-854-7771\n';
    text += 'CHIRLA: 1-888-624-4752\n\n';
    text += 'Health Matters Clinic: (323) 990-4325\n';
    text += 'healthmatters.clinic\n';

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-check-${date.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOptInSubmit = (type: 'sms' | 'app') => {
    const key = type === 'sms' ? 'hmcSmsOptIn' : 'hmcAppOptIn';
    localStorage.setItem(key, 'true');
    localStorage.setItem(`${key}Date`, new Date().toISOString());
    // TODO: Configure webhook URL for your org's opt-in collection endpoint
    // Example: Google Apps Script web app, Zapier webhook, etc.
    // const WEBHOOK_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    // fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ type, timestamp: new Date().toISOString() }) }).catch(() => {});
  };

  // --- VIEWS ---

  if (state.section === 'intro') {
    return (
      <div className="min-h-screen bg-[#faf9f6] p-4 md:p-8 flex flex-col items-center justify-center font-['Inter']">
        {savedState && (
          <div className="w-full max-w-xl mb-6 bg-white rounded-2xl shadow-lg p-6 border border-stone-200 flex flex-col sm:flex-row items-center gap-4" style={{ animation: 'fadeSlideUp 0.4s ease-out' }}>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-stone-800 text-sm">{t.resumePrompt}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setState(savedState); setSavedState(null); }} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-full shadow-md" style={{ backgroundColor: BRAND.blue }}>{t.resumeYes}</button>
              <button onClick={() => { sessionStorage.removeItem('vibeCheckState'); setSavedState(null); }} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">{t.resumeNo}</button>
            </div>
          </div>
        )}
        <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 text-center flex flex-col items-center border border-stone-100 mb-8" style={{ animation: 'fadeSlideUp 0.6s ease-out' }}>
          <style>{`
            @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          `}</style>
          <div className="w-20 h-20 rounded-[1.75rem] flex items-center justify-center mb-8 shadow-xl" style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueDark})` }}>
             <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h1 className="font-display text-6xl md:text-7xl text-stone-900 mb-3 leading-[0.85] tracking-wide uppercase">{t.title}</h1>
          <p className="font-bold mb-8 uppercase tracking-[0.4em] text-[10px]" style={{ color: BRAND.blue }}>{t.subtitle}</p>
          <p className="font-accent text-stone-600 mb-12 text-xl leading-relaxed font-medium max-w-sm">
            {t.intro}
          </p>

          <div className="w-full space-y-5">
            <ActionButton onClick={handleStart} className="w-full py-5 text-xl" color={BRAND.blue}>
              {t.start}
            </ActionButton>
            <p className="text-[10px] font-bold text-stone-400 leading-relaxed px-4 italic">
              {t.disclaimer}
            </p>
            <button onClick={toggleLanguage} className="w-full text-xs font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors py-2">
              {state.language === Language.EN ? 'Hacerlo en Español' : 'Check in in English'}
            </button>
          </div>
        </div>

        <div className="text-center space-y-3">
           <h4 className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.4em]">{t.checkYourself}</h4>
           <a href="https://www.healthmatters.clinic" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-colors text-[10px] font-bold group tracking-[0.3em] uppercase">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> {t.backToClinic}
           </a>
        </div>
      </div>
    );
  }

  if (state.section === 'assessment') {
    const currentQ = QUESTIONS[state.currentStep];
    const catColor = currentQ?.category === 'mood' ? BRAND.pink : BRAND.orange;
    const qNum = state.currentStep + 1;
    const qTotal = QUESTIONS.length;
    return (
      <Layout state={state} restart={restart} toggleLanguage={toggleLanguage}>
        <div className="w-full max-w-2xl" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
          <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-sm tracking-wider" style={{ color: catColor }}>
                {qNum}/{qTotal}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: catColor }}>
                {currentQ?.category === 'mood' ? t.moodLabel : t.anxietyLabel}
              </span>
            </div>
            <h2 className="font-accent text-2xl md:text-4xl font-bold text-stone-900 leading-snug">
              {currentQ?.text[state.language]}
            </h2>
          </div>
          <div className="grid gap-3" role="radiogroup" aria-label="Response options">
            {SCORING_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                role="radio"
                aria-checked={state.answers[currentQ?.id] === option.value}
                className="w-full p-5 md:p-6 text-left rounded-2xl bg-white border-2 border-stone-100 hover:border-stone-400 transition-all group flex items-center justify-between hover:shadow-lg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: BRAND.blue }}
              >
                <span className="text-lg md:text-xl font-bold text-stone-700 group-hover:text-stone-900">{option.label[state.language]}</span>
                <div className="w-8 h-8 rounded-full border-2 border-stone-200 group-hover:border-stone-400 flex items-center justify-center transition-all flex-shrink-0 ml-4">
                  <div className="w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: catColor }}></div>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-10 text-[10px] font-bold text-stone-300 uppercase tracking-widest text-center leading-relaxed">
            {t.overLast2Weeks}
          </p>
        </div>
      </Layout>
    );
  }

  if (state.section === 'life-events') {
    return (
      <Layout state={state} restart={restart} toggleLanguage={toggleLanguage}>
        <div className="w-full max-w-2xl" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
           <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
           <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: BRAND.yellow }}>{t.contextHeader}</h4>
           <h1 className="font-display text-5xl md:text-6xl text-stone-900 mb-4 leading-none tracking-wide">{t.lifeEventTitle}</h1>
           <p className="font-accent text-stone-600 mb-10 text-lg font-medium">{t.lifeEventSub}</p>
           <div className="grid gap-3">
              {LIFE_EVENT_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => toggleList('lifeEvents', opt.id)} className={`w-full p-5 text-left rounded-2xl border transition-all flex items-center justify-between ${state.lifeEvents.includes(opt.id) ? 'bg-stone-50 shadow-md border-stone-300' : 'border-stone-100 bg-white hover:border-stone-300'}`}>
                  <span className={`text-lg font-bold ${state.lifeEvents.includes(opt.id) ? 'text-stone-900' : 'text-stone-700'}`}>{opt.label[state.language]}</span>
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${state.lifeEvents.includes(opt.id) ? 'border-transparent' : 'border-stone-200'}`} style={{ backgroundColor: state.lifeEvents.includes(opt.id) ? BRAND.yellow : '' }}>
                    {state.lifeEvents.includes(opt.id) && <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                  </div>
                </button>
              ))}
           </div>
           <ActionButton onClick={() => setState(prev => ({ ...prev, section: 'root-cause' }))} className="w-full text-2xl mt-12" color={BRAND.blue}>
             {t.next}
           </ActionButton>
        </div>
      </Layout>
    );
  }

  if (state.section === 'root-cause') {
    return (
      <Layout state={state} restart={restart} toggleLanguage={toggleLanguage}>
        <div className="w-full max-w-2xl" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
           <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
           <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: BRAND.orange }}>{t.environmentHeader}</h4>
           <h1 className="font-display text-5xl md:text-6xl text-stone-900 mb-4 leading-none tracking-wide">{t.rootCauseTitle}</h1>
           <p className="font-accent text-stone-600 mb-10 text-lg font-medium">{t.rootCauseSub}</p>
           <div className="grid gap-3">
              {SDOH_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => toggleList('rootCauses', opt.id)} className={`w-full p-5 text-left rounded-2xl border transition-all flex items-center justify-between ${state.rootCauses.includes(opt.id) ? 'bg-stone-50 shadow-md border-stone-300' : 'border-stone-100 bg-white hover:border-stone-300'}`}>
                  <span className={`text-lg font-bold ${state.rootCauses.includes(opt.id) ? 'text-stone-900' : 'text-stone-700'}`}>{opt.label[state.language]}</span>
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${state.rootCauses.includes(opt.id) ? 'border-transparent' : 'border-stone-200'}`} style={{ backgroundColor: state.rootCauses.includes(opt.id) ? BRAND.orange : '' }}>
                    {state.rootCauses.includes(opt.id) && <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                  </div>
                </button>
              ))}
           </div>
           <ActionButton onClick={goToResults} className="w-full text-2xl mt-12" color={BRAND.blue}>
             {t.rootCauseNext}
           </ActionButton>
        </div>
      </Layout>
    );
  }

  if (state.section === 'results') {
    const phq = calculatePHQ9(state.answers, state.language);
    const gad = calculateGAD7(state.answers, state.language);
    const hasSuicidalIdeation = state.answers['p9'] > 0;
    const hasSevereSymptoms = phq.severity === 'severe' || gad.severity === 'severe' || phq.severity === 'moderately-severe';

    const isMinimal = phq.score < 5 && gad.score < 5;
    
    const talkingPointsEn = isMinimal 
      ? `"I completed a wellness screening using validated PHQ-9 and GAD-7 tools. My results indicate minimal clinical symptoms (Score ${phq.score}/${gad.score}). I am currently doing alright and would like to proactively discuss maintaining my wellness and staying on top of my mental health."`
      : `"I completed a wellness screening using validated PHQ-9 and GAD-7 tools. My results indicate a score of ${phq.score} for mood and ${gad.score} for anxiety. I would like to discuss how my current environmental stressors and life transitions are impacting my daily quality of life."`;
    
    const talkingPointsEs = isMinimal
      ? `"Completé un chequeo de bienestar usando las herramientas validadas PHQ-9 y GAD-7. Mis resultados indican síntomas clínicos mínimos (Puntuación ${phq.score}/${gad.score}). Me siento bien por ahora y me gustaría hablar proactivamente sobre cómo mantener mi bienestar y mi salud mental."`
      : `"Completé un chequeo de bienestar usando las herramientas validadas PHQ-9 y GAD-7. Mis resultados indican una puntuación de ${phq.score} para el ánimo y ${gad.score} para la ansiedad. Me gustaría hablar sobre cómo mis factores de estrés ambientales y transiciones de vida actuales están afectando mi calidad de vida diaria."`;

    const scriptText = state.language === Language.EN ? talkingPointsEn : talkingPointsEs;
    const isAlreadyOptedIn = state.gamePlan.smsOptIn || state.gamePlan.appOptIn;

    return (
      <Layout state={state} restart={restart} toggleLanguage={toggleLanguage}>
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 overflow-hidden pb-12 print:shadow-none print:border print:border-stone-200 print:rounded-[1rem]" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
          <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          { (hasSuicidalIdeation || hasSevereSymptoms) && (
            <div className="p-8 md:p-10 text-white text-center print:hidden" style={{ background: hasSuicidalIdeation ? `linear-gradient(135deg, ${BRAND.red}, #b91c1c)` : `linear-gradient(135deg, ${BRAND.orange}, #e65100)` }}>
              <h3 className="font-display text-4xl mb-3 tracking-wide">{t.crisisTitle}</h3>
              <p className="font-accent font-bold text-lg opacity-95 mb-8 max-w-sm mx-auto leading-tight">{t.crisisSub}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <ActionButton
                  onClick={() => window.location.href = 'tel:988'}
                  className="shadow-2xl px-10 border-transparent"
                  noDot
                  color={BRAND.blue}
                >
                  <span className="text-white text-lg">{t.call988}</span>
                </ActionButton>
                <ActionButton
                  onClick={() => window.location.href = 'sms:741741&body=HELLO'}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  noDot
                >
                  <span className="text-white text-sm">Text HOME to 741741</span>
                </ActionButton>
              </div>
            </div>
          )}

          <div className="p-8 md:p-10 text-center border-b border-stone-100" style={{ background: 'linear-gradient(180deg, #f5f5f0, white)' }}>
            <h1 className="font-display text-5xl text-stone-800 mb-2 tracking-wide uppercase">{t.resultsHeader}</h1>
            <p className="text-stone-500 font-bold uppercase tracking-[0.3em] text-[10px]">{t.subtitle}</p>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            <div className="grid gap-5">
              <div className="bg-stone-50 p-7 md:p-8 rounded-[1.75rem] border border-stone-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND.pink }}></div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: BRAND.pink }}>{t.moodLabel}</h4>
                </div>
                <div className="font-display text-4xl text-stone-800 mb-2 tracking-wide">{phq.label}</div>
                <p className="font-accent text-stone-600 leading-relaxed font-bold mb-4">{phq.recommendation}</p>
                {phq.score > 0 && (
                  <div className="p-4 bg-white rounded-xl border border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: BRAND.blue }}>{t.clinicalInterpretation}</span>
                    <p className="text-xs text-stone-500 italic font-medium leading-relaxed">"{phq.clinicalTranslation}"</p>
                  </div>
                )}
              </div>

              <div className="bg-stone-50 p-7 md:p-8 rounded-[1.75rem] border border-stone-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND.orange }}></div>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: BRAND.orange }}>{t.anxietyLabel}</h4>
                </div>
                <div className="font-display text-4xl text-stone-800 mb-2 tracking-wide">{gad.label}</div>
                <p className="font-accent text-stone-600 leading-relaxed font-bold mb-4">{gad.recommendation}</p>
                {gad.score > 0 && (
                  <div className="p-4 bg-white rounded-xl border border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: BRAND.blue }}>{t.clinicalInterpretation}</span>
                    <p className="text-xs text-stone-500 italic font-medium leading-relaxed">"{gad.clinicalTranslation}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-7 md:p-8 rounded-[1.75rem] border-2 border-stone-200 bg-stone-50/50 flex flex-col items-center text-center gap-5 print:hidden">
                <div>
                   <h3 className="font-display text-3xl text-stone-800 mb-1 tracking-wide">{t.calmKitTitle}</h3>
                   <p className="font-accent text-stone-600 font-semibold text-sm">{t.calmKitSub}</p>
                </div>
                <ActionButton
                  href="https://teamhmc.github.io/CalmKit/"
                  className="w-full sm:w-auto px-12"
                  color={BRAND.blue}
                >
                   {t.calmKitBtn}
                </ActionButton>
            </div>

            <div className="p-7 md:p-8 rounded-[1.75rem] text-white shadow-xl overflow-hidden" style={{ background: `linear-gradient(135deg, #1a1a1a, ${BRAND.blueDark})` }}>
              <h3 className="font-display text-2xl mb-4 tracking-wide">{t.doctorSpeakHeader}</h3>
              <p className="opacity-60 text-sm mb-6 leading-relaxed font-medium">{t.doctorSpeakIntro}</p>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur">
                <p className="text-[10px] font-bold uppercase mb-2 tracking-widest" style={{ color: BRAND.yellow }}>{t.patientAdvocacyScript}</p>
                <p className="text-sm font-medium leading-relaxed italic opacity-90">{scriptText}</p>
              </div>
            </div>

            {/* HMC COMMUNITY CONNECTION Section on Results Page - Clean UI logic */}
            {!isAlreadyOptedIn ? (
              <div className="p-8 rounded-[2rem] bg-stone-50 border border-stone-100 shadow-sm space-y-6 print:hidden">
                <h3 className="text-lg font-extrabold text-stone-800 tracking-tight uppercase">HMC COMMUNITY CONNECTION</h3>
                <div className="space-y-4">
                  <label className={`flex items-center gap-3 p-5 rounded-2xl cursor-pointer transition-all border ${state.gamePlan.smsOptIn ? 'bg-white border-stone-400 shadow-md' : 'bg-white border-stone-100 hover:border-stone-400'}`}>
                    <input type="checkbox" checked={state.gamePlan.smsOptIn} onChange={e => { updateGamePlan('smsOptIn', e.target.checked); if (e.target.checked) handleOptInSubmit('sms'); }} className="w-5 h-5" style={{ accentColor: BRAND.blue }} />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-stone-800">{t.smsCheckInLabel}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: BRAND.blue }}>{t.gpSmsConsent}</span>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-5 rounded-2xl cursor-pointer transition-all border ${state.gamePlan.appOptIn ? 'bg-white border-stone-400 shadow-md' : 'bg-white border-stone-100 hover:border-stone-400'}`}>
                    <input type="checkbox" checked={state.gamePlan.appOptIn} onChange={e => { updateGamePlan('appOptIn', e.target.checked); if (e.target.checked) handleOptInSubmit('app'); }} className="w-5 h-5" style={{ accentColor: BRAND.blue }} />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-stone-800">{t.appMemberLabel}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: BRAND.blue }}>{t.gpAppConsent}</span>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-[2rem] bg-stone-50 border border-stone-200 shadow-inner text-center print:hidden flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mb-2"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>
                <h3 className="text-xl font-extrabold text-stone-800 tracking-tight uppercase">{t.connectedMessage}</h3>
                <p className="text-stone-500 font-bold text-xs max-w-xs">{t.thanksSubscribing}</p>
              </div>
            )}

            <div className="space-y-6 pt-10 border-t border-stone-100 print:hidden">
               <h2 className="font-display text-3xl text-stone-800 text-center mb-6 tracking-wide uppercase">{t.communityHeader}</h2>

               <div className="grid gap-4">
                  <a href="https://www.healthmatters.clinic/resources/eventfinder" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-8 md:p-10 rounded-2xl hover:shadow-lg transition-all group text-center border-2 border-transparent" style={{ background: `linear-gradient(135deg, ${BRAND.blue}08, ${BRAND.blue}15)`, borderColor: `${BRAND.blue}20` }}>
                    <h4 className="font-display text-3xl text-stone-800 leading-none tracking-wide">{t.eventLink}</h4>
                    <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.2em]">{t.communitySub}</p>
                  </a>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={startGamePlan} className="p-5 bg-white border border-stone-100 rounded-2xl hover:border-stone-300 hover:shadow-md shadow-sm transition-all text-left group w-full h-full">
                       <h4 className="font-bold text-stone-800 group-hover:text-stone-900 mb-1 uppercase tracking-tight text-sm">{t.gamePlanBtn}</h4>
                       <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{t.gamePlanSub}</p>
                    </button>

                    <a href="https://www.healthmatters.clinic/resources/resource-directory" target="_blank" rel="noopener noreferrer" className="p-5 bg-white border border-stone-100 rounded-2xl hover:border-stone-300 hover:shadow-md shadow-sm transition-all">
                       <h4 className="font-bold text-stone-800 mb-1 uppercase tracking-tight text-sm">{t.resourceBtn}</h4>
                       <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{t.resourceSub}</p>
                    </a>
                    <a href="https://www.healthmatters.clinic/podcast" target="_blank" rel="noopener noreferrer" className="p-5 bg-white border border-stone-100 rounded-2xl hover:border-stone-300 hover:shadow-md shadow-sm transition-all">
                       <h4 className="font-bold text-stone-800 mb-1 uppercase tracking-tight text-sm">{t.podcastBtn}</h4>
                       <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{t.podcastSub}</p>
                    </a>
                    <a href="https://www.healthmatters.clinic/blog" target="_blank" rel="noopener noreferrer" className="p-5 bg-white border border-stone-100 rounded-2xl hover:border-stone-300 hover:shadow-md shadow-sm transition-all">
                       <h4 className="font-bold text-stone-800 mb-1 uppercase tracking-tight text-sm">{t.blogBtn}</h4>
                       <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{t.blogSub}</p>
                    </a>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-3 pt-8">
                  <ActionButton onClick={restart} variant="outline" className="flex-1" icon={<RestartIcon />}>
                    {t.restart}
                  </ActionButton>
                  <ActionButton onClick={handleDownload} variant="outline" className="flex-1" icon={<DownloadIcon />}>
                    {t.downloadResults}
                  </ActionButton>
                  <ActionButton onClick={handleShare} className="flex-1" color={BRAND.blue} icon={<ShareIcon />}>
                    {t.share}
                  </ActionButton>
               </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.section === 'game-plan') {
    const step = state.gamePlanStep;
    return (
      <Layout state={state} restart={restart} toggleLanguage={toggleLanguage}>
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl border border-stone-100 p-8 md:p-12" style={{ animation: 'fadeSlideUp 0.4s ease-out' }}>
           <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block" style={{ color: BRAND.blue }}>{t.gpPart} {step}: {t.gpStrategy}</span>

           {step === 1 && (
             <div className="space-y-8">
               <h2 className="font-display text-4xl text-stone-800 tracking-wide uppercase">{t.gpInventoryTitle}</h2>
               <div className="space-y-4">
                 <label className="block text-sm font-bold text-stone-600">{t.gpGroundingLabel}</label>
                 <textarea value={state.gamePlan.grounding} onChange={e => updateGamePlan('grounding', e.target.value)} className="w-full p-4 border border-stone-200 rounded-2xl focus:border-stone-800 h-24 outline-none transition-all font-['Inter'] font-bold" placeholder={t.gpGroundingPlaceholder} />
               </div>
               <div className="space-y-4">
                 <label className="block text-sm font-bold text-stone-600">{t.gpToolsLabel}</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {TOOL_OPTIONS.map(opt => (
                     <button key={opt.id} onClick={() => toggleGamePlanTool(opt.id)} className={`p-4 text-left rounded-xl border transition-all font-bold text-xs ${state.gamePlan.tools.includes(opt.id) ? 'bg-black text-white border-black' : 'bg-white text-stone-700 border-stone-100 hover:border-stone-400'}`}>{opt.label[state.language]}</button>
                   ))}
                 </div>
               </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-8">
               <h2 className="font-display text-4xl text-stone-800 tracking-wide uppercase">{t.gpStabilizeTitle}</h2>
               <div className="space-y-4">
                 <label className="block text-sm font-bold text-stone-600">{t.gpContactsLabel}</label>
                 <input type="text" value={state.gamePlan.contact1.name} onChange={e => updateGamePlanNested('contact1', 'name', e.target.value)} placeholder={`${t.gpNamePlaceholder} 1`} className="w-full p-4 border border-stone-200 rounded-2xl mb-2 font-bold" />
                 <input type="tel" value={state.gamePlan.contact1.phone} onChange={e => updateGamePlanNested('contact1', 'phone', e.target.value)} placeholder={t.gpPhonePlaceholder} className="w-full p-4 border border-stone-200 rounded-2xl mb-4 font-bold" />

                 <input type="text" value={state.gamePlan.contact2.name} onChange={e => updateGamePlanNested('contact2', 'name', e.target.value)} placeholder={`${t.gpNamePlaceholder} 2`} className="w-full p-4 border border-stone-200 rounded-2xl mb-2 font-bold" />
                 <input type="tel" value={state.gamePlan.contact2.phone} onChange={e => updateGamePlanNested('contact2', 'phone', e.target.value)} placeholder={t.gpPhonePlaceholder} className="w-full p-4 border border-stone-200 rounded-2xl font-bold" />
               </div>
               <div className="space-y-4 pt-4 border-t border-stone-100">
                 <label className="block text-sm font-bold text-stone-600">{t.gpTherapistLabel}</label>
                 <input type="text" value={state.gamePlan.therapist.name} onChange={e => updateGamePlanNested('therapist', 'name', e.target.value)} placeholder={t.gpTherapistPlaceholder} className="w-full p-4 border border-stone-200 rounded-2xl mb-2 font-bold" />
                 <input type="tel" value={state.gamePlan.therapist.phone} onChange={e => updateGamePlanNested('therapist', 'phone', e.target.value)} placeholder={t.gpPhonePlaceholder} className="w-full p-4 border border-stone-200 rounded-2xl font-bold" />
               </div>
               <div className="p-5 rounded-2xl border-2 border-dashed" style={{ borderColor: `${BRAND.red}40`, background: `${BRAND.red}08` }}>
                 <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: BRAND.red }}>{t.gpCrisisNote}</h4>
                 <div className="space-y-2 text-sm font-bold text-stone-700">
                   <p>988 Suicide & Crisis Lifeline</p>
                   <p>741741 Crisis Text Line</p>
                   <p>1-800-854-7771 LA County ACCESS</p>
                   <p>1-888-624-4752 CHIRLA</p>
                 </div>
               </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-8">
               <h2 className="font-display text-4xl text-stone-800 tracking-wide uppercase">{t.gpResetTitle}</h2>
               <div className="space-y-4">
                 <label className="block text-sm font-bold text-stone-600">{t.gpPlaylistLabel}</label>
                 <textarea value={state.gamePlan.playlist} onChange={e => updateGamePlan('playlist', e.target.value)} className="w-full p-4 border border-stone-200 rounded-2xl h-20 mb-4 font-bold" placeholder={t.gpPlaylistPlaceholder} />
                 <label className="block text-sm font-bold text-stone-600">{t.gpCreativePlaceholder}</label>
                 <textarea value={state.gamePlan.creative} onChange={e => updateGamePlan('creative', e.target.value)} className="w-full p-4 border border-stone-200 rounded-2xl h-20 font-bold" placeholder={t.gpCreativePlaceholder} />
               </div>
             </div>
           )}

           {step === 4 && (
             <div className="space-y-8">
               <h2 className="font-display text-4xl text-stone-800 tracking-wide uppercase">{t.gpReconnectTitle}</h2>
               <div className="space-y-4">
                 <label className="block text-sm font-bold text-stone-600">{t.gpForwardLabel}</label>
                 <textarea value={state.gamePlan.forward} onChange={e => updateGamePlan('forward', e.target.value)} className="w-full p-4 border border-stone-200 rounded-2xl h-24 mb-4 font-bold" placeholder={t.gpForwardPlaceholder} />
                 
                 <label className="block text-sm font-bold text-stone-600">{t.gpMessageLabel}</label>
                 <textarea value={state.gamePlan.message} onChange={e => updateGamePlan('message', e.target.value)} className="w-full p-4 border border-stone-200 rounded-2xl h-24 font-bold" placeholder={t.gpMessagePlaceholder} />
               </div>
               
               <div className="pt-6 border-t border-stone-100 space-y-4">
                 <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">HMC COMMUNITY CONNECTION</h3>
                 <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-5 rounded-2xl cursor-pointer hover:bg-stone-50 transition-colors border ${state.gamePlan.smsOptIn ? 'bg-white border-stone-400 shadow-md' : 'bg-stone-50 border-stone-100'}`}>
                      <input type="checkbox" checked={state.gamePlan.smsOptIn} onChange={e => { updateGamePlan('smsOptIn', e.target.checked); if (e.target.checked) handleOptInSubmit('sms'); }} className="w-5 h-5" style={{ accentColor: BRAND.blue }} />
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-stone-800">{t.smsCheckInLabel}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: BRAND.blue }}>{t.gpSmsConsent}</span>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-5 rounded-2xl cursor-pointer hover:bg-stone-50 transition-colors border ${state.gamePlan.appOptIn ? 'bg-white border-stone-400 shadow-md' : 'bg-stone-50 border-stone-100'}`}>
                      <input type="checkbox" checked={state.gamePlan.appOptIn} onChange={e => { updateGamePlan('appOptIn', e.target.checked); if (e.target.checked) handleOptInSubmit('app'); }} className="w-5 h-5" style={{ accentColor: BRAND.blue }} />
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-stone-800">{t.appMemberLabel}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: BRAND.blue }}>{t.gpAppConsent}</span>
                      </div>
                    </label>
                 </div>
               </div>
             </div>
           )}

           <div className="flex gap-4 mt-12">
             {step > 1 && (
               <ActionButton variant="outline" onClick={() => setState(s => ({ ...s, gamePlanStep: s.gamePlanStep - 1 }))} className="flex-1 uppercase text-xs" icon={<RestartIcon />}>{t.back}</ActionButton>
             )}
             <ActionButton onClick={() => {
               if (step < 4) setState(s => ({ ...s, gamePlanStep: s.gamePlanStep + 1 }));
               else setState(s => ({ ...s, section: 'game-plan-results' }));
             }} className="flex-[2] uppercase text-xs" color={BRAND.blue}>{step < 4 ? t.gpContinue : t.finish}</ActionButton>
           </div>
        </div>
      </Layout>
    );
  }

  if (state.section === 'game-plan-results') {
    return (
      <Layout state={state} restart={restart} toggleLanguage={toggleLanguage} hideProgress>
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 overflow-hidden print:shadow-none print:border print:border-stone-200 print:rounded-[1rem]" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
           <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
           <div className="p-10 md:p-12 text-center text-white border-b border-stone-200" style={{ background: `linear-gradient(135deg, #1a1a1a, ${BRAND.blueDark})` }}>
              <h1 className="font-display text-5xl tracking-wide mb-2 uppercase">{t.gpResultsHeader}</h1>
              <p className="font-bold text-[10px] uppercase tracking-[0.3em]" style={{ color: BRAND.yellow }}>{t.gpResultsSub} &middot; {new Date().toLocaleDateString()}</p>
           </div>
           <div className="p-10 space-y-8 text-sm">
              <p className="font-accent text-stone-500 text-center text-sm font-medium leading-relaxed italic">{t.gpResultsIntro}</p>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 shadow-sm">
                <h4 className="font-bold text-stone-400 uppercase text-[10px] mb-2 tracking-widest">{t.gpResultsGrounding}</h4>
                <p className="text-stone-800 font-bold italic">"{state.gamePlan.grounding || t.gpResultsGroundingText}"</p>
              </div>

              {state.gamePlan.tools.length > 0 && (
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 shadow-sm">
                  <h4 className="font-bold text-stone-400 uppercase text-[10px] mb-3 tracking-widest">{t.gpResultsTools}</h4>
                  <div className="flex flex-wrap gap-2">
                    {state.gamePlan.tools.map(id => {
                      const tool = TOOL_OPTIONS.find(o => o.id === id);
                      return tool ? <span key={id} className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-bold">{tool.label[state.language]}</span> : null;
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 border border-stone-100 rounded-2xl shadow-sm bg-white">
                   <h4 className="font-bold text-stone-400 uppercase text-[10px] mb-3 tracking-widest">{t.gpResultsEmergency}</h4>
                   <p className="font-bold text-stone-800 mb-0.5">{state.gamePlan.contact1.name || t.gpResultsPrimary}</p>
                   <p className="text-stone-500 mb-3 font-bold">{state.gamePlan.contact1.phone || '---'}</p>
                   <p className="font-bold text-stone-800 mb-0.5">{state.gamePlan.contact2.name || t.gpResultsSecondary}</p>
                   <p className="text-stone-500 font-bold">{state.gamePlan.contact2.phone || '---'}</p>
                </div>
                {(state.gamePlan.therapist.name || state.gamePlan.therapist.phone) && (
                  <div className="p-6 border border-stone-100 rounded-2xl shadow-sm bg-white">
                     <h4 className="font-bold text-stone-400 uppercase text-[10px] mb-3 tracking-widest">{t.gpResultsTherapist}</h4>
                     <p className="font-bold text-stone-800 mb-0.5">{state.gamePlan.therapist.name}</p>
                     <p className="text-stone-500 font-bold">{state.gamePlan.therapist.phone || '---'}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {state.gamePlan.playlist && (
                  <div className="p-6 border border-stone-100 rounded-2xl shadow-sm bg-white">
                    <h4 className="font-bold text-stone-400 uppercase text-[10px] mb-2 tracking-widest">{t.gpResultsPlaylist}</h4>
                    <p className="text-stone-800 font-bold">{state.gamePlan.playlist}</p>
                  </div>
                )}
                {state.gamePlan.creative && (
                  <div className="p-6 border border-stone-100 rounded-2xl shadow-sm bg-white">
                    <h4 className="font-bold text-stone-400 uppercase text-[10px] mb-2 tracking-widest">{t.gpResultsCreative}</h4>
                    <p className="text-stone-800 font-bold">{state.gamePlan.creative}</p>
                  </div>
                )}
              </div>

              {state.gamePlan.forward && (
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 shadow-sm">
                  <h4 className="font-bold text-stone-400 uppercase text-[10px] mb-2 tracking-widest">{t.gpResultsLookingForward}</h4>
                  <p className="text-stone-800 font-bold">{state.gamePlan.forward}</p>
                </div>
              )}

              <div className="pt-8 border-t border-stone-100">
                 <h4 className="font-bold text-stone-400 uppercase text-[10px] mb-2 tracking-widest">{t.gpResultsMessage}</h4>
                 <p className="text-xl font-extrabold text-stone-800 leading-tight">"{state.gamePlan.message || t.gpResultsMessageText}"</p>
              </div>

              <div className="p-5 rounded-2xl border-2 border-dashed border-stone-200 text-center print:hidden">
                 <h4 className="font-bold text-stone-400 uppercase text-[10px] mb-1 tracking-widest" style={{ color: BRAND.red }}>{t.gpCrisisNote}</h4>
                 <p className="text-sm font-bold text-stone-700">988 &middot; 741741 &middot; 1-800-854-7771</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 print:hidden">
                 <ActionButton
                  onClick={handleShare}
                  className="flex-1"
                  color={BRAND.blue}
                  icon={<ShareIcon />}
                 >
                    {t.sharePlan}
                 </ActionButton>
                 <ActionButton
                  href={`mailto:referrals@healthmatters.clinic?subject=${encodeURIComponent('Wellness Check Referral Request')}&body=${encodeURIComponent(`Hi HMC Team,\n\nI completed a wellness screening and would like to connect with support.\n\nSupport contacts: ${state.gamePlan.contact1.name || 'Not provided'} / ${state.gamePlan.contact2.name || 'Not provided'}\nTherapist: ${state.gamePlan.therapist.name || 'Not provided'}\nTools selected: ${state.gamePlan.tools.join(', ') || 'None'}\n\nPlease reach out to help me navigate next steps.\n\nThank you.`)}`}
                  variant="outline"
                  className="flex-1"
                 >
                    {t.gpBeginReferral}
                 </ActionButton>
              </div>
              <p className="text-center text-stone-400 text-[10px] font-bold uppercase tracking-widest print:hidden">{t.gpReferralSub}</p>

              <div className="text-center pt-4 print:hidden">
                 <button onClick={restart} className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-stone-800 transition-colors flex items-center justify-center gap-2 mx-auto">
                    <RestartIcon /> {t.returnDashboard.toUpperCase()}
                 </button>
              </div>
           </div>
        </div>
      </Layout>
    );
  }

  return null;
};

export default App;
