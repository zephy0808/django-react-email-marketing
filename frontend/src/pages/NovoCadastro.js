import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../services/api';

const NovoCadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    ativo: true
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso('');

    try {
      await clienteService.criar(formData);
      setSucesso('Cliente cadastrado com sucesso!');
      setTimeout(() => {
        navigate('/clientes');
      }, 2000);
    } catch (error) {
      setErro('Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
      console.error('Erro ao cadastrar cliente:', error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4">Novo Cliente</h1>

      {erro && <Alert variant="danger">{erro}</Alert>}
      {sucesso && <Alert variant="success">{sucesso}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sobrenome</Form.Label>
              <Form.Control
                type="text"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Ativo"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button
                variant="secondary"
                onClick={() => navigate('/clientes')}
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                type="submit"
                disabled={carregando}
              >
                {carregando ? 'Salvando...' : 'Salvar Cliente'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NovoCadastro; 