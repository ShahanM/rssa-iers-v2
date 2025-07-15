import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { useRecoilValue } from 'recoil';
import { activeEmotionMovieSelector } from '../../states/emotionmoviestate';

interface MoviePreviewCardProps {
}


const MoviePreviewCard: React.FC<MoviePreviewCardProps> = () => {

	const selectedMovie = useRecoilValue(activeEmotionMovieSelector);

	if (!selectedMovie) {
		return (
			<Container className="moviePreviewCard">
				<Row>
					<Col>
						<p>No movie selected</p>
					</Col>
				</Row>
			</Container>
		);
	}

	return (
		<Container className="moviePreviewCard">
			<Row>
				<Col>
					<div className="movie-preview-card-image">
						<Image src={selectedMovie.poster}
							alt={"Post of the movie " + selectedMovie.title}
							className="d-flex mx-auto d-block img-thumbnail" />
					</div>
				</Col>
				<Col>
					<Row>
						<h5 style={{ textAlign: "left" }}>{selectedMovie.title} ({selectedMovie.year})</h5>
					</Row>
					<Row style={{ height: "216px", overflowY: "scroll" }}>
						<p style={{ textAlign: "left" }}>
							{selectedMovie.description}
						</p>
					</Row>
				</Col>
			</Row>
		</Container >
	)
}

export default MoviePreviewCard;