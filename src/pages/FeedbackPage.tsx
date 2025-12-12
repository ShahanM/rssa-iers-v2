import React, { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useStudy } from "rssa-api";
import { StudyLayoutContextType, useNextButtonControl, useStepCompletion } from "rssa-study-template";
import { WarningDialog } from "../components/dialogs/warningDialog";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";

export type TextResponsePayload = {
	study_step_id: string;
	study_step_page_id?: string;
	context_tag: string;
	response_text: string;
};

const FeedbackPage: React.FC = () => {

	const { studyStep, resetNextButton } = useOutletContext<StudyLayoutContextType>();
	const { setButtonControl } = useNextButtonControl();
	const { setIsStepComplete } = useStepCompletion();
	const { studyApi } = useStudy();

	const [showWarning, setShowWarning] = useState<boolean>(false);
	const feedbackRef = useRef<HTMLTextAreaElement>(null);

	// Disable Next button initially
	useEffect(() => {
		setButtonControl(prev => ({ ...prev, isDisabled: true }));
		return () => resetNextButton(); // Cleanup on unmount
	}, [setButtonControl, resetNextButton]);

	const feedbackMutation = useMutation({
		mutationKey: ['FreeformTextResponse'],
		mutationFn: async (payload: TextResponsePayload) => studyApi.post<TextResponsePayload, null>('responses/texts/', payload),
		onSuccess: () => {
			setIsStepComplete(true);
			resetNextButton(); // Enable Standard Next Button
		},
		onError: (error) => {
			console.error("Error submitting feedback:", error);
			// Re-disable if it failed
			setButtonControl(prev => ({ ...prev, isDisabled: true }));
		}
	});

	const submitFeedback = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		if (feedbackRef.current) {
			const feedbackText = feedbackRef.current.value;
			if (feedbackText.length === 0) {
				setShowWarning(true);
				return;
			}

			feedbackMutation.mutate({
				study_step_id: studyStep.id,
				context_tag: 'rssa_ers',
				response_text: feedbackText
			});
		}
	}, [feedbackMutation, studyStep]);

	const handleWarningConfirm = () => {
		setShowWarning(false);
		setIsStepComplete(true);
		resetNextButton(); // Enable Standard Next Button
	}

	const isSubmitting = feedbackMutation.isPending;
	const isSuccess = feedbackMutation.isSuccess;

	return (
		<div className="container mx-auto px-4">
			{showWarning && <WarningDialog show={showWarning} confirmCallback={handleWarningConfirm}
				title="Empty feedback" message="<p>You hardly wrote anything.</p><p>Are you sure you are done?</p>"
				confirmText="Yes, I'm done"
				cancelCallback={() => setShowWarning(false)}
			/>}
			<div className="mb-6">
				{/* Header handled by layout */}
			</div>
			<div className="feedback-body mb-6">
				<form>
					<div className="mb-4">
						<label htmlFor="feedback" className="block text-gray-700 text-sm font-bold mb-2">
							<p className="mb-2">Thank you for participating in our study!</p>
							<p>
								Tell us about your experience with the study.
								This is a research study and your feedback is
								not only important to us, but also greatly
								appreciated.
							</p>
						</label>
						<textarea
							id="feedback"
							rows={4}
							ref={feedbackRef}
							disabled={isSubmitting || isSuccess}
							className={clsx(
								"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
								(isSubmitting || isSuccess) && "bg-gray-100"
							)}
						/>
					</div>
					<button
						type="button"
						onClick={submitFeedback}
						disabled={isSubmitting || isSuccess}
						className={clsx(
							"px-4 py-2 rounded font-bold text-white transition-colors",
							isSubmitting || isSuccess ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'
						)}
					>
						{isSubmitting ? 'Submitting...' : isSuccess ? 'Submitted' : 'Submit'}
					</button>
				</form>
			</div>
			<div className="mb-6">
				{/* Footer handled by layout */}
			</div>
		</div>
	);
}

export default FeedbackPage;