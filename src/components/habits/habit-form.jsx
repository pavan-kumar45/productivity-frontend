import React, { useState } from 'react';
import styles from './page.module.css';

export default function HabitForm({ addHabit }) {
    const [habitName, setHabitName] = useState('');
    const [repetition, setRepetition] = useState('Daily');
    const [time, setTime] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (habitName.trim()) {
            addHabit({ name: habitName, repetition, time });
            setHabitName('');
            setRepetition('Daily');
            setTime('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <input
                type="text"
                placeholder="Add a new habit"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className={styles.input}
                required
            />
            <select
                value={repetition}
                onChange={(e) => setRepetition(e.target.value)}
                className={styles.select}
            >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
            </select>
            <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={styles.timeInput}
            />
            <button type="submit" className={styles.button}>
                Add Habit
            </button>
        </form>
    );
}