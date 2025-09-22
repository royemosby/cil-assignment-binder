import { Table } from '@radix-ui/themes';
import { useState } from 'react';

export default function Assignments({ fields, assignments }) {
  const [displayFields, setDispayFields] = useState(fields);

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          {displayFields.map((field) => (
            <Table.ColumnHeaderCell key={field}>{field}</Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {assignments?.map((assignment) => (
          <Table.Row key={assignment.binderAssignmentId}>
            {displayFields.map((field) => (
              <Table.Cell key={`${field}-${assignment.binderAssignmentId}`}>
                {assignment[field]}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
