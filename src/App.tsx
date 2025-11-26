import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Field } from './pages/Field';
import { Harvest } from './pages/Harvest';
import { Logistics } from './pages/Logistics';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Expenses } from './pages/Expenses';
import { Crops } from './pages/Crops';
import { Livestock } from './pages/Livestock';
import { PrecisionAg } from './pages/PrecisionAg';
import { Admin } from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="field" element={<Field />} />
          <Route path="harvest" element={<Harvest />} />
          <Route path="logistics" element={<Logistics />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="crops" element={<Crops />} />
          <Route path="livestock" element={<Livestock />} />
          <Route path="precision-ag" element={<PrecisionAg />} />
          <Route path="reports" element={<Reports />} />
          <Route path="admin" element={<Admin />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
