const API_BASE = 'https://your-api-domain.com/api'; 
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

