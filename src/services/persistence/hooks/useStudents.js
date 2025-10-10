import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import {
  cleanStudentName,
  extractCohortFromName,
} from '../../utils/cohortUtils';

export function useStudents() {
  // Read - get all students
  const students = useLiveQuery(() => db.students.toArray());

  // Create - add new student
  const addStudent = async (studentData) => {
    try {
      const id = await db.students.add(studentData);
      return { success: true, id };
    } catch (error) {
      console.error('Error adding student:', error);
      return { success: false, error: error.message };
    }
  };

  // Update - update existing student
  const updateStudent = async (id, updates) => {
    try {
      await db.students.update(id, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating student:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete - remove student
  const deleteStudent = async (id) => {
    try {
      await db.students.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting student:', error);
      return { success: false, error: error.message };
    }
  };

  // Upsert - add or update student based on unique field within cohort context
  const upsertStudent = async (studentData, uniqueField = 'name') => {
    try {
      if (uniqueField === 'id' && studentData.id) {
        // If ID is provided, try to update first
        const existing = await db.students.get(studentData.id);
        if (existing) {
          await db.students.update(studentData.id, studentData);
          return { success: true, id: studentData.id, action: 'updated' };
        }
      } else if (
        uniqueField === 'name' &&
        studentData.name &&
        studentData.cohortId
      ) {
        // For cohort-aware matching: search by name within cohort
        const existing = await db.students
          .where('name')
          .equals(studentData.name)
          .and((student) => student.cohortId === studentData.cohortId)
          .first();

        if (existing) {
          await db.students.update(existing.id, studentData);
          return { success: true, id: existing.id, action: 'updated' };
        }
      } else if (uniqueField !== 'id' && uniqueField !== 'name') {
        // Search by other unique field (e.g., slack)
        const existing = await db.students
          .where(uniqueField)
          .equals(studentData[uniqueField])
          .first();
        if (existing) {
          await db.students.update(existing.id, studentData);
          return { success: true, id: existing.id, action: 'updated' };
        }
      }

      // If not found, create new
      const id = await db.students.add(studentData);
      return { success: true, id, action: 'created' };
    } catch (error) {
      console.error('Error upserting student:', error);
      return { success: false, error: error.message };
    }
  };

  // Bulk operations
  const addStudents = async (studentsArray) => {
    try {
      const ids = await db.students.bulkAdd(studentsArray);
      return { success: true, ids };
    } catch (error) {
      console.error('Error bulk adding students:', error);
      return { success: false, error: error.message };
    }
  };

  // Sync student auditStatus to their latest submission during weekly updates
  const syncStudentAuditStatusToLatestSubmission = async (
    studentId,
    newAuditStatus,
    currentWeek
  ) => {
    try {
      // Update student's auditStatus
      await db.students.update(studentId, { auditStatus: newAuditStatus });

      // Find student's latest submission (current week)
      const latestSubmission = await db.submissions
        .where('studentId')
        .equals(studentId)
        .and((submission) => Number(submission.week) === currentWeek)
        .first();

      if (latestSubmission) {
        // Update latest submission's auditStatus to match student's auditStatus
        await db.submissions.update(latestSubmission.id, {
          auditStatus: newAuditStatus,
        });
      }

      return { success: true };
      // Note: Prior weeks remain unchanged for longitudinal tracking
      // assignmentStatus (like "Needs Review") is separate from auditStatus
    } catch (error) {
      console.error('Error syncing audit status:', error);
      return { success: false, error: error.message };
    }
  };

  // Parse student data from CSV format (handles cohort extraction)
  const parseStudentFromCSV = (csvRow, defaultCohortId) => {
    const fullName = csvRow.name || csvRow.studentName || '';
    const cohortName = extractCohortFromName(fullName);
    const cleanName = cleanStudentName(fullName);

    return {
      name: cleanName,
      cohortId: defaultCohortId, // Will be updated based on cohort resolution
      currentStatus: csvRow.currentStatus || '',
      slack: csvRow.slack || '',
      slackUrl: csvRow.slackUrl || '',
      auditStatus: '', // Preserve existing or start empty
      originalName: fullName,
      detectedCohort: cohortName !== 'Current Cohort' ? cohortName : null,
    };
  };

  // Bulk upsert operations
  const upsertStudents = async (studentsArray, uniqueField = 'name') => {
    try {
      const results = await Promise.all(
        studentsArray.map((student) => upsertStudent(student, uniqueField))
      );

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      return {
        success: failed.length === 0,
        results: {
          successful: successful.length,
          failed: failed.length,
          created: successful.filter((r) => r.action === 'created').length,
          updated: successful.filter((r) => r.action === 'updated').length,
          errors: failed.map((r) => r.error),
        },
      };
    } catch (error) {
      console.error('Error bulk upserting students:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    upsertStudent,
    addStudents,
    upsertStudents,
    syncStudentAuditStatusToLatestSubmission,
    parseStudentFromCSV,
    loading: students === undefined,
  };
}

export function useStudent(id) {
  // Read - get single student by id
  const student = useLiveQuery(() => db.students.get(id), [id]);

  return {
    student,
    loading: student === undefined,
  };
}

export function useStudentsByCohort(cohortId) {
  // Read - get students by cohort
  const students = useLiveQuery(
    () => db.students.where('cohortId').equals(cohortId).toArray(),
    [cohortId]
  );

  return {
    students,
    loading: students === undefined,
  };
}

export function useStudentsWithSubmissions() {
  const studentsWithSubmissions = useLiveQuery(async () => {
    const students = await db.students.toArray();
    const submissions = await db.submissions.toArray();

    return students.map((student) => ({
      ...student,
      assignments: submissions.filter((s) => s.studentId === student.id),
    }));
  });
  return {
    studentsWithSubmissions,
    loading: studentsWithSubmissions === undefined,
  };
}

export function useStudentsWithSubmissionsForCohort(cohortId) {
  const studentsWithSubmissions = useLiveQuery(async () => {
    if (!cohortId) return [];

    // Get students in the cohort
    const students = await db.students
      .where('cohortId')
      .equals(cohortId)
      .toArray();

    if (students.length === 0) return [];

    // Manual sorting since we can't use orderBy after where().equals()
    students.sort((a, b) => a.name.localeCompare(b.name));

    // Get submissions for those students
    const studentIds = students.map((student) => student.id);
    const submissions = await db.submissions
      .where('studentId')
      .anyOf(studentIds)
      .toArray();

    return students.map((student) => ({
      ...student,
      assignments: submissions.filter((s) => s.studentId === student.id),
    }));
  }, [cohortId]);

  return {
    studentsWithSubmissions,
    loading: studentsWithSubmissions === undefined,
  };
}
