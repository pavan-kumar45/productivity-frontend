import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import styles from './page.module.css';

export default function HabitList() {
    const [habits, setHabits] = useState([]);
    const [userId, setUserId] = useState(null);
    const [guidance, setGuidance] = useState({}); // Stores guidance for each habit

    // Fetch userId from token stored in localStorage
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    console.error('Token expired. Redirecting to login.');
                    localStorage.removeItem('authToken');
                    return;
                }
                setUserId(decodedToken.sub); // Set userId from token
            } catch (error) {
                console.error('Invalid token. Redirecting to login.', error);
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    // Fetch habits based on userId
    useEffect(() => {
        if (userId) {
            const fetchHabits = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/get-habits?userId=${userId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch habits');
                    }
                    const data = await response.json();
                    setHabits(data.habits);
                } catch (error) {
                    console.error('Error fetching habits:', error);
                }
            };

            fetchHabits();
        }
    }, [userId]);

    const handleSkip = async (id) => {

        console.log(id)
        const reason = prompt('Why did you skip this habit?');
        if (reason) {
            try {
                const response = await fetch(`http://localhost:8000/update-habit/skipped/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json', // Ensure the content type is JSON
                    },
                    body: JSON.stringify({ reason }), // Send reason as JSON
                });

                console.log(response.ok)
    
                if (!response.ok) {
                    throw new Error('Failed to update habit as skipped');
                }
    
                const data = await response.json();
                setHabits((prevHabits) =>
                    prevHabits.map((habit) =>
                        habit._id === id
                            ? { ...habit, skipped: true, completed: false, reason, tip: data.tip }
                            : habit
                    )
                );
    
                setGuidance((prev) => ({ ...prev, [id]: data.tip }));
            } catch (error) {
                console.error('Error skipping habit:', error);
            }
        }
    };

    const handleComplete = async (id) => {
        
        if (!id) {
            console.error("Invalid habit ID");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8000/update-habit/completed/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(response.ok)

            if (!response.ok) {
                throw new Error('Failed to update habit as completed');
            }

            setHabits((prevHabits) =>
                prevHabits.map((habit) =>
                    habit._id === id
                        ? { ...habit, completed: true, skipped: false }
                        : habit
                )
            );
        } catch (error) {
            console.error('Error completing habit:', error);
        }
    };

    const handleUndo = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/update-habit/undo/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to undo habit status');
            }

            setHabits((prevHabits) =>
                prevHabits.map((habit) =>
                    habit._id === id
                        ? { ...habit, completed: false, skipped: false, reason: null, tip: null }
                        : habit
                )
            );
        } catch (error) {
            console.error('Error undoing habit status:', error);
        }
    };

    return (
        <ul className={styles.list}>
            {habits.map((habit) => (
                <li key={habit._id} className={styles.item}>
                    <div>
                        <p
                            className={`${styles.habitName} ${
                                habit.completed ? styles.completedText : ''
                            }`}
                        >
                            {habit.title}
                        </p>
                        <p className={styles.habitDetails}>
                            Repetition: {habit.repetition}{' '}
                            {habit.repetition === 'custom' && habit.customDays.length > 0 && (
                                <span>({habit.customDays.join(', ')})</span>
                            )}
                            {habit.time && ` at ${habit.time}`}
                        </p>
                        {habit.skipped && (
                            <>
                                <p className={styles.reason}>Reason: {habit.reason}</p>
                                <p className={styles.guidance}>Tip: {habit.tip}</p>
                            </>
                        )}
                    </div>
                    <div className={styles.buttons}>
                        {!habit.completed && !habit.skipped && (
                            <>
                                <button
                                    className={styles.completeButton}
                                    onClick={() => handleComplete(habit._id)}
                                >
                                    Complete
                                </button>
                                <button
                                    className={styles.skipButton}
                                    onClick={() => handleSkip(habit._id)}
                                >
                                    Skip
                                </button>
                            </>
                        )}
                        {(habit.completed || habit.skipped) && (
                            <button
                                className={styles.undoButton}
                                onClick={() => handleUndo(habit._id)}
                            >
                                Undo
                            </button>
                        )}
                        {habit.completed && <p className={styles.completed}>Completed</p>}
                    </div>
                </li>
            ))}
        </ul>
    );
}