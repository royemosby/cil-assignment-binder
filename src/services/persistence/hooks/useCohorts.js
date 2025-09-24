import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useCohorts() {
  const cohorts = useLiveQuery(() => db.cohorts.toArray());

  const addCohort = async (cohortData) => {
    try {
      const id = await db.cohorts.add(cohortData);
      return { success: true, id };
    } catch (error) {
      console.error('Error adding cohort:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCohort = async (id, updates) => {
    try {
      await db.cohorts.update(id, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating cohort:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteCohort = async (id) => {
    try {
      await db.cohorts.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting cohort:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    cohorts,
    addCohort,
    updateCohort,
    deleteCohort,
    loading: cohorts === undefined,
  };
}

export function useCohort(id) {
  const cohort = useLiveQuery(() => db.cohorts.get(id), [id]);

  return {
    cohort,
    loading: cohort === undefined,
  };
}

export function useCohortWithStudents(cohortId) {
  const cohortWithStudents = useLiveQuery(async () => {
    const cohort = await db.cohorts.get(cohortId);
    if (!cohort) return null;

    const students = await db.students
      .where('cohortId')
      .equals(cohortId)
      .toArray();
    return {
      ...cohort,
      students,
    };
  }, [cohortId]);

  return {
    cohortWithStudents,
    loading: cohortWithStudents === undefined,
  };
}
