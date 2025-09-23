import styles from './Upload.module.css';
import { useState } from 'react';
import UploadForm from './UploadForm';
import { Tabs } from 'radix-ui';
import RecordsSummary from './RecordsSummary';

const tabValues = {
  REMAP: 'remap',
  SUMMARY: 'summary',
};

export default function Upload() {
  const [assignments, setAssignments] = useState([]);
  const [fields, setFields] = useState([]);
  const [upsertReady, setUpsertReady] = useState(false);
  const [activeTab, setActiveTab] = useState(tabValues.SUMMARY);

  return (
    <>
      <UploadForm
        setAssignments={setAssignments}
        setFields={setFields}
        setUpsertReady={setUpsertReady}
      />
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
            </Tabs.List>
            <Tabs.Content value={tabValues.SUMMARY}>
              <RecordsSummary
                assignments={assignments}
                setUpsertReady={setUpsertReady}
                upsertReady={upsertReady}
              />
            </Tabs.Content>
          </Tabs.Root>
        </>
      ) : (
        <p>Select a file to get started.</p>
      )}
    </>
  );
}
