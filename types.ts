
export enum Language {
  EN = 'en',
  ES = 'es'
}

export type Severity = 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';

export interface ScaleResult {
  score: number;
  severity: Severity;
  label: string;
  recommendation: string;
  clinicalTranslation: string;
}

export interface Question {
  id: string;
  text: Record<Language, string>;
  category: 'mood' | 'anxiety' | 'root-cause';
}

export type AppSection = 'intro' | 'assessment' | 'life-events' | 'root-cause' | 'results' | 'game-plan' | 'game-plan-results';

export interface GamePlanData {
  grounding: string;
  tools: string[];
  customTools: string;
  checkpoint: string;
  contact1: { name: string; phone: string };
  contact2: { name: string; phone: string };
  therapist: { name: string; phone: string };
  emergency: string;
  playlist: string;
  creative: string;
  content: string;
  physical: string;
  forward: string;
  message: string;
  smsOptIn: boolean;
  appOptIn: boolean;
}

export interface AssessmentState {
  answers: Record<string, number>;
  rootCauses: string[];
  lifeEvents: string[];
  currentStep: number;
  section: AppSection;
  language: Language;
  gamePlan: GamePlanData;
  gamePlanStep: number;
}

export const SCORING_OPTIONS = [
  { value: 0, label: { en: 'Nah, not me', es: 'No soy yo' } },
  { value: 1, label: { en: 'A few times', es: 'Un par de veces' } },
  { value: 2, label: { en: 'More often than not', es: 'Seguido' } },
  { value: 3, label: { en: "Yeah, that's me lately", es: 'Así mero me siento' } }
];

export const SDOH_OPTIONS = [
  { id: 'housing', label: { en: 'Stable Housing', es: 'Vivienda estable' } },
  { id: 'food', label: { en: 'Food / Groceries', es: 'Comida / Supermercado' } },
  { id: 'transportation', label: { en: 'Getting Around / Bus / Car', es: 'Transporte / Bus / Carro' } },
  { id: 'bills', label: { en: 'Bills / Money stress', es: 'Biles / Estrés de dinero' } },
  { id: 'job', label: { en: 'Work / Job security', es: 'Trabajo / Estabilidad laboral' } },
  { id: 'safety', label: { en: 'Safety at home', es: 'Seguridad en casa' } },
  { id: 'childcare', label: { en: 'Childcare support', es: 'Apoyo con los niños' } }
];

export const LIFE_EVENT_OPTIONS = [
  { id: 'grief', label: { en: 'Loss of a loved one / Grief', es: 'Pérdida de un ser querido / Duelo' } },
  { id: 'breakup', label: { en: 'Breakup, Divorce, or Ending', es: 'Ruptura, Divorcio o Final' } },
  { id: 'career', label: { en: 'Job Loss or Career Change', es: 'Pérdida de trabajo o cambio de carrera' } },
  { id: 'parent', label: { en: 'New parent / Postpartum / Pregnancy', es: 'Nuevo padre/madre / Posparto / Embarazo' } },
  { id: 'justice', label: { en: 'Recently released from prison or supporting a returning family member', es: 'Recientemente liberado de prisión o apoyando a un familiar que regresa' } },
  { id: 'immigration', label: { en: 'Immigration-related incident or stress', es: 'Incidente o estrés relacionado con migración' } },
  { id: 'trauma', label: { en: 'Scary or traumatic event', es: 'Evento fuerte o traumático' } }
];

export const TOOL_OPTIONS = [
  { id: 'breathing', label: { en: 'Breathing break', es: 'Pausa de respiración' } },
  { id: 'grounding', label: { en: 'Grounding (5-4-3-2-1)', es: 'Anclaje (5-4-3-2-1)' } },
  { id: 'music', label: { en: 'Music shift', es: 'Cambio de música' } },
  { id: 'body', label: { en: 'Move body', es: 'Mover cuerpo' } },
  { id: 'scroll', label: { en: 'Step back from scroll', es: 'Aléjate del teléfono' } },
  { id: 'journal', label: { en: 'Journal', es: 'Diario' } },
  { id: 'call', label: { en: 'Call someone', es: 'Llamar a alguien' } }
];
