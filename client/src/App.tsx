import { useEffect, useState } from 'react';

interface Task {
  id: string;
  name: string;
  status: string;
  progress: number;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/api/stream');
    eventSource.onmessage = (event) => {
      setTasks(JSON.parse(event.data));
    };
    return () => eventSource.close();
  }, []);

  const triggerTask = async () => {
    await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Batch Process Records' })
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>LogPulse Dashboard</h1>
      <button onClick={triggerTask} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Dispatch Task
      </button>

      <h2>Active Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id} style={{ border: '1px solid #ccc', margin: '0.5rem 0', padding: '1rem' }}>
          <strong>{task.name}</strong> - <span>{task.status}</span>
          <div style={{ background: '#eee', height: '10px', width: '100%', marginTop: '5px' }}>
            <div style={{ background: '#4CAF50', height: '100%', width: `${task.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}