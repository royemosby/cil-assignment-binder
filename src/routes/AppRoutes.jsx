import { Routes, Route } from 'react-router-dom';
import Admin from '../features/admin/Admin';
import Assignments from '../features/assignments/Assignments';
import Index from '../features/Index';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/assignments" element={<Assignments />} />
    </Routes>
  );
}
