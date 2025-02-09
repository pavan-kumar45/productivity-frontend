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
        <div className={styles.habitSections}>
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

            <div className={styles.section}>
                <h2>All Habits</h2>
                <ul className={styles.list}>
                    {habits.map((habit) => (
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
        </div>
    );
}

function HabitInstance({ instance, onAction, setSkippedInstances, userId }) {
    const [status, setStatus] = useState(instance.status);
    const [reason, setReason] = useState(instance.reason || "");
    const [tip, setTip] = useState(instance.tip || "");
    const [completionMethod, setCompletionMethod] = useState(""); // New state for completion method
    const [isEditing, setIsEditing] = useState(false); // Track if we are editing or viewing the completion method

    // Fetch recovery text when the component mounts
    useEffect(() => {
        const fetchRecoveryText = async () => {
            try {
                const response = await fetch(`http://localhost:8000/get-all-habits?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    const habit = data.habits.find(h => h._id === instance.habitId);
                    if (habit) {
                        const habitInstance = habit.instances.find(i => i.datetime === instance.datetime);
                        if (habitInstance) {
                            setCompletionMethod(habitInstance.recovery || "");
                        }
                    }
                } else {
                    console.error("Failed to fetch habits.");
                }
            } catch (error) {
                console.error("Error fetching habits:", error);
            }
        };

        fetchRecoveryText();
    }, [instance.habitId, instance.datetime, userId]);

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
                `http://localhost:8000/skip-instance/${instance.habitId}?reason=${encodeURIComponent(skipReason)}&instance_datetime=${encodeURIComponent(instanceDatetime)}`,
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
                {status === "completed" && (
                    <div>
                        <span className={styles.completed}>Completed!</span>
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
        </li>
    );
}