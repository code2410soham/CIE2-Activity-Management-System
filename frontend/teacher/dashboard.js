document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await apiService.get('/api/v1/teacher/dashboard');
        if(res.success && res.summary) {
            document.getElementById('kpi-1').textContent = res.summary.active_activities || 0;
            document.getElementById('kpi-2').textContent = res.summary.pending_evaluations || 0;
            document.getElementById('kpi-3').textContent = res.summary.published_results || 0;
        }
    } catch(err) { console.error(err); }
});
