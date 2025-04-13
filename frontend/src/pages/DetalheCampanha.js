import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Row, Col, Badge, Table } from 'react-bootstrap';
import { campanhaService } from '../services/api';

const DetalheCampanha = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campanha, setCampanha] = useState(null);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarCampanha = async () => {
            try {
                const res = await campanhaService.obterPorId(id);
                setCampanha(res.data);
                setCarregando(false);
            } catch (error) {
                setErro('Erro ao carregar detalhes da campanha');
                setCarregando(false);
                console.error('Erro ao carregar campanha:', error);
            }
        };

        carregarCampanha();
    }, [id]);

    const iniciarEnvio = async () => {
        try {
            await campanhaService.iniciarEnvio(id);
            setSucesso('Envio de campanha iniciado com sucesso!');
            // Recarregar dados da campanha
            const res = await campanhaService.obterPorId(id);
            setCampanha(res.data);
        } catch (error) {
            setErro('Erro ao iniciar envio da campanha');
            console.error('Erro ao iniciar envio:', error);
        }
    };

    const exportarRelatorio = async () => {
        try {
            const response = await campanhaService.exportarRelatorio(id);

            // Criar arquivo para download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `relatorio_${campanha.titulo}.csv`);
            document.body.appendChild(link);
            link.click();

            // Limpar
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setErro('Erro ao exportar relatório');
            console.error('Erro ao exportar relatório:', error);
        }
    };

    const obterStatusBadge = (status) => {
        const statusMap = {
            'rascunho': <Badge bg="secondary">Rascunho</Badge>,
            'agendada': <Badge bg="primary">Agendada</Badge>,
            'enviando': <Badge bg="warning">Enviando</Badge>,
            'concluida': <Badge bg="success">Concluída</Badge>,
            'cancelada': <Badge bg="danger">Cancelada</Badge>
        };

        return statusMap[status] || <Badge bg="secondary">Desconhecido</Badge>;
    };

    if (carregando) {
        return <p className="text-center">Carregando dados da campanha...</p>;
    }

    if (!campanha) {
        return (
            <Alert variant="danger">
                Campanha não encontrada. <Button variant="link" onClick={() => navigate('/')}>Voltar</Button>
            </Alert>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>{campanha.titulo}</h1>
                <Button variant="outline-secondary" onClick={() => navigate('/')}>Voltar</Button>
            </div>

            {erro && <Alert variant="danger">{erro}</Alert>}
            {sucesso && <Alert variant="success">{sucesso}</Alert>}

            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Detalhes da Campanha</h5>
                                {obterStatusBadge(campanha.status)}
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <strong>Título:</strong>
                                </Col>
                                <Col md={8}>{campanha.titulo}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <strong>Assunto:</strong>
                                </Col>
                                <Col md={8}>{campanha.assunto}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <strong>Criado por:</strong>
                                </Col>
                                <Col md={8}>{campanha.criador_nome}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <strong>Data de Criação:</strong>
                                </Col>
                                <Col md={8}>{new Date(campanha.data_criacao).toLocaleString()}</Col>
                            </Row>
                            {campanha.data_agendamento && (
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <strong>Agendado para:</strong>
                                    </Col>
                                    <Col md={8}>{new Date(campanha.data_agendamento).toLocaleString()}</Col>
                                </Row>
                            )}
                            {campanha.data_inicio_envio && (
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <strong>Início do Envio:</strong>
                                    </Col>
                                    <Col md={8}>{new Date(campanha.data_inicio_envio).toLocaleString()}</Col>
                                </Row>
                            )}
                            {campanha.data_fim_envio && (
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <strong>Fim do Envio:</strong>
                                    </Col>
                                    <Col md={8}>{new Date(campanha.data_fim_envio).toLocaleString()}</Col>
                                </Row>
                            )}
                            <Row className="mb-3">
                                <Col md={4}>
                                    <strong>Destinatários:</strong>
                                </Col>
                                <Col md={8}>
                                    {campanha.todos_clientes ? 'Todos os clientes ativos' : 'Grupos específicos'}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <strong>Anexos:</strong>
                                </Col>
                                <Col md={8}>
                                    {campanha.anexos && campanha.anexos.length > 0
                                        ? campanha.anexos.map(anexo => <div key={anexo.id}>{anexo.nome}</div>)
                                        : 'Nenhum anexo'}
                                </Col>
                            </Row>
                        </Card.Body>
                        <Card.Footer>
                            <div className="d-flex justify-content-between">
                                {(campanha.status === 'rascunho' || campanha.status === 'agendada') && (
                                    <Button variant="primary" onClick={iniciarEnvio}>
                                        Iniciar Envio
                                    </Button>
                                )}
                                <Button variant="outline-info" onClick={exportarRelatorio}>
                                    Exportar Relatório
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
                <Col md={4}>
                    {campanha.relatorio && (
                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">Relatório</h5>
                            </Card.Header>
                            <Card.Body>
                                <Table striped bordered hover size="sm">
                                    <tbody>
                                        <tr>
                                            <td>Total de Envios:</td>
                                            <td>{campanha.relatorio.total_envios}</td>
                                        </tr>
                                        <tr>
                                            <td>Total de Aberturas:</td>
                                            <td>{campanha.relatorio.total_aberturas}</td>
                                        </tr>
                                        <tr>
                                            <td>Total de Cliques:</td>
                                            <td>{campanha.relatorio.total_cliques}</td>
                                        </tr>
                                        <tr>
                                            <td>Total de Respostas:</td>
                                            <td>{campanha.relatorio.total_respostas}</td>
                                        </tr>
                                        <tr>
                                            <td>Taxa de Abertura:</td>
                                            <td>{campanha.relatorio.taxa_abertura.toFixed(2)}%</td>
                                        </tr>
                                        <tr>
                                            <td>Taxa de Clique:</td>
                                            <td>{campanha.relatorio.taxa_clique.toFixed(2)}%</td>
                                        </tr>
                                        <tr>
                                            <td>Taxa de Resposta:</td>
                                            <td>{campanha.relatorio.taxa_resposta.toFixed(2)}%</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            <Card className="mt-4">
                <Card.Header>
                    <h5 className="mb-0">Conteúdo do Email</h5>
                </Card.Header>
                <Card.Body>
                    <div dangerouslySetInnerHTML={{ __html: campanha.corpo }} />
                </Card.Body>
            </Card>
        </div>
    );
};

export default DetalheCampanha; 