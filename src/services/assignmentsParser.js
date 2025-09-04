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

  if (errors.length > 0) {
    throw { message: 'CSV contains errors', errors };
  }

  const croppedFields = meta.fields.filter((field) => field !== 'Name');
  const expandedFields = [];

  const assignmentRecords = data.map((assignment) => {
    const { Name, ...rest } = assignment;
    const nameColumnExpanded = parseNameForLessonInfo(Name);
    const newFields = [...Object.keys(nameColumnExpanded), 'localId'];
    newFields.forEach((field) => {
      if (!expandedFields.includes(field)) {
        expandedFields.push(field);
      }
    });
    delete assignment.Name;
    delete assignment.Created;
    const localId = ulid();
    rest.localId = localId;

    return { ...rest, ...nameColumnExpanded };
  });

  meta.fields = [...croppedFields, ...expandedFields];

  console.log({ data: assignmentRecords, meta, errors });
  return { data: assignmentRecords, meta, errors };
}
