import React from 'react';
import AppRouter from './routes/AppRouter';
import Background from './components/background/Background';
import './App.css';

function App() {
  return (
    <div className="App">
      <Background />
      <AppRouter />
    </div>
  );
}

export default App;
