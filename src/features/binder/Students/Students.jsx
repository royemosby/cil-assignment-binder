import { useStudentsWithSubmissionsForCohort } from '@services/persistence/hooks';
import { useCohortContext } from '../../../contexts/CohortContext';
import StudentCard from './StudentCard';
import styles from './Students.module.css';

export default function Students() {
  const { selectedCohort } = useCohortContext();
  const { studentsWithSubmissions, loading } =
    useStudentsWithSubmissionsForCohort(selectedCohort?.id);

  if (loading) {
    return <div>Loading students...</div>;
  }

  if (!selectedCohort) {
    return <div>Please select a cohort to view students.</div>;
  }

  if (!studentsWithSubmissions || studentsWithSubmissions.length === 0) {
    return <div>No students found.</div>;
  }

  const getLatestAssignment = (assignments) => {
    if (!assignments || assignments.length === 0) return null;

    return assignments.reduce((latest, current) => {
      const currentDate = new Date(current.submittedOn);
      const latestDate = new Date(latest.submittedOn);
      return currentDate > latestDate ? current : latest;
    });
  };

  return (
    <div>
      <h2>Students</h2>
      <div className={styles.studentsGrid}>
        {studentsWithSubmissions.map((student) => {
          const latestAssignment = getLatestAssignment(student.assignments);

          return (
            <StudentCard
              key={student.id}
              student={student}
              latestAssignment={latestAssignment}
            />
          );
        })}
      </div>
    </div>
  );
}
