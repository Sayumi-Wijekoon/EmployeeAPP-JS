const API_BASE = 'https://api.freeprojectapi.com/api';

const HEADERS = { 'Content-Type': 'application/json' };

 async function apiGet(path) {
     const res = await fetch(API_BASE + path);
      return res.json();
 }
 
 async function apiPost(path, body) { 
    const res = await fetch(API_BASE + path, {
         method: 'POST',
          headers: HEADERS, 
          body: JSON.stringify(body) 
        }); 
    return res.json();
 }

 function showAlert(type, msg) {
  document.getElementById('alert').innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}


 async function handleLogin() {
    console.log("login...");
    

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    const res = await apiPost('/EmployeeApp/login',{
      userName:user,
       password:pass
    });

    if(res.result == true){
        sessionStorage.setItem('user',JSON.stringify(res.data));
        
        document.getElementById('login-section').style.display='none';
        document.getElementById('dashboard-section').style.display='block';

        loadInitialData();


    }else{
        showAlert('danger',res.message || 'Login failed.Please try again.');

    }

}

