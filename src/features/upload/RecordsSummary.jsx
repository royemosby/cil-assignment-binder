export default function RecordsSummary({ assignments }) {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>New Records</th>
            <th>Existing Records</th>
            <th>Total Records</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Assignment records</th>
            <td>{assignments.length}</td>
            <td>0</td>
            <td>0</td>
          </tr>
          <tr>
            <th scope="row">Number of Students</th>
            <td>
              {new Set(assignments.map((a) => a['Student Class Records'])).size}
            </td>
            <td>0</td>
            <td>0</td>
          </tr>
          <tr>
            <th scope="row">Number of Mentors</th>
            <td>
              {
                new Set(
                  assignments.map(
                    (a) => a['Assigned Reviewer (from Student Class Records)']
                  )
                ).size
              }
            </td>
            <td>0</td>
            <td>0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
