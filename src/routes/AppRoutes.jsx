import { Routes, Route } from 'react-router-dom';
import Admin from '../features/admin/Admin';
import Binder from '../features/binder/Binder';
import Upload from '../features/upload/Upload';
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Binder />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/upload" element={<Upload />} />
    </Routes>
  );
}
