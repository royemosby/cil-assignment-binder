import {
  Dialog,
  Button,
  Text,
  Badge,
  Separator,
  Flex,
  Card,
} from '@radix-ui/themes';
import {
  ExclamationTriangleIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons';

export default function CohortConflictDialog({
  open,
  onOpenChange,
  validation,
  selectedCohortName,
  onResolve,
}) {
  if (!validation) return null;

  const hasConflicts =
    validation.conflicts.length > 0 || validation.mixedCohorts.length > 0;

  const handleAbort = () => {
    onResolve('abort');
  };

  const handleContinueWithSelected = () => {
    onResolve('continue_with_selected');
  };

  const handleSwitchCohort = (cohortName) => {
    onResolve('switch_cohort', cohortName);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '600px' }}>
        <Dialog.Title>
          <ExclamationTriangleIcon
            style={{ marginRight: '8px', color: 'orange' }}
          />
          Cohort Conflicts Detected
        </Dialog.Title>

        <Dialog.Description style={{ marginBottom: '16px' }}>
          The CSV file contains cohort information that conflicts with your
          current selection. Please review and choose how to proceed.
        </Dialog.Description>

        {/* Current Selection */}
        <Card
          style={{
            padding: '16px',
            marginBottom: '16px',
            background: 'var(--blue-2)',
          }}
        >
          <Text size="3" weight="medium">
            Current Selection:{' '}
          </Text>
          <Badge color="blue" size="2">
            {selectedCohortName}
          </Badge>
        </Card>

        {/* Conflicts Section */}
        {validation.conflicts.length > 0 && (
          <Card
            style={{
              padding: '16px',
              marginBottom: '16px',
              background: 'var(--orange-2)',
            }}
          >
            <Text size="3" weight="medium" style={{ marginBottom: '8px' }}>
              <CrossCircledIcon style={{ marginRight: '8px', color: 'red' }} />
              Cohort Mismatches
            </Text>
            {validation.conflicts.map((conflict, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  padding: '8px',
                  background: 'white',
                  borderRadius: '4px',
                }}
              >
                <Text size="2">
                  CSV contains{' '}
                  <Badge color="orange">{conflict.csvCohort}</Badge> cohort (
                  {conflict.affectedStudents} students)
                </Text>
                <Button
                  size="1"
                  variant="soft"
                  color="orange"
                  onClick={() => handleSwitchCohort(conflict.csvCohort)}
                >
                  Switch to {conflict.csvCohort}
                </Button>
              </div>
            ))}
          </Card>
        )}

        {/* Mixed Cohorts Section */}
        {validation.mixedCohorts.length > 0 && (
          <Card
            style={{
              padding: '16px',
              marginBottom: '16px',
              background: 'var(--purple-2)',
            }}
          >
            <Text size="3" weight="medium" style={{ marginBottom: '8px' }}>
              Multiple Cohorts in CSV
            </Text>
            <Text size="2" color="gray" style={{ marginBottom: '8px' }}>
              Your CSV file contains students from multiple cohorts:
            </Text>
            <div>
              {validation.mixedCohorts.map((cohort, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    padding: '8px',
                    background: 'white',
                    borderRadius: '4px',
                  }}
                >
                  <div>
                    <Badge color="purple" size="2">
                      {cohort.cohortName}
                    </Badge>
                    <Text size="2" color="gray">
                      {' '}
                      ({cohort.studentCount} students)
                    </Text>
                  </div>
                  <Button
                    size="1"
                    variant="soft"
                    color="purple"
                    onClick={() => handleSwitchCohort(cohort.cohortName)}
                  >
                    Switch to {cohort.cohortName}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Students Without Cohort */}
        {validation.studentsWithoutCohort &&
          validation.studentsWithoutCohort.length > 0 && (
            <Card style={{ padding: '16px', marginBottom: '16px' }}>
              <Text size="3" weight="medium">
                Students Without Cohort Identifiers
              </Text>
              <Text size="2" color="gray" style={{ marginBottom: '8px' }}>
                {validation.studentsWithoutCohort.length} students will be
                assigned to the selected cohort:
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {validation.studentsWithoutCohort
                  .slice(0, 5)
                  .map((studentName, index) => (
                    <Badge key={index} color="gray" size="1">
                      {studentName}
                    </Badge>
                  ))}
                {validation.studentsWithoutCohort.length > 5 && (
                  <Text size="1" color="gray">
                    +{validation.studentsWithoutCohort.length - 5} more...
                  </Text>
                )}
              </div>
            </Card>
          )}

        <Separator style={{ margin: '16px 0' }} />

        {/* Resolution Options */}
        <div>
          <Text size="3" weight="medium" style={{ marginBottom: '16px' }}>
            How would you like to proceed?
          </Text>

          <Flex gap="3" justify="end">
            <Button variant="soft" color="red" onClick={handleAbort}>
              Cancel Upload
            </Button>

            {hasConflicts ? (
              <Button
                variant="soft"
                color="blue"
                onClick={handleContinueWithSelected}
              >
                Force Upload to {selectedCohortName}
              </Button>
            ) : (
              <Button color="green" onClick={handleContinueWithSelected}>
                Continue with {selectedCohortName}
              </Button>
            )}
          </Flex>

          {hasConflicts && (
            <Text
              size="1"
              color="gray"
              style={{
                textAlign: 'center',
                marginTop: '8px',
                fontStyle: 'italic',
              }}
            >
              Warning: Forcing upload may assign students to the wrong cohort.
            </Text>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
