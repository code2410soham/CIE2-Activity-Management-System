document.addEventListener('DOMContentLoaded', async () => {
    // We can reuse the submissions API to list items to evaluate
    try {
        const res = await apiService.get('/api/v1/teacher/teacher-submissions');
        const tb = document.getElementById('eval-body');
        if(res.success && res.submissions) {
            tb.innerHTML = res.submissions.map(s => 
                <tr>
                    <td> ()</td>
                    <td></td>
                    <td></td>
                    <td id="score-"> / </td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="openEvalModal('', )">Evaluate</button>
                    </td>
                </tr>
            ).join('');
        }
    } catch(err) { console.error(err); }
});

window.openEvalModal = (subId, maxMarks) => {
    Swal.fire({
        title: 'Evaluate Submission',
        html: 
            <input type="number" id="marks" class="swal2-input" placeholder="Marks out of " />
            <textarea id="feedback" class="swal2-textarea" placeholder="Feedback..."></textarea>
        ,
        preConfirm: () => {
            return {
                marks: document.getElementById('marks').value,
                feedback: document.getElementById('feedback').value
            }
        }
    }).then(async res => {
        if(res.isConfirmed) {
            // submit to API
            const payload = { submission_id: subId, marks: res.value.marks, feedback: res.value.feedback };
            const token = localStorage.getItem('token');
            const data = await fetch(apiService.baseUrl + '/evaluate-submission.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(payload)
            }).then(r => r.json());
            if(data.success) { Swal.fire('Saved!', '', 'success'); document.getElementById('score-'+subId).innerHTML = res.value.marks+' / '+maxMarks; }
            else { Swal.fire('Error', data.error, 'error'); }
        }
    });
}
