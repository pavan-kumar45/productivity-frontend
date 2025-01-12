import React, { useState } from 'react';
import styles from './page.module.css';

export default function MoodLogs({ moodLogs }) {
    const [recoveryInputs, setRecoveryInputs] = useState({}); // Store recovery inputs by log ID
    const [showInput, setShowInput] = useState({}); // Control visibility of input for each log

    const handleRecoverySubmit = (id, input) => {
        if (input) {
            setRecoveryInputs((prev) => ({ ...prev, [id]: input }));
            setShowInput((prev) => ({ ...prev, [id]: false })); // Hide input after submission
        }
    };

    return (
        <div>
            <h2 className={styles.subheading}>Mood Logs</h2>
            {moodLogs.length > 0 ? (
                <ul className={styles.list}>
                    {moodLogs.map((log, index) => (
                        <li key={index} className={styles.logItem}>
                            <p><strong>Date:</strong> {log.date}</p>
                            <p><strong>Mood:</strong> {log.mood}</p>
                            <p><strong>Sentiment:</strong> {log.sentiment}</p>
                            <p><strong>Key Aspects:</strong> {log.keyAspects.join(', ')}</p>
                            <p><strong>Guidance:</strong> {log.guidance}</p>
                            {recoveryInputs[index] && (
                                <p className={styles.recovery}>
                                    <strong>Recovery:</strong> {recoveryInputs[index]}
                                </p>
                            )}
                            {!showInput[index] && (
                                <button
                                    className={styles.recoveryButton}
                                    onClick={() =>
                                        setShowInput((prev) => ({ ...prev, [index]: true }))
                                    }
                                >
                                    Add Recovery Input
                                </button>
                            )}
                            {showInput[index] && (
                                <div className={styles.recoveryInputContainer}>
                                    <textarea
                                        placeholder="Enter your recovery input..."
                                        className={styles.recoveryInput}
                                        onBlur={(e) =>
                                            handleRecoverySubmit(index, e.target.value)
                                        }
                                    />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No mood logs available yet.</p>
            )}
        </div>
    );
}