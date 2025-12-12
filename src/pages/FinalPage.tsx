import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { StudyLayoutContextType, useNextButtonControl } from "rssa-study-template";
import { useParticipant } from "../contexts/ParticipantContext";


const FinalPage: React.FC = () => {
	const { studyStep } = useOutletContext<StudyLayoutContextType>();
	const { setParticipant } = useParticipant();
	const { setButtonControl } = useNextButtonControl();

	const navigate = useNavigate();

	const handleNextBtn = () => {
		localStorage.clear();
		setParticipant(null);
		navigate(studyStep?.next || '/');
	}

	// Set Next button action and label
	useEffect(() => {
		setButtonControl({
			label: "Done",
			action: handleNextBtn,
			isDisabled: false
		});
	}, [setButtonControl, studyStep]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="container mx-auto px-4">
			<div className="mb-6">
				{/* Header handled by layout */}
			</div>
			<div className="text-left mb-6">
				<p className="mb-4">
					You should be automatically redirected back to the Prolific
					page. If not, please click the link below.
				</p>
				<div className="text-center mb-4">
					<a href="#" className="text-blue-600 hover:underline">Some redirect url.</a>
				</div>
				<p className="mb-4">
					Currently, this is a placeholder for testing. Please click
					the Done button below to finish the study.
				</p>
				<p className="mb-4 text-gray-600 italic">
					Note: If you do not click the Done button, you will not be
					able to run the study again on this browser without clearing
					browser data/cache.
				</p>
			</div>
			<div className="mb-6">
				{/* Footer handled by layout */}
			</div>
		</div>
	)
}

export default FinalPage;