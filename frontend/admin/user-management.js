document.addEventListener('DOMContentLoaded', async () => {
    fetchUsers();
});

async function fetchUsers() {
    try {
        const res = await apiService.get('/api/v1/admin/user-management');
        const tb = document.getElementById('user-body');
        if(res.success && res.users) {
            tb.innerHTML = res.users.map(u => 
                <tr>
                    <td><br><span style='font-size:0.8rem; color:var(--text-muted);'></span></td>
                    <td></td>
                    <td><span class='badge '></span></td>
                    <td>
                        <button class='btn btn-sm btn-outline'>Edit</button>
                    </td>
                </tr>
            ).join('');
        }
    } catch(err) { console.error(err); }
}

window.addUserModal = () => {
    Swal.fire({
        title: 'Add User',
        html: 
            <input type='text' id='u_name' class='swal2-input' placeholder='Username' />
            <input type='email' id='u_email' class='swal2-input' placeholder='Email' />
            <select id='u_role' class='swal2-select' style='width: 80%; display:block; margin: 10px auto;'><option value='student'>Student</option><option value='teacher'>Teacher</option></select>
            <input type='password' id='u_pass' class='swal2-input' placeholder='Password' />
        ,
        preConfirm: () => {
             // In real app, we would send this to POST /api/v1/admin/user-management
             return { succ: true }
        }
    }).then(r => { if(r.isConfirmed) Swal.fire('Success', 'User created', 'success') });
}
