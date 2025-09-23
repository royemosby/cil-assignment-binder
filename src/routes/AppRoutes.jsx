import { Routes, Route } from 'react-router-dom';
import Binder from '../features/binder/Binder';
import Upload from '../features/upload/Upload';
export default function AppRoutes(props) {
  return (
    <Routes>
      <Route path="/" element={<Binder {...props} />} />
      <Route path="/upload" element={<Upload {...props} />} />
    </Routes>
  );
}
