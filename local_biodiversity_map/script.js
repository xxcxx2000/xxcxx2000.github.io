// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoieHhjMjAwMCIsImEiOiJjbGNxOTQwM2swM3B3M3FwMGFxOGl3aHdhIn0.U_3cBsg0AZHQUkUwnyXFjA";

// Define a map object by initialising a Map from Mapbox
const map = new mapboxgl.Map({
  container: "map",
  // Replace YOUR_STYLE_URL with your style URL.
  style: "mapbox://styles/xxc2000/cldg3ykrf000901rngsuv0oo6"
});

const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
  placeholder: "Search for local biodiversity sites in Edinburgh", // Placeholder text for the search bar
  proximity: {
    longitude: 55.95,
    latitude: -3.307
  } // Coordinates of Glasgow center
});

map.addControl(geocoder, "top-right");

map.addControl(new mapboxgl.NavigationControl(), "top-right");
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "top-right"
);

map.on("load", () => {
  const layers = [
    "<5",
    "~10 ",
    "~20 ",
    "~50 ",
    "~100 ",
    "~200 ",
    ">200 "
  ];
  const colors = [
    "#ffffcc",
    "#d9f0a3",
    "#addd8e",
    "#78c679",
    "#41ab5d",
    "#238443",
    "#005a32"
  ];

  // create legend
  const legend = document.getElementById("legend");

layers.forEach((layer, i) => {
 const color = colors[i];
    const key = document.createElement("div");
    if (i >=5) {
      key.style.color = "white";
    }
    
    key.className = "legend-key";
    key.style.backgroundColor = color;
    key.innerHTML = `${layer}`;

    legend.appendChild(key);
  });
  
  
  map.addSource("hover", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });

  map.addLayer({
    id: "dz-hover",
    type: "fill",
    source: "hover",
    layout: {},
    paint: {
      "fill-color": "white"
    }
  });
});

map.on("mousemove", (event) => {
  const dzone = map.queryRenderedFeatures(event.point, {
    layers: ["local-biodiversity-sites"]
  });

  document.getElementById("pd").innerHTML = dzone.length
    ? `<h2>${dzone[0].properties.SITE_NAME}</h2><h3>Area:<strong>${dzone[0].properties.Shapearea}<strong> sq.m.</h3>`
    : ` <h2>Data: <a href='https://data.edinburghcouncilmaps.info/datasets/cityofedinburgh::local-biodiversity-sites/explore'>Biodiversity Sites Data </a> in City of Edinburgh, 2022 </h2>`;

  map.getSource("hover").setData({
    type: "FeatureCollection",
    features: dzone.map(function (f) {
      return { type: "Feature", geometry: f.geometry };
    })
  });
});

//Should point to your own GEOJSON
// const data_url = "https://api.mapbox.com/datasets/v1/your_user_name/your_dataset_ID/features?access_token= your_access_token

const data_url =
  "https://api.mapbox.com/datasets/v1/xxc2000/cldg6qemf18cj28o7s7nqd9u6/features?access_token=pk.eyJ1IjoieHhjMjAwMCIsImEiOiJjbGNxOTQwM2swM3B3M3FwMGFxOGl3aHdhIn0.U_3cBsg0AZHQUkUwnyXFjA";

//Everything will go into this map.on ()
map.on("load", () => {
  //Style the marker as circles, note in the source property, the data is using data_url from above.
  map.addLayer({
    id: "site",
    type: "fill",
    source: {
      type: "geojson",
      data: data_url //point to the data url variable
    },
    paint: {
      //feel free to adjust these
      "line-width": 1.2
    }
  });

  //Radio button interaction code goes below
  document.getElementById("toggle").addEventListener("change", (event) => {
    const type = event.target.value;
    console.log(type);
    // update the map filter
    if (type == "all") {
      filterType = ["!=", ["get", "Type"], "placeholder"];
    } else if (type == "Rural") {
      filterType = ["==", ["get", "Type"], "Rural"];
    } else if (type == "Urban") {
      filterType = ["==", ["get", "Type"], "Urban"];
    } else {
      console.log("error");
    }
    map.setFilter("local-biodiversity-sites", ["all", filterType]);
  });
});