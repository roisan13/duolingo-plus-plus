import React, { useState, useEffect } from 'react';

const VocabularyAnalysis = ({ sessionId, onBack }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);

    const languages = [
        { id: 'french', name: 'French' },
        { id: 'spanish', name: 'Spanish' },
        { id: 'german', name: 'German' },
        { id: 'italian', name: 'Italian' }
    ];

    const fetchAnalysis = async (language) => {
        if (!sessionId || !language) return;
        
        try {
            setLoading(true);
            setError(null);

            // Here I'm still somehow getting Two identical requests at the same time but still no idea why
            const response = await fetch(`http://localhost:8000/analyze_vocabulary?session_id=${sessionId}&language=${language}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze vocabulary');
            }
            
            // Parse the recommendations JSON string
            let parsedRecommendations;
            try {
                parsedRecommendations = JSON.parse(data.recommendations);
            } catch (parseError) {
                console.error('Failed to parse recommendations:', parseError);
                console.error('Raw recommendations string:', data.recommendations);
                throw new Error('Failed to parse vocabulary recommendations');
            }
            
            const parsedData = {
                ...data,
                recommendations: parsedRecommendations
            };
            
            setAnalysis(parsedData);
        } catch (err) {
            console.error('Error in fetchAnalysis:', err);
            setError(err.message || 'Failed to analyze vocabulary');
            setAnalysis(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageSelect = (language) => {
        setSelectedLanguage(language);
        fetchAnalysis(language);
    };

    if (!selectedLanguage) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Select Language for Analysis</h1>
                    <div className="grid grid-cols-2 gap-4">
                        {languages.map((lang) => (
                            <button
                                key={lang.id}
                                onClick={() => handleLanguageSelect(lang.id)}
                                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-xl font-semibold text-gray-800"
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl text-gray-600">Analyzing your vocabulary...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Vocabulary Analysis</h1>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Back to Menu
                        </button>
                    </div>
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Vocabulary Analysis</h1>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Back to Menu
                        </button>
                    </div>
                    <div className="text-xl text-gray-600">No vocabulary analysis available</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Vocabulary Analysis</h1>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Back to Menu
                    </button>
                </div>
                
                {/* Most Used Words */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Used Words</h2>
                    <div className="flex flex-wrap gap-3">
                        {analysis.top_words && analysis.top_words.map((word, index) => (
                            <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-lg">
                                {word}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Word Recommendations</h2>
                    <div className="space-y-8">
                        {analysis.recommendations && analysis.recommendations.map((rec) => (
                            <div key={rec.word} className="border-b border-gray-200 pb-8 last:border-b-0">
                                <h3 className="text-2xl font-medium text-gray-900 mb-4">{rec.word}</h3>
                                <div className="space-y-4">
                                    {rec.synonyms && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Synonyms: </span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {rec.synonyms.map((synonym, index) => (
                                                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                                        {synonym}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {rec.description && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Description: </span>
                                            <p className="mt-2 text-gray-700">{rec.description}</p>
                                        </div>
                                    )}
                                    {rec.example && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Example: </span>
                                            <p className="mt-2 text-gray-700 italic">{rec.example}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VocabularyAnalysis; 