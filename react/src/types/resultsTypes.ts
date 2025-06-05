export type AbilityResult = {
  score: number;
  average: number;
  description: string;
};

export type PsychometricResults = {
  overallScore: number;
  technicalAbility: AbilityResult;
  logicalReasoning: AbilityResult;
  spatialReasoning: AbilityResult;
  quantitativeReasoning: AbilityResult;
  verbalReasoning: AbilityResult;
};

export type PersonalityTrait = {
  score: number;
  description: string;
};

export type PersonalityResults = {
  openness: PersonalityTrait;
  conscientiousness: PersonalityTrait;
  extraversion: PersonalityTrait;
  agreeableness: PersonalityTrait;
  neuroticism: PersonalityTrait;
  overallPersonalitySummary: string;
};

export type ResultsData = {
  psychometricResults: PsychometricResults;
  personalityResults: PersonalityResults;
  recommendations: string[];
};
