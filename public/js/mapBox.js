// const locations = JSON.parse(document.querySelector('#map').dataset.locations);

// console.log(locations);
export const displayMap = locations => {


mapboxgl.accessToken =
  'pk.eyJ1Ijoia2hvb3BoZGV2IiwiYSI6ImNrMWJjcmc0NjAxaWMzanFuMGQwbXllNXkifQ.D0-COLKliEkt-Ou83ShQGg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/khoophdev/ck1bkn4690lfq1cp05raxf3ir',
  scrollZoom: false
  // center: [-87.623177, 41.881832],
  // zoom: 8,
  // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(location => {
  // create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description}/p>`)
    .addTo(map);

  // extend map bounds to include current location
  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
}
