import { useState } from 'react';

export default function FieldsForm({ fields, assignments, setFields }) {
  const [workingFields, setWorkingFields] = useState(fields);
  const [fieldReferences] = useState(fields);

  const updateWorkingField = ({ newValue, index }) => {
    const updatedFields = workingFields.map((field, fieldIndex) => {
      if (fieldIndex === index) {
        return newValue;
      } else {
        return field;
      }
    });
    setWorkingFields([...updatedFields]);
  };

  return (
    <form>
      <table>
        <thead>
          <tr>
            <th>Original Field Name</th>
            <th>Field Name</th>
            <th>Example Input</th>
          </tr>
        </thead>
        <tbody>
          {workingFields.map((field, index) => (
            <tr key={fieldReferences[index]}>
              <td>
                <label htmlFor={field}>{fieldReferences[index]}</label>
              </td>
              <td>
                <input
                  type="text"
                  value={field}
                  onChange={(e) =>
                    updateWorkingField({ newValue: e.target.value, index })
                  }
                />
              </td>
              <td>{assignments[0]?.[fieldReferences[index]]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button>Columns look good?</button>
    </form>
  );
}
