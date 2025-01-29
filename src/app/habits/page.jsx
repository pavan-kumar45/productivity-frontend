'use client';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import styles from './page.module.css';
import HabitList from '@/components/habits/habit-list.jsx';

export default function HabitTracker() {
    const [userId, setUserId] = useState(null);
    const [habits, setHabits] = useState([]); // State to store all habits
    const [todaysInstances, setTodaysInstances] = useState([]); // State to store today's instances
    const [skippedInstances, setSkippedInstances] = useState([]); // State to store skipped instances

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem('authToken');
                    return;
                }
                setUserId(decodedToken.sub);
            } catch (error) {
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    // Fetch all habits, today's instances, and skipped instances when userId changes
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            // Fetch all habits
            const habitsRes = await fetch(`http://localhost:8000/get-all-habits?userId=${userId}`);
            const habitsData = await habitsRes.json();
            setHabits(habitsData.habits);

            // Fetch today's instances
            const todayRes = await fetch(`http://localhost:8000/get-todays-instances?userId=${userId}`);
            const todayData = await todayRes.json();
            setTodaysInstances(todayData.instances);

            // Fetch skipped instances
            const skippedRes = await fetch(`http://localhost:8000/get-skipped-instances?userId=${userId}`);
            const skippedData = await skippedRes.json();
            setSkippedInstances(skippedData.instances);
        };

        fetchData();
    }, [userId]);

    // Add a new habit
    const addHabit = async (habit) => {
        if (!userId) return;

        try {
            const response = await fetch('http://localhost:8000/log-habit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...habit, userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to log habit');
            }

            // Refresh data after adding a habit
            const habitsRes = await fetch(`http://localhost:8000/get-all-habits?userId=${userId}`);
            const habitsData = await habitsRes.json();
            setHabits(habitsData.habits);

            const todayRes = await fetch(`http://localhost:8000/get-todays-instances?userId=${userId}`);
            const todayData = await todayRes.json();
            setTodaysInstances(todayData.instances);
        } catch (error) {
            console.error('Error adding habit:', error);
        }
    };

    // Delete a habit
    const deleteHabit = async (habitId) => {
        try {
            const response = await fetch(`http://localhost:8000/delete-habit/${habitId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete habit');
            }

            // Remove the deleted habit from the state
            setHabits((prevHabits) => prevHabits.filter((habit) => habit._id !== habitId));
        } catch (error) {
            console.error('Error deleting habit:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Habit Tracker</h1>
            <HabitFormComponent addHabit={addHabit} />
            <HabitList 
                userId={userId}
                habits={habits}
                todaysInstances={todaysInstances}
                skippedInstances={skippedInstances}
                deleteHabit={deleteHabit} // Pass deleteHabit as a prop
                setTodaysInstances={setTodaysInstances} // Pass setTodaysInstances as a prop
                setSkippedInstances={setSkippedInstances} 
            />
        </div>
    );
}

function HabitFormComponent({ addHabit }) {
    const [title, setTitle] = useState('');
    const [repetition, setRepetition] = useState('daily');
    const [customDays, setCustomDays] = useState([]);
    const [time, setTime] = useState('');

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const toggleDay = (day) => {
        setCustomDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const habitTime = time || "00:00"; // Default to "00:00" if time is empty
        addHabit({ title, repetition, customDays, time: habitTime });
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
                required
            />
            <select
                value={repetition}
                onChange={(e) => setRepetition(e.target.value)}
                className={styles.select}
            >
                <option value="daily">Daily</option>
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
            />
            <button type="submit" className={styles.button}>Add Habit</button>
        </form>
    );
}