import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage'; // UNCOMMENT THIS

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<ResultsPage />} /> {/* UNCOMMENT THIS */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;