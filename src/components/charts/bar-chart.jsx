import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data }) {
    const chartData = {
        labels: data.map((item) => item.habitName),
        datasets: [
            {
                label: 'Completed',
                data: data.map((item) => item.completedCount),
                backgroundColor: '#4CAF50',
            },
            {
                label: 'Skipped',
                data: data.map((item) => item.skippedCount),
                backgroundColor: '#F44336',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Habit Adherence',
            },
        },
    };

    return <Bar data={chartData} options={options} />;
}