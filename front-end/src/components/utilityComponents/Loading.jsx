import React from 'react';


export default function Loading() {
	const [numDots, setNumDots] = React.useState(0);

	React.useEffect(() => {
		const timer = setInterval(() => {
			setNumDots((prev) => (prev === 5 ? 0 : prev + 1));
		}, 500);
		return () => clearInterval(timer);
	}, []);

	return (
		<div>
			<h1>
				Loading{'.'.repeat(numDots)}
			</h1>
		</div>
	);
}
