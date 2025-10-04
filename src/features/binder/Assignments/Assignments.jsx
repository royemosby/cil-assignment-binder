import { useSubmissionsWithStudents } from '@services/persistence/hooks';
import AssignmentsTable from '@components/AssignmentsTable/AssignmentsTable';
import styles from './Assignments.module.css';

export default function Assignments() {
  const { submissionsWithStudents, loading } = useSubmissionsWithStudents();

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  // Group submissions by student current status
  const submissionsByStatus = submissionsWithStudents.reduce(
    (groups, submission) => {
      const status = submission.student?.currentStatus || 'Unknown Status';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(submission);
      return groups;
    },
    {}
  );

  // Define the order of status groups for consistent display
  const statusOrder = [
    'Ahead',
    'On Track',
    'Behind 1 week',
    'Behind 2 weeks / CIL reached out',
    'Behind with CIL approval',
    'No Activity',
    'Unknown Status',
    'Dropped',
    'Petitioned to retake - Approved',
  ];

  // Sort status groups by defined order, then alphabetically for any unlisted statuses
  const sortedStatusKeys = Object.keys(submissionsByStatus).sort((a, b) => {
    const aIndex = statusOrder.indexOf(a);
    const bIndex = statusOrder.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  // Function to scroll to a specific status group
  const scrollToStatus = (status) => {
    const elementId = `status-${status.replace(/\s+/g, '-').toLowerCase()}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (sortedStatusKeys.length === 0) {
    return <div>No assignments found.</div>;
  }

  return (
    <div className={styles.assignmentsContainer}>
      {/* Navigation */}
      <nav className={styles.statusNavigation}>
        <h3 className={styles.navigationTitle}>Jump to Status:</h3>
        <div className={styles.navigationButtons}>
          {sortedStatusKeys.map((status) => (
            <button
              key={status}
              onClick={() => scrollToStatus(status)}
              className={styles.navigationButton}
            >
              {status} ({submissionsByStatus[status].length})
            </button>
          ))}
        </div>
      </nav>

      {/* Status Groups */}
      {sortedStatusKeys.map((status) => (
        <div
          key={status}
          id={`status-${status.replace(/\s+/g, '-').toLowerCase()}`}
          className={styles.statusGroup}
        >
          <h2 className={styles.statusTitle}>
            {status} ({submissionsByStatus[status].length} submissions)
          </h2>
          <AssignmentsTable submissions={submissionsByStatus[status]} />
        </div>
      ))}
    </div>
  );
}
