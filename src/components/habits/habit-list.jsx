import React from "react";
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
    // Fetch today's instances when an action is performed
    const fetchTodaysInstances = async () => {
        const res = await fetch(`http://localhost:8000/get-todays-instances?userId=${userId}`);
        const data = await res.json();
        setTodaysInstances(data.instances);
    };

    // Fetch skipped instances
    const fetchSkippedInstances = async () => {
        const res = await fetch(`http://localhost:8000/get-skipped-instances?userId=${userId}`);
        const data = await res.json();
        setSkippedInstances(data.instances); // Update skipped instances
    };

    // Fetch data when the component is mounted
    React.useEffect(() => {
        fetchTodaysInstances();
        fetchSkippedInstances(); // Fetch skipped habits when the component mounts
    }, []);

    // Handle delete habit
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
            {/* Today's Habits Section */}
            <div className={styles.section}>
                <h2>Today's Habits</h2>
                <ul className={styles.list}>
                    {todaysInstances.map((instance) => (
                        <HabitInstance
                            key={instance.habitId + instance.datetime}
                            instance={instance}
                            onAction={fetchTodaysInstances}
                            setSkippedInstances={setSkippedInstances} // Pass setSkippedInstances here
                            userId={userId}
                        />
                    ))}
                </ul>
            </div>

            {/* Skipped Habits Section */}
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

            {/* All Habits Section */}
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

function HabitInstance({ instance, onAction, setSkippedInstances,userId }) {
    const [status, setStatus] = React.useState(instance.status);
    const [reason, setReason] = React.useState(instance.reason || "");
    const [tip, setTip] = React.useState(instance.tip || "");

    // Handle marking the task as completed
    const handleComplete = async () => {
        const response = await fetch(`http://localhost:8000/complete-instance/${instance.habitId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
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
        setSkippedInstances(data.instances);  // Assuming setSkippedInstances is available to update the skipped instances
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
                    <span className={styles.completed}>Completed!</span>
                )}
                {status === "skipped" && (
                    <div className={styles.skippedInfo}>
                        <span className={styles.completed}>Skipped!</span>
                        <p>Reason: {reason}</p>
                        <p>Tip: {tip}</p> {/* Use tip from state */}
                    </div>
                )}
            </div>
        </li>
    );
}