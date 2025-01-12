import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Heatmap({ data }) {
    const chartRef = useRef(null);

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Mood Score',
                data: data.map((item) => item.moodScore),
                backgroundColor: data.map((item) =>
                    item.moodScore > 7 ? '#4CAF50' : item.moodScore > 4 ? '#FFC107' : '#F44336'
                ),
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Important for custom sizing
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    // Trigger resize on window resize
    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div
            style={{
                width: '100%',
                maxWidth: '800px',
                height: '400px',
                margin: '0 auto',
            }}
        >
            <h3>Mood Trends</h3>
            <Bar ref={chartRef} data={chartData} options={options} />
        </div>
    );
}