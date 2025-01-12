'use client';
import React, { useState } from 'react';
import styles from './page.module.css';
import HabitForm from '../../components/habits/habit-form';
import HabitList from '../../components/habits/habit-list';

export default function HabitTracker() {
    const [habits, setHabits] = useState([]);

    // Add a new habit
    const addHabit = (habit) => {
        setHabits([...habits, { ...habit, id: Date.now(), completed: false, skipped: false }]);
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
            <HabitForm addHabit={addHabit} />
            <HabitList habits={habits} skipHabit={skipHabit} completeHabit={completeHabit} />
        </div>
    );
}