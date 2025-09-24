import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

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

  // Upsert - add or update student based on unique field
  const upsertStudent = async (studentData, uniqueField = 'id') => {
    try {
      if (uniqueField === 'id' && studentData.id) {
        // If ID is provided, try to update first
        const existing = await db.students.get(studentData.id);
        if (existing) {
          await db.students.update(studentData.id, studentData);
          return { success: true, id: studentData.id, action: 'updated' };
        }
      } else if (uniqueField !== 'id') {
        // Search by other unique field (e.g., slack, name)
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

  // Bulk upsert operations
  const upsertStudents = async (studentsArray, uniqueField = 'id') => {
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
