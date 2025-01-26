'use client';
import React, { useState , useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import styles from './page.module.css';
import HabitForm from '../../components/habits/habit-form';
import HabitList from '../../components/habits/habit-list';

function HabitFormComponent({ addHabit }) {
    const [title, setTitle] = useState('');
    const [repetition, setRepetition] = useState('daily');
    const [customDays, setCustomDays] = useState([]);
    const [time, setTime] = useState(''); // Add state for optional time

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const toggleDay = (day) => {
        setCustomDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addHabit({ title, repetition, customDays, time });
        setTitle('');
        setRepetition('daily');
        setCustomDays([]);
        setTime('');
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <input
                type="text"
                placeholder="Add a new habit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
            />
            <select
                value={repetition}
                onChange={(e) => setRepetition(e.target.value)}
                className={styles.select}
            >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom Days</option>
            </select>
            {repetition === 'custom' && (
                <div className={styles.customDaysContainer}>
                    {daysOfWeek.map((day) => (
                        <label key={day} className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={customDays.includes(day)}
                                onChange={() => toggleDay(day)}
                                className={styles.checkbox}
                            />
                            {day}
                        </label>
                    ))}
                </div>
            )}
            <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={styles.timeInput}
                placeholder="Optional time"
            />
            <button type="submit" className={styles.button}>Add Habit</button>
        </form>
    );
}

export default function HabitTracker() {
    const [habits, setHabits] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken'); // Replace with your token key
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    console.error('Token is expired. Redirecting to login.');
                    localStorage.removeItem('authToken');
                    return;
                }
                setUserId(decodedToken.sub); // Extract and set userId (sub)
            } catch (error) {
                console.error('Invalid token. Redirecting to login.', error);
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    // Add a new habit
    const addHabit = async (habit) => {
        if (!userId) {
            console.error('User not logged in. Cannot add habits.');
            return;
        }

        const newHabit = {
            ...habit,
            userId, // Include userId in the payload
        };

        try {
            const response = await fetch('http://localhost:8000/log-habit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newHabit),
            });

            if (!response.ok) {
                throw new Error('Failed to log habit');
            }

            const result = await response.json();
            console.log('Habit logged successfully:', result);
            setHabits([...habits, { ...habit, id: result.habitId }]);
        } catch (error) {
            console.error('Error logging habit:', error);
        }
    };
    

    // Mark habit as skipped
    const skipHabit = (id, reason) => {
        setHabits(
            habits.map((habit) =>
                habit.id === id ? { ...habit, skipped: true, reason } : habit
            )
        );
    };

    // Mark habit as completed
    const completeHabit = (id) => {
        setHabits(
            habits.map((habit) =>
                habit.id === id ? { ...habit, completed: true, skipped: false } : habit
            )
        );
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Habit Tracker</h1>
            <HabitFormComponent addHabit={addHabit} />
            <HabitList habits={habits} skipHabit={skipHabit} completeHabit={completeHabit} />
        </div>
    );
}
