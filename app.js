const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'users.json');

function initDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    }
}

function getUsers() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (pathname === '/api/users' && method === 'GET') {
        const users = getUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
        return;
    }

    if (pathname === '/api/users' && method === 'POST') {
        try {
            const body = await parseBody(req);
            const { name, email } = body;
            
            if (!name || !email) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Name and email are required' }));
                return;
            }
            
            const users = getUsers();
            const newUser = {
                id: Date.now(),
                name,
                email,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            saveUsers(users);
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        return;
    }

    if (pathname.startsWith('/api/users/') && method === 'DELETE') {
        try {
            const userId = pathname.split('/api/users/')[1];
            
            if (!userId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User ID is required' }));
                return;
            }
            
            const users = getUsers();
            const userIndex = users.findIndex(user => user.id === parseInt(userId));
            
            if (userIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
                return;
            }
            
            users.splice(userIndex, 1);
            saveUsers(users);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User deleted successfully' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        return;
    }

    if (pathname === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>User Manager</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .form-group { margin-bottom: 15px; }
                    label { display: block; margin-bottom: 5px; font-weight: bold; }
                    input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
                    button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                    button:hover { background: #0056b3; }
                    .user-list { margin-top: 30px; }
                    .user-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007bff; position: relative; }
                    .delete-btn { position: absolute; top: 10px; right: 10px; background: #dc3545; color: white; border: none; border-radius: 3px; padding: 5px 10px; cursor: pointer; font-size: 12px; }
                    .delete-btn:hover { background: #c82333; }
                </style>
            </head>
            <body>
                <h1>User Manager</h1>
                
                <form id="userForm">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <button type="submit">Add User</button>
                </form>
                
                <div class="user-list">
                    <h2>Users</h2>
                    <div id="usersList"></div>
                </div>

                <script>
                    loadUsers();

                    document.getElementById('userForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        
                        const formData = new FormData(e.target);
                        const userData = {
                            name: formData.get('name'),
                            email: formData.get('email')
                        };

                        try {
                            const response = await fetch('/api/users', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(userData)
                            });

                            if (response.ok) {
                                e.target.reset();
                                loadUsers();
                                alert('User added!');
                            } else {
                                const error = await response.json();
                                alert('Error: ' + error.error);
                            }
                        } catch (error) {
                            alert('Error adding user: ' + error.message);
                        }
                    });

                    async function deleteUser(userId) {
                        if (!confirm('Are you sure you want to delete this user?')) {
                            return;
                        }

                        try {
                            const response = await fetch('/api/users/' + userId, {
                                method: 'DELETE'
                            });

                            if (response.ok) {
                                loadUsers();
                                alert('User deleted!');
                            } else {
                                const error = await response.json();
                                alert('Error: ' + error.error);
                            }
                        } catch (error) {
                            alert('Error deleting user: ' + error.message);
                        }
                    }

                    async function loadUsers() {
                        try {
                            const response = await fetch('/api/users');
                            const users = await response.json();
                            
                            const usersList = document.getElementById('usersList');
                            usersList.innerHTML = '';
                            
                            if (users.length === 0) {
                                usersList.innerHTML = '<p>No users yet.</p>';
                                return;
                            }
                            
                            users.forEach(user => {
                                const userDiv = document.createElement('div');
                                userDiv.className = 'user-item';
                                userDiv.innerHTML = 
                                    '<button class="delete-btn" onclick="deleteUser(' + user.id + ')">Delete</button>' +
                                    '<strong>' + user.name + '</strong><br>' +
                                    'Email: ' + user.email + '<br>' +
                                    '<small>Added: ' + new Date(user.createdAt).toLocaleString('en-US') + '</small>';
                                usersList.appendChild(userDiv);
                            });
                        } catch (error) {
                            console.error('Error loading users:', error);
                        }
                    }
                </script>
            </body>
            </html>
        `);
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
});

initDB();

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
