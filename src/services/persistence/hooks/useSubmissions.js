import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useSubmissions() {
  const submissions = useLiveQuery(() => db.submissions.toArray());
  const addSubmission = async (submissionData) => {
    try {
      const id = await db.submissions.add(submissionData);
      return { success: true, id };
    } catch (error) {
      console.error('Error adding submission:', error);
      return { success: false, error: error.message };
    }
  };
  const updateSubmission = async (id, updates) => {
    try {
      await db.submissions.update(id, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating submission:', error);
      return { success: false, error: error.message };
    }
  };
  const deleteSubmission = async (id) => {
    try {
      await db.submissions.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return { success: false, error: error.message };
    }
  };
  const upsertSubmission = async (
    submissionData,
    uniqueFields = ['studentId', 'week', 'topic', 'submittedOn']
  ) => {
    try {
      if (submissionData.id) {
        // If ID is provided, try to update first
        const existing = await db.submissions.get(submissionData.id);
        if (existing) {
          await db.submissions.update(submissionData.id, submissionData);
          console.log(existing);
          return { success: true, id: submissionData.id, action: 'updated' };
        }
      }

      // Search by unique field combination (e.g., studentId + week + topic)
      // For compound unique constraints, we need to filter manually since Dexie doesn't support chaining multiple where clauses
      const allSubmissions = await db.submissions.toArray();
      const existing = allSubmissions.find((submission) => {
        const match = uniqueFields.every((field) => {
          const submissionValue = submissionData[field];
          const existingValue = submission[field];

          // Both values must be defined and match for this field to be considered a match
          if (
            submissionValue === undefined ||
            submissionValue === null ||
            existingValue === undefined ||
            existingValue === null
          ) {
            return false; // Fail the match if either value is undefined/null
          }

          // Convert both values to strings for comparison to handle type differences
          return String(existingValue) === String(submissionValue);
        });

        // Debug logging
        if (match) {
          console.log('Found matching submission for update:', {
            existingId: submission.id,
            matchedOn: uniqueFields.reduce(
              (acc, field) => ({
                ...acc,
                [field]: {
                  existing: submission[field],
                  new: submissionData[field],
                },
              }),
              {}
            ),
          });
        }

        return match;
      });
      if (existing) {
        console.log('Updating submission with data:', {
          id: existing.id,
          oldData: existing,
          newData: submissionData,
        });
        await db.submissions.update(existing.id, submissionData);
        return { success: true, id: existing.id, action: 'updated' };
      }

      // If not found, create new
      const id = await db.submissions.add(submissionData);
      return { success: true, id, action: 'created' };
    } catch (error) {
      console.error('Error upserting submission:', error);
      return { success: false, error: error.message };
    }
  };

  // Bulk operations
  const addSubmissions = async (submissionsArray) => {
    try {
      const ids = await db.submissions.bulkAdd(submissionsArray);
      return { success: true, ids };
    } catch (error) {
      console.error('Error bulk adding submissions:', error);
      return { success: false, error: error.message };
    }
  };

  // Bulk upsert operations with student handling
  const upsertSubmissions = async (
    submissionsArray,
    uniqueFields = ['studentId', 'week', 'topic', 'submittedOn']
  ) => {
    try {
      const results = [];
      const studentResults = { created: 0, updated: 0, errors: [] };

      for (const submissionData of submissionsArray) {
        let processedSubmission = { ...submissionData };

        // If submission has a 'name' field but no studentId, handle student upsert
        if (submissionData.name && !submissionData.studentId) {
          // Extract student data from submission
          const studentData = {
            name: submissionData.name,
            ...(submissionData.slack && { slack: submissionData.slack }),
            ...(submissionData.slackUrl && {
              slackUrl: submissionData.slackUrl,
            }),
            ...(submissionData.cohortId && {
              cohortId: submissionData.cohortId,
            }),
            ...(submissionData.currentStatus && {
              currentStatus: submissionData.currentStatus,
            }),
          };

          // Handle student upsert directly
          let studentResult;
          try {
            // Search for existing student by name
            const existingStudent = await db.students
              .where('name')
              .equals(studentData.name)
              .first();

            if (existingStudent) {
              await db.students.update(existingStudent.id, studentData);
              studentResult = {
                success: true,
                id: existingStudent.id,
                action: 'updated',
              };
            } else {
              // Create new student
              const id = await db.students.add(studentData);
              studentResult = { success: true, id, action: 'created' };
            }
          } catch (error) {
            console.error('Error upserting student:', error);
            studentResult = { success: false, error: error.message };
          }

          if (studentResult.success) {
            processedSubmission.studentId = studentResult.id;
            if (studentResult.action === 'created') {
              studentResults.created++;
            } else {
              studentResults.updated++;
            }

            // Remove student fields from submission data
            /* eslint-disable no-unused-vars */
            const {
              name,
              slack,
              slackUrl,
              cohortId,
              currentStatus,
              ...cleanSubmissionData
            } = processedSubmission;
            processedSubmission = cleanSubmissionData;
          } else {
            console.error(
              'Error handling student for submission:',
              studentResult.error
            );
            studentResults.errors.push({
              studentName: submissionData.name,
              error: studentResult.error,
            });
            // Continue with submission without studentId - it will likely fail but we track it
          }
        }

        // Now process the submission
        const submissionResult = await upsertSubmission(
          processedSubmission,
          uniqueFields
        );
        results.push(submissionResult);
      }

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      return {
        success: failed.length === 0 && studentResults.errors.length === 0,
        results: {
          submissions: {
            successful: successful.length,
            failed: failed.length,
            created: successful.filter((r) => r.action === 'created').length,
            updated: successful.filter((r) => r.action === 'updated').length,
            errors: failed.map((r) => r.error),
          },
          students: studentResults,
        },
      };
    } catch (error) {
      console.error('Error bulk upserting submissions:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    submissions,
    addSubmission,
    updateSubmission,
    deleteSubmission,
    upsertSubmission,
    addSubmissions,
    upsertSubmissions,
    loading: submissions === undefined,
  };
}

export function useSubmission(id) {
  // Read - get single submission by id
  const submission = useLiveQuery(() => db.submissions.get(id), [id]);

  return {
    submission,
    loading: submission === undefined,
  };
}

export function useSubmissionsByStudent(studentId) {
  // Read - get submissions by student
  const submissions = useLiveQuery(
    () => db.submissions.where('studentId').equals(studentId).toArray(),
    [studentId]
  );

  return {
    submissions,
    loading: submissions === undefined,
  };
}

export function useSubmissionsByWeek(week) {
  // Read - get submissions by week
  const submissions = useLiveQuery(
    () => db.submissions.where('week').equals(week).toArray(),
    [week]
  );

  return {
    submissions,
    loading: submissions === undefined,
  };
}

export function useSubmissionsWithStudents() {
  // Read - get submissions joined with student data
  const submissionsWithStudents = useLiveQuery(async () => {
    const submissions = await db.submissions.toArray();
    if (!submissions.length) return [];
    // Fetch all students once for efficient lookup
    const students = await db.students.toArray();
    const studentMap = students.reduce((acc, student) => {
      acc[student.id] = student;
      return acc;
    }, {});
    return submissions.map((submission) => ({
      ...submission,
      student: studentMap[submission.studentId] || null,
    }));
  });

  return {
    submissionsWithStudents,
    loading: submissionsWithStudents === undefined,
  };
}
