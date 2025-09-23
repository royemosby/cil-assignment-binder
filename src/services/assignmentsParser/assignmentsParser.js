import Papa from 'papaparse';

export function parseAssignmentsCSV(csvString) {
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    delimiter: ',',
    transformHeader: mapColumn,
  });
  return results;
}

const mapColumn = (title) => {
  switch (title) {
    case 'Student Class Records':
      return 'name';
    case 'Current Class Status':
      return 'currentStatus';
    case "Student's Slack":
      return 'slack';
    case "Student's Slack Link":
      return 'slackUrl';
    case 'Assignment Status':
      return 'assignmentStatus';
    case 'Submitted On':
      return 'submittedOn';
    case 'Week #':
      return 'week';
    case 'Lesson Topic (from Lessons)':
      return 'topic';
    case 'URL':
      return 'url';
    case 'URL2':
      return 'url2';
    case 'Review Completed?':
      return 'reviewCompleted';
    case 'Reviewed By':
      return 'reviewCompletedBy';
    case 'Review Completed On':
      return 'reviewOn';
    default:
      return title;
  }
};
