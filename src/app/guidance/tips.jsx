import React from 'react';
import styles from './page.module.css';

export default function Tips({ recoveryData, motivationalTips }) {
    return (
        <div className={styles.tipsContainer}>
            {/* Recovery Strategies Section */}
            <div className={styles.recovery}>
                <h2 className={styles.sectionHeading}>Past Recovery Strategies</h2>
                {recoveryData.length > 0 ? (
                    <ul className={styles.list}>
                        {recoveryData.map((strategy, index) => (
                            <li key={index} className={styles.listItem}>
                                {strategy}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No recovery strategies available yet. Start tracking your progress!</p>
                )}
            </div>

            {/* Motivational Tips Section */}
            <div className={styles.motivation}>
                <h2 className={styles.sectionHeading}>Motivational Tips</h2>
                {motivationalTips.length > 0 ? (
                    <ul className={styles.list}>
                        {motivationalTips.map((tip, index) => (
                            <li key={index} className={styles.listItem}>
                                {tip}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Stay consistent, and you'll see results!</p>
                )}
            </div>
        </div>
    );
}