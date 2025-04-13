import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { campanhaService } from '../services/api';

const Relatorios = () => {
    const [campanhas, setCampanhas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        const carregarCampanhas = async () => {
            try {
                const res = await campanhaService.listarTodas();
                // Filtrar apenas campanhas concluídas ou em andamento
                const campanhasFiltradas = res.data.filter(
                    c => c.status === 'concluida' || c.status === 'enviando'
                );
                setCampanhas(campanhasFiltradas);
                setCarregando(false);
            } catch (error) {
                setErro('Erro ao carregar campanhas');
                setCarregando(false);
                console.error('Erro ao carregar campanhas:', error);
            }
        };

        carregarCampanhas();
    }, []);

    const obterStatusBadge = (status) => {
        const statusMap = {
            'enviando': <Badge bg="warning">Enviando</Badge>,
            'concluida': <Badge bg="success">Concluída</Badge>
        };

        return statusMap[status] || <Badge bg="secondary">Desconhecido</Badge>;
    };

    const exportarRelatorio = async (id, titulo) => {
        try {
            const response = await campanhaService.exportarRelatorio(id);

            // Criar arquivo para download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `relatorio_${titulo}.csv`);
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

    return (
        <div>
            <h1 className="mb-4">Relatórios de Campanhas</h1>

            {erro && <Alert variant="danger">{erro}</Alert>}

            {carregando ? (
                <p className="text-center">Carregando relatórios...</p>
            ) : (
                <>
                    {campanhas.length === 0 ? (
                        <Alert variant="info">
                            Não há campanhas concluídas ou em andamento para exibir relatórios.
                        </Alert>
                    ) : (
                        <Card>
                            <Card.Body>
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Campanha</th>
                                            <th>Status</th>
                                            <th>Envios</th>
                                            <th>Aberturas</th>
                                            <th>Cliques</th>
                                            <th>Respostas</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {campanhas.map(campanha => (
                                            <tr key={campanha.id}>
                                                <td>{campanha.titulo}</td>
                                                <td>{obterStatusBadge(campanha.status)}</td>
                                                <td>{campanha.relatorio?.total_envios || 0}</td>
                                                <td>
                                                    {campanha.relatorio?.total_aberturas || 0}
                                                    {' '}
                                                    ({(campanha.relatorio?.taxa_abertura || 0).toFixed(2)}%)
                                                </td>
                                                <td>
                                                    {campanha.relatorio?.total_cliques || 0}
                                                    {' '}
                                                    ({(campanha.relatorio?.taxa_clique || 0).toFixed(2)}%)
                                                </td>
                                                <td>
                                                    {campanha.relatorio?.total_respostas || 0}
                                                    {' '}
                                                    ({(campanha.relatorio?.taxa_resposta || 0).toFixed(2)}%)
                                                </td>
                                                <td className="text-center">
                                                    <Button
                                                        as={Link}
                                                        to={`/campanhas/${campanha.id}`}
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                    >
                                                        Detalhes
                                                    </Button>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => exportarRelatorio(campanha.id, campanha.titulo)}
                                                    >
                                                        Exportar CSV
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default Relatorios; 