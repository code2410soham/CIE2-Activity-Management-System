document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await apiService.get('/api/v1/student/student-notifications');
        const list = document.getElementById('notif-list');
        if(res.success && res.notifications.length > 0) {
            list.innerHTML = res.notifications.map(n => 
                <div style='padding:16px; border:1px solid var(--border-glass); border-radius:12px; background:var(--bg-glass-card);'>
                    <div style='font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;'> + n.created_at + </div>
                    <div style='font-weight:600;'> + n.title + </div>
                    <div style='color:var(--text-secondary); margin-top:8px;'> + n.message + </div>
                </div>
            ).join('');
        } else {
            list.innerHTML = 'No new notifications.';
        }
    } catch(err) { console.error(err); }
});
document.getElementById('logout-btn').addEventListener('click', () => apiService.logout());
