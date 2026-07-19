document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await apiService.get('/api/v1/student/student-profile');
        if(res.success && res.profile) {
            const p = res.profile;
            document.getElementById('prof-details').innerHTML = 
                <div><span style='color:var(--text-muted)'>Name:</span> <strong> + p.username + </strong></div>
                <div><span style='color:var(--text-muted)'>Email:</span>  + p.email + </div>
                <div><span style='color:var(--text-muted)'>USN / PRN:</span>  + p.usn + </div>
                <div><span style='color:var(--text-muted)'>Department:</span>  + p.department + </div>
                <div><span style='color:var(--text-muted)'>Term:</span>  + p.term +  -  + p.academic_year + </div>
                <div><span style='color:var(--text-muted)'>Section:</span>  + p.section + </div>
                <div><span style='color:var(--text-muted)'>Admission Year:</span>  + p.admission_year + </div>
            ;
        }
    } catch(err) { console.error(err); }
});
document.getElementById('logout-btn').addEventListener('click', () => apiService.logout());
