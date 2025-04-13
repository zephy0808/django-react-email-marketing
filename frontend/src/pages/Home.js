import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { clienteService, campanhaService } from '../services/api';

const Home = () => {
    const [resumo, setResumo] = useState({
        totalClientes: 0,
        campanhasAtivas: 0,
        campanhasConcluidas: 0
    });

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const resClientes = await clienteService.listarTodos();
                const resCampanhas = await campanhaService.listarTodas();

                const campanhasAtivas = resCampanhas.data.filter(
                    c => c.status === 'rascunho' || c.status === 'agendada' || c.status === 'enviando'
                ).length;

                const campanhasConcluidas = resCampanhas.data.filter(
                    c => c.status === 'concluida'
                ).length;

                setResumo({
                    totalClientes: resClientes.data.length,
                    campanhasAtivas,
                    campanhasConcluidas
                });
            } catch (error) {
                console.error('Erro ao carregar dados', error);
            }
        };

        carregarDados();
    }, []);

    return (
        <div>
            <h1 className="mb-4">Dashboard</h1>

            <Row>
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Clientes</Card.Title>
                            <Card.Text className="fs-1 text-center">{resumo.totalClientes}</Card.Text>
                            <Button as={Link} to="/clientes" variant="primary" className="w-100">
                                Ver Clientes
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Campanhas Ativas</Card.Title>
                            <Card.Text className="fs-1 text-center">{resumo.campanhasAtivas}</Card.Text>
                            <Button as={Link} to="/campanhas/nova" variant="success" className="w-100">
                                Nova Campanha
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Campanhas Concluídas</Card.Title>
                            <Card.Text className="fs-1 text-center">{resumo.campanhasConcluidas}</Card.Text>
                            <Button as={Link} to="/relatorios" variant="info" className="w-100">
                                Ver Relatórios
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Ações Rápidas</Card.Title>
                            <div className="d-grid gap-2">
                                <Button as={Link} to="/clientes/novo" variant="outline-primary">
                                    Cadastrar Novo Cliente
                                </Button>
                                <Button as={Link} to="/clientes/importar" variant="outline-primary">
                                    Importar Lista de Clientes
                                </Button>
                                <Button as={Link} to="/campanhas/nova" variant="outline-success">
                                    Criar Nova Campanha
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Sobre o Sistema</Card.Title>
                            <Card.Text>
                                O sistema de Email Marketing permite gerenciar contatos, criar campanhas personalizadas e
                                analisar o desempenho dos seus emails com relatórios detalhados.
                            </Card.Text>
                            <Card.Text>
                                Utilize os campos dinâmicos como {'{'}{'{'}'nome'{'}'}{'}'},  {'{'}{'{'}'sobrenome'{'}'}{'}'}  e  {'{'}{'{'}'email'{'}'}{'}'} para personalizar
                                suas mensagens para cada destinatário.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Home; 