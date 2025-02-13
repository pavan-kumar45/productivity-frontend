"use client";

import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import styles from "./page.module.css";
import Heatmap from "@/components/charts/moodbarchart";
import BarChart from "@/components/charts/bar-chart";
import PieChart from '@/components/charts/pie-chart';
import HabitHeatmap from '@/components/charts/habit-heatmap';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("Mood Logs");
    const [habitData, setHabitData] = useState([]);
    const [keywordData, setKeywordData] = useState([]);
    const [habitCompletionData, setHabitCompletionData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem('authToken');
                    return;
                }
                const userId = decodedToken.sub;

                async function fetchHabits() {
                    try {
                        const response = await fetch(`http://127.0.0.1:8000/get-all-habits?userId=${userId}`);
                        const data = await response.json();
                        const today = new Date().setHours(0, 0, 0, 0);

                        // Process data for habit completion heatmap
                        const habitCompletionData = data.habits.flatMap(habit => {
                            return habit.instances.map(instance => {
                                const instanceDate = new Date(instance.datetime).setHours(0, 0, 0, 0);
                                const isToday = instanceDate === today;
                                const status = instance.status === 'completed' ? 'completed' : (instance.status === 'pending' && !isToday) ? 'skipped' : instance.status;
                                return {
                                    date: new Date(instance.datetime).toISOString().split('T')[0], // Format date as YYYY-MM-DD
                                    habitName: habit.title,
                                    status
                                };
                            });
                        }).filter(instance => instance.status !== 'pending' || new Date(instance.date).setHours(0, 0, 0, 0) === today);

                        setHabitCompletionData(habitCompletionData);

                        const processedData = data.habits.map(habit => {
                            const completedCount = habit.instances.filter(instance => instance.status === 'completed').length;
                            const skippedCount = habit.instances.filter(instance => {
                                const instanceDate = new Date(instance.datetime).setHours(0, 0, 0, 0);
                                return (
                                    instance.status === 'skipped' ||
                                    (instance.status === 'pending' && instanceDate < today)
                                );
                            }).length;
                            return {
                                habitName: habit.title,
                                completedCount,
                                skippedCount,
                            };
                        });
                        setHabitData(processedData);

                        // Aggregate keywords from all instances
                        const keywordCounts = {};
                        data.habits.forEach(habit => {
                            habit.instances.forEach(instance => {
                                if (instance.tipKeywords) {
                                    instance.tipKeywords.forEach(keyword => {
                                        keyword = keyword.trim(); // Remove any leading/trailing spaces
                                        if (keywordCounts[keyword]) {
                                            keywordCounts[keyword]++;
                                        } else {
                                            keywordCounts[keyword] = 1;
                                        }
                                    });
                                }
                            });
                        });

                        // Convert keywordCounts to an array suitable for the PieChart
                        const keywordArray = Object.entries(keywordCounts).map(([keyword, count]) => ({
                            keyword,
                            count
                        }));

                        setKeywordData(keywordArray);
                    } catch (error) {
                        console.error("Error fetching habits:", error);
                    }
                }

                fetchHabits();
            } catch (error) {
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    // Dummy data for demonstration
    const moodData = [
        { day: "Mon", moodScore: 8 },
        { day: "Tue", moodScore: 5 },
        { day: "Wed", moodScore: 4 },
        { day: "Thu", moodScore: 6 },
        { day: "Fri", moodScore: 9 },
        { day: "Sat", moodScore: 7 },
        { day: "Sun", moodScore: 3 },
    ];

    // Example data
    // const keywordData = [
    //     { keyword: 'React', count: 10 },
    //     { keyword: 'JavaScript', count: 15 },
    //     { keyword: 'CSS', count: 5 },
    //     { keyword: 'HTML', count: 8 },
    // ];

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.heading}>Dashboard</h1>

            {/* Tab Navigation */}
            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${
                        activeTab === "Mood Logs" ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("Mood Logs")}
                >
                    Mood Visualization
                </div>
                <div
                    className={`${styles.tab} ${
                        activeTab === "Habit Logs" ? styles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("Habit Logs")}
                >
                    Habit Visualization
                </div>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === "Mood Logs" && (
                    <div className={styles.section}>
                        <Heatmap data={moodData} />
                    </div>
                )}
                {activeTab === "Habit Logs" && (
                    <div className={styles.cardContainer}>
                        <div className={styles.card}>
                            <BarChart data={habitData} />
                        </div>
                        <div className={styles.card}>
                            <PieChart data={keywordData} />
                        </div>
                        <div className={styles.card}>
                            <HabitHeatmap data={habitCompletionData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}