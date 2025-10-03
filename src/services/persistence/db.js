import Dexie from 'dexie';

//not in use yet!
export const db = new Dexie('cil-assignment-binder');
db.version(1).stores({
  cohorts: '++id, name, startDate, endDate, config, details',

  students: '++id, cohortId, name, currentStatus, slack, slackUrl, auditStatus',
  submissions:
    '++id, studentId, submittedOn, week, topic, url, reviewCompleted, assignmentStatus, reviewedCompletedBy, reviewedOn, auditStatus, auditNotes',
});
