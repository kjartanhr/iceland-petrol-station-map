import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from "react";
import L from 'leaflet'

function App() {
	const [map, setMap] = useState(null);
	const [data, setData] = useState();
	const [sorted95, setSorted95] = useState();
	const [sortedDiesel, setSortedDiesel] = useState();
	const [sortOrder, setSortOrder] = useState('95-lowest-first');
	useEffect(() => {
		fetch('https://apis.is/petrol').then(data => data.json()).then(setData);
	}, [setData]);

	useEffect(() => {
		if (data) {
			let n = data.results.map((x) => x);
			setSorted95(n.sort(function(a, b) {
				// both have discount
				if (a.bensin95_discount && b.bensin95_discount) {
					return a.bensin95_discount - b.bensin95_discount;
				} 
				// A has discount
				else if (a.bensin95_discount && !b.bensin95_discount) {
					return a.bensin95_discount - b.bensin95;
				} 
				// B has discount
				else if (!a.bensin95_discount && b.bensin95_discount) {
					return a.bensin95 - b.bensin95_discount;
				}
				// Neither has discount
				else {
					return a.bensin95 - b.bensin95;
				}
			}));
			setSortedDiesel(n.sort(function(a, b) {
				// both have discount
				if (a.diesel_discount && b.diesel_discount) {
					return a.diesel_discount - b.diesel_discount;
				} 
				// A has discount
				else if (a.diesel_discount && !b.diesel_discount) {
					return a.diesel_discount - b.diesel;
				} 
				// B has discount
				else if (!a.diesel_discount && b.diesel_discount) {
					return a.diesel - b.diesel_discount;
				}
				// Neither has discount
				else {
					return a.diesel - b.diesel;
				}
			}));
		}
	}, [data, setSorted95, setSortedDiesel]);

	// avoid wasting memory
	const icons = {
		ao: L.icon({
			iconUrl: 'brand-markers/ao-icon-2x.png',
			iconAnchor: [25, 82]
		}),
		co: L.icon({
			iconUrl: 'brand-markers/co-icon-2x.png',
			iconAnchor: [25, 82]
		}),
		n1: L.icon({
			iconUrl: 'brand-markers/n1-icon-2x.png',
			iconAnchor: [25, 82]
		}),
		ob: L.icon({
			iconUrl: 'brand-markers/ob-icon-2x.png',
			iconAnchor: [25, 82]
		}),
		ol: L.icon({
			iconUrl: 'brand-markers/ol-icon-2x.png',
			iconAnchor: [25, 82]
		}),
		or: L.icon({
			iconUrl: 'brand-markers/or-icon-2x.png',
			iconAnchor: [25, 82]
		})
	}

	const formatter = new Intl.NumberFormat('is-IS', { style: 'currency', currency: 'ISK', maximumFractionDigits: 2, minimumFractionDigits: 2, currencyDisplay: 'narrowSymbol' });

	return (
		<div className="App">
			<div style={{position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 500, padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.7)', borderBottomLeftRadius: '0.5rem', WebkitBorderBottomRightRadius: '0.5rem', backdropFilter: 'blur(3px)'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
					<img src="dispenser.png" style={{height: 35}} />
					<h1 style={{margin: 0, fontSize: '1.75rem'}}>Bensínstöðvarvefsjá</h1>
				</div>
				<div style={{textAlign: 'center'}}>
					<p style={{margin: 0, marginTop: 10, fontSize: '0.85rem', opacity: 0.65}}>&copy; {new Date().getFullYear()} <a style={{textDecoration: 'underline', color: 'inherit'}} href="https://kjartan.io/" target="_blank" rel="noreferrer">Kjartan Hrafnkelsson</a></p>
				</div>
			</div>
			<MapContainer center={[64.81942, -18.53717]} zoom={6.5} scrollWheelZoom={true} ref={setMap}>
				<TileLayer
					attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}"
					subdomains="abcd"
					minZoom={1}
					maxZoom={16}
					ext="jpg"
				/>
				{data && data.results.map((result, i) => (
					<Marker icon={icons[result.key.split('_')[0]]} key={i} position={[result.geo.lat, result.geo.lon]}>
						<Popup>
							<p style={{marginBottom: 3}}>
								{result.bensin95_discount ? <strong><span style={{textDecoration: 'line-through'}}>{formatter.format(result.bensin95)}</span>{' '}{formatter.format(result.bensin95_discount)}</strong> :
								<strong>{formatter.format(result.bensin95)}</strong>}
								{' '}/ lítra (Bensín 95)
							</p>
							<p style={{margin: 0}}>
								{result.diesel_discount ? <strong><span style={{textDecoration: 'line-through'}}>{formatter.format(result.diesel)}</span>{' '}{formatter.format(result.diesel_discount)}</strong> :
								<strong>{formatter.format(result.diesel)}</strong>}
								{' '}/ lítra (Dísel)
							</p>
							<p style={{opacity: 80, marginTop: 9}}>{result.company} &mdash; {result.name}</p>
						</Popup>
					</Marker>
				))}
			</MapContainer>
			<div style={{backgroundColor: 'white', position: 'absolute', left: 0, bottom: 0, zIndex: 2000}} className="station-list-container">
				<div style={{padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '2rem'}}>
					<p style={{fontWeight: 500, margin: 0}}>Verðlisti</p>
					<div style={{display: 'flex', flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center', textAlign: 'right'}}>
						<select style={{border: 'none'}} onChange={(e) => setSortOrder(e.target.value)}>
							<option value="95-lowest-first">Bensín (95) &mdash; ódýrt fyrst</option>
							<option value="95-highest-first">Bensín (95) &mdash; dýrt fyrst</option>
							<option value="diesel-lowest-first">Dísel &mdash; ódýrt fyrst</option>
							<option value="diesel-highest-first">Dísel &mdash; dýrt fyrst</option>
						</select>
					</div>
				</div>
				<div style={{height: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
					{(sorted95 && sortedDiesel) && <>
						{
							sortOrder === '95-lowest-first' ? sorted95.map((d, i) => <StationButton d={d} map={map} formatter={formatter} key={i} />) :
							sortOrder === '95-highest-first' ? sorted95.slice().reverse().map((d, i) => <StationButton d={d} map={map} formatter={formatter} key={i} />) :
							sortOrder === 'diesel-lowest-first' ? sortedDiesel.map((d, i) => <StationButton d={d} map={map} formatter={formatter} key={i} />) :
							sortOrder === 'diesel-highest-first' ? sortedDiesel.slice().reverse().map((d, i) => <StationButton d={d} map={map} formatter={formatter} key={i} />) :
							null
						}
					</>}
				</div>
			</div>
		</div>
	);
}

const StationButton = ({d, map, formatter}) => (
	<button className="station-button" onClick={function() { map.flyTo(new L.LatLng(d.geo.lat, d.geo.lon), 14) }}>
		<div style={{display: 'flex', gap: '2rem', alignItems: 'center'}}>
			<div style={{flexGrow: 1}}>
				<p style={{margin: 0}}>{d.name}</p>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end', paddingTop: '5px'}}>
					<p style={{margin: 0, color: '#64748b', fontSize: '0.7rem', fontWeight: 600}}>
						<span style={{fontWeight: 400}}>Bensín (95):</span>{' '}
						<span style={{color: '#334155'}}>{d.bensin95_discount ? formatter.format(d.bensin95_discount) : formatter.format(d.bensin95)}</span>
					</p>
					<p style={{margin: 0, color: '#64748b', fontSize: '0.7rem', fontWeight: 600}}>
						<span style={{fontWeight: 400}}>Dísel:</span>{' '}
						<span style={{color: '#334155'}}>{d.diesel_discount ? formatter.format(d.diesel_discount) : formatter.format(d.diesel)}</span>
					</p>
				</div>
			</div>
			<div>
				<img style={{borderRadius: '0.25rem', height: '25px'}} src={'brand-logos/' + d.key.split('_')[0] + '.svg'} />
			</div>
		</div>
	</button>
)

export default App;
