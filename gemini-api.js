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
        const result = await this.callGeminiAPI(prompt);
        return result && result.length > 0 ? result : this.getFallbackAnalysis();
    }

    async analyzeRouteConditions(mockData, startLocation, endLocation) {
        const prompt = this.buildRouteAnalysisPrompt(mockData, startLocation, endLocation);
        const result = await this.callGeminiAPI(prompt);
        return result && result.length > 0 ? result : this.getFallbackRouteAnalysis();
    }

    async generateTrafficPrediction(mockData) {
        const prompt = this.buildTrafficPredictionPrompt(mockData);
        const result = await this.callGeminiAPI(prompt);
        return result && result.length > 0 ? result : this.getFallbackTrafficAnalysis();
    }

    async generateSafetyInsights(mockData) {
        const prompt = this.buildSafetyInsightsPrompt(mockData);
        const result = await this.callGeminiAPI(prompt);
        return result && result.length > 0 ? result : this.getFallbackSafetyAnalysis();
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
            console.log('Calling Gemini API with prompt length:', prompt.length);
            
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

            console.log('Gemini API Response Status:', response.status);

            const data = await response.json();
            console.log('Gemini API Response:', data);

            if (!response.ok) {
                console.error('API Error:', data);
                throw new Error(`API Error: ${response.status}`);
            }

            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                const result = data.candidates[0].content.parts[0].text;
                console.log('Gemini API Success - Result length:', result.length);
                return result;
            } else if (data.error) {
                console.error('API Error Message:', data.error.message);
                throw new Error(data.error.message);
            } else {
                console.error('Unexpected response format:', data);
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Gemini API Exception:', error.message);
            return null;
        }
    }

    getFallbackAnalysis() {
        return `Analysis unavailable - Using cached insights:

Based on current snow conditions in NYC:
• Multiple snowplows active on major corridors
• 5th Avenue and Broadway showing good progress
• Park Avenue and Madison Ave still need clearing
• Expect 12-15 minute transit delays
• Recommend using recently cleared routes
• Monitor conditions every 10 minutes`;
    }

    getFallbackRouteAnalysis() {
        return `Route Safety Assessment: CAUTION

Travel Recommendation: 
Conditions are challenging but passable. Allow extra time for your journey.

Best Travel Mode: 
Public transit is experiencing 12-15 minute delays. Driving recommended with caution.

Specific Travel Tips:
1. Avoid Madison Avenue and Park Avenue if possible
2. Use recently cleared routes like Broadway and 5th Avenue
3. Drive slowly and maintain increased following distance
4. Check conditions again before departing
5. Have an alternative route ready

Estimated Delay Impact: +10-15 minutes added to normal travel time`;
    }

    getFallbackSafetyAnalysis() {
        return `Overall Safety Level: CAUTION

Top 3 Safety Risks:
1. Slippery road conditions on uncleared routes (Park Ave, Madison Ave)
2. Reduced visibility due to active snowfall
3. Increased vehicle accidents due to weather conditions

High-Risk Areas to Avoid:
• Madison Avenue (impassable - 7.2" snow)
• Park Avenue (caution zone - 5.6" snow, high winds)
• Side streets not yet cleared

Safety Recommendations:
• Reduce speed and maintain safe distances
• Use winter tires or chains
• Avoid unnecessary travel if possible
• Keep phone charged and have emergency contacts ready`;
    }

    getFallbackTrafficAnalysis() {
        return `Next 30 Minutes Prediction: WORSENING

Traffic Pattern Analysis:
Conditions expected to worsen slightly as snow continues. Most congestion on secondary routes.

Routes Likely to Become Congested:
• West Side Highway (already heavy - expect worse)
• Crosstown routes (Broadway to Park Ave)
• FDR Drive approach ramps

Routes Likely to Improve:
• Recently plowed Broadway corridor
• 5th Avenue north of Central Park
• Main arterials with active plow coverage

Overall Recommendation:
Avoid travel if possible. If you must travel, use Broadway or 5th Avenue. Expect delays on all routes.`;
    }
}