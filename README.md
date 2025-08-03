# One File App

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen?style=for-the-badge)

A complete user management application in a single JavaScript file with no external dependencies.

## Features

- **Zero dependencies** - Uses only native Node.js modules
- **Single file** - All code in `app.js`  
- **JSON database** - Simple persistence in `users.json`
- **Web interface** - HTML, CSS and JavaScript included
- **REST API** - Endpoints to manage users

## Quick Start

```bash
git clone https://github.com/luangrezende/one-file-app.git
cd one-file-app
node app.js
```

Open `http://localhost:3000` in your browser.

## Project Structure

```
one-file-app/
├── app.js        # Complete application
├── users.json    # Database (created automatically)
└── README.md     # This file
```

## What it does

- Add users
- List users  
- Data validation
- Responsive interface
- Data persistence

## API

- `GET /` - Web interface
- `GET /api/users` - List all users
- `POST /api/users` - Add a new user

## Tech Stack

- Node.js (http, fs, path, url)
- HTML5 + CSS3 + JavaScript
- JSON for persistence