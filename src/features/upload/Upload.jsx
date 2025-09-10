import { useState } from 'react';
import UploadForm from './UploadForm';
import FieldsForm from './FieldsForm';
import RecordsSummary from './RecordsSummary';

export default function Upload() {
  const [assignments, setAssignments] = useState([]);
  const [fields, setFields] = useState([]);

  function confirmRecords() {
    window.alert('confirmed');
  }

  return (
    <>
      <UploadForm setAssignments={setAssignments} setFields={setFields} />
      <hr />
      {assignments.length > 0 ? (
        <>
          <FieldsForm
            assignments={assignments}
            fields={fields}
            setFields={setFields}
          />
          <hr />
          <RecordsSummary assignments={assignments} />
          <button onClick={() => confirmRecords()}>
            Everything look good?
          </button>
        </>
      ) : (
        <p>Select a file to get started.</p>
      )}
    </>
  );
}
