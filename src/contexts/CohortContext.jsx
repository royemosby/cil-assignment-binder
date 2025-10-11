import { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useCohort, useActiveCohorts } from '../services/persistence/hooks';

const CohortContext = createContext();

export function CohortContextProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [selectedCohortId, setSelectedCohortId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { cohort: selectedCohort, loading: cohortLoading } =
    useCohort(selectedCohortId);
  const { activeCohorts, loading: activeCohortsLoading } = useActiveCohorts();

  // Initialize cohort selection from URL params or localStorage
  useEffect(() => {
    if (activeCohortsLoading || isInitialized) return;

    const urlCohortId = searchParams.get('cohort');
    const storedCohortId = localStorage.getItem('selectedCohortId');

    let cohortIdToSelect = null;

    // Priority order: URL param > localStorage > first active cohort
    if (urlCohortId) {
      const parsedUrlId = parseInt(urlCohortId, 10);
      if (
        !isNaN(parsedUrlId) &&
        activeCohorts?.find((c) => c.id === parsedUrlId)
      ) {
        cohortIdToSelect = parsedUrlId;
      }
    } else if (storedCohortId) {
      const parsedStoredId = parseInt(storedCohortId, 10);
      if (
        !isNaN(parsedStoredId) &&
        activeCohorts?.find((c) => c.id === parsedStoredId)
      ) {
        cohortIdToSelect = parsedStoredId;
      }
    }

    // Fallback to first active cohort if none selected
    if (!cohortIdToSelect && activeCohorts && activeCohorts.length > 0) {
      cohortIdToSelect = activeCohorts[0].id;
    }

    if (cohortIdToSelect) {
      setSelectedCohortId(cohortIdToSelect);

      // Update URL if different from current
      if (
        urlCohortId !== cohortIdToSelect.toString() &&
        shouldUpdateUrl(location.pathname)
      ) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('cohort', cohortIdToSelect.toString());
        setSearchParams(newSearchParams, { replace: true });
      }

      // Update localStorage
      localStorage.setItem('selectedCohortId', cohortIdToSelect.toString());
    }

    setIsInitialized(true);
  }, [
    activeCohorts,
    activeCohortsLoading,
    searchParams,
    setSearchParams,
    location.pathname,
    isInitialized,
  ]);

  // Helper function to determine if we should update URL with cohort param
  const shouldUpdateUrl = (pathname) => {
    // Add cohort param to main app routes, but not admin/upload routes
    const cohortRoutes = ['/binder', '/'];
    return (
      cohortRoutes.some((route) => pathname.startsWith(route)) ||
      pathname === '/'
    );
  };

  // Function to select a cohort programmatically
  const selectCohort = (cohortId) => {
    if (!cohortId) {
      setSelectedCohortId(null);
      localStorage.removeItem('selectedCohortId');

      if (shouldUpdateUrl(location.pathname)) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('cohort');
        setSearchParams(newSearchParams, { replace: true });
      }
      return;
    }

    const cohortIdNum =
      typeof cohortId === 'string' ? parseInt(cohortId, 10) : cohortId;

    // Validate cohort exists
    if (!activeCohorts?.find((c) => c.id === cohortIdNum)) {
      console.warn(`Cohort with ID ${cohortIdNum} not found in active cohorts`);
      return;
    }

    setSelectedCohortId(cohortIdNum);
    localStorage.setItem('selectedCohortId', cohortIdNum.toString());

    // Update URL if on a cohort-relevant route
    if (shouldUpdateUrl(location.pathname)) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('cohort', cohortIdNum.toString());
      setSearchParams(newSearchParams, { replace: true });
    }
  };

  // Function to get cohort-aware URL for navigation
  const getCohortUrl = (basePath, additionalParams = {}) => {
    if (!selectedCohortId || !shouldUpdateUrl(basePath)) {
      const params = new URLSearchParams(additionalParams);
      return params.toString() ? `${basePath}?${params.toString()}` : basePath;
    }

    const params = new URLSearchParams({
      cohort: selectedCohortId.toString(),
      ...additionalParams,
    });

    return `${basePath}?${params.toString()}`;
  };

  const contextValue = {
    selectedCohortId,
    selectedCohort,
    selectCohort,
    activeCohorts,
    loading: cohortLoading || activeCohortsLoading,
    hasActiveCohorts: activeCohorts && activeCohorts.length > 0,
    isInitialized,
    getCohortUrl,
  };

  return (
    <CohortContext.Provider value={contextValue}>
      {children}
    </CohortContext.Provider>
  );
}

export function useCohortContext() {
  const context = useContext(CohortContext);
  if (!context) {
    throw new Error(
      'useCohortContext must be used within a CohortContextProvider'
    );
  }
  return context;
}

// Hook for backward compatibility with existing useSelectedCohort usage
export function useSelectedCohort() {
  const context = useContext(CohortContext);
  if (context) {
    // If context is available, use it
    return context;
  } else {
    // Fallback to original hook for components not wrapped in provider
    // This maintains backward compatibility during migration
    const originalHook =
      require('../services/persistence/hooks/useSelectedCohort').useSelectedCohort;
    return originalHook();
  }
}
