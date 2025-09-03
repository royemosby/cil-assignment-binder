import { useState } from 'react';
import UploadForm from './UploadForm';
import AssignmentsTable from './AssignmentsTable';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [fields, setFields] = useState([]);

  return (
    <>
      <h1>Assignments</h1>
      <UploadForm onSetAssignments={setAssignments} onSetFields={setFields} />
      {assignments.length > 0 ? (
        <AssignmentsTable assignments={assignments} fields={fields} />
      ) : (
        <p>Select a file to get started.</p>
      )}
    </>
  );
}
