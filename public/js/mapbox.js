/*eslint-disable*/
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoieW9nZXNoMjAwMCIsImEiOiJjazF2dXo2OWMxYWdpM2NrYXVuMTF6N2RwIn0.bsML-mKk91TfBl0eBv4xJg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yogesh2000/ck1vwi5iy1b1s1cp0w67wbej3',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add marker

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add Popup

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //Extend map bound to add current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
