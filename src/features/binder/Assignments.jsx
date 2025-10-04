import { Table } from '@radix-ui/themes';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useSubmissionsWithStudents } from '@services/persistence/hooks';
import styles from './Assignments.module.css';

export default function Assignments() {
  const { submissionsWithStudents, loading } = useSubmissionsWithStudents();

  // Helper function to check if student has blocking issues
  const hasBlockingIssues = (submission, allSubmissions) => {
    const studentSubmissions = allSubmissions.filter(
      (s) => s.student?.name === submission.student?.name
    );

    const currentWeek = Number(submission.week);

    // Skip blocking check for Week 0 since there are no prerequisites
    if (currentWeek <= 0) {
      return false;
    }

    // Check all previous weeks (including Week 0) for missing or unapproved assignments
    for (let week = 0; week < currentWeek; week++) {
      // Get ALL submissions for this week, sorted by submission date (most recent first)
      const weekSubmissions = studentSubmissions
        .filter((s) => Number(s.week) === week)
        .sort((a, b) => {
          // Sort by submitted date, with most recent first
          const dateA = new Date(a.submittedOn || 0);
          const dateB = new Date(b.submittedOn || 0);
          return dateB - dateA;
        });

      // No submissions for this week at all
      if (weekSubmissions.length === 0) {
        return true;
      }

      // Get the most recent submission for this week
      const latestWeekSubmission = weekSubmissions[0];

      // A week is complete if the latest submission is reviewed AND successful
      const isWeekComplete =
        latestWeekSubmission.reviewCompleted &&
        latestWeekSubmission.assignmentStatus?.includes('Assignment Successful');

      // If this week is not complete, it's blocking
      if (!isWeekComplete) {
        return true;
      }
    }

    return false;
  };

  // Helper function to generate submission flags
  const getSubmissionFlags = (submission, allSubmissions) => {
    const flags = [];

    // Check if URL contains a PR link (GitHub, GitLab, etc.)
    const isPullRequest =
      submission.url &&
      (submission.url.includes('/pull/') ||
        submission.url.includes('/merge_requests/') ||
        (submission.url.includes('github.com') &&
          submission.url.includes('/pull/')));

    if (!isPullRequest) {
      flags.push('😞'); // Sad face emoji for missing PR
    }

    // Check for blocking issues (missing previous assignments or unapproved revisions)
    if (hasBlockingIssues(submission, allSubmissions)) {
      flags.push(<Cross1Icon key="blocking" className={styles.flag} />);
    }

    return flags;
  };

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
          <Table.ColumnHeaderCell>Submission Flags</Table.ColumnHeaderCell>
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
            <Table.Cell>
              <div className={styles.submissionFlags}>
                {getSubmissionFlags(submission, submissionsWithStudents).map(
                  (flag, index) => (
                    <span key={index} className={styles.flag}>
                      {flag}
                    </span>
                  )
                )}
              </div>
            </Table.Cell>
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
