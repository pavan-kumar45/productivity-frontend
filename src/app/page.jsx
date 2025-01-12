'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

export default function Home() {
    const [userName, setUserName] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false); // For toggling the dropdown menu

    // Restore user authentication state on page load
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserName(decodedToken.name); // Restore username from token
            } catch (error) {
                console.error("Error decoding token from localStorage:", error);
            }
        }
    }, []);

    // Handle Google Login success
    const handleGoogleSuccess = (credentialResponse) => {
        try {
            if (!credentialResponse.credential) {
                throw new Error("Credential response is missing the 'credential' field");
            }

            // Decode the JWT token
            const decodedToken = jwtDecode(credentialResponse.credential);
            console.log("Google User:", decodedToken);

            // Save token in localStorage
            localStorage.setItem("authToken", credentialResponse.credential);

            // Set the username
            setUserName(decodedToken.name);
        } catch (error) {
            console.error("Error decoding Google token:", error);
        }
    };

    // Handle Google Login failure
    const handleGoogleError = () => {
        console.error('Google Login Failed');
    };

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem("authToken"); // Clear token from localStorage
        setUserName(null); // Reset username
        setShowDropdown(false); // Close dropdown
    };

    // Toggle dropdown menu
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <GoogleOAuthProvider clientId="324196355188-glishm51qcpu5fjes6unnhiassr793fk.apps.googleusercontent.com">
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.loginContainer}>
                        {userName ? (
                            <div className={styles.userMenu}>
                                <p
                                    className={styles.userName}
                                    onClick={toggleDropdown}
                                >
                                    {userName}
                                </p>
                                {showDropdown && (
                                    <div className={styles.dropdownMenu}>
                                        <button
                                            className={styles.logoutButton}
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                            />
                        )}
                    </div>
                    <h1 className={styles.title}>Welcome to Productivity App</h1>
                    <p className={styles.subtitle}>
                        Track your moods, habits, and progress effortlessly!
                    </p>
                    <Link href="/mood-tracker">
                        <button className={styles.ctaButton}>Get Started</button>
                    </Link>
                </header>

                <section className={styles.features}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Mood Tracker</h2>
                        <p className={styles.cardDescription}>
                            Analyze your moods and receive actionable insights to improve your mental health.
                        </p>
                        <Link href="/mood-tracker">
                            <button className={styles.cardButton}>Explore</button>
                        </Link>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Habit Tracker</h2>
                        <p className={styles.cardDescription}>
                            Build better habits and track your streaks to stay consistent.
                        </p>
                        <Link href="/habits">
                            <button className={styles.cardButton}>Explore</button>
                        </Link>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Dashboard</h2>
                        <p className={styles.cardDescription}>
                            Visualize your mood trends and habit adherence with beautiful charts.
                        </p>
                        <Link href="/dashboard">
                            <button className={styles.cardButton}>Explore</button>
                        </Link>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Past Personalized Guidances</h2>
                        <p className={styles.cardDescription}>
                            Receive motivational tips tailored to your mood and habits.
                        </p>
                        <Link href="/guidance">
                            <button className={styles.cardButton}>Explore</button>
                        </Link>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Past Logs</h2>
                        <p className={styles.cardDescription}>
                            See your past logs and enter recovery methods if you tried and worked for you.
                        </p>
                        <Link href="/logs">
                            <button className={styles.cardButton}>Explore</button>
                        </Link>
                    </div>
                </section>

                <footer className={styles.footer}>
                    <p>© 2025 Productivity App. All rights reserved.</p>
                </footer>
            </div>
        </GoogleOAuthProvider>
    );
}