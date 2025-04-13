import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Card, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { clienteService } from '../services/api';

const ListaClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        carregarClientes();
    }, []);

    const carregarClientes = async () => {
        setCarregando(true);
        try {
            const response = await clienteService.listarTodos();
            setClientes(response.data);
            setCarregando(false);
        } catch (error) {
            setErro('Erro ao carregar a lista de clientes. Tente novamente mais tarde.');
            setCarregando(false);
            console.error('Erro ao carregar clientes:', error);
        }
    };

    const excluirCliente = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await clienteService.excluir(id);
                carregarClientes();
            } catch (error) {
                setErro('Erro ao excluir o cliente. Tente novamente mais tarde.');
                console.error('Erro ao excluir cliente:', error);
            }
        }
    };

    const filtrarClientes = () => {
        if (!filtro) return clientes;

        return clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
            cliente.sobrenome.toLowerCase().includes(filtro.toLowerCase()) ||
            cliente.email.toLowerCase().includes(filtro.toLowerCase())
        );
    };

    const clientesFiltrados = filtrarClientes();

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Lista de Clientes</h1>
                <div>
                    <Button as={Link} to="/clientes/novo" variant="success" className="me-2">
                        Novo Cliente
                    </Button>
                    <Button as={Link} to="/clientes/importar" variant="primary">
                        Importar CSV
                    </Button>
                </div>
            </div>

            {erro && <Alert variant="danger">{erro}</Alert>}

            <Card className="mb-4">
                <Card.Body>
                    <InputGroup>
                        <Form.Control
                            placeholder="Buscar por nome, sobrenome ou email..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                        {filtro && (
                            <Button
                                variant="outline-secondary"
                                onClick={() => setFiltro('')}
                            >
                                Limpar
                            </Button>
                        )}
                    </InputGroup>
                </Card.Body>
            </Card>

            {carregando ? (
                <p className="text-center">Carregando clientes...</p>
            ) : (
                <>
                    <p>Total de clientes: {clientesFiltrados.length}</p>

                    {clientesFiltrados.length === 0 ? (
                        <Alert variant="info">
                            Nenhum cliente encontrado. {filtro ? 'Tente um filtro diferente ou ' : ''}
                            <Link to="/clientes/novo">cadastre um novo cliente</Link>.
                        </Alert>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Sobrenome</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientesFiltrados.map(cliente => (
                                    <tr key={cliente.id}>
                                        <td>{cliente.nome}</td>
                                        <td>{cliente.sobrenome}</td>
                                        <td>{cliente.email}</td>
                                        <td>
                                            {cliente.ativo ? (
                                                <Badge bg="success">Ativo</Badge>
                                            ) : (
                                                <Badge bg="danger">Inativo</Badge>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => excluirCliente(cliente.id)}
                                                className="ms-2"
                                            >
                                                Excluir
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </>
            )}
        </div>
    );
};

export default ListaClientes; 