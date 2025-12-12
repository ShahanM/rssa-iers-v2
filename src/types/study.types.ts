import type { StudyStep } from "./rssa.types";

export type StudyLayoutContextType = {
	studyStep: StudyStep;
	resetNextButton: () => void;
};

export type NavigationWrapper<T> = {
	data: T;
	next_id: string | null;
	next_path: string | null;
}