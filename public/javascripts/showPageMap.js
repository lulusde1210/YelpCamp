
// mapboxgl.accessToken = '<%-process.env.MAPBOX_TOKEN%>';
// before moving this script from the show.ejs file to this seperate file, the first line of code was written like this line,
//but this line of code wont work because <%%> is an ejs access token, while this is not a ejs file. 
//but we could use a variable that we defined in the ejs file

mapboxgl.accessToken = mapToken; // or you can hard code the token here, because this token is not a secret


const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});

const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup( // set pop up here, it shows up when you click it
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${campground.title}</h3>`)
    )
    .addTo(map);

map.addControl(new mapboxgl.NavigationControl());


// const popup = new mapboxgl.Popup({ offset: 25 })
//     .setLngLat(campground.geometry.coordinates)
//     .setHTML(`<h3>${campground.title}</h3>`)
//     .addTo(map);
// set popup separately, it shows without clicking 
