import './App.css';
import AppRoutes from './routes/AppRoutes';
import Nav from './components/nav';
import { useState } from 'react';

function App() {
  const [persistedAssignments, setPersistedAssignments] = useState([]);
  const [persistedFields, setPersistedFields] = useState([]);
  return (
    <div className="appWrapper">
      <header>
        <h1>CIL Assignment Binder</h1>
        <Nav />
      </header>
      <main>
        <AppRoutes
          persistedFields={persistedFields}
          setPersistedFields={setPersistedFields}
          persistedAssignments={persistedAssignments}
          setPersistedAssignments={setPersistedAssignments}
        />
      </main>
    </div>
  );
}

export default App;
