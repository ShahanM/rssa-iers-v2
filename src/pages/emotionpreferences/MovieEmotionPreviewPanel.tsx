import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { useRecoilValue } from "recoil";
import { activeEmotionMovieSelector } from "../../states/emotionmoviestate";
import EmotionStats from "./emotionStats";
import MoviePreviewCard from "./MoviePreviewCard";

interface MovieEmotionPreviewPanelProps {
	emoVizEnabled?: boolean;
	vizType?: "wheel" | "bars";
}

const MovieEmotionPreviewPanel: React.FC<MovieEmotionPreviewPanelProps> = ({
	emoVizEnabled,
	vizType
}) => {

	const selectedMovie = useRecoilValue(activeEmotionMovieSelector);

	if (!selectedMovie) {
		return (
			<Container>
				<Row style={{ height: "279px" }}>
					<h5 style={{ textAlign: "center", marginTop: "100px" }}>Select a movie to see its emotional signature</h5>
				</Row>
			</Container>
		);
	}

	return (
		<Container>
			<Row className="mt-3" style={{ height: "279px" }}>
				<MoviePreviewCard />
			</Row>
			<hr />
			{emoVizEnabled &&
				<>
					<Row className="mt-3 text-lg-center">
						<h5>Emotional signature</h5>
					</Row>
					<Row className="mt-3 centered-content">
						<EmotionStats movie={selectedMovie} vizType={vizType}/>
					</Row>
				</>
			}
		</Container>
	)
}

export default MovieEmotionPreviewPanel;