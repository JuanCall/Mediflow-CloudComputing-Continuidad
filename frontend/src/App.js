import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Bienvenido a Mediflow</h1>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;