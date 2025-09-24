// Export all hooks from a single entry point
export { useStudents, useStudent, useStudentsByCohort } from './useStudents';
export {
  useSubmissions,
  useSubmission,
  useSubmissionsByStudent,
  useSubmissionsByWeek,
  useSubmissionsWithStudents,
} from './useSubmissions';
export { useCohorts, useCohort, useCohortWithStudents } from './useCohorts';
