import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Text, Flex, Box, Badge } from '@radix-ui/themes';
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { useCohorts } from '@services/persistence/hooks';
import { deleteAllData } from '@services/persistence/db';
import CohortOnboardingDialog from '@components/CohortOnboardingDialog';
import CohortEditDialog from '@components/CohortEditDialog';
import CohortSelector from '@components/CohortSelector';
import DeleteAllDataDialog from '@components/DeleteAllDataDialog';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingCohort, setEditingCohort] = useState(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { cohorts: cohortsWithStats, loading } = useCohorts();

  const handleCreateCohort = () => {
    setShowOnboarding(true);
  };

  const handleCohortCreated = () => {
    setShowOnboarding(false);
  };

  const handleEditCohort = (cohort) => {
    setEditingCohort(cohort);
  };

  const handleCohortUpdated = () => {
    // The hook will automatically refresh, no need to do anything
    setEditingCohort(null);
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAllData();
      if (result.success) {
        setShowDeleteAllDialog(false);
        // Navigate to upload route after successful deletion
        navigate('/upload');
      } else {
        console.error('Failed to delete all data:', result.error);
        // Could add toast notification here
      }
    } catch (error) {
      console.error('Error deleting all data:', error);
      // Could add toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'archived':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Text>Loading cohorts...</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <CohortOnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onCohortCreated={handleCohortCreated}
      />

      <CohortEditDialog
        open={!!editingCohort}
        onOpenChange={(open) => !open && setEditingCohort(null)}
        cohort={editingCohort}
        onCohortUpdated={handleCohortUpdated}
      />

      <DeleteAllDataDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
        onConfirm={handleDeleteAllData}
        isDeleting={isDeleting}
      />

      <div className={styles.header}>
        <div>
          <Text size="6" weight="bold" className={styles.title}>
            Cohort Management
          </Text>
        </div>

        <Flex gap="3" align="center">
          <Button
            variant="outline"
            color="red"
            onClick={() => setShowDeleteAllDialog(true)}
          >
            <TrashIcon /> Delete All Data
          </Button>
          <Button onClick={handleCreateCohort} className={styles.createButton}>
            <PlusIcon /> Add New Cohort
          </Button>
        </Flex>
      </div>

      {/* Cohort Selection Section */}
      <Card className={styles.selectorCard}>
        <Flex direction="column" gap="3">
          <Text size="4" weight="medium">
            Current Cohort
          </Text>

          <CohortSelector showManageLink={false} />
        </Flex>
      </Card>

      {!cohortsWithStats || cohortsWithStats.length === 0 ? (
        <Card className={styles.emptyState}>
          <Flex direction="column" align="center" gap="4">
            <GearIcon width="48" height="48" color="var(--gray-8)" />
            <Text size="4" weight="medium" color="gray">
              No cohorts yet
            </Text>
            <Text size="2" color="gray" align="center">
              Create your first cohort to start managing student assignments
            </Text>
            <Button onClick={handleCreateCohort} size="3">
              <PlusIcon /> Create First Cohort
            </Button>
          </Flex>
        </Card>
      ) : (
        <div className={styles.cohortsGrid}>
          {cohortsWithStats.map((cohort) => (
            <Card key={cohort.id} className={styles.cohortCard}>
              <Flex direction="column" gap="3">
                <Flex justify="between" align="start">
                  <div>
                    <Text size="4" weight="bold" className={styles.cohortName}>
                      {cohort.name}
                    </Text>
                    <Badge
                      color={getStatusColor(cohort.status)}
                      className={styles.statusBadge}
                    >
                      {cohort.status}
                    </Badge>
                  </div>

                  <Flex gap="2">
                    <Button
                      variant="ghost"
                      size="1"
                      className={styles.actionButton}
                      onClick={() => handleEditCohort(cohort)}
                    >
                      <Pencil1Icon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="1"
                      color="red"
                      className={styles.actionButton}
                      onClick={() => handleEditCohort(cohort)}
                    >
                      <TrashIcon />
                    </Button>
                  </Flex>
                </Flex>

                <div className={styles.cohortDetails}>
                  <Flex justify="between" className={styles.detailRow}>
                    <Text size="2" color="gray">
                      Students:
                    </Text>
                    <Text size="2" weight="medium">
                      {cohort.studentCount || 'N/A'}
                    </Text>
                  </Flex>

                  <Flex justify="between" className={styles.detailRow}>
                    <Text size="2" color="gray">
                      Submissions:
                    </Text>
                    <Text size="2" weight="medium">
                      {cohort.submissionCount || 'N/A'}
                    </Text>
                  </Flex>

                  <Flex justify="between" className={styles.detailRow}>
                    <Text size="2" color="gray">
                      Start Date:
                    </Text>
                    <Text size="2" weight="medium">
                      {formatDate(cohort.startDate)}
                    </Text>
                  </Flex>

                  <Flex justify="between" className={styles.detailRow}>
                    <Text size="2" color="gray">
                      Day Lesson Week Starts:
                    </Text>
                    <Text size="2" weight="medium">
                      {cohort.lessonWeekStartDay || 'Wednesday'}
                    </Text>
                  </Flex>
                </div>

                {cohort.cilNotes && (
                  <Box className={styles.notes}>
                    <Text size="2" color="gray" style={{ fontStyle: 'italic' }}>
                      {cohort.cilNotes}
                    </Text>
                  </Box>
                )}
              </Flex>
            </Card>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <Text size="1" color="gray" align="center">
          Need help? Check the documentation or contact support.
        </Text>
      </div>
    </div>
  );
}
