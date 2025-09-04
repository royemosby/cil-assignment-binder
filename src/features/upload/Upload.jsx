import { useState } from 'react';
import AssignmentRecordsTable from './AssignmentRecordsTable';
import UploadForm from './UploadForm';

export default function Upload() {
  const [workingAssignments, setWorkingAssignments] = useState([]);
  const [workingFields, setWorkingFields] = useState([]);

  function confirmRecords() {
    window.alert('confirmed');
  }

  return (
    <>
      <UploadForm
        setWorkingAssignments={setWorkingAssignments}
        setWorkingFields={setWorkingFields}
      />
      {workingAssignments.length > 0 ? (
        <>
          <button onClick={() => confirmRecords()}>Everything good?</button>
          <AssignmentRecordsTable
            workingAssignments={workingAssignments}
            workingFields={workingFields}
            setWorkingAssignments={setWorkingAssignments}
            setWorkingFields={setWorkingFields}
          />
        </>
      ) : (
        <p>Select a file to get started.</p>
      )}
    </>
  );
}
