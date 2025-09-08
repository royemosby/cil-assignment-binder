import Papa from 'papaparse';
import { ulid } from 'ulid';

export function parseAssignmentsCSV(csvString) {
  const results = Papa.parse(csvString, {
    header: true,
    preview: 3,
    skipEmptyLines: true,
    delimiter: ',',
  });
  return results;
}

export function parseNameForLessonInfo(name) {
  // Drop student name
  // Extract lesson number
  const lessonNumberMatch = name.match(/Lesson (\d{1,2})/);
  const lessonNumber = lessonNumberMatch ? lessonNumberMatch[1] : null;

  // Extract datetime string
  const dateTimeMatch = name.match(/submitted on([0-9T:\-.]+Z)/);
  let lessonNameMatch;
  const dateTimeString = dateTimeMatch ? dateTimeMatch[1].trim() : null;

  if (dateTimeMatch) {
    // Extract lesson name (matches any string between ": " and "submitted on")
    lessonNameMatch = name.match(/Lesson \d{1,2}: (.*?)submitted on/);
  } else {
    // Extract lesson name where "submitted on" is missing from entry
    lessonNameMatch = name.match(/Lesson \d{1,2}: (.*)/);
  }

  const lessonName = lessonNameMatch ? lessonNameMatch[1].trim() : null;

  //For consistency with other column titles in the CSV
  return {
    'Lesson Number': lessonNumber,
    'Lesson Name': lessonName,
    'Submitted On': dateTimeString,
  };
}

export function processAssignmentsCSV(csvString) {
  const { data, errors, meta } = parseAssignmentsCSV(csvString);
  const requiredFields = [
    'Name',
    'Current Class Status',
    'Student Class Records',
    'Review Completed?',
    'URL',
    'Student Section #',
    'Created',
    "Student's Slack",
  ];
  const missingFields = requiredFields.filter(
    (field) => !meta.fields.includes(field)
  );
  if (missingFields.length > 0) {
    throw new Error(
      `CSV is missing required fields: ${missingFields.join(', ')}`
    );
  }
  if (errors.length > 0) {
    throw new Error(
      `The CSV parser has ran into one or more issues: ${errors.map((e) => `type: ${e.type}; message: ${e.message} - in row ${e.row} (${e.code})`)}`,
      {
        cause: errors,
      }
    );
  }

  const croppedFields = meta.fields.filter((field) => field !== 'Name');
  const expandedFields = [];

  const assignmentRecords = data.map((assignment) => {
    const { Name, ...rest } = assignment;
    const nameColumnExpanded = parseNameForLessonInfo(Name);
    const newFields = [
      ...Object.keys(nameColumnExpanded),
      'binderAssignmentId',
    ];
    newFields.forEach((field) => {
      if (!expandedFields.includes(field)) {
        expandedFields.push(field);
      }
    });
    delete assignment.Name;
    delete assignment.Created;
    const binderAssignmentId = ulid();
    rest.binderAssignmentId = binderAssignmentId;

    return { ...rest, ...nameColumnExpanded };
  });

  meta.fields = [...croppedFields, ...expandedFields];
  return { data: assignmentRecords, meta, errors };
}
