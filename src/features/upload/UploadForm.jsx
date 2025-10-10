import { parseAssignmentsCSV } from '@services/assignmentsParser/assignmentsParser';
import styles from './UploadForm.module.css';

export default function UploadForm({ setAssignments, setFields }) {
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      const parsed = await parseAssignmentsCSV(text);
      setFields(parsed.meta.fields);
      setAssignments(parsed.data);
    }
  };

  return (
    <form className={styles.form}>
      <input type="file" accept=".csv" onChange={handleCsvUpload} />
    </form>
  );
}
