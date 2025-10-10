import { Card, Text, Badge } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { useSelectedCohort } from '@services/persistence/hooks';
import { calculateCurrentWeek } from '@services/utils/cohortUtils';
import styles from './StudentCard.module.css';

export default function StudentCard({ student, latestAssignment }) {
  const { selectedCohort } = useSelectedCohort();

  // Calculate assignment status color based on how behind the student is
  const getAssignmentStatusClass = () => {
    if (!selectedCohort || !latestAssignment) {
      return '';
    }

    try {
      // Get current week (0-based)
      const currentWeekZeroBased = calculateCurrentWeek(
        selectedCohort.startDate,
        selectedCohort.lessonWeekStartDay || 'Wednesday'
      );

      // Convert to 1-based for comparison with assignment weeks
      const currentWeek = currentWeekZeroBased + 1;
      const latestWeek = parseInt(latestAssignment.week);

      // The expected week is the previous week (assignments are due the week after)
      const expectedWeek = currentWeek - 1;

      // Calculate how many weeks behind the student is
      const weeksBehind = expectedWeek - latestWeek;

      if (weeksBehind <= 0) {
        // On time or ahead
        return styles.onTime;
      } else if (weeksBehind === 1) {
        // 1 week behind
        return styles.oneWeekBehind;
      } else if (weeksBehind === 2) {
        // 2 weeks behind
        return styles.twoWeeksBehind;
      } else {
        // 3+ weeks behind
        return styles.threeWeeksBehind;
      }
    } catch (error) {
      console.error('Error calculating assignment status:', error);
      return '';
    }
  };

  const assignmentStatusClass = getAssignmentStatusClass();

  return (
    <Link to={`/binder/students/${student.id}`} className={styles.cardLink}>
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
          <div
            className={`${styles.assignmentSection} ${assignmentStatusClass}`}
          >
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
    </Link>
  );
}
