const myMap = L.map('map').setView([22.9074872, 79.07306671], 5);
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution =
        'Coded by jay patel';
const tileLayer = L.tileLayer(tileUrl, { attribution });
tileLayer.addTo(myMap);


function generateList() {
  const ul = document.querySelector('.list');
  storeList.forEach((shop) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    const a = document.createElement('a');
    const p = document.createElement('p');
    a.addEventListener('click', () => {
        flyToStore(shop);
    });
    div.classList.add('shop-item');
    // a.innerText = shop.properties.name;

    p.innerText = shop.properties.address;

    div.appendChild(a);
    div.appendChild(p);
    li.appendChild(div);
    // ul.appendChild(li);
    var liToAdd = `
        <li> hello world</li>
`
    a.innerHTML+= liToAdd;
    ul.appendChild(a);


    //   const ul = document.querySelector('.property-list');
//   storeList.forEach((shop) => {
//     // const li = document.createElement('li');
//     // const div = document.createElement('div');
//     const a = document.createElement('a');
//     // const p = document.createElement('p');
//     a.addEventListener('click', () => {
//         flyToStore(shop);
//     });
//     var liToAdd = `
//     <li> 
//       <div class="property-card">
//         <figure class="card-banner img-holder" style="--width: 800; --height: 533;">
//           <img src="./public/assets/images/property-1.jpg" width="800" height="533" loading="lazy" alt="10765 Hillshire Ave, Baton Rouge, LA 70810, USA" class="img-cover">
//         </figure>

//         <button class="card-action-btn" aria-label="add to favourite">
//           <ion-icon name="heart" aria-hidden="true"></ion-icon>
//         </button>

//         <div class="card-content">

//           <h3 class="h3">
//             <a href="#" class="card-title">${shop.properties.name}</a>
//           </h3>

//           <ul class="card-list">

//             <li class="card-item">
//               <div class="item-icon">
//                 <ion-icon name="cube-outline"></ion-icon>
//               </div>

//               <span class="item-text">8000sqf</span>
//             </li>

//             <li class="card-item">
//               <div class="item-icon">
//                 <ion-icon name="bed-outline"></ion-icon>
//               </div>

//               <span class="item-text">4 Beds</span>
//             </li>

//             <li class="card-item">
//               <div class="item-icon">
//                 <ion-icon name="man-outline"></ion-icon>
//               </div>

//               <span class="item-text">4 Baths</span>
//             </li>

//           </ul>

//           <div class="card-meta">

//             <div>
//               <span class="meta-title">Price</span>

//               <span class="meta-text">$5000</span>
//             </div>

//             <div>
//               <span class="meta-title">Rating</span>

//               <span class="meta-text">

//                 <div class="rating-wrapper">
//                   <ion-icon name="star"></ion-icon>
//                   <ion-icon name="star"></ion-icon>
//                   <ion-icon name="star"></ion-icon>
//                   <ion-icon name="star"></ion-icon>
//                   <ion-icon name="star"></ion-icon>
//                 </div>

//                 <span>5.0(30)</span>

//               </span>
//             </div>

//           </div>

//         </div>
//       </div>
//     </li>
//   `;
//     a.innerHTML+= liToAdd;
//     ul.appendChild(a);
  });

}

generateList();

function makePopupContent(shop) {
  return `
    <div>
        <h4>${shop.properties.name}</h4>
        <p>${shop.properties.address}</p>
        <div class="phone-number">
            <a href="tel:${shop.properties.phone}">${shop.properties.phone}</a>
        </div>
    </div>
  `;
}
function onEachFeature(feature, layer) {
    layer.bindPopup(makePopupContent(feature), { closeButton: false, offset: L.point(0, -8) });
}

var myIcon = L.icon({
    iconUrl: 'public/marker.png',
    iconSize: [30, 40]
});

const shopsLayer = L.geoJSON(storeList, {
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
        return L.marker(latlng, { icon: myIcon });
    }
});
shopsLayer.addTo(myMap);

function flyToStore(store) {
    const lat = store.geometry.coordinates[1];
    const lng = store.geometry.coordinates[0];

    myMap.flyTo([lat, lng],
         14, {
        duration: 3
    });
    setTimeout(() => {
        L.popup({closeButton: false, offset: L.point(0, -8)})
        .setLatLng([lat, lng])
        .setContent(makePopupContent(store))
        .openOn(myMap);
    }, 3000);
}




