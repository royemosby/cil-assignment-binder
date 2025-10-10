import styles from './Upload.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadForm from './UploadForm';
import { Tabs } from '@radix-ui/themes';
import { Button } from '@radix-ui/themes';
import RecordsSummary from './RecordsSummary';
import { useSubmissions, useCohorts } from '@services/persistence/hooks';
import { parseDate } from '@services/utils';
import CohortOnboardingDialog from '@components/CohortOnboardingDialog';
import CohortConflictDialog from '@components/CohortConflictDialog';
import WeekSelectionDialog from '@components/WeekSelectionDialog';

const tabValues = {
  FIELDS: 'fields',
  SUMMARY: 'summary',
};

export default function Upload() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [fields, setFields] = useState([]);
  const [activeTab, setActiveTab] = useState(tabValues.SUMMARY);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedCohortId, setSelectedCohortId] = useState(null);

  // Enhanced upload workflow state
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showWeekDialog, setShowWeekDialog] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [pendingSubmissionsData, setPendingSubmissionsData] = useState(null);

  const { upsertSubmissions, validateCohortConsistency } = useSubmissions();
  const { cohorts, loading: cohortsLoading } = useCohorts();

  // Check if onboarding is needed
  useEffect(() => {
    // Skip if cohorts are still loading
    if (cohortsLoading) return;

    // If no cohorts exist in the database, show onboarding dialog
    // This takes priority over localStorage flag to handle cases where DB is cleared
    if (!cohorts || cohorts.length === 0) {
      setShowOnboarding(true);
    } else if (cohorts && cohorts.length > 0) {
      setShowOnboarding(false);
      // Get selected cohort from localStorage or use the first active cohort
      const savedCohortId = localStorage.getItem('selectedCohortId');
      const activeCohorts = cohorts.filter((c) => c.status === 'active');

      if (
        savedCohortId &&
        cohorts.find((c) => c.id.toString() === savedCohortId)
      ) {
        setSelectedCohortId(parseInt(savedCohortId));
      } else if (activeCohorts.length > 0) {
        setSelectedCohortId(activeCohorts[0].id);
        localStorage.setItem(
          'selectedCohortId',
          activeCohorts[0].id.toString()
        );
      }
    }
  }, [cohorts, cohortsLoading]);

  const handleCohortCreated = (cohortId) => {
    setSelectedCohortId(cohortId);
    setShowOnboarding(false);
  };

  // Helper: Get selected cohort object
  const getSelectedCohort = () => {
    return cohorts?.find((c) => c.id === selectedCohortId);
  };

  // Helper: Handle conflict resolution
  const handleConflictResolution = (resolution, cohortName) => {
    if (resolution === 'abort') {
      // Cancel the upload process
      setShowConflictDialog(false);
      setValidationResult(null);
      setPendingSubmissionsData(null);
      return;
    }

    if (resolution === 'switch_cohort') {
      // Find and switch to the specified cohort
      const targetCohort = cohorts?.find((c) => c.name === cohortName);
      if (targetCohort) {
        setSelectedCohortId(targetCohort.id);
        localStorage.setItem('selectedCohortId', targetCohort.id.toString());
      }
    }

    // Continue with upload workflow
    setShowConflictDialog(false);
    setShowWeekDialog(true);
  };

  // Helper: Handle week selection
  const handleWeekSelection = (week) => {
    setShowWeekDialog(false);

    // Proceed with actual upload
    performAtomicUpload(week);
  };

  // Helper: Perform atomic upload with all validations passed
  const performAtomicUpload = async (displayWeek) => {
    if (!pendingSubmissionsData) return;

    setIsUploading(true);

    try {
      // Use the original week values from CSV (already included in pendingSubmissionsData)
      // The displayWeek parameter is now just for dialog display purposes
      const submissionsData = pendingSubmissionsData;

      // Perform bulk upsert
      const result = await upsertSubmissions(submissionsData);

      setUploadResult(result);

      if (result.success) {
        alert(`Upload successful! 
Students: ${result.results.students.created} new students, ${result.results.students.updated} students updated
Submissions: ${result.results.submissions.created} created, ${result.results.submissions.updated} updated`);

        // Clear the form data after successful upload
        setAssignments([]);
        setFields([]);

        // Navigate to binder assignments page
        navigate('/binder/assignments');
      } else {
        alert(
          `Upload completed with some errors. Check the console for details.`
        );
        console.error('Upload errors:', result);
      }
    } catch (error) {
      console.error('Error during upload:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
      setPendingSubmissionsData(null);
      setValidationResult(null);
    }
  };

  const handleConfirmUpload = async () => {
    if (assignments.length === 0) {
      alert('No assignments to upload');
      return;
    }

    if (!selectedCohortId) {
      alert('Please select a cohort before uploading');
      return;
    }

    try {
      // Validate cohort consistency before processing
      console.log('Validating cohort consistency...');
      const validation = await validateCohortConsistency(
        assignments,
        selectedCohortId
      );

      // Prepare submissions data with original week values from CSV
      const submissionsData = assignments.map((assignment) => ({
        name: assignment.name,
        slack: assignment.slack,
        currentStatus: assignment.currentStatus,
        slackUrl: assignment.slackUrl,
        cohortId: selectedCohortId, // Add cohort context

        // Submission data with original week from CSV
        week: assignment.week?.toString() || '1', // Use original week from CSV
        topic: assignment.topic,
        url: assignment.url,
        submittedOn: parseDate(assignment.submittedOn),
        reviewCompleted: assignment.reviewCompleted === '✅',
        reviewCompletedBy: assignment.reviewCompletedBy,
        reviewedOn: parseDate(assignment.reviewOn),
        assignmentStatus: assignment.assignmentStatus,
        auditStatus: '', // Preserve existing audit data during upsert
        auditNotes: '', // Preserve existing audit data during upsert
      }));

      // Store prepared data for atomic upload
      setPendingSubmissionsData(submissionsData);
      setValidationResult(validation);

      // Check for conflicts that need resolution
      if (
        validation.conflicts.length > 0 ||
        validation.mixedCohorts.length > 0
      ) {
        console.log('Cohort conflicts detected:', validation);
        setShowConflictDialog(true);
        return;
      }

      console.log('Cohort validation passed, proceeding to week selection...');

      // No conflicts, proceed directly to week information display
      setShowWeekDialog(true);
    } catch (error) {
      console.error('Error during upload preparation:', error);
      alert('Upload preparation failed: ' + error.message);
    }
  };

  return (
    <>
      <CohortOnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onCohortCreated={handleCohortCreated}
      />

      <CohortConflictDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
        validation={validationResult}
        selectedCohortName={getSelectedCohort()?.name}
        onResolve={handleConflictResolution}
      />

      <WeekSelectionDialog
        open={showWeekDialog}
        onOpenChange={setShowWeekDialog}
        selectedCohort={getSelectedCohort()}
        detectedWeeks={
          pendingSubmissionsData
            ? [
                ...new Set(pendingSubmissionsData.map((s) => parseInt(s.week))),
              ].sort((a, b) => a - b)
            : []
        }
        onWeekSelect={handleWeekSelection}
      />

      <UploadForm setAssignments={setAssignments} setFields={setFields} />
      <hr />
      {assignments.length > 0 ? (
        <>
          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            className={styles.tabsRoot}
          >
            <Tabs.List aria-label="Upload Tabs" className={styles.tabsList}>
              <Tabs.Trigger
                value={tabValues.SUMMARY}
                onClick={() => setActiveTab(tabValues.SUMMARY)}
              >
                Records Summary Tab
              </Tabs.Trigger>
              <Tabs.Trigger
                value={tabValues.FIELDS}
                onClick={() => setActiveTab(tabValues.FIELDS)}
              >
                Fields Tab
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value={tabValues.SUMMARY}>
              <RecordsSummary assignments={assignments} />
            </Tabs.Content>
            <Tabs.Content value={tabValues.FIELDS}>
              <h3>Fields</h3>
              <ul>
                {fields.map((field, idx) => (
                  <li key={idx}>{field}</li>
                ))}
              </ul>
            </Tabs.Content>
          </Tabs.Root>
          <Button onClick={handleConfirmUpload} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Confirm Upload'}
          </Button>
          {uploadResult && uploadResult.success && (
            <div className={styles.successMessage}>
              <h4>Upload Successful!</h4>
              <p>
                Students: {uploadResult.results.students.created} new students,{' '}
                {uploadResult.results.students.updated} students updated
              </p>
              <p>
                Submissions: {uploadResult.results.submissions.created} created,{' '}
                {uploadResult.results.submissions.updated} updated
              </p>
            </div>
          )}
          {uploadResult && !uploadResult.success && (
            <div className={styles.errorMessage}>
              <h4>Upload Completed with Errors</h4>
              <p>
                Some records may not have been processed correctly. Check the
                browser console for details.
              </p>
            </div>
          )}
        </>
      ) : (
        <p>Select a file to get started.</p>
      )}
    </>
  );
}
