import { processAssignmentsCSV } from '../../services/assignments_parser';

export default function UploadForm({ onSetAssignments, onSetFields }) {
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      const parsed = await processAssignmentsCSV(text);
      onSetFields(parsed.meta.fields);
      onSetAssignments(parsed.data);
    }
  };

  return (
    <form>
      <input type="file" accept=".csv" onChange={handleCsvUpload} />
    </form>
  );
}
