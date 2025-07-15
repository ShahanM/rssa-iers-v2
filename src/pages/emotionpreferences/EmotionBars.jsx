import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';

export default function EmotionBars({ emotions, movie }) {
	const floatToHexStr = (float) => {
		let hex = Math.round(float * 255).toString(16);
		if (hex.length === 1) {
			hex = '0' + hex;
		}
		return hex;
	}

	const getEmoScaled = (emo, movieEmotions) => {
		const emoVal = movieEmotions[emo.emo.toLowerCase()];
		return (emoVal - emo.min) / (emo.max - emo.min);
	}

	const hslToRgb = (h, s, l) => {
		let r, g, b;

		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			const hue2rgb = function hue2rgb(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			}

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}


	const numberToColorHsl = (emoVal, emoMin, emoMax) => {
		let ratio = emoVal;
		if (emoMin > 0 || emoMax < 1) {
			if (emoVal < emoMin) {
				ratio = 0;
			} else if (emoVal > emoMax) {
				ratio = 1;
			} else {
				var range = emoMax - emoMin;
				ratio = (emoVal - emoMin) / range;
			}
		}

		const hue = ratio * 1.2 / 3.60;

		const rgb = hslToRgb(hue, 1, .5);
		return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
	}

	const linearGradient = (emo, movieEmotions) => {
		const emoVal = movieEmotions[emo.emo.toLowerCase()];
		const gradStart = numberToColorHsl(emo.min, emo.min, emo.max);
		const gradEnd = numberToColorHsl(emoVal, emo.min, emo.max);

		return 'linear-gradient(90deg, ' + gradStart + ', ' + gradEnd + ')';
	}

	const getEmoBar = (emo, movieEmotions) => {
		const emoVal = movieEmotions[emo.emo.toLowerCase()];

		return numberToColorHsl(emoVal, emo.min, emo.max);
	}


	return (
		<div className="emoStatbars">
			{
				emotions.map((emotion, i) =>
					<Row
						key={emotion.emo + '_' + i + '_' + movie.id}
						className="align-items-center mb-1"
						style={{ height: "27px" }}
					>
						<Col xs={3} sm={3} md={3} xl={3} className="text-end ps-2">
							<span style={{ whiteSpace: "nowrap" }}>{emotion.emo}</span>
						</Col>

						<Col xs={9} className="ps-2">
							<ProgressBar className="w-100" style={{ padding: "0" }}>
								<ProgressBar
									style={{ background: linearGradient(emotion, movie.emotions) }}
									now={getEmoScaled(emotion, movie.emotions) * 100}
								/>
							</ProgressBar>
						</Col>
					</Row>
				)
			}
		</div>
	)
}