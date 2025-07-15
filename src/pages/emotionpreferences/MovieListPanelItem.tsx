import React from "react";
import Image from "react-bootstrap/Image";
import ListGroup from "react-bootstrap/ListGroup";
import { useRecoilState } from "recoil";
import { Movie } from "../../components/moviegrid/moviegriditem/MovieGridItem.types";
import { activeEmotionMovieIdState, selectedEmotionMovieIdState } from "../../states/emotionmoviestate";
import { Button } from "react-bootstrap";

interface MovieListPanelItemProps {
	movie: Movie;
	selectButtonEnabled?: boolean;
}

const MovieListPanelItem: React.FC<MovieListPanelItemProps> = ({
	movie, selectButtonEnabled = false
}) => {

	const [activeHoverMovieId, setActiveHoverMovieId] = useRecoilState(activeEmotionMovieIdState);
	const [selectedMovieId, setSelectedMovieId] = useRecoilState(selectedEmotionMovieIdState);

	return (
		<ListGroup.Item as="div"
			className={`d-flex justify-content-between align-items-center ${movie.id === activeHoverMovieId ? "bg-ers" : ""}`}
			style={{ padding: "0.1rem" }}
			// onMouseEnter={(evt) => props.hoverHandler(evt, true, movie, "enter")}
			onMouseEnter={() => setActiveHoverMovieId(movie.id)}
		>
			<div>
				<Image className="sidePanelThumbnail" src={movie.poster} />
			</div>
			<div style={{
				position: "relative", boxSizing: "border-box", width: "87%",
				display: "inline-block", verticalAlign: "middle"
			}}>
				<p style={{ marginBottom: "0", marginTop: "0.25rem", textAlign: "left", marginLeft: "0.5em" }}>
					{movie.title + " (" + movie.year + ")"}
				</p>
			</div>
			{selectButtonEnabled ?
				<>
					<div id={"selectButton_" + movie.id}>
						{movie.id === selectedMovieId ?
							<Button variant="ersDone" className="movielist-btn"> Selected</Button>
							:
							<Button variant="ers" className="movielist-btn" onClick={() => setSelectedMovieId(movie.id)}>Select</Button>
						}
					</div>
				</>
				: ''}
		</ListGroup.Item>
	)
}

export default MovieListPanelItem;