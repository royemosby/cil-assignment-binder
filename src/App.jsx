import './App.css';
import AppRoutes from './routes/AppRoutes';
import Nav from './components/nav';

function App() {
  return (
    <div className="appWrapper">
      <header>
        <h1>CIL Assignment Binder</h1>
        <Nav />
      </header>
      <main>
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
