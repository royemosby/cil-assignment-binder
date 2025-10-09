import { Cross1Icon } from '@radix-ui/react-icons';
import styles from './SubmissionFlagsLegend.module.css';

export default function SubmissionFlagsLegend() {
  const flagDefinitions = [
    {
      icon: '😞',
      label: 'Missing Pull Request',
      description: 'Submission URL does not contain a pull request link',
    },
    {
      icon: <Cross1Icon className={styles.flagIcon} />,
      label: 'Blocking Issues',
      description:
        'Student has missing or unapproved previous assignments that must be completed first',
    },
  ];

  return (
    <div className={styles.legend}>
      <span className={styles.legendTitle}>Submission Flags:</span>
      <div className={styles.flagList}>
        {flagDefinitions.map((flag, index) => (
          <div key={index} className={styles.flagItem}>
            <span className={styles.flagDisplay}>{flag.icon}</span>
            <span className={styles.flagLabel}>{flag.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
