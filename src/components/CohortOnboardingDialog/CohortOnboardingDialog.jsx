import { useState, useEffect } from 'react';
import { Dialog, Button, TextField, Text, Flex, Box } from '@radix-ui/themes';
import { useCohorts } from '@services/persistence/hooks';
import { validateCohortName } from '@services/utils/cohortUtils';
import styles from './CohortOnboardingDialog.module.css';

export default function CohortOnboardingDialog({
  open,
  onOpenChange,
  onCohortCreated,
}) {
  const { addCohort } = useCohorts();

  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    lessonWeekStartDay: 'Wednesday',
    cilNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Clear localStorage onboarding flag when dialog is opened (handles database reset cases)
  useEffect(() => {
    if (open) {
      localStorage.removeItem('cohortOnboardingCompleted');
      localStorage.removeItem('selectedCohortId');
    }
  }, [open]);

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const cohortData = {
        name: formData.name.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        lessonWeekStartDay: formData.lessonWeekStartDay,
        cilNotes: formData.cilNotes.trim(),
        status: 'active',
      };

      const result = await addCohort(cohortData);

      if (result.success) {
        // Mark onboarding as completed in localStorage
        localStorage.setItem('cohortOnboardingCompleted', 'true');
        localStorage.setItem('selectedCohortId', result.id.toString());

        // Call the callback with the created cohort
        onCohortCreated?.(result.id);

        // Close the dialog
        onOpenChange(false);

        // Reset form
        setFormData({
          name: '',
          startDate: new Date().toISOString().split('T')[0],
          lessonWeekStartDay: 'Wednesday',
          cilNotes: '',
        });
      } else {
        setError(result.error || 'Failed to create cohort');
      }
    } catch (err) {
      console.error('Error creating cohort:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className={styles.dialogContent}>
        <Dialog.Title className={styles.title}>
          Welcome to CIL Assignment Binder! 🎉
        </Dialog.Title>

        <Dialog.Description className={styles.description}>
          Let&apos;s set up your first cohort to get started with managing
          assignments.
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
              Cohort Start Date *
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
              CIL Notes (Optional)
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

          <Flex gap="3" justify="end" className={styles.actions}>
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={isSubmitting}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Cohort'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
