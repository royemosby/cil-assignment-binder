import { processAssignmentsCSV } from '@services/assignmentsParser';

export default function UploadForm({
  setWorkingAssignments,
  setWorkingFields,
}) {
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      const parsed = await processAssignmentsCSV(text);
      setWorkingFields(parsed.meta.fields);
      setWorkingAssignments(parsed.data);
    }
  };

  return (
    <form>
      <input type="file" accept=".csv" onChange={handleCsvUpload} />
    </form>
  );
}
