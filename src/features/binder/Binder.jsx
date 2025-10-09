import styles from './Binder.module.css';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSubmissions } from '@services/persistence/hooks';

export default function Binder() {
  const { submissions } = useSubmissions();
  const location = useLocation();

  return (
    <>
      <h1>Binder</h1>
      {submissions ? (
        <>
          <nav className={styles.tabsList}>
            {location.pathname === '/binder/assignments' ? (
              <span
                className={`${styles.tabLink} ${styles.active} ${styles.disabled}`}
              >
                Assignments
              </span>
            ) : (
              <Link to="/binder/assignments" className={styles.tabLink}>
                Assignments
              </Link>
            )}
            {location.pathname === '/binder/students' ||
            location.pathname.startsWith('/binder/students/') ? (
              <span
                className={`${styles.tabLink} ${styles.active} ${styles.disabled}`}
              >
                Students
              </span>
            ) : (
              <Link to="/binder/students" className={styles.tabLink}>
                Students
              </Link>
            )}
          </nav>
          <div className={styles.tabContent}>
            <Outlet />
          </div>
        </>
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
