// Initialize Google Map
let map;
let directionsService;
let directionsRenderer;
let snowplowMarkers = [];

function initMap() {
    // NYC Center coordinates
    const nycCenter = { lat: 40.7128, lng: -74.0060 };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: nycCenter,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#1a202e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1a202e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#a0aec0" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#a0aec0" }]
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#a0aec0" }]
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#2d3748" }]
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38415f" }]
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#2d3748" }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#4c5481" }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#2d3748" }]
            },
            {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#38415f" }]
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#0f1419" }]
            }
        ]
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        polylineOptions: {
            strokeColor: "#0066ff",
            strokeWeight: 4
        }
    });

    // Add sample snowplow markers
    addSnowplowMarkers();
    addRoadStatusOverlay();

    // Event listeners
    document.getElementById('showSnowplows').addEventListener('click', toggleSnowplows);
    document.getElementById('showRoads').addEventListener('click', toggleRoads);
    document.getElementById('showRoutes').addEventListener('click', toggleRoutes);
    document.getElementById('planRoute').addEventListener('click', planRoute);
}

function addSnowplowMarkers() {
    const snowplows = [
        { id: 'Plow-NYC-001', lat: 40.7580, lng: -73.9855, route: '5th Ave - Central' },
        { id: 'Plow-NYC-002', lat: 40.7360, lng: -73.9911, route: 'Broadway - Downtown' },
        { id: 'Plow-NYC-003', lat: 40.7829, lng: -73.9654, route: 'Park Ave - Uptown' }
    ];

    snowplows.forEach(plow => {
        const marker = new google.maps.Marker({
            position: { lat: plow.lat, lng: plow.lng },
            map: map,
            title: plow.id,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#0066ff',
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 2
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="color: #ffffff; background-color: #1a2847; padding: 12px; border-radius: 6px;">
                    <p style="margin: 0 0 8px 0; font-weight: bold;">${plow.id}</p>
                    <p style="margin: 0 0 4px 0; font-size: 12px;">Route: ${plow.route}</p>
                    <p style="margin: 0; font-size: 11px; color: #a0aec0;">Status: Active</p>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

        snowplowMarkers.push(marker);
    });
}

function addRoadStatusOverlay() {
    // Add sample polylines for road status
    const clearedRoad = new google.maps.Polyline({
        path: [
            { lat: 40.7128, lng: -74.0060 },
            { lat: 40.7580, lng: -73.9855 }
        ],
        geodesic: true,
        strokeColor: '#68d391',
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map: map,
        title: 'Cleared Road'
    });

    const clearingRoad = new google.maps.Polyline({
        path: [
            { lat: 40.7360, lng: -73.9911 },
            { lat: 40.7500, lng: -73.9800 }
        ],
        geodesic: true,
        strokeColor: '#f6ad55',
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map: map,
        title: 'Road in Progress'
    });

    const cautionRoad = new google.maps.Polyline({
        path: [
            { lat: 40.7829, lng: -73.9654 },
            { lat: 40.7700, lng: -73.9700 }
        ],
        geodesic: true,
        strokeColor: '#fc8181',
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map: map,
        title: 'Caution Area'
    });
}

function toggleSnowplows() {
    const btn = document.getElementById('showSnowplows');
    const visible = snowplowMarkers[0].getMap() === null;

    snowplowMarkers.forEach(marker => {
        marker.setMap(visible ? map : null);
    });

    btn.classList.toggle('active');
}

function toggleRoads() {
    const btn = document.getElementById('showRoads');
    btn.classList.toggle('active');
    // In a real app, this would toggle road status polylines
}

function toggleRoutes() {
    const btn = document.getElementById('showRoutes');
    btn.classList.toggle('active');
}

function planRoute() {
    const startLocation = document.getElementById('startLocation').value;
    const endLocation = document.getElementById('endLocation').value;
    const travelMode = document.getElementById('travelMode').value;

    if (!startLocation || !endLocation) {
        alert('Please enter both start and end locations');
        return;
    }

    const request = {
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.TravelMode[travelMode],
        avoidHighways: false
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            const route = result.routes[0];
            const leg = route.legs[0];
            
            document.getElementById('routeDistance').textContent = leg.distance.text;
            document.getElementById('routeTime').textContent = leg.duration.text;
            
            // Calculate risk level (in real app, would check snowplow data)
            const riskLevel = Math.random() > 0.5 ? 'Low' : 'Medium';
            const riskElement = document.getElementById('riskLevel');
            riskElement.textContent = riskLevel;
            riskElement.className = `risk-${riskLevel.toLowerCase()}`;
            
            document.getElementById('routeResults').style.display = 'block';
            document.getElementById('routeResults').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Could not calculate route: ' + status);
        }
    });
}

// Initialize map when page loads
window.addEventListener('load', initMap);