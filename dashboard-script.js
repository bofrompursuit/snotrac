// Dashboard Script - AI Analysis Integration
let geminiAnalyzer;
let mockData;

// Initialize on page load
async function initDashboard() {
    console.log('Initializing Dashboard...');
    
    try {
        // Initialize Gemini Analyzer
        if (typeof GeminiAnalyzer === 'undefined') {
            console.error('GeminiAnalyzer class not found');
            showMockResults();
            return;
        }
        
        geminiAnalyzer = new GeminiAnalyzer('AIzaSyCoAC4mL8IplZfdBMD7Z-E2U-35jA2EAXE');
        console.log('GeminiAnalyzer initialized');
        
        // Load mock data
        await loadMockData();
        console.log('Mock data loaded');
        
        // Generate all initial analyses
        await generateSnowplowAnalysis();
        await generateSafetyInsights();
        await generateTrafficPrediction();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showMockResults();
    }
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
        if (analysis && analysis.length > 0) {
            container.innerHTML = `<p>${analysis}</p>`;
        } else {
            container.innerHTML = '<p>Unable to generate analysis.</p>';
        }
    } catch (error) {
        console.error('Snowplow analysis error:', error);
        container.innerHTML = `<p>${geminiAnalyzer.getFallbackAnalysis()}</p>`;
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
        if (analysis && analysis.length > 0) {
            container.innerHTML = `<p>${analysis}</p>`;
        } else {
            container.innerHTML = `<p>${geminiAnalyzer.getFallbackSafetyAnalysis()}</p>`;
        }
    } catch (error) {
        console.error('Safety analysis error:', error);
        container.innerHTML = `<p>${geminiAnalyzer.getFallbackSafetyAnalysis()}</p>`;
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
        if (analysis && analysis.length > 0) {
            container.innerHTML = `<p>${analysis}</p>`;
        } else {
            container.innerHTML = `<p>${geminiAnalyzer.getFallbackTrafficAnalysis()}</p>`;
        }
    } catch (error) {
        console.error('Traffic prediction error:', error);
        container.innerHTML = `<p>${geminiAnalyzer.getFallbackTrafficAnalysis()}</p>`;
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
        container.innerHTML = '<p style="color: var(--danger);">Unable to load data</p>';
        return;
    }

    container.innerHTML = '<div class="loading">Analyzing route: ' + startLocation + ' → ' + endLocation + '</div>';
    
    try {
        console.log('Analyzing route:', startLocation, 'to', endLocation);
        const analysis = await geminiAnalyzer.analyzeRouteConditions(mockData, startLocation, endLocation);
        
        if (analysis && analysis.length > 0) {
            console.log('Route analysis received, length:', analysis.length);
            container.innerHTML = `<p>${analysis}</p>`;
        } else {
            console.log('No analysis result, using fallback');
            container.innerHTML = `<p>${geminiAnalyzer.getFallbackRouteAnalysis()}</p>`;
        }
    } catch (error) {
        console.error('Route analysis exception:', error);
        container.innerHTML = `<p>${geminiAnalyzer.getFallbackRouteAnalysis()}</p>`;
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

// Show mock results if there's an error
function showMockResults() {
    console.log('Displaying mock results...');
    
    if (typeof geminiAnalyzer === 'undefined' || !geminiAnalyzer) {
        geminiAnalyzer = {
            getFallbackAnalysis: () => `Analysis unavailable - Using cached insights:

Based on current snow conditions in NYC:
• Multiple snowplows active on major corridors
• 5th Avenue and Broadway showing good progress
• Park Avenue and Madison Ave still need clearing
• Expect 12-15 minute transit delays
• Recommend using recently cleared routes
• Monitor conditions every 10 minutes`,
            getFallbackSafetyAnalysis: () => `Overall Safety Level: CAUTION

Top 3 Safety Risks:
1. Slippery road conditions on uncleared routes
2. Reduced visibility due to active snowfall
3. Increased vehicle accidents due to weather

High-Risk Areas to Avoid:
• Madison Avenue (impassable - 12" snow)
• Park Avenue (caution zone - 11" snow)`,
            getFallbackTrafficAnalysis: () => `Next 30 Minutes Prediction: WORSENING

Routes Likely to Become Congested:
• West Side Highway (already heavy)
• Crosstown routes
• FDR Drive

Recommendation: Use Broadway or 5th Avenue`
        };
    }
    
    document.getElementById('snowplowAnalysis').innerHTML = `<p>${geminiAnalyzer.getFallbackAnalysis()}</p>`;
    document.getElementById('safetyAnalysis').innerHTML = `<p>${geminiAnalyzer.getFallbackSafetyAnalysis()}</p>`;
    document.getElementById('trafficAnalysis').innerHTML = `<p>${geminiAnalyzer.getFallbackTrafficAnalysis()}</p>`;
}