const API_BASE = 'https://api.freeprojectapi.com/api';

const HEADERS = { 'Content-Type': 'application/json' };

function buildUrl(path) {
    const cleanPath = String(path).replace(/^\/+/, '');
    return `${API_BASE}/${cleanPath}`;
}

async function apiGet(path) {
    const res = await fetch(buildUrl(path));

    if (!res.ok) {
        throw new Error(`API GET failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

async function apiPost(path, body) {
    const url = buildUrl(path);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            throw new Error(`API POST failed: ${res.status} ${res.statusText}`);
        }

        return res.json();
    } catch (error) {
        console.error('API request failed:', url, error);
        throw error;
    }
}

function showAlert(type, msg) {
    document.getElementById('alert').innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}


async function handleLogin() {
    console.log("login...");


    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    const res = await apiPost('/EmployeeApp/login', {
        userName: user,
        password: pass
    });

    if (res.result == true) {
        sessionStorage.setItem('user', JSON.stringify(res.data));

        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';

        loadInitialData();


   } else {
      showAlert('danger', res.message || 'Login failed.Please try again.');

   }

}


function clearForm() {
    const fields = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'gender',
        'dateOfJoining',
        'departmentId',
        'designationId',
        'employeeType',
        'salary'
    ];

    fields.forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
}

function loadEmployee() {
    console.log('Employee list refreshed.');
}

async function addEmployee() {
    console.log("Add");

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const gender = document.getElementById('gender').value.trim();
    const dateOfJoining = document.getElementById('dateOfJoining').value;
    const departmentId = Number(document.getElementById('departmentId').value);
    const designationId = Number(document.getElementById('designationId').value);
    const employeeType = document.getElementById('employeeType').value.trim();
    const salary = Number(document.getElementById('salary').value);

    if (!firstName || !lastName || !email || !phone || !gender || !dateOfJoining || !employeeType) {
        showAlert('danger', 'Please fill in all required employee fields.');
        return;
    }

    const empData = {
        firstName,
        lastName,
        email,
        phone,
        gender,
        dateOfJoining,
        departmentId: Number.isFinite(departmentId) ? departmentId : 0,
        designationId: Number.isFinite(designationId) ? designationId : 0,
        employeeType,
        salary: Number.isFinite(salary) ? salary : 0,
    };

    console.log('Create employee payload:', empData);

    try {
        const res = await apiPost('/EmployeeApp/CreateEmployee', empData);

        if (res && res.employeeId) {
            showAlert('success', 'Employee added Successfully!');
            clearForm();
            loadEmployee();
        } else if (res && res.result === true) {
            showAlert('success', 'Employee added Successfully!');
            clearForm();
            loadEmployee();
        } else {
            showAlert('danger', res && res.message ? res.message : 'Employee creation failed. Please try again.');
        }
    } catch (error) {
        console.error('Create employee failed:', error);
        showAlert('danger', 'Employee creation failed. Please check the API field format or required values.');
    }

}

