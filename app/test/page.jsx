'use client';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const [courts, setCourts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/courts')
      .then(res => res.json())
      .then(data => setCourts(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Test Koneksi API</h1>
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      {courts.length > 0 
        ? courts.map(c => <p key={c.id}>{c.name}</p>)
        : <p>Loading atau data kosong...</p>
      }
    </div>
  );
}