import { useStudentsWithSubmissions } from '@services/persistence/hooks';
import StudentCard from './StudentCard';

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
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}
      >
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
