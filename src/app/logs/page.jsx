'use client'; // Enables client-side rendering for the page
import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Decoding JWT
import styles from './page.module.css';

export default function Logs() {
    const [activeTab, setActiveTab] = useState('mood'); // Track the active tab
    const [moodLogs, setMoodLogs] = useState([]);
    const [habitLogs, setHabitLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null); // Store userId decoded from JWT
    const [editingRecoveryId, setEditingRecoveryId] = useState(null); // Track which recovery is being edited
    const [recoveryInputs, setRecoveryInputs] = useState({}); // Track recovery inputs for each card

    // Decode JWT and set userId
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.sub); // Use the `sub` field as userId
            } catch (err) {
                console.error('Error decoding JWT:', err.message);
                setError('Invalid token. Please log in again.');
            }
        } else {
            setError('No authentication token found. Please log in.');
        }
    }, []);

    // Fetch logs based on active tab
    useEffect(() => {
        if (!userId) {
            return; // Don't fetch logs if userId is not set
        }

        // Fetch mood logs from the backend
        const fetchMoodLogs = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(`http://localhost:8000/mood-logs/?userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch mood logs.');
                }
                const data = await response.json();
                setMoodLogs(data);
            } catch (err) {
                console.error('Error fetching mood logs:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Fetch habit logs (dummy data for now)
        const fetchHabitLogs = () => {
            const dummyHabitLogs = [
                {
                    date: '2025-01-05',
                    habit: 'Workout',
                    status: 'Skipped',
                    reason: 'Too tired from work',
                    tip: 'Start with a shorter workout session next time.',
                },
                {
                    date: '2025-01-04',
                    habit: 'Reading',
                    status: 'Completed',
                },
            ];
            setHabitLogs(dummyHabitLogs);
        };

        if (activeTab === 'mood') {
            fetchMoodLogs();
        } else if (activeTab === 'habit') {
            fetchHabitLogs();
        }
    }, [activeTab, userId]); // Refetch when activeTab or userId changes

    // Handle recovery input change
    const handleRecoveryInputChange = (id, value) => {
        setRecoveryInputs((prev) => ({ ...prev, [id]: value }));
    };

    // Handle recovery submission
    const handleRecoverySubmit = async (id) => {
        const recoveryInput = recoveryInputs[id];
        if (!recoveryInput) {
            alert('Please enter a recovery input before submitting.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/recovery-submit/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    logId: id,
                    userId: userId,
                    recovery: recoveryInput,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit recovery input.');
            }

            // Update the moodLogs state to reflect the recovery input
            setMoodLogs((prevLogs) =>
                prevLogs.map((log) =>
                    log._id === id ? { ...log, recovery: recoveryInput } : log
                )
            );

            alert('Recovery input updated successfully!');
            setEditingRecoveryId(null); // Exit edit mode
        } catch (err) {
            console.error('Error submitting recovery input:', err.message);
            alert('Failed to submit recovery input.');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>User Logs</h1>

            {/* Display error messages */}
            {error && <p className={styles.error}>{error}</p>}

            {/* Tab navigation */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'mood' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('mood')}
                >
                    Mood Logs
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'habit' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('habit')}
                >
                    Habit Logs
                </button>
            </div>

            {/* Render content based on active tab */}
            {activeTab === 'mood' && (
                <div>
                    {loading ? (
                        <p>Loading mood logs...</p>
                    ) : error ? (
                        <p className={styles.error}>Error: {error}</p>
                    ) : moodLogs.length === 0 ? (
                        <p>No mood logs found for this user.</p>
                    ) : (
                        <div className={styles.cardGrid}>
                            {moodLogs.map((log) => (
                                <div key={log._id} className={styles.card}>
                                    <p><strong>Date and Time:</strong> {`${log.date || 'N/A'} ${log.time || ''}`}</p>
                                    <p><strong>Mood:</strong> {log.mood}</p>
                                    <p><strong>Intensity:</strong> {log.intensity}</p>
                                    <p><strong>Sentiment:</strong> {log.sentiment}</p>
                                    <p><strong>Guidance:</strong> {log.guidance}</p>
                                    {log.aspects && (
                                        <p><strong>Key Aspects:</strong> {log.aspects.join(', ')}</p>
                                    )}
                                    <div className={styles.recoverySection}>
                                        <p>
                                            <strong>Recovery:</strong>{' '}
                                            {editingRecoveryId === log._id ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        className={styles.recoveryInput}
                                                        placeholder="Add or edit your recovery suggestion..."
                                                        value={recoveryInputs[log._id] || ''}
                                                        onChange={(e) =>
                                                            handleRecoveryInputChange(log._id, e.target.value)
                                                        }
                                                    />
                                                    <button
                                                        className={styles.recoveryButton}
                                                        onClick={() => handleRecoverySubmit(log._id)}
                                                    >
                                                        Save
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {log.recovery ? (
                                                        <>
                                                            <span>{log.recovery}</span>
                                                            <button
                                                                className={styles.editButton}
                                                                onClick={() => {
                                                                    setEditingRecoveryId(log._id);
                                                                    setRecoveryInputs((prev) => ({
                                                                        ...prev,
                                                                        [log._id]: log.recovery || '',
                                                                    }));
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className={styles.addButton}
                                                            onClick={() => {
                                                                setEditingRecoveryId(log._id);
                                                                setRecoveryInputs((prev) => ({
                                                                    ...prev,
                                                                    [log._id]: '',
                                                                }));
                                                            }}
                                                        >
                                                            Add Recovery Input
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'habit' && (
                <div>
                    {habitLogs.length === 0 ? (
                        <p>No habit logs found.</p>
                    ) : (
                        <div className={styles.cardGrid}>
                            {habitLogs.map((log, index) => (
                                <div key={index} className={styles.card}>
                                    <p><strong>Date:</strong> {log.date}</p>
                                    <p><strong>Habit:</strong> {log.habit}</p>
                                    <p><strong>Status:</strong> {log.status}</p>
                                    {log.reason && <p><strong>Reason:</strong> {log.reason}</p>}
                                    {log.tip && <p><strong>Tip:</strong> {log.tip}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}