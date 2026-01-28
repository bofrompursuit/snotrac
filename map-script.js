// Initialize Google Map
let map;
let directionsService;
let directionsRenderer;
let snowplowMarkers = [];
let geminiAnalyzer;
let mockData;

async function initMap() {
    // NYC Center coordinates
    const nycCenter = { lat: 40.7128, lng: -74.0060 };

    try {
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

        console.log('Google Map initialized successfully');

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

        // Initialize Gemini Analyzer
        geminiAnalyzer = new GeminiAnalyzer('AIzaSyCoAC4mL8IplZfdBMD7Z-E2U-35jA2EAXE');
        
        // Load mock data
        await loadMockData();
        
        // Generate initial Gemini analysis
        generateMapSidebarAnalysis();

        // Event listeners
        document.getElementById('showSnowplows').addEventListener('click', toggleSnowplows);
        document.getElementById('showRoads').addEventListener('click', toggleRoads);
        document.getElementById('showRoutes').addEventListener('click', toggleRoutes);
        document.getElementById('planRoute').addEventListener('click', planRoute);
        document.getElementById('useCurrentLocation').addEventListener('click', useCurrentLocation);
    } catch (error) {
        console.error('Map initialization error:', error);
        document.getElementById('map').innerHTML = '<p style="color: #a0aec0; padding: 20px;">Map failed to load. Please refresh the page.</p>';
    }
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
            
            // Get Gemini analysis for this route
            generateRouteAnalysis(startLocation, endLocation);
            
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

// Use current location as starting point
function useCurrentLocation() {
    const btn = document.getElementById('useCurrentLocation');
    btn.textContent = '📍 Getting...';
    btn.disabled = true;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Use reverse geocoding to get address
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: { lat: lat, lng: lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const address = results[0].formatted_address;
                        document.getElementById('startLocation').value = address;
                        btn.innerHTML = '<span>✓</span>';
                        btn.disabled = false;
                        
                        // Center map on current location
                        map.setCenter({ lat: lat, lng: lng });
                        
                        // Add marker at current location
                        new google.maps.Marker({
                            position: { lat: lat, lng: lng },
                            map: map,
                            title: 'Your Location',
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 12,
                                fillColor: '#0066ff',
                                fillOpacity: 1,
                                strokeColor: '#ffffff',
                                strokeWeight: 2
                            }
                        });
                    } else {
                        alert('Could not get address for current location');
                        btn.innerHTML = '<span>📍</span>';
                        btn.disabled = false;
                    }
                });
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please enable location services.');
                btn.innerHTML = '<span>📍</span>';
                btn.disabled = false;
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
        btn.innerHTML = '<span>📍</span>';
        btn.disabled = false;
    }
}

// Initialize map when page loads
window.addEventListener('load', initMap);

// Load mock data
async function loadMockData() {
    try {
        const response = await fetch('data/mock-data.json');
        mockData = await response.json();
    } catch (error) {
        console.error('Error loading mock data:', error);
    }
}

// Generate sidebar analysis with Gemini
async function generateMapSidebarAnalysis() {
    if (!mockData || !geminiAnalyzer) return;

    const analysisContainer = document.querySelector('.sidebar-section:first-of-type');
    if (!analysisContainer) return;

    // Add analysis section
    const analysisDiv = document.createElement('div');
    analysisDiv.className = 'sidebar-section gemini-analysis';
    analysisDiv.innerHTML = `
        <h2>🤖 AI Analysis</h2>
        <div class="analysis-loading">
            <p>Analyzing conditions...</p>
        </div>
    `;
    analysisContainer.parentNode.insertBefore(analysisDiv, analysisContainer.nextSibling);

    // Get Gemini analysis
    const analysis = await geminiAnalyzer.analyzeSnowplowData(mockData);
    
    analysisDiv.innerHTML = `
        <h2>🤖 AI Analysis</h2>
        <div class="analysis-content">
            <p>${analysis}</p>
        </div>
    `;
}

// Generate route-specific analysis
async function generateRouteAnalysis(startLocation, endLocation) {
    if (!mockData || !geminiAnalyzer) return;

    const routeResults = document.getElementById('routeResults');
    
    // Add analysis section
    const analysisDiv = document.createElement('div');
    analysisDiv.className = 'route-analysis-section';
    analysisDiv.innerHTML = `
        <h3>🤖 AI Route Analysis</h3>
        <div class="analysis-loading">
            <p>Analyzing route conditions...</p>
        </div>
    `;
    routeResults.appendChild(analysisDiv);

    // Get Gemini route analysis
    const analysis = await geminiAnalyzer.analyzeRouteConditions(mockData, startLocation, endLocation);
    
    analysisDiv.innerHTML = `
        <h3>🤖 AI Route Analysis</h3>
        <div class="route-analysis-content">
            <p>${analysis}</p>
        </div>
    `;
}