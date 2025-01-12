'use client';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Guidance() {
    const [recoveryStrategies, setRecoveryStrategies] = useState([]);
    const [motivationalTips, setMotivationalTips] = useState([]);
    const [activeTab, setActiveTab] = useState('Recovery Strategies'); // Tab state

    // Simulate fetching data with dummy content
    useEffect(() => {
        // Dummy data for recovery strategies
        const dummyRecoveryStrategies = [
            'You recovered by exercising last time.',
            'Meditation helped improve your mood last week.',
            'Taking short breaks kept your stress levels in check.',
        ];

        // Dummy data for motivational tips
        const dummyMotivationalTips = [
            'Remember: progress over perfection.',
            'Small consistent actions lead to big changes.',
            'You’ve got this! Stay positive and keep going.',
        ];

        // Simulate API response delay
        setTimeout(() => {
            setRecoveryStrategies(dummyRecoveryStrategies);
            setMotivationalTips(dummyMotivationalTips);
        }, 500); // 500ms delay to mimic a real API call
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Personalized Guidance</h1>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'Recovery Strategies' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('Recovery Strategies')}
                >
                    Recovery Strategies
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'Motivational Tips' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('Motivational Tips')}
                >
                    Motivational Tips
                </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 'Recovery Strategies' && (
                    <div>
                        <h2>Recovery Strategies</h2>
                        <div className={styles.cardContainer}>
                            {recoveryStrategies.map((strategy, index) => (
                                <div className={styles.card} key={index}>
                                    {strategy}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'Motivational Tips' && (
                    <div>
                        <h2>Motivational Tips</h2>
                        <div className={styles.cardContainer}>
                            {motivationalTips.map((tip, index) => (
                                <div className={styles.card} key={index}>
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}