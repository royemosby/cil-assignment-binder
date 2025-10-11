// Export all hooks from a single entry point
export {
  useStudents,
  useStudent,
  useStudentsByCohort,
  useStudentsWithSubmissions,
  useStudentsWithSubmissionsForCohort,
} from './useStudents';
export {
  useSubmissions,
  useSubmission,
  useSubmissionsByStudent,
  useSubmissionsByWeek,
  useSubmissionsWithStudents,
  useSubmissionsByCohort,
  useSubmissionsWithStudentsForCohort,
} from './useSubmissions';
export {
  useCohorts,
  useCohort,
  useCohortWithStudents,
  useActiveCohorts,
  useCohortsWithStats,
  useCohortByName,
} from './useCohorts';
export { useSelectedCohort } from './useSelectedCohort';
