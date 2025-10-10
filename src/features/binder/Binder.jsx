import styles from './Binder.module.css';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  useSubmissionsByCohort,
  useSelectedCohort,
} from '@services/persistence/hooks';
import { calculateCurrentWeek } from '@services/utils/cohortUtils';

export default function Binder() {
  const { selectedCohort } = useSelectedCohort();
  const { submissions } = useSubmissionsByCohort(selectedCohort?.id);
  const location = useLocation();

  // Format cohort dates for display
  const formatCohortDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateRange = () => {
    if (!selectedCohort) return '';

    const startDate = formatCohortDate(selectedCohort.startDate);
    const endDate = formatCohortDate(selectedCohort.endDate);

    // Calculate current week number (convert from 0-based to 1-based)
    const currentWeekZeroBased = calculateCurrentWeek(
      selectedCohort.startDate,
      selectedCohort.lessonWeekStartDay || 'Wednesday'
    );
    const currentWeek = currentWeekZeroBased + 1;

    // Debug logging
    console.log('Week calculation debug:', {
      cohortStartDate: selectedCohort.startDate,
      lessonWeekStartDay: selectedCohort.lessonWeekStartDay || 'Wednesday',
      zeroBased: currentWeekZeroBased,
      displayWeek: currentWeek,
    });

    if (startDate && endDate) {
      return `${startDate} - ${endDate} | Current week: ${currentWeek}`;
    } else if (startDate) {
      return `Started ${startDate} | Current week: ${currentWeek}`;
    } else {
      return '';
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h1>
          Binder{selectedCohort ? ` for ${selectedCohort.name} Cohort` : ''}
        </h1>
        {selectedCohort && formatDateRange() && (
          <p className={styles.subtitle}>{formatDateRange()}</p>
        )}
      </div>
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
