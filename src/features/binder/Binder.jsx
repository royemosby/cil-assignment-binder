import { Link } from 'react-router';

export default function Binder() {
  return (
    <>
      <h1>Binder</h1>
      <p>
        Looks a bit empty here! Get started by{' '}
        <Link to="/upload">uploading a CSV</Link> from the assignments view in
        Airtable
      </p>
    </>
  );
}
