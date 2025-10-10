import { useParams, Link, useLocation } from 'react-router-dom';
import { Card, Text, Badge, Button, Separator } from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import {
  useStudentsWithSubmissionsForCohort,
  useSelectedCohort,
} from '@services/persistence/hooks';
import { useEffect, useState } from 'react';
import styles from './StudentDetails.module.css';

export default function StudentDetails() {
  const { studentId } = useParams();
  const { selectedCohort } = useSelectedCohort();
  const { studentsWithSubmissions, loading } =
    useStudentsWithSubmissionsForCohort(selectedCohort?.id);
  const location = useLocation();

  // Determine the referring page for breadcrumb navigation
  const [referringPage, setReferringPage] = useState({
    path: '/binder/students',
    label: 'Back to Students',
  });

  useEffect(() => {
    // Check if we have referrer information from the location state
    if (location.state?.from) {
      const fromPath = location.state.from;
      if (fromPath.includes('/binder/assignments')) {
        setReferringPage({
          path: '/binder/assignments',
          label: 'Back to Assignments',
        });
      }
    } else {
      // Check the document referrer as fallback
      const referrer = document.referrer;
      if (referrer && referrer.includes('/binder/assignments')) {
        setReferringPage({
          path: '/binder/assignments',
          label: 'Back to Assignments',
        });
      }
    }
  }, [location]);

  if (loading) {
    return <div>Loading student details...</div>;
  }

  if (!selectedCohort) {
    return (
      <div className={styles.notFound}>
        <h2>No Cohort Selected</h2>
        <p>Please select a cohort to view student details.</p>
        <Link to={referringPage.path}>
          <Button variant="soft">
            <ArrowLeftIcon /> {referringPage.label}
          </Button>
        </Link>
      </div>
    );
  }

  // Find the specific student by ID (convert string ID from URL to number)
  const student = studentsWithSubmissions?.find(
    (s) => s.id === Number(studentId)
  );

  if (!student) {
    return (
      <div className={styles.notFound}>
        <h2>Student Not Found</h2>
        <p>
          The student with ID &ldquo;{studentId}&rdquo; could not be found in
          the selected cohort
          {selectedCohort ? ` "${selectedCohort.name}"` : ''}.
        </p>
        <Link to={referringPage.path}>
          <Button variant="soft">
            <ArrowLeftIcon /> {referringPage.label}
          </Button>
        </Link>
      </div>
    );
  }

  const getLatestAssignment = (assignments) => {
    if (!assignments || assignments.length === 0) return null;
    return assignments.reduce((latest, current) => {
      const currentDate = new Date(current.submittedOn);
      const latestDate = new Date(latest.submittedOn);
      return currentDate > latestDate ? current : latest;
    });
  };

  const latestAssignment = getLatestAssignment(student.assignments);

  // Sort assignments by week number for chronological display
  const sortedAssignments =
    student.assignments?.sort((a, b) => {
      return Number(a.week) - Number(b.week);
    }) || [];

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <div className={styles.navigation}>
        <Link to={referringPage.path}>
          <Button variant="ghost" className={styles.backButton}>
            <ArrowLeftIcon /> {referringPage.label}
          </Button>
        </Link>
      </div>

      {/* Student Header */}
      <Card className={styles.headerCard}>
        <div className={styles.studentHeader}>
          <div>
            <Text size="6" weight="bold" className={styles.studentName}>
              {student.name}
            </Text>
            {student.slack && (
              <Text size="3" color="gray" className={styles.slackHandle}>
                @{student.slack}
              </Text>
            )}
          </div>

          <div className={styles.badgeSection}>
            <Badge color="blue" size="2">
              {student.assignments?.length || 0} submissions
            </Badge>
            {student.currentStatus && (
              <Badge color="green" size="2" className={styles.statusBadge}>
                {student.currentStatus}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Latest Assignment Summary */}
      {latestAssignment && (
        <Card className={styles.summaryCard}>
          <Text size="4" weight="medium" className={styles.sectionTitle}>
            Latest Activity
          </Text>
          <div className={styles.latestAssignment}>
            <Text size="3" weight="medium">
              Week {latestAssignment.week} - {latestAssignment.topic}
            </Text>
            <Text size="2" color="gray">
              Submitted:{' '}
              {new Date(latestAssignment.submittedOn).toLocaleDateString()}
            </Text>
            <div className={styles.assignmentBadges}>
              <Badge
                color={latestAssignment.reviewCompleted ? 'green' : 'orange'}
              >
                {latestAssignment.reviewCompleted
                  ? '✅ Reviewed'
                  : '⏳ Pending Review'}
              </Badge>
              {latestAssignment.reviewCompleted &&
                latestAssignment.reviewCompletedBy && (
                  <Text size="2" color="gray">
                    by {latestAssignment.reviewCompletedBy}
                  </Text>
                )}
            </div>
            {latestAssignment.assignmentStatus && (
              <Text size="2" color="gray">
                Status: {latestAssignment.assignmentStatus}
              </Text>
            )}
          </div>
        </Card>
      )}

      {/* Assignment History */}
      <Card className={styles.historyCard}>
        <Text size="4" weight="medium" className={styles.sectionTitle}>
          Assignment History
        </Text>

        {sortedAssignments.length > 0 ? (
          <div className={styles.assignmentsList}>
            {sortedAssignments.map((assignment, index) => (
              <div
                key={`${assignment.week}-${index}`}
                className={styles.assignmentItem}
              >
                <div className={styles.assignmentHeader}>
                  <Text size="3" weight="medium">
                    Week {assignment.week} - {assignment.topic}
                  </Text>
                  <Text size="2" color="gray">
                    {new Date(assignment.submittedOn).toLocaleDateString()}
                  </Text>
                </div>

                <div className={styles.assignmentDetails}>
                  <div className={styles.assignmentBadges}>
                    <Badge
                      color={assignment.reviewCompleted ? 'green' : 'orange'}
                      size="1"
                    >
                      {assignment.reviewCompleted ? 'Reviewed' : 'Pending'}
                    </Badge>
                    {assignment.assignmentStatus && (
                      <Badge
                        color={
                          assignment.assignmentStatus.includes('Successful')
                            ? 'green'
                            : 'red'
                        }
                        size="1"
                      >
                        {assignment.assignmentStatus.includes('Successful')
                          ? 'Success'
                          : 'Needs Revision'}
                      </Badge>
                    )}
                  </div>

                  {assignment.url && (
                    <a
                      href={assignment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.assignmentLink}
                    >
                      View PR
                    </a>
                  )}
                </div>

                {index < sortedAssignments.length - 1 && (
                  <Separator className={styles.separator} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <Text size="2" color="gray">
            No assignments submitted yet
          </Text>
        )}
      </Card>

      {/* Future Expandable Sections */}
      <div className={styles.futureSection}>
        <Text size="3" color="gray" style={{ fontStyle: 'italic' }}>
          Future sections: Performance metrics, Contact information, Notes &
          Comments
        </Text>
      </div>
    </div>
  );
}
