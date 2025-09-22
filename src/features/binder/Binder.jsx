import { Link } from 'react-router';
import Assignments from './Assignments';
import { Tabs } from 'radix-ui';
import Students from './Students';
import Mentors from './Mentors';

export default function Binder({ persistedFields, persistedAssignments }) {
  return (
    <>
      <h1>Binder</h1>

      {persistedAssignments.length > 0 ? (
        <Tabs.Root defaultValue="assignments" style={{ width: '100%' }}>
          <Tabs.List aria-label="Binder Tabs">
            <Tabs.Trigger value="assignments">Assignments</Tabs.Trigger>
            <Tabs.Trigger value="students">Students</Tabs.Trigger>
            <Tabs.Trigger value="mentors">Mentors</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="assignments">
            <h2>Assignments</h2>
            <Assignments
              fields={persistedFields}
              assignments={persistedAssignments}
            />
          </Tabs.Content>
          <Tabs.Content value="students">
            <Students
              persistedAssignments={persistedAssignments}
              persistedFields={persistedFields}
            />
          </Tabs.Content>
          <Tabs.Content value="mentors">
            <Mentors persistedAssignments={persistedAssignments} />{' '}
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
