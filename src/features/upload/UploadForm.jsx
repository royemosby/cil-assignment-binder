import { processAssignmentsCSV } from '@services/assignmentsParser';
import { useEffect } from 'react';
import testData from '../../TestAssignments.csv';

export default function UploadForm({ setAssignments, setFields }) {
  //TODO delete after
  useEffect(() => {
    const loadTestData = async () => {
      const response = await fetch(testData);
      const text = await response.text();
      const parsed = await processAssignmentsCSV(text);
      setFields(parsed.meta.fields);
      setAssignments(parsed.data);
    };
    loadTestData();
  }, []);

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      const parsed = await processAssignmentsCSV(text);
      setFields(parsed.meta.fields);
      setAssignments(parsed.data);
    }
  };

  return (
    <form>
      <input type="file" accept=".csv" onChange={handleCsvUpload} />
    </form>
  );
}
