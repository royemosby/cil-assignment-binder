import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import {
  createCohortWithDefaults,
  validateCohortName,
} from '../../utils/cohortUtils';

export function useCohorts() {
  const cohorts = useLiveQuery(() => db.cohorts.orderBy('createdAt').toArray());

  const addCohort = async (cohortData) => {
    try {
      // Validate cohort name
      const validation = validateCohortName(cohortData.name);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check for duplicate names
      const existingCohort = await db.cohorts
        .where('name')
        .equals(validation.name)
        .first();
      if (existingCohort) {
        return {
          success: false,
          error: 'A cohort with this name already exists',
        };
      }

      // Create cohort with defaults
      const cohortWithDefaults = createCohortWithDefaults({
        ...cohortData,
        name: validation.name,
      });

      const id = await db.cohorts.add(cohortWithDefaults);
      return { success: true, id };
    } catch (error) {
      console.error('Error adding cohort:', error);
      return { success: false, error: error.message };
    }
  };

  const updateCohort = async (id, updates) => {
    try {
      // If name is being updated, validate it
      if (updates.name) {
        const validation = validateCohortName(updates.name);
        if (!validation.valid) {
          return { success: false, error: validation.error };
        }

        // Check for duplicate names (excluding current cohort)
        const existingCohort = await db.cohorts
          .where('name')
          .equals(validation.name)
          .and((cohort) => cohort.id !== id)
          .first();

        if (existingCohort) {
          return {
            success: false,
            error: 'A cohort with this name already exists',
          };
        }

        updates.name = validation.name;
      }

      // Always update the updatedAt timestamp
      updates.updatedAt = new Date().toISOString();

      await db.cohorts.update(id, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating cohort:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteCohort = async (id) => {
    try {
      // Check if cohort has students
      const studentsCount = await db.students
        .where('cohortId')
        .equals(id)
        .count();
      if (studentsCount > 0) {
        return {
          success: false,
          error: `Cannot delete cohort: ${studentsCount} students are still assigned to this cohort`,
        };
      }

      await db.cohorts.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting cohort:', error);
      return { success: false, error: error.message };
    }
  };

  const upsertCohort = async (cohortData, uniqueField = 'name') => {
    try {
      if (uniqueField === 'id' && cohortData.id) {
        // Update existing by ID
        const existing = await db.cohorts.get(cohortData.id);
        if (existing) {
          const result = await updateCohort(cohortData.id, cohortData);
          return { ...result, action: 'updated' };
        }
      } else if (uniqueField !== 'id' && cohortData[uniqueField]) {
        // Search by other unique field
        const existing = await db.cohorts
          .where(uniqueField)
          .equals(cohortData[uniqueField])
          .first();

        if (existing) {
          const result = await updateCohort(existing.id, cohortData);
          return { ...result, id: existing.id, action: 'updated' };
        }
      }

      // Create new cohort
      const result = await addCohort(cohortData);
      return { ...result, action: 'created' };
    } catch (error) {
      console.error('Error upserting cohort:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    cohorts,
    addCohort,
    updateCohort,
    deleteCohort,
    upsertCohort,
    loading: cohorts === undefined,
  };
}

export function useActiveCohorts() {
  const activeCohorts = useLiveQuery(async () => {
    const cohorts = await db.cohorts.where('status').equals('active').toArray();
    return cohorts.sort((a, b) => a.name.localeCompare(b.name));
  });

  return {
    activeCohorts,
    loading: activeCohorts === undefined,
  };
}

export function useCohort(id) {
  const cohort = useLiveQuery(() => {
    // Don't query if id is null, undefined, or invalid
    if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
      return null;
    }
    return db.cohorts.get(id);
  }, [id]);

  return {
    cohort,
    loading: cohort === undefined,
  };
}

export function useCohortWithStudents(cohortId) {
  const cohortWithStudents = useLiveQuery(async () => {
    if (!cohortId) return null;

    const cohort = await db.cohorts.get(cohortId);
    if (!cohort) return null;

    const students = await db.students
      .where('cohortId')
      .equals(cohortId)
      .toArray();

    // Sort by name since we can't use orderBy after where/equals
    students.sort((a, b) => a.name.localeCompare(b.name));

    return {
      ...cohort,
      students,
      studentCount: students.length,
    };
  }, [cohortId]);

  return {
    cohortWithStudents,
    loading: cohortWithStudents === undefined,
  };
}

export function useCohortsWithStats() {
  const cohortsWithStats = useLiveQuery(async () => {
    const cohorts = await db.cohorts.orderBy('createdAt').toArray();

    // Get student counts for each cohort
    const cohortsWithStudentCounts = await Promise.all(
      cohorts.map(async (cohort) => {
        const studentCount = await db.students
          .where('cohortId')
          .equals(cohort.id)
          .count();

        const submissionCount = await db.submissions
          .where('studentId')
          .anyOf(
            await db.students.where('cohortId').equals(cohort.id).primaryKeys()
          )
          .count();

        return {
          ...cohort,
          studentCount,
          submissionCount,
        };
      })
    );

    return cohortsWithStudentCounts;
  });

  return {
    cohortsWithStats,
    loading: cohortsWithStats === undefined,
  };
}

export function useCohortByName(cohortName) {
  const cohort = useLiveQuery(
    () =>
      cohortName ? db.cohorts.where('name').equals(cohortName).first() : null,
    [cohortName]
  );

  return {
    cohort,
    loading: cohort === undefined && cohortName !== null,
  };
}
