import { useEffect } from "react";
import { Card, Col, Container, Image, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { CurrentStep, Participant, StudyStep, useStudy } from "rssa-api";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { participantState, studyStepState } from "../states/studyState";
import { StudyPageProps } from "./StudyPage.types";


const StudyMap: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	onStepUpdate
}) => {
	const participant: Participant | null = useRecoilValue(participantState);
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const rspref = require("../res/rate-prefs.png");
	const presurvey = require("../res/pre-survey.png");
	const rsinteract = require("../res/interact.png");
	const postsurvey = require("../res/post-survey.png")

	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const handleNextBtn = async () => {
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}
		try {
			const nextStep: StudyStep = await studyApi.post<CurrentStep, StudyStep>('studies/steps/next', {
				current_step_id: participant.current_step
			});
			onStepUpdate(nextStep, participant, next);
			navigate(next);
		} catch (error) {
			console.error("Error getting next to updating study progress", error);
		}
	}

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			<Row>
				<Col>
					<Card className="overviewCard">
						<Card.Body>
							<Card.Title>Pre-survey</Card.Title>
							<Image src={presurvey} fluid />
						</Card.Body>
					</Card>
				</Col>
				<Col>
					<Card className="overviewCard">
						<Card.Body>
							<Card.Title>Indicate your preference</Card.Title>
							<Image src={rspref} fluid />
						</Card.Body>
					</Card>
				</Col>
				<Col>
					<Card className="overviewCard">
						<Card.Body>
							<Card.Title>Interact with the system</Card.Title>
							<Image src={rsinteract} fluid />
						</Card.Body>
					</Card>
				</Col>
				<Col>
					<Card className="overviewCard">
						<Card.Body>
							<Card.Title>Post-survey</Card.Title>
							<Image src={postsurvey} fluid />
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row>
				<Footer callback={handleNextBtn} />
			</Row>
		</Container>
	)
}

export default StudyMap;