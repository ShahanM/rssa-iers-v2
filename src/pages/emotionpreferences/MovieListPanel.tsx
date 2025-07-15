import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import { useRecoilValue } from "recoil";
import { emotionMovieMapState } from "../../states/emotionmoviestate";
import { emotionState } from "../../states/emotiontogglestate";
import { EmotionMovieDetails } from "../../types/movies";
import MovieListPanelItem from "./MovieListPanelItem";

interface MovieListPanelProps {
	id: string;
	panelTitle: string;
	selectButtonEnabled?: boolean;
}


const MovieListPanel: React.FC<MovieListPanelProps> = ({
	id, panelTitle, selectButtonEnabled = false
}) => {

	const movies: Map<string, EmotionMovieDetails> = useRecoilValue(emotionMovieMapState);
	const emotionMap: Map<string, string> = useRecoilValue(emotionState);

	const selectionTags = Array.from(emotionMap.entries()).filter(([emoKey, emoVal]) => emoVal !== 'ignore');

	console.log("Selection Tags:", selectionTags, emotionMap);

	return (
		<Col id={id} className="recommendationsListContainer">
			<div className="align-items-center justify-content-center"
				style={{
					height: "99px", padding: "9px 18px",
					textAlign: "center", borderRadius: "0.3rem 0.3rem 0 0",
					backgroundColor: "#e9ecef"
				}}>
				<h5>{panelTitle}</h5>
				{
					selectionTags.length > 0 ?
						<div className="badgeContainer">
							{selectionTags.map(([emo, emoVal], i) => (
								<div className="badge" key={'badge_' + i}>
									<div className="name">
										<span>{emo}</span>
									</div>
									<div className={`status ${emoVal === 'low' ? "ersorange" : "green"}`}>
										<span>{emoVal}</span>
									</div>
								</div>
							))}
						</div>
						:
						<p style={{ padding: "1.8em" }}>No emotion preference selected</p>
				}
			</div>
			<ListGroup as="ul" style={{ minHeight: "504px" }}>
				{[...movies.values()].map((movie) => (
					<MovieListPanelItem
						key={movie.id}
						movie={movie}
						selectButtonEnabled={selectButtonEnabled}
					/>
				))}
			</ListGroup>
		</Col>
	)
}

export default MovieListPanel;