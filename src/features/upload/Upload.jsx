import { useState } from 'react';
import AssignmentRecordsTable from './AssignmentRecordsTable';
import UploadForm from './UploadForm';
import FieldsForm from './FieldsForm';

export default function Upload() {
  const [assignments, setAssignments] = useState([]);
  const [fields, setFields] = useState([]);

  function confirmRecords() {
    window.alert('confirmed');
  }

  return (
    <>
      <UploadForm setAssignments={setAssignments} setFields={setFields} />
      {assignments.length > 0 ? (
        <>
          <FieldsForm
            assignments={assignments}
            fields={fields}
            setFields={setFields}
          />
          <button onClick={() => confirmRecords()}>
            Everything look good?
          </button>
          <AssignmentRecordsTable
            assignments={assignments}
            fields={fields}
            setAssignments={setAssignments}
            setFields={setFields}
          />
        </>
      ) : (
        <p>Select a file to get started.</p>
      )}
    </>
  );
}
