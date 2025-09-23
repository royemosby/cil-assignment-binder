import { parseAssignmentsCSV } from '@services/assignmentsParser/assignmentsParser';
import { useEffect } from 'react';
import styles from './UploadForm.module.css';
import testData from '../../TestAssignments.csv';

export default function UploadForm({
  setAssignments,
  setFields,
  setUpsertReady,
}) {
  //TODO delete after
  useEffect(() => {
    const loadTestData = async () => {
      const response = await fetch(testData);
      const text = await response.text();
      const parsed = await parseAssignmentsCSV(text);
      setFields(parsed.meta.fields);
      setAssignments(parsed.data);
      console.dir(parsed);
    };
    loadTestData();
  }, []);

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      const parsed = await parseAssignmentsCSV(text);
      setFields(parsed.meta.fields);
      setAssignments(parsed.data);
      setUpsertReady(false);
    }
  };

  return (
    <form className={styles.form}>
      <input type="file" accept=".csv" onChange={handleCsvUpload} />
    </form>
  );
}
