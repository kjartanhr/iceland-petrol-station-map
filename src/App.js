import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from "react";
import L from 'leaflet'

function App() {
	const [data, setData] = useState();
	useEffect(() => {
		fetch('https://apis.is/petrol').then(data => data.json()).then(setData);
	}, [setData]);

	function getLowestPrices() {
		const r = [0,1,2,3,4,5,6,7,8,9,10,11]
		//const r = [...data.results];
		/*const r = [...data.results].sort(function(a,b) {
			return 1;
		});*/

		return r.slice(0, 10);
	}

	const aoIcon = L.icon({
		iconUrl: 'ao-marker.svg',
		iconSize: [32,32],
		iconAnchor: [16, 32],
		popupAnchor: null,
		shadowUrl: null,
		shadowSize: null,
		shadowAnchor: null
	});

	return (
		<div className="App">
			<MapContainer center={[64.81942, -18.53717]} zoom={6.5} scrollWheelZoom={false}>
				<TileLayer
					attribution='Map data &copy; <a href="https://maps.google.com/">Google, LLC.</a>'
					//url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
					subdomains={['mt0','mt1','mt2','mt3']}
				/>
				{data && data.results.map((result, i) => (
					<Marker key={i} position={[result.geo.lat, result.geo.lon]}>
						<Popup>
							<p style={{marginBottom: 3}}>
								{result.bensin95_discount ? <strong><span style={{textDecoration: 'line-through'}}>{result.bensin95}</span>{' '}{result.bensin95_discount}kr</strong> :
								<strong>{result.bensin95}kr</strong>}
								{' '}/ lítra (Bensín 95)
							</p>
							<p style={{margin: 0}}>
								{result.diesel_discount ? <strong><span style={{textDecoration: 'line-through'}}>{result.diesel}</span>{' '}{result.diesel_discount}kr</strong> :
								<strong>{result.diesel}kr</strong>}
								{' '}/ lítra (Dísel)
							</p>
							<p style={{opacity: 80, marginTop: 9}}>{result.company} &mdash; {result.name}</p>
						</Popup>
					</Marker>
				))}
			</MapContainer>
			<div style={{backgroundColor: 'white', position: 'absolute', left: 0, bottom: 0, width: '300px', height: '50px', zIndex: 500, borderTopRightRadius: '0.25rem'}}>
				{getLowestPrices(data)}
			</div>
		</div>
	);
}

export default App;
