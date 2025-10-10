import { Dialog, Button, Text, Flex, Card } from '@radix-ui/themes';
import { CalendarIcon } from '@radix-ui/react-icons';

import { calculateCurrentWeek } from '@services/utils/cohortUtils';

export default function WeekSelectionDialog({
  open,
  onOpenChange,
  selectedCohort,
  detectedWeeks = [],
  onWeekSelect,
}) {
  const handleConfirm = () => {
    // Since we're no longer selecting a week, just proceed with the original weeks
    onWeekSelect(0); // Pass a dummy value since weeks are already preserved
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!selectedCohort) return null;

  const currentWeek =
    calculateCurrentWeek(
      selectedCohort.startDate,
      selectedCohort.lessonWeekStartDay || 'Wednesday'
    ) + 1;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '500px' }}>
        <Dialog.Title>
          <CalendarIcon style={{ marginRight: '8px', color: 'blue' }} />
          CSV Week Information
        </Dialog.Title>

        <Dialog.Description style={{ marginBottom: '16px' }}>
          The CSV contains submissions with their original week assignments.
          Review the detected weeks below before proceeding with the upload.
        </Dialog.Description>

        {/* Cohort Info */}
        <Card
          style={{
            padding: '16px',
            marginBottom: '16px',
            background: 'var(--blue-2)',
          }}
        >
          <Text size="3" weight="medium">
            Uploading to: {selectedCohort.name} Cohort
          </Text>
          <Text size="2" color="gray">
            Current week: {currentWeek} (calculated from cohort start date)
          </Text>
        </Card>

        {/* Detected Weeks Information */}
        <div style={{ marginBottom: '16px' }}>
          <Text
            size="3"
            weight="medium"
            style={{ display: 'block', marginBottom: '8px' }}
          >
            Detected Weeks in CSV:
          </Text>
          <Card style={{ padding: '16px', background: 'var(--gray-1)' }}>
            {detectedWeeks.length > 0 ? (
              <Flex wrap="wrap" gap="2">
                {detectedWeeks.map((week) => (
                  <Card
                    key={week}
                    style={{
                      padding: '8px 12px',
                      background:
                        week === currentWeek
                          ? 'var(--blue-3)'
                          : 'var(--gray-3)',
                      border:
                        week === currentWeek
                          ? '1px solid var(--blue-6)'
                          : '1px solid var(--gray-6)',
                    }}
                  >
                    <Flex align="center" gap="1">
                      <Text size="2" weight="medium">
                        Week {week}
                      </Text>
                      {week === currentWeek && (
                        <Text size="1" color="blue">
                          (Current)
                        </Text>
                      )}
                      {week > currentWeek && (
                        <Text size="1" color="gray">
                          (Future)
                        </Text>
                      )}
                      {week < currentWeek && (
                        <Text size="1" color="orange">
                          (Past)
                        </Text>
                      )}
                    </Flex>
                  </Card>
                ))}
              </Flex>
            ) : (
              <Text size="2" color="gray">
                No valid week numbers detected in CSV
              </Text>
            )}
          </Card>
        </div>

        {/* Help Text */}
        <Card
          style={{
            padding: '16px',
            marginBottom: '16px',
            background: 'var(--gray-2)',
          }}
        >
          <Text size="2" color="gray">
            <strong>Note:</strong> Each submission will maintain its original
            week number as found in the CSV. This preserves the chronological
            order and accuracy of your assignment data.
          </Text>
        </Card>

        {/* Action Buttons */}
        <Flex
          gap="3"
          justify="end"
          style={{ paddingTop: '16px', borderTop: '1px solid var(--gray-6)' }}
        >
          <Button variant="soft" color="gray" onClick={handleCancel}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleConfirm}>
            Continue Upload
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
