document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await apiService.get('/api/v1/student/student-dashboard');
        if(res.success) {
            const data = res.performance_trend;
            new Chart(document.getElementById('perf-chart'), {
                type: 'bar',
                data: {
                    labels: data.map(d => d.label.substring(0,12)),
                    datasets: [{ label: 'Score %', data: data.map(d => d.score), backgroundColor: '#4338ca', borderRadius: 8 }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });

            const grid = document.getElementById('perf-grid');
            grid.innerHTML = res.subject_analytics.map(s => 
                <div class='glass-panel kpi-card' style='flex-direction:column; gap:4px;'>
                   <strong style='font-size:1.1rem;'> + s.subject_name + </strong>
                   <p style='color:var(--text-muted); text-transform:none;'> + s.percentage + % Score -  + s.completion_rate + % Complete</p>
                </div>
            ).join('');
        }
    } catch(err) { console.error(err); }
});
document.getElementById('logout-btn').addEventListener('click', () => apiService.logout());
