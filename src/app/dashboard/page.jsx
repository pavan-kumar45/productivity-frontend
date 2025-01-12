"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Heatmap from "@/components/charts/heatmap";
import BarChart from "@/components/charts/bar-chart";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("Mood Logs");

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

    const habitData = [
        { habitName: "Workout", completedCount: 5, skippedCount: 2 },
        { habitName: "Meditation", completedCount: 4, skippedCount: 3 },
        { habitName: "Reading", completedCount: 6, skippedCount: 1 },
    ];

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
                    <div className={styles.section}>
                        <BarChart data={habitData} />
                    </div>
                )}
            </div>
        </div>
    );
}