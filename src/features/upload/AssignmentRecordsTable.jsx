export default function AssignmentRecordsTable({
  workingFields,
  workingAssignments,
  setWorkingAssignments,
  setWorkingFields,
}) {
  function updateWorkingFieldName(field) {}

  return (
    <table>
      <thead>
        <tr>
          {workingFields.map((field) => (
            <th key={field}>{field}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {workingAssignments.map((assignment) => (
          <tr key={assignment.localId}>
            {workingFields.map((field) => (
              <td key={field}>{assignment[field]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
``;
