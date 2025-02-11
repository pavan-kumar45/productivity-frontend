import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function HabitList({
    userId,
    habits,
    todaysInstances,
    skippedInstances,
    deleteHabit,
    setTodaysInstances,
    setSkippedInstances, // Pass setSkippedInstances here
}) {
    const [activeTab, setActiveTab] = useState("todaysHabits");

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const filteredHabits = habits.filter(habit => {
        if (activeTab === "todaysHabits") {
            return habit.date === today; // Show today's habits
        } else if (activeTab === "skippedHabits") {
            return habit.skipped && habit.date === today; // Show today's skipped habits
        } else if (activeTab === "allHabits") {
            return true; // Show all habits
        }
        return false;
    });

    const fetchTodaysInstances = async () => {
        const res = await fetch(`http://localhost:8000/get-todays-instances?userId=${userId}`);
        const data = await res.json();
        setTodaysInstances(data.instances);
    };

    const fetchSkippedInstances = async () => {
        const res = await fetch(`http://localhost:8000/get-skipped-instances?userId=${userId}`);
        const data = await res.json();
        setSkippedInstances(data.instances); // Update skipped instances
    };

    React.useEffect(() => {
        fetchTodaysInstances();
        fetchSkippedInstances(); // Fetch skipped habits when the component mounts
    }, []);

    const handleDeleteHabit = async (habitId) => {
        const response = await fetch(`http://localhost:8000/delete-habit/${habitId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Habit deleted successfully!");
            fetchTodaysInstances(); // Refresh today's instances
            deleteHabit(habitId); // Call the passed delete function for all habits
        } else {
            alert("Failed to delete habit. Please try again.");
        }
    };

    return (
        <div>
            <div className={styles.tabContainer}>
                <div
                    className={`${styles.tab} ${activeTab === "todaysHabits" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("todaysHabits")}
                >
                    Today's Habits
                </div>
                <div
                    className={`${styles.tab} ${activeTab === "skippedHabits" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("skippedHabits")}
                >
                    Skipped Habits
                </div>
                <div
                    className={`${styles.tab} ${activeTab === "allHabits" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("allHabits")}
                >
                    All Habits
                </div>
            </div>

            <div className={styles.habitSections}>
                {activeTab === "todaysHabits" && (
                    <div className={styles.section}>
                        <h2>Today's Habits</h2>
                        <ul className={styles.list}>
                            {todaysInstances.map((instance) => (
                                <HabitInstance
                                    key={instance.habitId + instance.datetime}
                                    instance={instance}
                                    onAction={fetchTodaysInstances}
                                    setSkippedInstances={setSkippedInstances}
                                    userId={userId}
                                />
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === "skippedHabits" && (
                    <div className={styles.section}>
                        <h2>Skipped Habits</h2>
                        <ul className={styles.list}>
                            {skippedInstances.map((instance) => (
                                <li key={instance.habitId + instance.datetime} className={styles.item}>
                                    <p>{instance.title}</p>
                                    <p>Reason: {instance.reason}</p>
                                    <p>Tip: {instance.tip}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === "allHabits" && (
                    <div className={styles.section}>
                        <h2>All Habits</h2>
                        <ul className={styles.list}>
                            {filteredHabits.map((habit) => (
                                <li key={habit._id} className={styles.item}>
                                    <p>{habit.title}</p>
                                    <p>
                                        Schedule: {habit.repetition === "daily"
                                            ? "Daily"
                                            : `Custom (${habit.customDays.join(", ")})`}
                                    </p>
                                    <button
                                        onClick={() => handleDeleteHabit(habit._id)}
                                        className={styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

function HabitInstance({ instance, onAction, setSkippedInstances, userId }) {
    const [status, setStatus] = useState(instance.status);
    const [reason, setReason] = useState(instance.reason || "");
    const [title, setTitle] = useState(instance.title || "");
    const [tip, setTip] = useState(instance.tip || "");
    const [completionMethod, setCompletionMethod] = useState(""); // New state for completion method
    const [isEditing, setIsEditing] = useState(false); // Track if we are editing or viewing the completion method

    // Handle marking the task as completed
    const handleComplete = async () => {
        const response = await fetch(`http://localhost:8000/complete-instance/${instance.habitId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completionMethod }),
        });

        if (response.ok) {
            setStatus("completed");
            onAction(); // Refresh the list
        } else {
            alert("Failed to mark as completed. Please try again.");
        }
    };

    const handleSkip = async () => {
        const skipReason = prompt("Why are you skipping this task?");
        const instanceDatetime = instance.datetime;

        if (skipReason) {
            const response = await fetch(
                `http://localhost:8000/skip-instance/${instance.habitId}?title=${encodeURIComponent(title)}&reason=${encodeURIComponent(skipReason)}&instance_datetime=${encodeURIComponent(instanceDatetime)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setStatus("skipped");
                setReason(skipReason);
                setTip(data.generated_tip); // Set tip from backend response
                onAction(); // Refresh today's instances
                fetchSkippedInstances(); // Refresh skipped instances
            } else {
                alert("Failed to skip the task. Please try again.");
            }
        }
    };

    const fetchSkippedInstances = async () => {
        const res = await fetch(`http://localhost:8000/get-skipped-instances?userId=${userId}`);
        const data = await res.json();
        setSkippedInstances(data.instances);
    };

    // Handle the submission of completion method
    const handleSubmitCompletionMethod = async () => {
        if (completionMethod) {
            try {
                const response = await fetch(`http://localhost:8000/submit-completion-method`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        habitId: instance.habitId,
                        completionMethod,
                        instanceDatetime: instance.datetime
                    })
                });

                if (response.ok) {
                    alert("Completion method submitted successfully!");
                    setIsEditing(false); // Stop editing after submission
                } else {
                    alert("Failed to submit completion method.");
                }
            } catch (error) {
                console.error("Submission error:", error);
                alert("Error submitting completion method.");
            }
        } else {
            alert("No completion method provided.");
        }
    };

    // Handle editing of the completion method
    const handleEditCompletionMethod = () => {
        setIsEditing(true);
    };

    // Handle undo action
    const handleUndo = async () => {
        const response = await fetch(`http://localhost:8000/undo-instance/${instance.habitId}?instance_datetime=${encodeURIComponent(instance.datetime)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });
    
        if (response.ok) {
            setStatus("pending");
            setReason("");
            setTip("");
            onAction(); // Refresh the list
            fetchSkippedInstances(); // Refresh skipped instances if needed
        } else {
            alert("Failed to undo the action. Please try again.");
        }
    };

    return (
        <li className={styles.item}>
            <div>
                <p>{instance.title}</p>
                <p>Scheduled: {new Date(instance.datetime).toLocaleString()}</p>
                {status === "pending" && (
                    <div className={styles.buttonGroup}>
                        <button onClick={handleComplete} className={styles.completeButton}>
                            Complete
                        </button>
                        <button onClick={handleSkip} className={styles.skipButton}>
                            Skip
                        </button>
                    </div>
                )}
                {(status === "completed" || status === "skipped") && (
                    <div>
                        <span className={status === "completed" ? styles.completed : styles.skipped}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}!
                        </span>
                        <button onClick={handleUndo} className={styles.undoButton}>
                            Undo
                        </button>
                        {status === "completed" && (
                            <div>
                                {isEditing ? (
                                    <div className={styles.completionMethod}>
                                        <input
                                            type="text"
                                            placeholder="How did you complete this task? (Optional)"
                                            value={completionMethod || ""}
                                            onChange={(e) => setCompletionMethod(e.target.value)} // Update state with the input value
                                            className={styles.completionInput}
                                        />
                                        <button
                                            onClick={handleSubmitCompletionMethod}
                                            className={styles.submitButton}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.completionMethodText}>
                                        <span>{completionMethod || ""}</span>
                                        <button
                                            onClick={handleEditCompletionMethod}
                                            className={styles.editButton}
                                        >
                                            {completionMethod ? "Edit" : "Add Recovery input"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {status === "skipped" && (
                            <div className={styles.skippedInfo}>
                                <span className={styles.completed}>Skipped!</span>
                                <p>Reason: {reason}</p>
                                <p>Tip: {tip}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </li>
    );
}