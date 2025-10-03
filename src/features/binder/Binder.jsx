import styles from './Binder.module.css';
import { Link } from 'react-router';
import { Tabs } from 'radix-ui';
import Assignments from './Assignments';
import Students from './Students/Students';
import { useSubmissions } from '@services/persistence/hooks';

export default function Binder() {
  const { submissions } = useSubmissions();
  return (
    <>
      <h1>Binder</h1>
      {submissions ? (
        <Tabs.Root defaultValue="assignments">
          <Tabs.List className={styles.tabsList}>
            <Tabs.Trigger value="assignments">Assignments</Tabs.Trigger>
            <Tabs.Trigger value="students">Students</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="assignments">
            <Assignments />
          </Tabs.Content>
          <Tabs.Content value="students">
            <Students />
          </Tabs.Content>
        </Tabs.Root>
      ) : (
        <p>
          Looks a bit empty here! Get started by{' '}
          <Link to="/upload">uploading a CSV</Link> from the assignments view in
          Airtable
        </p>
      )}
    </>
  );
}
