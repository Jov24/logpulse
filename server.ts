import express = require('express');
import cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

interface Task {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED';
  progress: number;
}

let tasks: Task[] = [];
let clients: express.Response[] = [];

// SSE Endpoint for Live Updates
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  clients.push(res);
  
  // Send initial state immediately
  res.write(`data: ${JSON.stringify(tasks)}\n\n`);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

function broadcast() {
  clients.forEach(client => client.write(`data: ${JSON.stringify(tasks)}\n\n`));
}

// Task Dispatch Endpoint
app.post('/api/tasks', (req, res) => {
  const newTask: Task = {
    id: Date.now().toString(),
    name: req.body.name || 'Automated Data Cleanup',
    status: 'PENDING',
    progress: 0
  };
  tasks.push(newTask);
  broadcast();
  res.json(newTask);

  // Simulate Async Background Execution
  setTimeout(() => {
    newTask.status = 'RUNNING';
    const interval = setInterval(() => {
      newTask.progress += 25;
      if (newTask.progress >= 100) {
        newTask.status = 'COMPLETED';
        clearInterval(interval);
      }
      broadcast();
    }, 800);
  }, 500);
});

app.listen(5000, () => console.log('Server running on port 5000'));