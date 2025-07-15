import React, { useCallback, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CurrentStep, Participant, StudyStep, useStudy } from 'rssa-api';
import Footer from '../components/Footer';
import Header from '../components/Header';
import MovieGrid from '../components/moviegrid/MovieGrid';
import { MovieRating } from '../components/moviegrid/moviegriditem/MovieGridItem.types';
import { ratedMoviesState } from '../states/ratedmoviestate';
import { participantState, studyStepState } from '../states/studyState';
import { StudyPageProps } from './StudyPage.types';


const MovieRatingPage: React.FC<StudyPageProps> = ({
	next,
	checkpointUrl,
	onStepUpdate,
	sizeWarning
}) => {
	const itemsPerPage = 24;
	const minRatingCount = 10;

	const participant: Participant | null = useRecoilValue(participantState);
	const studyStep: StudyStep | null = useRecoilValue(studyStepState);

	const { studyApi } = useStudy();
	const navigate = useNavigate();
	const location = useLocation();

	const [buttonDisabled, setButtonDisabled] = useState(true);
	const [loading, setLoading] = useState(false);

	const [ratedMovies, setRatedMovies] = useRecoilState(ratedMoviesState);

	const handleRating = useCallback((movieRating: MovieRating) => {
		if (!movieRating || !movieRating.id || !movieRating.movielens_id || movieRating.rating === undefined) {
			console.error("Invalid movie rating data:", movieRating);
			return;
		}
		setRatedMovies(prev => {
			const newRatedMovies = new Map(prev);
			newRatedMovies.set(movieRating.id, movieRating);
			return newRatedMovies;
		});
	}, [setRatedMovies]);

	useEffect(() => {
		if (checkpointUrl !== '/' && checkpointUrl !== location.pathname) {
			navigate(checkpointUrl);
		}
	}, [checkpointUrl, location.pathname, navigate]);

	const handleNextBtn = useCallback(async () => {
		if (!participant || !studyStep) {
			console.error("Participant or study step is not defined.");
			return;
		}
		if (ratedMovies.size < minRatingCount) {
			console.warn(`Please rate at least ${minRatingCount} movies.`);
			return;
		}

		setLoading(true);
		setButtonDisabled(true);

		try {
			const nextRouteStep: StudyStep = await studyApi.post<CurrentStep, StudyStep>('studies/steps/next', {
				current_step_id: participant.current_step
			});

			onStepUpdate(nextRouteStep, participant, next);
			navigate(next);
		} catch (error) {
			console.error("Error getting next step:", error);
		} finally {
			setLoading(false);
		}
	}, [studyApi, participant, studyStep, onStepUpdate, next, ratedMovies, minRatingCount, navigate]);

	useEffect(() => {
		setButtonDisabled(ratedMovies.size < minRatingCount || !participant || !studyStep);
	}, [ratedMovies, minRatingCount, participant, studyStep]);

	if (!participant || !studyStep) {
		return <div>Loading study data...</div>;
	}

	return (
		<Container>
			<Row>
				<Header title={studyStep?.name} content={studyStep?.description} />
			</Row>
			{sizeWarning ? <Row className="size-error-overlay">Nothing to display</Row> :
				<Row>
					<MovieGrid
						dataCallback={handleRating}
						itemsPerPage={itemsPerPage} />
				</Row>
			}
			<Row>
				<RankHolder max={minRatingCount} />
				<Footer callback={handleNextBtn} disabled={buttonDisabled}
					loading={loading} />
			</Row>
		</Container>
	);
}


interface RankHolderProps {
	max: number;
}


const RankHolder: React.FC<RankHolderProps> = ({ max }) => {
	const ratedMovies: Map<string, MovieRating> = useRecoilValue(ratedMoviesState);

	return (
		<div className="rankHolder">
			<span>Rated Movies: </span>
			<span><i>{ratedMovies.size}</i></span>
			<span><i>of {max}</i></span>
		</div>
	)
}

export default MovieRatingPage;