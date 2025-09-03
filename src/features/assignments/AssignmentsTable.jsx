export default function AssignmentsTable({ fields, assignments }) {
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
        {assignments.map((assignment, idx) => (
          <tr key={idx}>
            {fields.map((field) => (
              <td key={field}>{assignment[field]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
