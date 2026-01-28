// Google Gemini API Integration for SNOTRAC
const GEMINI_API_KEY = 'AIzaSyCoAC4mL8IplZfdBMD7Z-E2U-35jA2EAXE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class GeminiAnalyzer {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = GEMINI_API_URL;
    }

    async analyzeSnowplowData(mockData) {
        const prompt = this.buildSnowplowAnalysisPrompt(mockData);
        return await this.callGeminiAPI(prompt);
    }

    async analyzeRouteConditions(mockData, startLocation, endLocation) {
        const prompt = this.buildRouteAnalysisPrompt(mockData, startLocation, endLocation);
        return await this.callGeminiAPI(prompt);
    }

    async generateTrafficPrediction(mockData) {
        const prompt = this.buildTrafficPredictionPrompt(mockData);
        return await this.callGeminiAPI(prompt);
    }

    async generateSafetyInsights(mockData) {
        const prompt = this.buildSafetyInsightsPrompt(mockData);
        return await this.callGeminiAPI(prompt);
    }

    buildSnowplowAnalysisPrompt(mockData) {
        return `You are SNOTRAC, a real-time snow mobility intelligence assistant for NYC. Analyze this snowplow and road condition data and provide a brief, actionable analysis for commuters.

DATA:
Active Snowplows: ${JSON.stringify(mockData.snowplows, null, 2)}
Road Conditions: ${JSON.stringify(mockData.roadConditions, null, 2)}
Weather: ${JSON.stringify(mockData.weatherSummary, null, 2)}

Provide:
1. Current snow removal status (1-2 sentences)
2. Most/Least passable corridors
3. Key recommendations for commuters
Keep response under 150 words, practical and direct.`;
    }

    buildRouteAnalysisPrompt(mockData, startLocation, endLocation) {
        return `You are SNOTRAC, a real-time snow mobility assistant. Analyze route conditions from "${startLocation}" to "${endLocation}" during this snowstorm.

DATA:
Road Conditions: ${JSON.stringify(mockData.roadConditions, null, 2)}
Traffic: ${JSON.stringify(mockData.trafficData, null, 2)}
Transit: ${JSON.stringify(mockData.transitData, null, 2)}
Weather: ${JSON.stringify(mockData.weatherSummary, null, 2)}

Provide:
1. Route Safety Assessment (Low/Medium/High risk)
2. Best travel mode recommendation (driving/transit/wait)
3. Specific travel tips for this route
4. Estimated delay impact
Keep response under 120 words, concise and actionable.`;
    }

    buildTrafficPredictionPrompt(mockData) {
        return `You are SNOTRAC. Based on this live snowstorm data, predict traffic patterns for the next 30-60 minutes.

DATA:
Current Traffic: ${JSON.stringify(mockData.trafficData, null, 2)}
Snowplows: ${JSON.stringify(mockData.snowplows, null, 2)}
Weather Forecast: ${JSON.stringify(mockData.weatherSummary, null, 2)}

Provide:
1. Next 30 minutes prediction (worsening/improving/stable)
2. Routes likely to become congested
3. Routes likely to improve
4. Overall recommendation
Keep response under 130 words.`;
    }

    buildSafetyInsightsPrompt(mockData) {
        return `You are SNOTRAC, a safety-focused snow mobility AI. Assess current conditions and provide safety recommendations.

DATA:
Road Conditions: ${JSON.stringify(mockData.roadConditions, null, 2)}
Incidents: ${JSON.stringify(mockData.incidents, null, 2)}
Weather: ${JSON.stringify(mockData.weatherSummary, null, 2)}
Temperature & Wind: ${JSON.stringify({temp: mockData.weatherSummary.temperature, wind: mockData.weatherSummary.windSpeed}, null, 2)}

Provide:
1. Overall Safety Level (Safe/Caution/Unsafe)
2. Top 3 Safety Risks
3. High-Risk Areas to Avoid
4. Safety Recommendations
Keep response under 120 words, practical and clear.`;
    }

    async callGeminiAPI(prompt) {
        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            
            throw new Error('Unexpected API response format');
        } catch (error) {
            console.error('Gemini API Error:', error);
            return 'Unable to generate analysis at this time.';
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAnalyzer;
}