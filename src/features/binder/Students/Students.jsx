import { useStudentsWithSubmissions } from '@services/persistence/hooks';
import StudentCard from './StudentCard';
import styles from './Students.module.css';

export default function Students() {
  const { studentsWithSubmissions, loading } = useStudentsWithSubmissions();

  if (loading) {
    return <div>Loading students...</div>;
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
