# Current Data Structure Analysis

## Database Schema (Dexie)

### Current Tables

#### `cohorts` Table

```javascript
cohorts: '++id, name, startDate, endDate, config, details'
```

- **Status**: Exists but unused
- **Primary Key**: Auto-increment `id`
- **Indexed Fields**: `name`, `startDate`, `endDate`, `config`, `details`

#### `students` Table

```javascript
students: '++id, cohortId, name, currentStatus, slack, slackUrl, auditStatus'
```

- **Primary Key**: Auto-increment `id`
- **Foreign Key**: `cohortId` (exists but unused)
- **Indexed Fields**: `cohortId`, `name`, `currentStatus`, `slack`, `slackUrl`, `auditStatus`
- **Current Issue**: No cohort association in practice

#### `submissions` Table

```javascript
submissions: '++id, studentId, submittedOn, week, topic, url, reviewCompleted, assignmentStatus, reviewedCompletedBy, reviewedOn, auditStatus, auditNotes'
```

- **Primary Key**: Auto-increment `id`
- **Foreign Key**: `studentId` → `students.id`
- **Indexed Fields**: All fields are indexed
- **Current Issue**: No direct cohort scoping

## Current Data Flow

### CSV Upload Process (`Upload.jsx`)

1. **File Selection** → `UploadForm.jsx`
2. **CSV Parsing** → `assignmentsParser.js` (PapaParse)
3. **Field Mapping** → Column headers mapped to internal fields
4. **Data Processing** → `upsertSubmissions()` in `useSubmissions.js`
5. **Student Creation** → Automatic student upsert by `name`

### Student Upsert Logic (`useStudents.js`)

```javascript
// Current matching criteria
const upsertStudent = async (studentData, uniqueField = 'id') => {
  if (uniqueField === 'id' && studentData.id) {
    // Match by ID
    const existing = await db.students.get(studentData.id);
  } else if (uniqueField !== 'id') {
    // Match by other field (commonly 'name')
    const existing = await db.students
      .where(uniqueField)
      .equals(studentData[uniqueField])
      .first();
  }
}
```

### Submission Upsert Logic (`useSubmissions.js`)

```javascript
// Current matching criteria for submissions
const upsertSubmission = async (
  submissionData,
  uniqueFields = ['studentId', 'week', 'topic', 'submittedOn']
) => {
  // Compound matching on multiple fields
  const existing = allSubmissions.find((submission) => {
    return uniqueFields.every((field) => {
      return String(submission[field]) === String(submissionData[field]);
    });
  });
}
```

## Components Requiring Cohort Updates

### Data Display Components

- **`Assignments.jsx`** - Groups by student status, needs cohort filtering
- **`Students.jsx`** - Lists all students, needs cohort scoping
- **`StudentDetails.jsx`** - Shows individual student, needs cohort verification
- **`AssignmentsTable.jsx`** - Displays submissions, needs cohort context

### Data Hook Files

- **`useStudents.js`** - All student queries need cohort filtering
- **`useSubmissions.js`** - Submission queries need cohort context via student relationship
- **`useCohorts.js`** - Already exists but minimal implementation

### Navigation & Routing

- **`AppRoutes.jsx`** - May need cohort context in routes
- **`Nav.jsx`** - Needs cohort selector
- **`Binder.jsx`** - Main container needs cohort awareness

## Current Cohort Assumptions

### Single Cohort Design

- All queries assume single cohort context
- No cohort filtering in any data operations
- Student names contain embedded cohort identifiers: `"John Doe (Kiwi)"`
- No cohort selection UI or context management

### Data Isolation Issues

- Students from different cohorts mixed in same views
- Assignment blocking logic doesn't respect cohort boundaries
- No way to switch between cohorts
- Cross-cohort data contamination possible

## Cohort Name Analysis

### Pattern Recognition

From student names like "John Doe (Kiwi)":

- **Regex Pattern**: `\(([^)]+)\)$`
- **Extracted Cohort**: "Kiwi"
- **Clean Name**: "John Doe"

### Edge Cases Found

- Students without cohort identifiers
- Malformed patterns: "John Doe (Kiwi" (missing closing paren)
- Multiple parentheses: "John (Jr) Doe (Kiwi)"
- Empty cohort: "John Doe ()"

### Failsafe Strategy

Students without cohort identifiers → "Current Cohort" (configurable default)

## Current State Summary

### Working Systems

✅ **Database Schema**: Tables exist with proper structure  
✅ **Basic CRUD**: Student and submission operations work  
✅ **CSV Import**: Functional upload and parsing  
✅ **Data Display**: All views render correctly  

### Missing Cohort Features

❌ **Cohort Association**: Students not linked to cohorts  
❌ **Cohort Filtering**: No data scoping by cohort  
❌ **Cohort Management**: No UI for cohort operations  
❌ **Cohort Context**: No way to select/switch cohorts  
❌ **Cross-Cohort Validation**: No conflict detection in uploads  

### Critical Dependencies

1. **Student Upsert Matching** must be updated to handle cohort contexts
2. **All Data Queries** need cohort filtering parameters
3. **CSV Upload Logic** needs cohort detection and conflict resolution
4. **Navigation System** needs cohort selection and persistence

## Next Steps

Based on this analysis, the implementation should:

1. Update student upsert to use `cleanName + cohortId` matching
2. Add cohort filtering to all data hooks
3. Implement cohort name extraction utilities
4. Create cohort management UI components
5. Add cross-cohort validation to CSV uploads
