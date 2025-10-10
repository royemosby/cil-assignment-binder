import { useState, useEffect } from 'react';
import { Dialog, Button, TextField, Text, Flex, Box } from '@radix-ui/themes';
import { useCohorts } from '@services/persistence/hooks';
import { validateCohortName } from '@services/utils/cohortUtils';
import styles from './CohortEditDialog.module.css';

export default function CohortEditDialog({
  open,
  onOpenChange,
  cohort,
  onCohortUpdated,
}) {
  const { updateCohort, deleteCohort } = useCohorts();

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    lessonWeekStartDay: 'Wednesday',
    status: 'active',
    cilNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form when cohort changes
  useEffect(() => {
    if (cohort) {
      setFormData({
        name: cohort.name || '',
        startDate: cohort.startDate
          ? new Date(cohort.startDate).toISOString().split('T')[0]
          : '',
        endDate: cohort.endDate
          ? new Date(cohort.endDate).toISOString().split('T')[0]
          : '',
        lessonWeekStartDay: cohort.lessonWeekStartDay || 'Wednesday',
        status: cohort.status || 'active',
        cilNotes: cohort.cilNotes || '',
      });
    }
  }, [cohort]);

  const validateForm = () => {
    const errors = {};

    // Validate cohort name
    const nameValidation = validateCohortName(formData.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error;
    }

    // Validate start date
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    // Validate end date if provided
    if (formData.endDate && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    // Validate lesson start day
    const validDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    if (!validDays.includes(formData.lessonWeekStartDay)) {
      errors.lessonWeekStartDay = 'Please select a valid day of the week';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || !cohort) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updates = {
        name: formData.name.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
        lessonWeekStartDay: formData.lessonWeekStartDay,
        status: formData.status,
        cilNotes: formData.cilNotes.trim(),
      };

      const result = await updateCohort(cohort.id, updates);

      if (result.success) {
        onCohortUpdated?.();
        onOpenChange(false);
      } else {
        setError(result.error || 'Failed to update cohort');
      }
    } catch (err) {
      console.error('Error updating cohort:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!cohort) return;

    setIsDeleting(true);
    setError('');

    try {
      const result = await deleteCohort(cohort.id);

      if (result.success) {
        onCohortUpdated?.();
        onOpenChange(false);
        setShowDeleteConfirm(false);
      } else {
        setError(result.error || 'Failed to delete cohort');
      }
    } catch (err) {
      console.error('Error deleting cohort:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const dayOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  if (!cohort) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className={styles.dialogContent}>
        <Dialog.Title className={styles.title}>
          Edit Cohort: {cohort.name}
        </Dialog.Title>

        <Dialog.Description className={styles.description}>
          Update cohort details and settings.
        </Dialog.Description>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Box className={styles.fieldGroup}>
            <Text as="label" size="2" weight="medium" className={styles.label}>
              Cohort Name *
            </Text>
            <TextField.Root
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="e.g., Kiwi, Mango, Spring 2025"
              className={validationErrors.name ? styles.inputError : ''}
            />
            {validationErrors.name && (
              <Text size="1" color="red" className={styles.errorText}>
                {validationErrors.name}
              </Text>
            )}
          </Box>

          <Box className={styles.fieldGroup}>
            <Text as="label" size="2" weight="medium" className={styles.label}>
              Status
            </Text>
            <select
              value={formData.status}
              onChange={handleInputChange('status')}
              className={styles.select}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Box>

          <Flex gap="3" className={styles.dateFields}>
            <Box className={styles.fieldGroup} style={{ flex: 1 }}>
              <Text
                as="label"
                size="2"
                weight="medium"
                className={styles.label}
              >
                Start Date *
              </Text>
              <TextField.Root
                type="date"
                value={formData.startDate}
                onChange={handleInputChange('startDate')}
                className={validationErrors.startDate ? styles.inputError : ''}
              />
              {validationErrors.startDate && (
                <Text size="1" color="red" className={styles.errorText}>
                  {validationErrors.startDate}
                </Text>
              )}
            </Box>

            <Box className={styles.fieldGroup} style={{ flex: 1 }}>
              <Text
                as="label"
                size="2"
                weight="medium"
                className={styles.label}
              >
                End Date (Optional)
              </Text>
              <TextField.Root
                type="date"
                value={formData.endDate}
                onChange={handleInputChange('endDate')}
                className={validationErrors.endDate ? styles.inputError : ''}
              />
              {validationErrors.endDate && (
                <Text size="1" color="red" className={styles.errorText}>
                  {validationErrors.endDate}
                </Text>
              )}
            </Box>
          </Flex>

          <Box className={styles.fieldGroup}>
            <Text as="label" size="2" weight="medium" className={styles.label}>
              Lesson Week Start Day
            </Text>
            <select
              value={formData.lessonWeekStartDay}
              onChange={handleInputChange('lessonWeekStartDay')}
              className={styles.select}
            >
              {dayOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <Text size="1" color="gray" className={styles.helpText}>
              The day of the week when new lesson weeks begin
            </Text>
          </Box>

          <Box className={styles.fieldGroup}>
            <Text as="label" size="2" weight="medium" className={styles.label}>
              CIL Notes
            </Text>
            <textarea
              value={formData.cilNotes}
              onChange={handleInputChange('cilNotes')}
              placeholder="Additional notes about this cohort..."
              className={styles.textarea}
              rows={3}
            />
          </Box>

          {error && (
            <Box className={styles.errorBox}>
              <Text size="2" color="red">
                {error}
              </Text>
            </Box>
          )}

          <Flex gap="3" justify="between" className={styles.actions}>
            <Button
              type="button"
              variant="soft"
              color="red"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting || isDeleting}
            >
              Delete Cohort
            </Button>

            <Flex gap="2">
              <Dialog.Close>
                <Button
                  variant="soft"
                  color="gray"
                  disabled={isSubmitting || isDeleting}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={isSubmitting || isDeleting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Cohort'}
              </Button>
            </Flex>
          </Flex>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className={styles.deleteConfirm}>
            <Box className={styles.deleteConfirmContent}>
              <Text size="3" weight="medium" className={styles.deleteTitle}>
                Delete Cohort: {cohort.name}?
              </Text>
              <Text size="2" color="gray" className={styles.deleteWarning}>
                This action cannot be undone. All data associated with this
                cohort will be permanently deleted.
              </Text>
              <Flex gap="3" justify="end" className={styles.deleteActions}>
                <Button
                  variant="soft"
                  color="gray"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  color="red"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  loading={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Cohort'}
                </Button>
              </Flex>
            </Box>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
