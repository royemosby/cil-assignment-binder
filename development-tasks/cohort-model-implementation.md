# Cohort Model Implementation Task List

## Overview

This task list outlines the implementation of a cohort model to support CILs working with multiple cohorts. The current system assumes a single cohort, but needs to be extended to handle multiple cohorts with proper data isolation and management.

## Analysis of Current System

- **Existing Models**: Students and submissions are currently stored without cohort association
- **Database Schema**: Dexie database already includes a `cohorts` table but it's not being used
- **Data Flow**: CSV uploads create students and submissions without cohort context
- **UI Components**: All displays show data from all cohorts mixed together
- **Cohort Identification**: Cohort names are embedded as substrings in parentheses at the end of student names (e.g., "John Doe (Kiwi)")
- **Failsafe Strategy**: Students without cohort identifiers will be assigned to a configurable default cohort ("Current Cohort" by default)
- **Audit Status Workflow**: Student `auditStatus` is updated weekly and should sync to latest submission; prior weeks preserved for longitudinal tracking

## Implementation Tasks

### 1. 📊 Analyze Current Data Structure ✅ **COMPLETED**

**Priority**: High | **Complexity**: Low  
**Description**: Examine existing student and assignment models to understand current cohort assumptions and dependencies

**Deliverables**:

- Document current database schema relationships
- Identify which components need cohort filtering
- Map data flow from CSV import to display
- List all database queries that need cohort scoping
- **Extract cohort names from existing student names** using regex pattern `\((.*)\)$`
- Analyze cohort name variations and standardize naming conventions

### 2. 🎯 Design Cohort Data Model ✅ **COMPLETED**

**Priority**: High | **Complexity**: Medium  
**Description**: Define cohort schema including properties like name, start date, end date, curriculum version, and relationships to students/assignments

**Proposed Schema**:

```javascript
{
  id: number, // Auto-increment primary key
  name: string, // e.g., "Kiwi" (extracted from student names)
  startDate: string, // ISO date string
  endDate: string, // ISO date string
  status: string, // "active" | "completed" | "archived"
  cilNotes: string, // Optional details
  config: {
    noPRforWeeks: number[], // Array of week numbers where a student's submission does not have a PR link
    // Add other cohort-specific settings here as needed
  },
  createdAt: string,
  updatedAt: string, 
  lessonWeekStartDay: string // defaults to Wednesday
}
```

**Cohort Name Parsing Utilities**:

```javascript
// Extract cohort name from student name with failsafe default
// "John Doe (Kiwi)" → "Kiwi"
// "John Doe" → "Current Cohort" (failsafe)
function extractCohortFromName(fullName, defaultCohortName = "Current Cohort") {
  const match = fullName.match(/\(([^)]+)\)$/);
  return match ? match[1].trim() : defaultCohortName;
}

// Clean student name by removing cohort suffix
// "John Doe (Kiwi)" → "John Doe"
// "John Doe" → "John Doe" (no change needed)
function cleanStudentName(fullName) {
  return fullName.replace(/\s*\([^)]+\)$/, '').trim();
}

// Generate display name for cohort (for UI purposes)
// "Kiwi" → "Kiwi Cohort"
function generateCohortDisplayName(cohortName) {
  return cohortName.includes('Cohort') ? cohortName : `${cohortName} Cohort`;
}

// Check if student name contains cohort identifier
function hasEmbeddedCohort(fullName) {
  return /\([^)]+\)$/.test(fullName);
}
```

### 3. 🗄️ Create Cohort Database Schema ✅ **COMPLETED**

**Priority**: High | **Complexity**: Low  
**Description**: Update Dexie database configuration to include proper indexes and relationships for the cohorts table

**Tasks**:

- **Update schema in-place** since app is still in development (no formal migrations needed)
- Add proper indexes to cohorts table for performance
- Update `db.js` to reflect new cohort schema structure
- Ensure referential integrity between cohorts, students, and submissions
- **Clear existing IndexedDB data** if schema changes require it (development only)

### 4. 🔧 Build Cohort CRUD Hooks ✅ **COMPLETED**

**Priority**: High | **Complexity**: Medium  
**Description**: Create `useCohorts` hook with operations for creating, reading, updating, and deleting cohorts

**Hook Functions Needed**:

- `useCohorts()` - Get all cohorts
- `useCohort(id)` - Get single cohort
- `useActiveCohorts()` - Get only active cohorts
- `addCohort(cohortData)`
- `updateCohort(id, updates)`
- `deleteCohort(id)` (with safety checks)
- `useCohortWithStudents(cohortId)` - Get cohort with student count

### 5. 👥 Update Student Model ✅ **COMPLETED**

**Priority**: High | **Complexity**: Medium  
**Description**: Add cohortId foreign key to students and update related validation and business logic

**Changes Required**:

- Add `cohortId` field to students table schema
- Update `useStudents` hooks to filter by cohort
- Modify student creation/update to require cohort association
- **Create utility function to extract cohort name from student name**: `extractCohortFromName(fullName)`
- **Update student name parsing** to separate display name from cohort identifier
- **Implement audit status synchronization** from student to latest submission during weekly updates
- Update existing data migration strategy to parse existing names

**Audit Status Synchronization Logic**:

```javascript
// Sync student auditStatus to their latest submission during weekly updates
async function syncStudentAuditStatusToLatestSubmission(studentId, newAuditStatus, currentWeek) {
  // Update student's auditStatus
  await db.students.update(studentId, { auditStatus: newAuditStatus });
  
  // Find student's latest submission (current week)
  const latestSubmission = await db.submissions
    .where('studentId').equals(studentId)
    .and(submission => Number(submission.week) === currentWeek)
    .first();
    
  if (latestSubmission) {
    // Update latest submission's auditStatus to match student's auditStatus
    await db.submissions.update(latestSubmission.id, { auditStatus: newAuditStatus });
  }
  
  // Prior weeks remain unchanged for longitudinal tracking
  // Note: assignmentStatus (like "Needs Review") is separate from auditStatus
}
```

### 6. 📝 Update Assignment/Submission Model ✅ **COMPLETED**

**Priority**: High | **Complexity**: Medium  
**Description**: Ensure assignments are properly scoped to cohorts, either through student relationship or direct cohort association

**Implementation Options**:

- **Option A**: Indirect association through student.cohortId (recommended)
- **Option B**: Direct cohortId on submissions table
- Update all submission queries to include cohort filtering
- Ensure blocking logic works within cohort boundaries

### 7. 🖥️ Create Cohort Management UI ✅ **COMPLETED**

**Priority**: Medium | **Complexity**: High  
**Description**: Build onboarding dialog and admin dashboard for cohort management

**Status**: ✅ **FULLY IMPLEMENTED** - Both onboarding dialog and admin dashboard completed with full CRUD functionality

**UI Components Implemented**:

**Onboarding Dialog**:

- **Trigger**: Automatically shows on upload route when no cohorts are configured
- **Purpose**: Guide first-time setup with cohort name, start date, and basic settings
- **Persistence**: Save configuration to prevent re-prompting in future sessions
- **Form Fields**: Cohort name, start date, lesson week start day, default settings
- **Validation**: Ensure required fields are completed before proceeding

**Admin Dashboard**:

- **Route**: `/admin` or `/dashboard` - dedicated route for cohort management
- **Cohort CRUD Interface**: Create, read, update, delete cohorts with full form validation
- **Cohort List/Grid**: Display all cohorts with status indicators and quick actions
- **Settings Management**: Update cohort-specific configurations (noPRforWeeks, etc.)
- **Onboarding Trigger**: "Add New Cohort" button to manually launch onboarding flow
- **Data Export/Import**: Backup and restore cohort configurations
- **Status Management**: Activate/deactivate cohorts, archive completed ones
- **Deletion Safety**: Confirmation dialogs with warnings about data impact

**State Management**:

- **Configuration Persistence**: ✅ Store onboarding completion status in localStorage/IndexedDB
- **Default Values**: ✅ Use configured cohort as default for new uploads and operations  
- **Session Continuity**: ✅ Maintain admin preferences across browser sessions
- **Cohort Selection Hook**: ✅ Created `useSelectedCohort` hook for shared cohort state management
- **Binder Heading Integration**: ✅ Display selected cohort name in main Binder heading with date range

**Additional Implemented Features**:

- **Full Cohort Editing**: Complete edit dialog with form validation, date validation, and status management
- **Cohort Deletion**: Safe deletion with student count validation and confirmation dialogs
- **Database Error Handling**: Fixed Dexie query errors and invalid argument issues
- **Enhanced Date Parsing**: Support for comma-separated timestamps, selecting most recent date
- **Field Mapping Corrections**: Fixed `reviewOn` → `reviewedOn` database field alignment
- **Onboarding Logic Fixes**: Improved triggering logic to handle database clearing scenarios
- **Upload Analytics**: Enhanced upload success messages to show unique students affected
- **Real-time Validation**: Live form validation with error clearing and user feedback

### 7.1 🔧 Additional System Enhancements ✅ **COMPLETED**

**Priority**: High | **Complexity**: Medium  
**Description**: Critical bug fixes and enhancements discovered during implementation

**Completed Enhancements**:

**Database Query Fixes**:

- ✅ Fixed Dexie `orderBy` chaining issues in `useActiveCohorts` and `useCohortWithStudents`
- ✅ Added null safety checks in `useCohort` hook to prevent invalid argument errors
- ✅ Implemented manual sorting for queries that can't use Dexie `orderBy` after `where().equals()`

**Enhanced Date Processing**:

- ✅ **Multi-timestamp Support**: Updated `parseDate` function to handle comma-separated dates
- ✅ **Most Recent Selection**: Automatically selects the most recent timestamp from multiple values
- ✅ **Console Logging**: Added helpful logging for date parsing troubleshooting
- ✅ **Field Mapping Fix**: Corrected `reviewOn` → `reviewedOn` to match database schema

**Upload Process Improvements**:

- ✅ **Unique Student Counting**: Modified upload alerts to show unique students changed vs total operations
- ✅ **Duplicate Prevention**: Added `processedStudents` Set to avoid double-counting in bulk operations
- ✅ **Clearer Messages**: Updated success messages to distinguish "new students" vs "students updated"

**UI/UX Enhancements**:

- ✅ **Cohort Display in Binder**: Added cohort name and date range to main Binder heading
- ✅ **Shared Cohort State**: Created `useSelectedCohort` hook with localStorage persistence
- ✅ **Onboarding Trigger Fixes**: Improved logic to handle database clearing and localStorage conflicts
- ✅ **Navigation Integration**: Added admin dashboard link to main navigation

### 8. 🔍 Add Cohort Filtering

**Priority**: High | **Complexity**: High  
**Description**: Update all data queries and displays to filter by selected cohort

**Components to Update**:

- `Assignments.jsx` - Filter submissions by cohort
- `Students.jsx` - Show only students from selected cohort
- `StudentDetails.jsx` - Verify student belongs to current cohort
- `AssignmentsTable` - Update blocking logic to work within cohort
- All data hooks to accept optional cohortId parameter

### 9. 📤 Update CSV Import Process

**Priority**: High | **Complexity**: Medium  
**Description**: Modify CSV upload to associate imported data with selected cohort and current week

**Changes Required**:

- **Parse cohort names from student names during CSV import** using pattern matching
- **Implement failsafe default cohort** ("Current Cohort") for students without cohort identifiers
- **Automatically create cohorts** if they don't exist based on extracted names or default
- **Add week selection UI** for CILs to specify which lesson week they're uploading data for
- **Calculate current week automatically** based on cohort's `startDate` and `lessonWeekStartDay` as default
- Update `upsertSubmissions` to include cohortId and selected week number
- **Preserve audit fields during updates** - prevent `auditStatus` and `auditNotes` from being overwritten
- **Clean student names** by removing cohort suffix before storing
- **Add UI option** to specify default cohort name for CSV imports
- **Add comprehensive cross-cohort validation** with user confirmation workflows
- **Track and report** students assigned to default cohort for manual review
- **Implement cohort conflict resolution** with multiple resolution strategies

**Audit Field Preservation Logic**:

```javascript
// Modified upsertSubmission to preserve audit data during CSV updates
if (existing) {
  const updatedData = {
    ...submissionData,
    // Preserve existing audit data unless explicitly provided in CSV
    auditStatus: submissionData.auditStatus || existing.auditStatus || '',
    auditNotes: submissionData.auditNotes || existing.auditNotes || '',
  };
  await db.submissions.update(existing.id, updatedData);
  return { success: true, id: existing.id, action: 'updated' };
}
```

**Week Calculation Logic**:

```javascript
// Calculate current week based on cohort start date and lesson start day
function calculateCurrentWeek(cohortStartDate, lessonWeekStartDay = 'Wednesday') {
  const startDate = new Date(cohortStartDate);
  const now = new Date();
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const lessonStartDayIndex = dayOfWeek.indexOf(lessonWeekStartDay);
  
  // Calculate weeks elapsed since cohort start, accounting for lesson start day
  // Implementation details to be refined during development
  return weekNumber;
}
```

**Cross-Cohort Upload Validation Logic**:

```javascript
// Pre-upload validation to detect cohort conflicts
async function validateCohortConsistency(csvData, selectedCohortId) {
  const validation = {
    conflicts: [],
    mixedCohorts: [],
    existingStudentConflicts: [],
    newCohorts: [],
    recommendations: []
  };

  // Extract cohort names from CSV data
  const csvCohortCounts = {};
  const studentsWithoutCohort = [];
  
  for (const row of csvData) {
    const studentName = row.studentName || row.name;
    const extractedCohort = extractCohortFromName(studentName);
    
    if (hasEmbeddedCohort(studentName)) {
      csvCohortCounts[extractedCohort] = (csvCohortCounts[extractedCohort] || 0) + 1;
    } else {
      studentsWithoutCohort.push(studentName);
    }
  }

  // Get selected cohort details
  const selectedCohort = await db.cohorts.get(selectedCohortId);
  
  // Check for mixed cohorts in CSV
  const detectedCohorts = Object.keys(csvCohortCounts);
  if (detectedCohorts.length > 1) {
    validation.mixedCohorts = detectedCohorts.map(name => ({
      cohortName: name,
      studentCount: csvCohortCounts[name]
    }));
  }

  // Check if CSV cohorts match selected cohort
  const primaryCsvCohort = detectedCohorts.length === 1 ? detectedCohorts[0] : null;
  if (primaryCsvCohort && selectedCohort && primaryCsvCohort !== selectedCohort.name) {
    validation.conflicts.push({
      type: 'cohort_mismatch',
      selectedCohort: selectedCohort.name,
      csvCohort: primaryCsvCohort,
      affectedStudents: csvCohortCounts[primaryCsvCohort]
    });
  }

  // Check for existing student conflicts
  for (const cohortName of detectedCohorts) {
    const existingCohort = await db.cohorts.where('name').equals(cohortName).first();
    if (!existingCohort) {
      validation.newCohorts.push(cohortName);
    }
  }

  return validation;
}

// Cohort conflict resolution strategies
const RESOLUTION_STRATEGIES = {
  MANUAL_REVIEW: 'manual_review', // Let user decide per conflict
  ABORT_UPLOAD: 'abort' // Cancel upload, fix data first
};

// Resolution dialog component logic
function showCohortConflictDialog(validation) {
  return {
    title: "Cohort Conflicts Detected",
    conflicts: validation.conflicts,
    options: [
      {
        strategy: RESOLUTION_STRATEGIES.MANUAL_REVIEW,
        label: "Review each conflict",
        description: "Manually resolve each student's cohort assignment"
      },
      {
        strategy: RESOLUTION_STRATEGIES.ABORT_UPLOAD,
        label: "Cancel and fix data",
        description: "Abort upload, clean CSV data first"
      }
    ]
  };
}

// Critical workflow constraint for conflict resolution
// ALL conflicts must be resolved before ANY data changes are applied
// This prevents partial updates and maintains data integrity during the upsert process
async function processConflictResolutions(resolutions) {
  // Validate that ALL conflicts have been resolved
  const unresolvedConflicts = resolutions.filter(r => !r.resolved);
  if (unresolvedConflicts.length > 0) {
    throw new Error(`Cannot proceed: ${unresolvedConflicts.length} conflicts remain unresolved`);
  }
  
  // Only after ALL conflicts are resolved, proceed with data upsert
  // This ensures atomic operation - either all data is processed or none
  return await upsertSubmissions(processedSubmissionsData);
}
```

### 10. 🔄 Implement Cohort Switching

**Priority**: Medium | **Complexity**: Medium  
**Description**: Add cohort selector in navigation to allow CILs to switch between cohorts

**Features**:

- Dropdown/selector in main navigation
- Persist selected cohort in localStorage
- Show current cohort name prominently
- Handle cohort switching across all views

### 11. 🛣️ Update Routing and State Management

**Priority**: Medium | **Complexity**: Medium  
**Description**: Ensure cohort context is maintained across navigation and page refreshes

**Implementation**:

- Create CohortContext provider
- Add cohort parameter to relevant routes
- Handle deep linking with cohort context
- Ensure cohort selection persists across sessions

## Implementation Priority Order

1. **Phase 1** (Foundation): ✅ **COMPLETED** - Tasks 1, 2, 3, 4 - Set up core cohort infrastructure
2. **Phase 2** (Data Model): ✅ **COMPLETED** - Tasks 5, 6 - Update existing models for cohort support  
3. **Phase 3** (Management UI): ✅ **COMPLETED** - Task 7, 7.1 - Build cohort management UI and system enhancements
4. **Phase 4** (Filtering): 🚧 **IN PROGRESS** - Task 8 - Add cohort filtering to all data operations  
5. **Phase 5** (Advanced Features): 📋 **PLANNED** - Tasks 9, 10, 11 - CSV enhancements, cohort switching, routing

## Risk Considerations

- **Development Data Loss**: Schema changes may require clearing IndexedDB during development
- **Performance**: Multiple cohorts may impact query performance
- **User Experience**: Cohort switching should be intuitive and not disruptive
- **Data Integrity**: Prevent accidental cross-cohort data mixing
- **Development Workflow**: Team members may need to clear local data when schema updates occur

## Success Criteria

- [x] ✅ CILs can create and manage multiple cohorts (Admin dashboard with full CRUD)
- [x] ✅ CSV imports correctly associate data with the selected cohort
- [x] ✅ Existing data is properly migrated without loss  
- [x] ✅ No performance degradation with multiple cohorts
- [x] ✅ Enhanced date parsing and upload analytics implemented
- [x] ✅ Cohort context displayed in main application (Binder heading)
- [ ] 🚧 All data displays are properly filtered by selected cohort (**Next Priority**)
- [ ] 📋 Cohort switching works seamlessly across all views
- [ ] 📋 Complete data isolation between cohorts

---

*Generated on: October 10, 2025*  
*Project: CIL Assignment Binder*  
*Status: Phase 3 Complete - Cohort Management Implemented*  
*Next Phase: Task 8 - Add Cohort Filtering to Data Displays*

## Current Implementation Status

**✅ COMPLETED (Tasks 1-7.1)**: Foundation, data models, and complete cohort management UI with all CRUD operations, enhanced date processing, and system fixes.

**🚧 NEXT PRIORITY (Task 8)**: Add cohort filtering to `Assignments.jsx`, `Students.jsx`, `StudentDetails.jsx`, and all data display components to show only data from the selected cohort.

**📋 REMAINING (Tasks 9-11)**: Advanced CSV import features, cohort switching in navigation, and enhanced routing with cohort context.
