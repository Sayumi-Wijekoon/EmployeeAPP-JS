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

function formatDateValue(value) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getEmployeeArray(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.employees)) return payload.employees;
    return [];
}

async function loadEmployee() {
    const tableBody = document.querySelector('#employeeTableBody');

    if (!tableBody) {
        return;
    }

    try {
        const payload = await apiGet('/EmployeeApp/GetEmployees');
        const employees = getEmployeeArray(payload);

        if (!employees.length) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No employees found.</td></tr>';
            return;
        }

        tableBody.innerHTML = employees.map((emp) => {
            const firstName = emp.firstName || emp.first_name || '';
            const lastName = emp.lastName || emp.last_name || '';
            const fullName = emp.fullName || [firstName, lastName].filter(Boolean).join(' ') || emp.name || '';
            const email = emp.email || '';
            const phone = emp.phone || emp.phoneNumber || '';
            const gender = emp.gender || '';
            const dateOfJoining = formatDateValue(emp.dateOfJoining || emp.joinedDate || '');
            const employeeType = emp.employeeType || '';
            const salary = emp.salary ?? '';
            const departmentName = emp.departmentName || emp.department?.name || emp.departmentNameText || '';
            const designationName = emp.designationName || emp.designation?.name || emp.designationNameText || '';

            return `
                <tr>
                    <td>${fullName}</td>
                    <td>${email}</td>
                    <td>${phone}</td>
                    <td>${gender}</td>
                    <td>${dateOfJoining}</td>
                    <td>${employeeType}</td>
                    <td>${salary}</td>
                    <td>${departmentName}</td>
                    <td>${designationName}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load employees:', error);
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Failed to load employees.</td></tr>';
    }
}

window.onload = function () {
    if (document.querySelector('#employeeTableBody')) {
        loadEmployee();
    }
};

async function addEmployee() {
    console.log("Add");

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const gender = document.getElementById('gender').value.trim();
    const rawDateOfJoining = document.getElementById('dateOfJoining').value;
    const dateOfJoining = rawDateOfJoining ? `${rawDateOfJoining}:00` : '';
    const departmentId = Number(document.getElementById('departmentId').value);
    const designationId = Number(document.getElementById('designationId').value);
    const employeeType = document.getElementById('employeeType').value.trim();
    const salary = Number(document.getElementById('salary').value);

    if (!firstName || !lastName || !email || !phone || !gender || !dateOfJoining || !employeeType) {
        showAlert('danger', 'Please fill in all required employee fields.');
        return;
    }

    if (!Number.isFinite(departmentId) || departmentId <= 0) {
        showAlert('danger', 'Please enter a valid Department ID greater than 0.');
        return;
    }

    if (!Number.isFinite(designationId) || designationId <= 0) {
        showAlert('danger', 'Please enter a valid Designation ID greater than 0.');
        return;
    }

    if (!Number.isFinite(salary) || salary <= 0) {
        showAlert('danger', 'Please enter a valid salary greater than 0.');
        return;
    }

    const empData = {
        firstName,
        lastName,
        email,
        phone,
        gender,
        dateOfJoining,
        departmentId,
        designationId,
        employeeType,
        salary,
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

//async function searchEmployee(fullName){
  //  console.log("search");
//}



