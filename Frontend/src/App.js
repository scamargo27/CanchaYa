import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Error404 from 'containers/errors/Error404';
import Home from 'containers/pages/Home';
import store from './store';
import { Provider } from 'react-redux';
import Reservas from './components/navigation/Reservas'
function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Home Display */}
          <Route path="/" element={<Home/>} />
          <Route path='/Reservas' element={<Reservas/>} />


          {/* Error Display - Debe ir al final */}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;