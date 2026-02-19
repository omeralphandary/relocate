export type EmploymentStatus = "employed" | "self_employed" | "freelancer" | "unemployed" | "student";
export type FamilyStatus = "single" | "couple" | "family_with_kids";
export type TaskCategory = "housing" | "banking" | "legal" | "telecom" | "transport" | "insurance" | "education";

export interface OnboardingData {
  nationality: string;
  originCountry: string;
  destinationCountry: string;
  employmentStatus: EmploymentStatus;
  familyStatus: FamilyStatus;
  hasChildren: boolean;
  movingDate?: string;
}
