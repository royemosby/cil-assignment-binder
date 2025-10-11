import './App.css';
import AppRoutes from './routes/AppRoutes';
import Nav from './components/nav';
import { CohortContextProvider } from './contexts/CohortContext';

function App() {
  return (
    <CohortContextProvider>
      <div className="appWrapper">
        <header>
          <h1>CIL Assignment Binder</h1>
          <Nav />
        </header>
        <main>
          <AppRoutes />
        </main>
      </div>
    </CohortContextProvider>
  );
}

export default App;
