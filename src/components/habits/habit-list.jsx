import React, { useState } from 'react';
import styles from './page.module.css';

export default function HabitList({ habits, skipHabit, completeHabit }) {
    const [guidance, setGuidance] = useState({}); // Stores guidance for each habit

    const handleSkip = (id) => {
        const reason = prompt('Why did you skip this habit?');
        if (reason) {
            skipHabit(id, reason);

            // Provide motivational tips based on the reason
            const tip = getMotivationalTip(reason);
            setGuidance((prev) => ({ ...prev, [id]: tip }));
        }
    };

    // Function to generate motivational tips based on the reason
    const getMotivationalTip = (reason) => {
        if (reason.toLowerCase().includes('busy')) {
            return 'It’s okay to have a busy day! Try to find 5 minutes for this habit tomorrow.';
        } else if (reason.toLowerCase().includes('forgot')) {
            return 'No worries! Setting a reminder can help you stay on track.';
        } else {
            return 'Consistency is key. Don’t be too hard on yourself—start again tomorrow!';
        }
    };

    return (
        <ul className={styles.list}>
            {habits.map((habit) => (
                <li key={habit.id} className={styles.item}>
                    <div>
                        <p
                            className={`${styles.habitName} ${
                                habit.completed ? styles.completedText : ''
                            }`}
                        >
                            {habit.name}
                        </p>
                        <p className={styles.habitDetails}>
                            Repetition: {habit.repetition}{' '}
                            {habit.time && `at ${habit.time}`}
                        </p>
                        {habit.skipped && (
                            <>
                                <p className={styles.reason}>Reason: {habit.reason}</p>
                                <p className={styles.guidance}>
                                    Tip: {guidance[habit.id]}
                                </p>
                            </>
                        )}
                    </div>
                    <div className={styles.buttons}>
                        {!habit.completed && !habit.skipped && (
                            <>
                                <button
                                    className={styles.completeButton}
                                    onClick={() => completeHabit(habit.id)}
                                >
                                    Complete
                                </button>
                                <button
                                    className={styles.skipButton}
                                    onClick={() => handleSkip(habit.id)}
                                >
                                    Skip
                                </button>
                            </>
                        )}
                        {habit.completed && <p className={styles.completed}>Completed</p>}
                    </div>
                </li>
            ))}
        </ul>
    );
}