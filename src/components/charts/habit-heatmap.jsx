// components/charts/habit-heatmap.jsx

import React from 'react';
import { Tooltip } from 'react-tooltip';

function HabitHeatmap({ data }) {
    // Get unique habits
    const habits = [...new Set(data.map(d => d.habitName))];

    // Get unique dates, sort them, and take the last 20
    const dates = [...new Set(data.map(d => {
        const date = new Date(d.date);
        date.setDate(date.getDate() + 1); // Increment day by 1
        return date.toISOString().split('T')[0];
    }))]
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(-20); // Only take the last 20 dates

    // Create matrix and get color for each cell
    const getStatusColor = (status) => {
        return {
            'completed': 'green',
            'skipped': 'red',
            'pending': 'yellow',
            'unscheduled': '#d3d3d3', // Grey for unscheduled
        }[status] || '#ffffff';
    };

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    return (
        <div style={{ overflowX: 'auto' }}>
            <h2>Habit Completion Rate Over Time</h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `100px repeat(${dates.length}, 20px)`,
                gridTemplateRows: `repeat(${habits.length}, 20px) auto`,
                rowGap: '10px',
                columnGap: '4px',
                padding: '10px',
            }}>
                {/* Rows for each habit */}
                {habits.map((habit, rowIndex) => (
                    <React.Fragment key={habit}>
                        <div style={{ 
                            gridRow: rowIndex + 1,
                            gridColumn: 1,
                            textAlign: 'right',
                            paddingRight: '8px',
                            fontSize: '12px',
                            lineHeight: '20px',
                        }}>
                            {habit}
                        </div>
                        
                        {dates.map((date, colIndex) => {
                            const instance = data.find(d => 
                                d.habitName === habit && new Date(new Date(d.date).setDate(new Date(d.date).getDate() + 1)).toISOString().split('T')[0] === date
                            );
                            let status = instance ? instance.status : 'unscheduled';

                            // Ensure today's pending habits are marked as pending
                            if (date === today && (!instance || instance.status === 'pending')) {
                                status = 'pending';
                            }

                            // Convert MongoDB date format to YYYY-MM-DD
                            const formattedDate = new Date(new Date(date).setDate(new Date(date).getDate() + 1))
                                .toISOString().split('T')[0];
                            if (formattedDate === today && status === 'pending') {
                                status = 'pending';
                            }

                            console.log("Today's Date:", today);
                            console.log("Formatted Date:", formattedDate);
                            console.log("Habit Name:", habit);

                            return (
                                <div
                                    key={`${habit}-${date}`}
                                    style={{
                                        gridRow: rowIndex + 1,
                                        gridColumn: colIndex + 2,
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: status !== 'pending' ? getStatusColor(status) : undefined,
                                        backgroundImage: status === 'pending' 
                                            ? 'linear-gradient(90deg, #00ffff, #ff00ff, #00ffff)' 
                                            : undefined,
                                        backgroundSize: status === 'pending' ? '200% 100%' : undefined,
                                        animation: status === 'pending' ? 'pending-animation 2s linear infinite' : undefined,
                                        borderRadius: '3px',
                                    }}
                                    data-tooltip-id="heatmap-tooltip"
                                    data-tooltip-content={`${habit}\n${date}\nStatus: ${status}`}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}

                {/* Footer Row - Dates */}
                <div style={{ gridRow: habits.length + 1, gridColumn: 1 }}></div>
                {dates.map((date, colIndex) => (
                    console.log("heatmap dates:",date),
                    <div
                        key={date}
                        style={{
                            gridRow: habits.length + 1,
                            gridColumn: colIndex + 2,
                            fontSize: '8px',
                            writingMode: 'horizontal-tb',
                            textAlign: 'center',
                            lineHeight: '20px',
                        }}
                    >
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                    </div>
                ))}
            </div>
            <Tooltip id="heatmap-tooltip" />
        </div>
    );
}

export default HabitHeatmap;