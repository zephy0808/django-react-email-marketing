import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Componentes
import Navegacao from './components/Navegacao';
import Home from './pages/Home';
import ListaClientes from './pages/ListaClientes';
import NovoCadastro from './pages/NovoCadastro';
import NovaCampanha from './pages/NovaCampanha';
import DetalheCampanha from './pages/DetalheCampanha';
import Relatorios from './pages/Relatorios';
import ImportarCSV from './pages/ImportarCSV';

function App() {
  return (
    <Router>
      <div className="App">
        <Navegacao />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clientes" element={<ListaClientes />} />
            <Route path="/clientes/novo" element={<NovoCadastro />} />
            <Route path="/clientes/importar" element={<ImportarCSV />} />
            <Route path="/campanhas/nova" element={<NovaCampanha />} />
            <Route path="/campanhas/:id" element={<DetalheCampanha />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
