import { Routes, Route, Navigate } from 'react-router-dom';
import Binder from '../features/binder/Binder';
import Assignments from '../features/binder/Assignments/Assignments';
import Students from '../features/binder/Students/Students';
import Upload from '../features/upload/Upload';

export default function AppRoutes(props) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/binder/assignments" replace />} />
      <Route path="/binder" element={<Binder {...props} />}>
        <Route index element={<Navigate to="assignments" replace />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="students" element={<Students />} />
      </Route>
      <Route path="/upload" element={<Upload {...props} />} />
    </Routes>
  );
}
