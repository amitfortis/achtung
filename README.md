
# Achtung Game

Achtung is a multiplayer snake-like game built with JavaScript and Webpack. Players control their lines to avoid collisions and compete for survival.

## Features

- Dynamic game states (Home, Game, etc.)
- Smooth animations using canvas
- Interactive UI with controls for players
- Optimized build system with Webpack

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Docker](https://www.docker.com/) (for containerized setup, optional)

---

## Local Setup

### 1. Clone the Repository

```bash
$ git clone <repository-url>
$ cd achtung
```

### 2. Install Dependencies

```bash
$ npm install
```

### 3. Run the Development Server

```bash
$ npm start
```

This will start a development server and open the game in your default browser. The app will be accessible at [http://localhost:5050](http://localhost:5050).

---

## Build for Production

To create an optimized build for production:

```bash
$ npm run build
```

The optimized files will be located in the `dist/` directory.

---

## Running the Game with Docker

### 1. Build the Docker Image

```bash
$ docker build -t achtung-game .
```

### 2. Run the Docker Container

```bash
$ docker run -p 5050:5050 achtung-game
```

### 3. Access the Game

Open your browser and navigate to [http://localhost:5050](http://localhost:5050).

---

## Folder Structure

```

├── index.html
├── package.json
├── package-lock.json
├── src
│   ├── game
│   │   ├── Collision.js
│   │   ├── GameState.js
│   │   ├── HomeState.js
│   │   ├── Player.js
│   │   └── Trail.js
│   ├── main.js
│   └── ui
│       ├── Canvas.js
│       ├── Controls.js
│       └── Scoreboard.js
├── style.css
└── webpack.config.js
```
