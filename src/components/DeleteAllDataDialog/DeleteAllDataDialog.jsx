import { Dialog, Button, Text, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export default function DeleteAllDataDialog({ open, onOpenChange, onConfirm }) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '500px' }}>
        <Dialog.Title
          style={{
            color: 'var(--red-11)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ExclamationTriangleIcon
            style={{ color: 'var(--red-9)', width: '20px', height: '20px' }}
          />
          Delete All Data
        </Dialog.Title>

        <Dialog.Description style={{ marginBottom: '24px', lineHeight: '1.6' }}>
          <Text size="3" style={{ display: 'block', marginBottom: '16px' }}>
            ⚠️ <strong>This action cannot be undone!</strong>
          </Text>

          <Text
            size="2"
            color="gray"
            style={{ display: 'block', marginBottom: '12px' }}
          >
            This will permanently delete:
          </Text>

          <ul
            style={{
              margin: '0 0 16px 0',
              paddingLeft: '20px',
              color: 'var(--gray-11)',
              fontSize: 'var(--font-size-2)',
            }}
          >
            <li>All cohorts and their configurations</li>
            <li>All student records and assignments</li>
            <li>All submission data and progress tracking</li>
            <li>All audit notes and review history</li>
            <li>Your entire local database</li>
          </ul>

          <Text
            size="2"
            style={{
              background: 'var(--yellow-3)',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--yellow-7)',
              display: 'block',
            }}
          >
            <strong>Note:</strong> This only affects data stored locally in your
            browser. Any CSV files or external data sources are not affected.
          </Text>
        </Dialog.Description>

        <Flex gap="3" justify="end" style={{ marginTop: '24px' }}>
          <Button variant="soft" color="gray" onClick={handleCancel} size="3">
            Cancel
          </Button>
          <Button color="red" onClick={handleConfirm} size="3">
            Delete Everything
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
