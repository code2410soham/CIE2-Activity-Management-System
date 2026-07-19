document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await apiService.get('/api/v1/admin/dashboard');
        if(res.success && res.summary) {
            document.getElementById('kpi-1').textContent = res.summary.total_users || 0;
            document.getElementById('kpi-2').textContent = res.summary.active_departments || 0;
            document.getElementById('kpi-3').textContent = res.summary.system_alerts || 0;
        }
    } catch(err) { console.error(err); }
});
