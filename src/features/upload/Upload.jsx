import styles from './Upload.module.css';
import { useState } from 'react';
import UploadForm from './UploadForm';
import { Tabs } from 'radix-ui';
import { Button } from '@radix-ui/themes';
import RecordsSummary from './RecordsSummary';
import { useSubmissions } from '@services/persistence/hooks';

const tabValues = {
  FIELDS: 'fields',
  SUMMARY: 'summary',
};

export default function Upload() {
  const [assignments, setAssignments] = useState([]);
  const [fields, setFields] = useState([]);
  const [activeTab, setActiveTab] = useState(tabValues.SUMMARY);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const { upsertSubmissions } = useSubmissions();

  const handleConfirmUpload = async () => {
    if (assignments.length === 0) {
      alert('No assignments to upload');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Map assignments to submission format expected by the database
      // Field names are already mapped by assignmentsParser.js
      const submissionsData = assignments.map((assignment) => ({
        name: assignment.name,
        slack: assignment.slack,
        currentStatus: assignment.currentStatus,
        slackUrl: assignment.slackUrl,

        // Submission data
        week: assignment.week,
        topic: assignment.topic,
        url: assignment.url,
        submittedOn: assignment.submittedOn || null,
        reviewCompleted: assignment.reviewCompleted === '✅',
        reviewCompletedBy: assignment.reviewCompletedBy,
        reviewOn: assignment.reviewOn,
        assignmentStatus: assignment.assignmentStatus,
      }));

      // Perform bulk upsert
      const result = await upsertSubmissions(submissionsData);

      setUploadResult(result);

      if (result.success) {
        alert(`Upload successful! 
Students: ${result.results.students.created} created, ${result.results.students.updated} updated
Submissions: ${result.results.submissions.created} created, ${result.results.submissions.updated} updated`);

        // Clear the form data after successful upload
        setAssignments([]);
        setFields([]);
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
    }
  };

  return (
    <>
      <UploadForm setAssignments={setAssignments} setFields={setFields} />
      <hr />
      {assignments.length > 0 ? (
        <>
          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            style={{ width: '100%' }}
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
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
              }}
            >
              <h4>Upload Successful!</h4>
              <p>
                Students: {uploadResult.results.students.created} created,{' '}
                {uploadResult.results.students.updated} updated
              </p>
              <p>
                Submissions: {uploadResult.results.submissions.created} created,{' '}
                {uploadResult.results.submissions.updated} updated
              </p>
            </div>
          )}
          {uploadResult && !uploadResult.success && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
              }}
            >
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
