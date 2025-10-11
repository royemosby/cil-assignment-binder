import Dexie from 'dexie';

export const db = new Dexie('cil-assignment-binder');
db.version(1).stores({
  cohorts:
    '++id, name, startDate, endDate, status, lessonWeekStartDay, createdAt, updatedAt',
  students: '++id, cohortId, name, currentStatus, slack, slackUrl, auditStatus',
  submissions:
    '++id, studentId, submittedOn, week, topic, url, reviewCompleted, assignmentStatus, reviewedCompletedBy, reviewedOn, auditStatus, auditNotes',
});

// Utility function to delete all data from the database
export const deleteAllData = async () => {
  try {
    // Clear all tables
    await db.transaction(
      'rw',
      db.cohorts,
      db.students,
      db.submissions,
      async () => {
        await db.cohorts.clear();
        await db.students.clear();
        await db.submissions.clear();
      }
    );

    // Also clear localStorage items related to the app
    localStorage.removeItem('selectedCohortId');
    localStorage.removeItem('onboardingCompleted');

    console.log('All data successfully deleted from database and localStorage');
    return { success: true };
  } catch (error) {
    console.error('Error deleting all data:', error);
    return { success: false, error: error.message };
  }
};
