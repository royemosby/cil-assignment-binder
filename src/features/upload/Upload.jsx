import styles from './Upload.module.css';
import { useState, useEffect } from 'react';
import UploadForm from './UploadForm';
import { Tabs } from 'radix-ui';
import FieldAliasForm from './FieldAliasForm';
import RecordsSummary from './RecordsSummary';
import { useNavigate } from 'react-router';

const tabValues = {
  REMAP: 'remap',
  SUMMARY: 'summary',
};

export default function Upload({
  persistedFields,
  setPersistedFields,
  setPersistedAssignments,
}) {
  const [assignments, setAssignments] = useState([]);
  const [fields, setFields] = useState([]);
  const [upsertReady, setUpsertReady] = useState(false);
  const [activeTab, setActiveTab] = useState(tabValues.SUMMARY);
  const navigate = useNavigate();

  useEffect(() => {
    if (upsertReady) {
      setPersistedAssignments(assignments);
      setPersistedFields(fields);
      setAssignments([]);
      setFields([]);
      navigate('/');
    }
  }, [upsertReady]);

  function confirmFieldMapping() {
    setActiveTab(tabValues.SUMMARY);
  }

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
              <Tabs.Trigger
                value={tabValues.REMAP}
                onClick={() => setActiveTab(tabValues.REMAP)}
              >
                Field Aliases Tab
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value={tabValues.REMAP}>
              <FieldAliasForm
                assignments={assignments}
                fields={fields}
                persistedFields={persistedFields}
                setFields={setFields}
                confirmFieldMapping={confirmFieldMapping}
              />
            </Tabs.Content>
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
