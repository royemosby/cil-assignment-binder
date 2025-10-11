import { useSelectedCohort } from '../../services/persistence/hooks';
import { Link } from 'react-router-dom';

export default function CohortSelector({ showManageLink = true }) {
  const {
    selectedCohort,
    activeCohorts,
    selectCohort,
    loading,
    hasActiveCohorts,
  } = useSelectedCohort();

  if (loading) {
    return (
      <div>
        <span style={{ fontSize: '0.875rem', color: 'gray' }}>
          Loading cohorts...
        </span>
      </div>
    );
  }

  if (!hasActiveCohorts) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'gray' }}>
          No cohorts available
        </span>
        <Link
          to="/admin"
          style={{
            textDecoration: 'none',
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            backgroundColor: 'var(--blue-3)',
            borderRadius: '4px',
            color: 'var(--blue-11)',
          }}
        >
          Create Cohort
        </Link>
      </div>
    );
  }

  const handleCohortChange = (event) => {
    const cohortId = parseInt(event.target.value, 10);
    if (!isNaN(cohortId)) {
      selectCohort(cohortId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label
          style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--gray-11)',
          }}
        >
          Cohort:
        </label>

        <select
          value={selectedCohort?.id || ''}
          onChange={handleCohortChange}
          style={{
            minWidth: '180px',
            padding: '0.375rem 0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'var(--gray-2)',
            border: '1px solid var(--gray-6)',
            borderRadius: '4px',
            color: 'var(--gray-12)',
          }}
        >
          <option value="">Select a cohort...</option>
          {activeCohorts?.map((cohort) => (
            <option key={cohort.id} value={cohort.id}>
              {cohort.name} ({cohort.status})
            </option>
          ))}
        </select>

        {showManageLink && (
          <Link
            to="/admin"
            style={{
              textDecoration: 'none',
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--gray-3)',
              borderRadius: '4px',
              color: 'var(--gray-11)',
              border: '1px solid var(--gray-6)',
            }}
          >
            Manage
          </Link>
        )}
      </div>

      {selectedCohort && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--gray-9)',
            fontStyle: 'italic',
            textAlign: 'right',
            marginTop: '0.125rem',
          }}
        >
          {selectedCohort.startDate
            ? `Started: ${new Date(selectedCohort.startDate).toLocaleDateString()}`
            : 'No start date set'}
        </div>
      )}
    </div>
  );
}
