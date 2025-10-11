import { Routes, Route, Navigate } from 'react-router-dom';
import Binder from '../features/binder/Binder';
import Assignments from '../features/binder/Assignments/Assignments';
import Students from '../features/binder/Students/Students';
import StudentDetails from '../features/binder/Students/StudentDetails';
import Upload from '../features/upload/Upload';
import AdminDashboard from '../features/admin/AdminDashboard';

export default function AppRoutes(props) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/binder/assignments" replace />} />
      <Route path="/binder" element={<Binder {...props} />}>
        <Route index element={<Navigate to="assignments" replace />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:studentId" element={<StudentDetails />} />
      </Route>
      <Route path="/upload" element={<Upload {...props} />} />
      <Route path="/admin" element={<AdminDashboard {...props} />} />
    </Routes>
  );
}
