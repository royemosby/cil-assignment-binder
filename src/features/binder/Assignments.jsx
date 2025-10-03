import { Table } from '@radix-ui/themes';
import { useSubmissionsWithStudents } from '@services/persistence/hooks';

export default function Assignments() {
  const { submissionsWithStudents, loading } = useSubmissionsWithStudents();

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  if (!submissionsWithStudents || submissionsWithStudents.length === 0) {
    return <div>No assignments found.</div>;
  }

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Student Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Student Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Student Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Slack</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Week</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Topic</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Submitted On</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Review Completed</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Reviewed By</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Assignment Status</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {submissionsWithStudents.map((submission) => (
          <Table.Row key={submission.id}>
            <Table.Cell>{submission.student?.name || 'Unknown'}</Table.Cell>
            <Table.Cell>{submission.student?.name || 'Unknown'}</Table.Cell>
            <Table.Cell>{submission.student?.name || 'Unknown'}</Table.Cell>
            <Table.Cell>{submission.student?.slack || '-'}</Table.Cell>
            <Table.Cell>{submission.student?.currentStatus || '-'}</Table.Cell>
            <Table.Cell>{submission.week}</Table.Cell>
            <Table.Cell>{submission.topic}</Table.Cell>
            <Table.Cell>
              {submission.url ? (
                <a
                  href={submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              ) : (
                '-'
              )}
            </Table.Cell>
            <Table.Cell>
              {submission.submittedOn ? submission.submittedOn : '-'}
            </Table.Cell>
            <Table.Cell>{submission.reviewCompleted ? '✅' : '❌'}</Table.Cell>
            <Table.Cell>{submission.reviewCompletedBy || '-'}</Table.Cell>
            <Table.Cell>{submission.assignmentStatus || '-'}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
