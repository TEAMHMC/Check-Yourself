
import { Severity, ScaleResult, Language } from '../types';
import { INTERPRETATIONS, STRINGS } from '../constants';

export function calculatePHQ9(answers: Record<string, number>, lang: Language): ScaleResult {
  const phqKeys = Object.keys(answers).filter(k => k.startsWith('p'));
  const score = phqKeys.reduce((acc, k) => acc + answers[k], 0);
  
  let severity: Severity = 'minimal';
  if (score >= 20) severity = 'severe';
  else if (score >= 15) severity = 'moderately-severe';
  else if (score >= 10) severity = 'moderate';
  else if (score >= 5) severity = 'mild';

  return {
    score,
    severity,
    label: STRINGS[lang].severityMap[severity],
    recommendation: INTERPRETATIONS.mood[severity][lang],
    clinicalTranslation: INTERPRETATIONS.mood[severity].clinical[lang]
  };
}

export function calculateGAD7(answers: Record<string, number>, lang: Language): ScaleResult {
  const gadKeys = Object.keys(answers).filter(k => k.startsWith('g'));
  const score = gadKeys.reduce((acc, k) => acc + answers[k], 0);

  let severity: Severity = 'minimal';
  if (score >= 15) severity = 'severe';
  else if (score >= 10) severity = 'moderate';
  else if (score >= 5) severity = 'mild';

  const finalSeverity: Severity = severity === 'moderate' ? 'moderate' : severity;

  return {
    score,
    severity: finalSeverity,
    label: STRINGS[lang].severityMap[finalSeverity],
    recommendation: (INTERPRETATIONS.anxiety as any)[severity][lang],
    clinicalTranslation: (INTERPRETATIONS.anxiety as any)[severity].clinical[lang]
  };
}
