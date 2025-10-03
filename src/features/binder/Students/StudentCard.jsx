import { Card, Text, Badge } from '@radix-ui/themes';

export default function StudentCard({ student, latestAssignment }) {
  return (
    <Card style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <Text size="4" weight="bold">
          {student.name}
        </Text>
        {student.slack && (
          <Text size="2" color="gray" style={{ display: 'block' }}>
            @{student.slack}
          </Text>
        )}
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <Badge color="blue">
          {student.assignments?.length || 0} submissions
        </Badge>
        {student.currentStatus && (
          <Badge color="green" style={{ marginLeft: '0.5rem' }}>
            {student.currentStatus}
          </Badge>
        )}
      </div>

      {latestAssignment ? (
        <div>
          <Text
            size="3"
            weight="medium"
            style={{ display: 'block', marginBottom: '0.25rem' }}
          >
            Latest: Week {latestAssignment.week} - {latestAssignment.topic}
          </Text>
          <Text
            size="2"
            color="gray"
            style={{ display: 'block', marginBottom: '0.25rem' }}
          >
            Submitted:{' '}
            {new Date(latestAssignment.submittedOn).toLocaleDateString()}
          </Text>
          <div>
            <Badge
              color={latestAssignment.reviewCompleted ? 'green' : 'orange'}
            >
              {latestAssignment.reviewCompleted
                ? '✅ Reviewed'
                : '⏳ Pending Review'}
            </Badge>
            {latestAssignment.reviewCompleted &&
              latestAssignment.reviewCompletedBy && (
                <Text size="2" color="gray" style={{ marginLeft: '0.5rem' }}>
                  by {latestAssignment.reviewCompletedBy}
                </Text>
              )}
          </div>
          {latestAssignment.assignmentStatus && (
            <Text
              size="2"
              color="gray"
              style={{ display: 'block', marginTop: '0.25rem' }}
            >
              Status: {latestAssignment.assignmentStatus}
            </Text>
          )}
        </div>
      ) : (
        <Text size="2" color="gray">
          No assignments submitted yet
        </Text>
      )}
    </Card>
  );
}
