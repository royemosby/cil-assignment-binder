import { Card, Text, Badge } from '@radix-ui/themes';
import styles from './StudentCard.module.css';

export default function StudentCard({ student, latestAssignment }) {
  return (
    <Card className={styles.card}>
      <div className={styles.studentHeader}>
        <Text size="4" weight="bold">
          {student.name}
        </Text>
        {student.slack && (
          <Text size="2" color="gray" className={styles.slackHandle}>
            @{student.slack}
          </Text>
        )}
      </div>

      <div className={styles.badgeSection}>
        <Badge color="blue">
          {student.assignments?.length || 0} submissions
        </Badge>
        {student.currentStatus && (
          <Badge color="green" className={styles.statusBadge}>
            {student.currentStatus}
          </Badge>
        )}
      </div>

      {latestAssignment ? (
        <div>
          <Text
            size="3"
            weight="medium"
            className={styles.latestAssignmentTitle}
          >
            Latest: Week {latestAssignment.week} - {latestAssignment.topic}
          </Text>
          <Text size="2" color="gray" className={styles.submittedDate}>
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
                <Text size="2" color="gray" className={styles.reviewerName}>
                  by {latestAssignment.reviewCompletedBy}
                </Text>
              )}
          </div>
          {latestAssignment.assignmentStatus && (
            <Text size="2" color="gray" className={styles.assignmentStatus}>
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
