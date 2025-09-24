import { Table } from '@radix-ui/themes';

export default function RecordsSummary({ assignments }) {
  return (
    <div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell />
            <Table.ColumnHeaderCell>From uploaded CSV</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>New Records</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Duplicate Records</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Records to be Updated
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>Assignments</Table.RowHeaderCell>
            <Table.Cell>{assignments.length}</Table.Cell>
            <Table.Cell>0</Table.Cell>
            <Table.Cell>0</Table.Cell>
            <Table.Cell>0</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Students</Table.RowHeaderCell>
            <Table.Cell>
              {new Set(assignments.map((a) => a['Student Class Records'])).size}
            </Table.Cell>
            <Table.Cell>0</Table.Cell>
            <Table.Cell>0</Table.Cell>
            <Table.Cell>0</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Mentors</Table.RowHeaderCell>
            <Table.Cell>
              {
                new Set(
                  assignments.map(
                    (a) => a['Assigned Reviewer (from Student Class Records)']
                  )
                ).size
              }
            </Table.Cell>
            <Table.Cell>0</Table.Cell>
            <Table.Cell>0</Table.Cell>
            <Table.Cell>0</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </div>
  );
}
