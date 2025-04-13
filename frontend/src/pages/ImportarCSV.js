import React, { useState } from 'react';
import { Form, Button, Card, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../services/api';

const ImportarCSV = () => {
    const navigate = useNavigate();
    const [arquivo, setArquivo] = useState(null);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [resultados, setResultados] = useState(null);

    const handleArquivoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'text/csv') {
            setErro('Por favor, selecione um arquivo CSV válido.');
            setArquivo(null);
            return;
        }
        setErro('');
        setArquivo(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!arquivo) {
            setErro('Por favor, selecione um arquivo CSV para importar.');
            return;
        }

        setCarregando(true);
        setErro('');
        setSucesso('');

        try {
            const response = await clienteService.importarCSV(arquivo);
            setResultados(response.data);
            setSucesso('Importação concluída com sucesso!');
        } catch (error) {
            setErro('Erro ao importar arquivo. Verifique o formato e tente novamente.');
            console.error('Erro ao importar CSV:', error);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div>
            <h1 className="mb-4">Importar Clientes (CSV)</h1>

            {erro && <Alert variant="danger">{erro}</Alert>}
            {sucesso && <Alert variant="success">{sucesso}</Alert>}

            <Card className="mb-4">
                <Card.Header>Instruções</Card.Header>
                <Card.Body>
                    <p>
                        Utilize um arquivo CSV com as seguintes colunas:
                    </p>
                    <ol>
                        <li>Nome</li>
                        <li>Sobrenome</li>
                        <li>Email</li>
                    </ol>
                    <p>
                        O arquivo deve ter um cabeçalho e os dados separados por vírgula.
                    </p>
                    <p>
                        <strong>Exemplo:</strong>
                    </p>
                    <pre>
                        Nome,Sobrenome,Email<br />
                        João,Silva,joao.silva@exemplo.com<br />
                        Maria,Santos,maria.santos@exemplo.com
                    </pre>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>Upload de Arquivo</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Selecione o arquivo CSV</Form.Label>
                            <Form.Control
                                type="file"
                                accept=".csv"
                                onChange={handleArquivoChange}
                                disabled={carregando}
                            />
                            <Form.Text className="text-muted">
                                Apenas arquivos CSV são aceitos.
                            </Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/clientes')}
                                disabled={carregando}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={!arquivo || carregando}
                            >
                                {carregando ? 'Importando...' : 'Importar Clientes'}
                            </Button>
                        </div>

                        {carregando && (
                            <ProgressBar animated now={100} className="mt-3" />
                        )}
                    </Form>

                    {resultados && (
                        <div className="mt-4">
                            <h5>Resultados da Importação</h5>
                            <p>
                                <strong>Clientes criados:</strong> {resultados.clientes_criados}<br />
                                <strong>Clientes atualizados:</strong> {resultados.clientes_atualizados}
                            </p>

                            {resultados.erros && resultados.erros.length > 0 && (
                                <>
                                    <h6>Erros ({resultados.erros.length})</h6>
                                    <ul className="text-danger">
                                        {resultados.erros.map((erro, index) => (
                                            <li key={index}>{erro}</li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            <div className="d-flex justify-content-end mt-3">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => navigate('/clientes')}
                                >
                                    Ver Lista de Clientes
                                </Button>
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default ImportarCSV; 