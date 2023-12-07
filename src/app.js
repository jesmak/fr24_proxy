import express from 'express';
import cors from 'cors';
import config from './config.json' assert { type: "json" };
import fetch from 'node-fetch';

const app = express();
app.use(cors());

app.get('/', async (req, res) => {
	const url = config.API_URL;

	const options = {
		method: 'GET',
		headers: { Authorization: 'Bearer ' + config.TOKEN }
	};

	const result = await fetch(url, options)
		.then(async (response) => {
			return response.json();
		})
		.then(async (response) => {
			const geojson = {};
			geojson['type'] = 'FeatureCollection';
			geojson['features'] = [];

			response.attributes.flights.forEach((flight) => {
				if (flight.aircraft_code !== 'GRND' && flight.flight_number) {
					geojson['features'].push({
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: [flight.longitude, flight.latitude]
						},
						properties: {
							title: '✈ ' + (flight.flight_number || flight.call_number || flight.id),
							id: flight.id
						}
					});
				}
			});

			return geojson;
		})
		.catch((error) => console.log(error));

	console.log(new Date().toISOString(), result ? JSON.stringify(result) : 'error');

	if (result) {
		res.json(result);
	} else {
		res.status(500);
	}
});

app.listen(8081, function() {
	console.log('app listening at :8081');
});
