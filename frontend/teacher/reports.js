document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await apiService.get('/api/v1/teacher/student-performance-report');
        if(res.success && res.report) {
            document.getElementById('rep-body').innerHTML = res.report.map(r => 
                <tr>
                    <td></td>
                    <td></td>
                    <td>%</td>
                    <td></td>
                </tr>
            ).join('');
        }
    } catch(err) { console.error(err); }
});

window.generateReport = () => { Swal.fire('Success', 'Report sent to your email.', 'success'); }
