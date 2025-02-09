'use client';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Decoding JWT
import styles from './page.module.css';

export default function Logs() {
    const [activeTab, setActiveTab] = useState('mood');
    const [moodLogs, setMoodLogs] = useState([]);
    const [habitLogs, setHabitLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [editingRecoveryId, setEditingRecoveryId] = useState(null);
    const [recoveryInputs, setRecoveryInputs] = useState({});

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

    useEffect(() => {
        if (!userId) {
            return;
        }

        const fetchMoodLogs = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`http://localhost:8000/mood-logs/?userId=${userId}`);
                if (!response.ok) throw new Error('Failed to fetch mood logs.');
                const data = await response.json();
                setMoodLogs(data);
            } catch (err) {
                console.error('Error fetching mood logs:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchHabitLogs = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`http://localhost:8000/get-all-habits?userId=${userId}`);
                if (!response.ok) throw new Error('Failed to fetch habit logs');
                const data = await response.json();

                if (Array.isArray(data.habits)) {
                    const allInstances = data.habits.flatMap(habit =>
                        habit.instances.map(instance => ({
                            ...instance,
                            habitTitle: habit.title
                        }))
                    );
                    const sortedInstances = allInstances.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
                    setHabitLogs(sortedInstances);
                } else {
                    throw new Error('Data is not in expected format');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'mood') {
            fetchMoodLogs();
        } else if (activeTab === 'habit') {
            fetchHabitLogs();
        }
    }, [activeTab, userId]);

    const handleRecoveryInputChange = (id, value) => {
        setRecoveryInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleRecoverySubmit = async (id) => {
        const recoveryInput = recoveryInputs[id];
        if (!recoveryInput) {
            alert('Please enter a recovery input before submitting.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/habit-recovery-submit/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    logId: id,
                    userId: userId,
                    recovery: recoveryInput
                })
            });

            if (!response.ok) throw new Error('Failed to submit recovery input.');

            setHabitLogs(prevLogs =>
                prevLogs.map(log =>
                    log._id === id ? { ...log, recovery: recoveryInput } : log
                )
            );

            alert('Recovery input updated successfully!');
            setEditingRecoveryId(null);
        } catch (err) {
            console.error('Error submitting recovery input:', err.message);
            alert('Failed to submit recovery input.');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>User Logs</h1>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === 'mood' ? styles.activeTab : ''}`} onClick={() => setActiveTab('mood')}>Mood Logs</button>
                <button className={`${styles.tab} ${activeTab === 'habit' ? styles.activeTab : ''}`} onClick={() => setActiveTab('habit')}>Habit Logs</button>
            </div>

            {activeTab === 'mood' && (
                <div>
                    {loading ? <p>Loading mood logs...</p> : error ? <p className={styles.error}>Error: {error}</p> : (
                        <div className={styles.cardGrid}>
                            {moodLogs.map((log) => (
                                <div key={log._id} className={styles.card}>
                                    <p><strong>Date and Time:</strong> {`${log.date || 'N/A'} ${log.time || ''}`}</p>
                                    <p><strong>Mood:</strong> {log.mood}</p>
                                    <p><strong>Intensity:</strong> {log.intensity}</p>
                                    <p><strong>Sentiment:</strong> {log.sentiment}</p>
                                    <p><strong>Guidance:</strong> {log.guidance}</p>
                                    {log.aspects && <p><strong>Key Aspects:</strong> {log.aspects.join(', ')}</p>}
                                    <div className={styles.recoverySection}>
                                        <p><strong>Recovery:</strong> {editingRecoveryId === log._id ? (
                                            <>
                                                <input
                                                    type="text"
                                                    className={styles.recoveryInput}
                                                    placeholder="Add or edit your recovery suggestion..."
                                                    value={recoveryInputs[log._id] || ''}
                                                    onChange={(e) => handleRecoveryInputChange(log._id, e.target.value)}
                                                />
                                                <button className={styles.recoveryButton} onClick={() => handleRecoverySubmit(log._id)}>Save</button>
                                            </>
                                        ) : (
                                            <>
                                                {log.recovery ? (
                                                    <>
                                                        <span>{log.recovery}</span>
                                                        <button className={styles.editButton} onClick={() => {
                                                            setEditingRecoveryId(log._id);
                                                            setRecoveryInputs(prev => ({ ...prev, [log._id]: log.recovery || '' }));
                                                        }}>Edit</button>
                                                    </>
                                                ) : (
                                                    <button className={styles.addButton} onClick={() => {
                                                        setEditingRecoveryId(log._id);
                                                        setRecoveryInputs(prev => ({ ...prev, [log._id]: '' }));
                                                    }}>Add Recovery Input</button>
                                                )}
                                            </>
                                        )}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'habit' && (
                <div>
                    {loading ? <p>Loading habit logs...</p> : error ? <p className={styles.error}>Error: {error}</p> : (
                        <div className={styles.cardGrid}>
                            {habitLogs.map((instance, index) => (
                                <div key={index} className={styles.card}>
                                    <p><strong>Date:</strong> {new Date(instance.datetime).toLocaleString()}</p>
                                    <p><strong>Habit:</strong> {instance.habitTitle}</p>
                                    <p><strong>Status:</strong> {instance.status}</p>
                                    {instance.reason && <p><strong>Reason:</strong> {instance.reason}</p>}
                                    {instance.tip && <p><strong>Tip:</strong> {instance.tip}</p>}
                                    {instance.recovery && <p><strong>Recovery:</strong> {instance.recovery}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}