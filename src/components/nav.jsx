import { NavLink } from 'react-router-dom';
import styles from './nav.module.css';

export default function Nav() {
  return (
    <nav className={styles.links}>
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? styles.active : undefined)}
      >
        Binder
      </NavLink>
      <NavLink
        to="/upload"
        className={({ isActive }) => (isActive ? styles.active : undefined)}
      >
        Upload New CSV
      </NavLink>
      <NavLink
        to="/admin"
        className={({ isActive }) => (isActive ? styles.active : undefined)}
      >
        App Admin
      </NavLink>
    </nav>
  );
}
