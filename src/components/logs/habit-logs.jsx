import React, { useState } from 'react';
import styles from './page.module.css';

export default function HabitLogs({ habitLogs }) {
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
            <h2 className={styles.subheading}>Habit Logs</h2>
            {habitLogs.length > 0 ? (
                <ul className={styles.list}>
                    {habitLogs.map((log, index) => (
                        <li key={index} className={styles.logItem}>
                            <p><strong>Date:</strong> {log.date}</p>
                            <p><strong>Habit:</strong> {log.habit}</p>
                            <p><strong>Status:</strong> {log.status}</p>
                            {log.status === 'Skipped' && (
                                <>
                                    <p><strong>Reason:</strong> {log.reason}</p>
                                    <p><strong>Tip:</strong> {log.tip}</p>
                                </>
                            )}
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
                <p>No habit logs available yet.</p>
            )}
        </div>
    );
}