export default function AssignmentRecordsTable({ fields, assignments }) {
  return (
    <table>
      <thead>
        <tr>
          {fields.map((field) => (
            <th key={field}>{field}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {assignments.map((assignment) => (
          <tr key={assignment.localId}>
            {fields.map((field) => (
              <td key={field}>{assignment[field]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
