/**
 * Scoring engine for Sentinel Drive Sense
 *
 * Score starts at 100 and is reduced by penalties.
 * The algorithm is transparent and explained to the user.
 */
import { TripEvent, Trip } from '../types';
import {
  PENALTY_HARSH_BRAKE,
  PENALTY_HARSH_ACCEL,
  PENALTY_OVERSPEED_PER_EVENT,
  PENALTY_LONG_DRIVE_NO_PAUSE,
} from '../constants/config';

export interface ScoreBreakdown {
  base: number;
  harshBrakePenalty: number;
  harshAccelPenalty: number;
  overspeedPenalty: number;
  longDrivePenalty: number;
  final: number;
}

/** Compute score from events and trip data */
export function computeScore(
  events: TripEvent[],
  durationSec: number,
  pauseThresholdMin: number
): ScoreBreakdown {
  const harshBrakes = events.filter((e) => e.type === 'harsh_brake').length;
  const harshAccels = events.filter((e) => e.type === 'harsh_accel').length;
  const overspeeds = events.filter((e) => e.type === 'overspeed').length;
  const pausesTaken = events.filter((e) => e.type === 'pause_taken').length;

  const durationMin = durationSec / 60;
  const longDriveSegments = Math.max(
    0,
    Math.floor(durationMin / pauseThresholdMin) - pausesTaken
  );

  const harshBrakePenalty = harshBrakes * PENALTY_HARSH_BRAKE;
  const harshAccelPenalty = harshAccels * PENALTY_HARSH_ACCEL;
  const overspeedPenalty = overspeeds * PENALTY_OVERSPEED_PER_EVENT;
  const longDrivePenalty = longDriveSegments * PENALTY_LONG_DRIVE_NO_PAUSE;

  const totalPenalty =
    harshBrakePenalty + harshAccelPenalty + overspeedPenalty + longDrivePenalty;

  const final = Math.max(0, Math.min(100, 100 - totalPenalty));

  return {
    base: 100,
    harshBrakePenalty,
    harshAccelPenalty,
    overspeedPenalty,
    longDrivePenalty,
    final,
  };
}

/** Generate personalized tips based on events */
export function generateTips(events: TripEvent[], durationSec: number): string[] {
  const tips: string[] = [];

  const harshBrakes = events.filter((e) => e.type === 'harsh_brake').length;
  const harshAccels = events.filter((e) => e.type === 'harsh_accel').length;
  const overspeeds = events.filter((e) => e.type === 'overspeed').length;
  const vigilanceLow = events.filter((e) => e.type === 'vigilance_low').length;

  if (harshBrakes > 0) {
    tips.push(
      'Essayez d\'anticiper davantage les ralentissements pour réduire les freinages brusques. Maintenez une distance de sécurité suffisante.'
    );
  }

  if (harshAccels > 0) {
    tips.push(
      'Des accélérations plus progressives réduisent la fatigue et améliorent la sécurité. Privilégiez la souplesse.'
    );
  }

  if (overspeeds > 0) {
    tips.push(
      'Restez vigilant(e) sur votre vitesse, en particulier dans les zones à risque. Adapter sa vitesse est le premier réflexe de prévention.'
    );
  }

  if (vigilanceLow > 0 || durationSec > 3600) {
    tips.push(
      'Pensez à faire des pauses régulières (toutes les 2h idéalement). La fatigue est un facteur majeur d\'accident.'
    );
  }

  // Always give at least one positive tip
  if (tips.length === 0) {
    tips.push(
      'Excellent trajet ! Continuez à rester attentif(ve) et à anticiper les situations de conduite.'
    );
  }

  return tips.slice(0, 3);
}

/** Human-readable explanation of how the score works */
export const SCORE_EXPLANATION = `Le score part de 100 points et est réduit par :
• Freinage brusque : -${PENALTY_HARSH_BRAKE} pts par événement
• Accélération brusque : -${PENALTY_HARSH_ACCEL} pts par événement
• Vitesse élevée : -${PENALTY_OVERSPEED_PER_EVENT} pts par événement
• Conduite prolongée sans pause : -${PENALTY_LONG_DRIVE_NO_PAUSE} pts par segment

Ce score est pédagogique et ne remplace pas votre vigilance. Il vise à vous aider à prendre conscience de vos habitudes de conduite.`;
