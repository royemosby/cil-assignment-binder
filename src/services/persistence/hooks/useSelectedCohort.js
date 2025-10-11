import { useState, useEffect } from 'react';
import { useCohort, useActiveCohorts } from './useCohorts';

/**
 * Hook to manage the currently selected cohort across the application
 * Persists selection in localStorage and provides fallback logic
 */
export function useSelectedCohort() {
  const [selectedCohortId, setSelectedCohortId] = useState(null);
  const { cohort: selectedCohort, loading: cohortLoading } =
    useCohort(selectedCohortId);
  const { activeCohorts, loading: activeCohortsLoading } = useActiveCohorts();

  // Load selected cohort from localStorage on mount
  useEffect(() => {
    const savedCohortId = localStorage.getItem('selectedCohortId');
    if (savedCohortId) {
      const parsedId = parseInt(savedCohortId, 10);
      if (!isNaN(parsedId)) {
        setSelectedCohortId(parsedId);
      }
    }
  }, []);

  // Auto-select first active cohort if none selected and cohorts are available
  useEffect(() => {
    if (!selectedCohortId && activeCohorts && activeCohorts.length > 0) {
      const firstActiveCohort = activeCohorts[0];
      setSelectedCohortId(firstActiveCohort.id);
      localStorage.setItem('selectedCohortId', firstActiveCohort.id.toString());
    }
  }, [selectedCohortId, activeCohorts]);

  // Update selected cohort and persist to localStorage
  const selectCohort = (cohortId) => {
    setSelectedCohortId(cohortId);
    if (cohortId) {
      localStorage.setItem('selectedCohortId', cohortId.toString());
    } else {
      localStorage.removeItem('selectedCohortId');
    }
  };

  return {
    selectedCohortId,
    selectedCohort,
    selectCohort,
    activeCohorts,
    loading: cohortLoading || activeCohortsLoading,
    hasActiveCohorts: activeCohorts && activeCohorts.length > 0,
  };
}
