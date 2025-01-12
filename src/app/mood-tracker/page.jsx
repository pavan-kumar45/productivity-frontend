'use client'; // Enables client-side rendering for the page
import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import styles from './page.module.css';

export default function MoodTracker() {
    const [mood, setMood] = useState('');
    const [intensity, setIntensity] = useState(5);
    const [result, setResult] = useState(null);
    const [userId, setUserId] = useState(''); // Stores the `sub` field from the decoded token
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [error, setError] = useState(''); // State for errors

    // Function to decode JWT and extract userId (sub)
    const decodeToken = () => {
        const token = localStorage.getItem('authToken'); // Replace with your token key
        if (token) {
            try {
                // Decode the token
                const decodedToken = jwtDecode(token);

                // Check token expiration
                const isTokenExpired = decodedToken.exp * 1000 < Date.now();
                if (isTokenExpired) {
                    console.error('Token is expired. Redirecting to login.');
                    setError('Your session has expired. Please log in again.');
                    localStorage.removeItem('authToken'); // Clear expired token
                    return;
                }

                // Set userId from the decoded token
                setUserId(decodedToken.sub); // Set the unique identifier (sub)
            } catch (err) {
                console.error('Error decoding token:', err.message);
                setError('Invalid authentication token. Please log in again.');
            }
        } else {
            console.error('No auth token found in localStorage.');
            setError('No authentication token found. Please log in.');
        }
    };

    // Decode the token when the component mounts
    useEffect(() => {
        decodeToken();
    }, []);

    // Submit handler for the mood form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true while API request is in progress

        try {
            // Make an API call to the FastAPI backend
            const response = await fetch('http://localhost:8000/analyze/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId, // Use userId extracted from the token
                    mood: mood,
                    intensity: parseInt(intensity, 10), // Ensure intensity is an integer
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze mood. Please try again.');
            }

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error analyzing mood: ' + error.message);
        } finally {
            setLoading(false); // Reset loading state after request is complete
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Mood Tracker</h1>
            {/* Display error messages */}
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
                <textarea
                    className={styles.textarea}
                    rows="4"
                    placeholder="How are you feeling today?"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                />
                <div className={styles.intensity}>
                    <label>Mood Intensity: {intensity}</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={intensity}
                        onChange={(e) => setIntensity(e.target.value)}
                    />
                </div>
                <button type="submit" className={styles.button} disabled={loading || !userId}>
                    {loading ? 'Analyzing...' : 'Analyze Mood'}
                </button>
            </form>

            {/* Display results if available */}
            {result && (
                <div className={styles.result}>
                    <h2>Analysis Results:</h2>
                    <p><strong>Sentiment:</strong> {result.sentiment}</p>
                    <p><strong>Guidance:</strong> {result.guidance}</p>
                    <p><strong>Key Aspects:</strong> {result.aspects.join(', ')}</p>
                </div>
            )}
        </div>
    );
}