// Dashboard Script - AI Analysis Integration
let geminiAnalyzer;
let mockData;

// Initialize on page load
async function initDashboard() {
    geminiAnalyzer = new GeminiAnalyzer('AIzaSyCoAC4mL8IplZfdBMD7Z-E2U-35jA2EAXE');
    await loadMockData();
    
    // Generate all initial analyses
    await generateSnowplowAnalysis();
    await generateSafetyInsights();
    await generateTrafficPrediction();
}

// Load mock data
async function loadMockData() {
    try {
        const response = await fetch('data/mock-data.json');
        mockData = await response.json();
        updateDataSummary();
    } catch (error) {
        console.error('Error loading mock data:', error);
    }
}

// Generate Snowplow Analysis
async function generateSnowplowAnalysis() {
    const container = document.getElementById('snowplowAnalysis');
    
    if (!mockData || !geminiAnalyzer) {
        container.innerHTML = '<div class="loading">Unable to load data</div>';
        return;
    }

    container.innerHTML = '<div class="loading">Analyzing snowplow operations...</div>';
    
    try {
        const analysis = await geminiAnalyzer.analyzeSnowplowData(mockData);
        container.innerHTML = `<p>${analysis}</p>`;
    } catch (error) {
        container.innerHTML = `<p>Error generating analysis: ${error.message}</p>`;
    }
}

// Generate Safety Insights
async function generateSafetyInsights() {
    const container = document.getElementById('safetyAnalysis');
    
    if (!mockData || !geminiAnalyzer) {
        container.innerHTML = '<div class="loading">Unable to load data</div>';
        return;
    }

    container.innerHTML = '<div class="loading">Analyzing safety conditions...</div>';
    
    try {
        const analysis = await geminiAnalyzer.generateSafetyInsights(mockData);
        container.innerHTML = `<p>${analysis}</p>`;
    } catch (error) {
        container.innerHTML = `<p>Error generating analysis: ${error.message}</p>`;
    }
}

// Generate Traffic Prediction
async function generateTrafficPrediction() {
    const container = document.getElementById('trafficAnalysis');
    
    if (!mockData || !geminiAnalyzer) {
        container.innerHTML = '<div class="loading">Unable to load data</div>';
        return;
    }

    container.innerHTML = '<div class="loading">Predicting traffic patterns...</div>';
    
    try {
        const analysis = await geminiAnalyzer.generateTrafficPrediction(mockData);
        container.innerHTML = `<p>${analysis}</p>`;
    } catch (error) {
        container.innerHTML = `<p>Error generating prediction: ${error.message}</p>`;
    }
}

// Analyze custom route
async function analyzeCustomRoute() {
    const startLocation = document.getElementById('routeStart').value.trim();
    const endLocation = document.getElementById('routeEnd').value.trim();
    const container = document.getElementById('routeAnalysis');

    if (!startLocation || !endLocation) {
        container.innerHTML = '<p style="color: var(--danger);">Please enter both start and end locations</p>';
        return;
    }

    if (!mockData || !geminiAnalyzer) {
        container.innerHTML = '<div class="loading">Unable to load data</div>';
        return;
    }

    container.innerHTML = '<div class="loading">Analyzing route conditions for ' + startLocation + ' → ' + endLocation + '...</div>';
    
    try {
        console.log('Requesting route analysis for:', startLocation, 'to', endLocation);
        const analysis = await geminiAnalyzer.analyzeRouteConditions(mockData, startLocation, endLocation);
        container.innerHTML = `<p>${analysis}</p>`;
    } catch (error) {
        console.error('Route analysis error:', error);
        container.innerHTML = `<p>Error analyzing route: ${error.message}</p>`;
    }
}

// Refresh individual analysis
async function refreshAnalysis(type) {
    switch(type) {
        case 'snowplow':
            await generateSnowplowAnalysis();
            break;
        case 'safety':
            await generateSafetyInsights();
            break;
        case 'traffic':
            await generateTrafficPrediction();
            break;
        case 'route':
            if (document.getElementById('routeStart').value && document.getElementById('routeEnd').value) {
                await analyzeCustomRoute();
            }
            break;
    }
}

// Update data summary with mock data
function updateDataSummary() {
    if (!mockData) return;

    // Active snowplows
    const activePlows = mockData.snowplows.filter(p => p.status === 'active').length;
    document.getElementById('activePlows').textContent = activePlows;

    // Routes cleared (calculate from road conditions)
    const clearedCount = mockData.roadConditions.filter(r => r.condition === 'cleared').length;
    const clearancePercent = Math.round((clearedCount / mockData.roadConditions.length) * 100);
    document.getElementById('routesCleared').textContent = clearancePercent + '%';

    // Transit delay from mock data
    const transitDelay = mockData.transitData.busDelay;
    document.getElementById('transitDelay').textContent = transitDelay;

    // Determine safety level from conditions
    const hasImpassable = mockData.roadConditions.some(r => r.condition === 'impassable');
    const hasCaution = mockData.roadConditions.some(r => r.condition === 'caution');
    
    const safetyElement = document.getElementById('safetyLevel');
    if (hasImpassable) {
        safetyElement.textContent = 'Unsafe';
        safetyElement.className = 'summary-value danger';
    } else if (hasCaution) {
        safetyElement.textContent = 'Caution';
        safetyElement.className = 'summary-value warning';
    } else {
        safetyElement.textContent = 'Safe';
        safetyElement.className = 'summary-value success';
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);