import EmotionBars from './EmotionBars';
import EmotionWheels from './EmotionWheels';

export default function EmotionStats(props) {
	const movie = props.movie;
	const emotions = [
		{ emo: 'Joy', max: 0.318181818181818, min: 0.0382546323968918 },
		{ emo: 'Trust', max: 0.253994490358127, min: 0.0817610062893082 },
		{ emo: 'Fear', max: 0.209126984126984, min: 0.0273270708795901 },
		{ emo: 'Surprise', max: 0.166202984427503, min: 0.0256678889470927 },
		{ emo: 'Sadness', max: 0.188492063492063, min: 0.025706940874036 },
		{ emo: 'Disgust', max: 0.157538659793814, min: 0.00886524822695036 },
		{ emo: 'Anger', max: 0.182929272690844, min: 0.0161596958174905 },
		{ emo: 'Anticipation', max: 0.251623376623377, min: 0.0645546921697549 }
	];

	switch (props.vizType) {
		case 'bars':
			return (
				<EmotionBars
					emotions={emotions}
					movie={movie}
				/>
			)
		case 'wheel':
			return (
				<EmotionWheels
					emotions={emotions}
					movie={movie}
				/>
			)
		default:
			return (
				<></>
			)
	}

}