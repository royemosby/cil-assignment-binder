import { useState } from 'react';
import { Button } from '@radix-ui/themes';
import { Table } from '@radix-ui/themes';

export default function FieldAliasForm({
  fields,
  assignments,
  confirmFieldMapping,
}) {
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

  const handleConfirm = (e) => {
    e.preventDefault();
    confirmFieldMapping();
  };

  return (
    <form
      onSubmit={(e) => {
        handleConfirm(e);
      }}
    >
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>CSV Field Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Field Alias</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Example Input</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {workingFields.map((field, index) => (
            <Table.Row key={fieldReferences[index]}>
              <Table.Cell>
                <label htmlFor={field}>{fieldReferences[index]}</label>
              </Table.Cell>
              <Table.Cell>
                <input
                  type="text"
                  value={field}
                  id={field}
                  onChange={(e) =>
                    updateWorkingField({ newValue: e.target.value, index })
                  }
                />
              </Table.Cell>
              <Table.Cell>
                {assignments[0]?.[fieldReferences[index]]}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Button>Update Field Aliases</Button>
    </form>
  );
}
