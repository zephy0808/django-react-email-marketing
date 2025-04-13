import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { campanhaService, grupoService, clienteService } from '../services/api';

const NovaCampanha = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        titulo: '',
        assunto: '',
        corpo: '',
        grupos: [],
        todos_clientes: false,
        status: 'rascunho'
    });
    const [grupos, setGrupos] = useState([]);
    const [arquivos, setArquivos] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [erro, setErro] = useState('');
    const [emailTeste, setEmailTeste] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [sucesso, setSucesso] = useState('');

    // Exemplo de cliente para visualização prévia
    const [clienteExemplo, setClienteExemplo] = useState(null);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const resGrupos = await grupoService.listarTodos();
                setGrupos(resGrupos.data);

                // Carregar um cliente aleatório para preview
                const resClientes = await clienteService.listarTodos();
                if (resClientes.data.length > 0) {
                    setClienteExemplo(resClientes.data[0]);
                }
            } catch (error) {
                setErro('Erro ao carregar dados. Tente novamente mais tarde.');
                console.error('Erro ao carregar dados:', error);
            }
        };

        carregarDados();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleEditorChange = (content) => {
        setFormData({
            ...formData,
            corpo: content
        });
    };

    const handleArquivosChange = (e) => {
        setArquivos([...e.target.files]);
    };

    const handleGruposChange = (e) => {
        const options = e.target.options;
        const values = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                values.push(parseInt(options[i].value));
            }
        }
        setFormData({
            ...formData,
            grupos: values
        });
    };

    const substituirCamposDinamicos = (texto) => {
        if (!clienteExemplo || !texto) return texto;

        return texto
            .replace(/{{nome}}/g, clienteExemplo.nome)
            .replace(/{{sobrenome}}/g, clienteExemplo.sobrenome)
            .replace(/{{email}}/g, clienteExemplo.email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setErro('');
        setSucesso('');

        try {
            const response = await campanhaService.criar(formData);
            const campanhaId = response.data.id;

            // Upload de anexos se houver
            if (arquivos.length > 0) {
                for (const arquivo of arquivos) {
                    await campanhaService.uploadAnexo(campanhaId, arquivo);
                }
            }

            setSucesso('Campanha criada com sucesso!');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            setErro('Erro ao criar campanha. Verifique os dados e tente novamente.');
            console.error('Erro ao criar campanha:', error);
        } finally {
            setCarregando(false);
        }
    };

    const enviarTeste = async () => {
        if (!emailTeste) {
            setErro('Informe um email para enviar o teste');
            return;
        }

        setCarregando(true);
        try {
            // Primeiro cria a campanha como rascunho se ainda não existir
            let campanhaId;
            if (!formData.id) {
                const response = await campanhaService.criar({
                    ...formData,
                    status: 'rascunho'
                });
                campanhaId = response.data.id;
                setFormData({ ...formData, id: campanhaId });

                // Upload de anexos se houver
                if (arquivos.length > 0) {
                    for (const arquivo of arquivos) {
                        await campanhaService.uploadAnexo(campanhaId, arquivo);
                    }
                }
            } else {
                campanhaId = formData.id;
            }

            // Envia o email de teste
            await campanhaService.enviarTeste(campanhaId, emailTeste);
            setSucesso(`Email de teste enviado para ${emailTeste}`);
        } catch (error) {
            setErro('Erro ao enviar email de teste. Tente novamente mais tarde.');
            console.error('Erro ao enviar teste:', error);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div>
            <h1 className="mb-4">Nova Campanha de Email</h1>

            {erro && <Alert variant="danger">{erro}</Alert>}
            {sucesso && <Alert variant="success">{sucesso}</Alert>}

            <Card className="mb-4">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Dados da Campanha</span>
                        <Button
                            variant={previewMode ? "outline-secondary" : "outline-primary"}
                            onClick={() => setPreviewMode(!previewMode)}
                        >
                            {previewMode ? "Editar" : "Visualizar"}
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {!previewMode ? (
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Título da Campanha</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="titulo"
                                            value={formData.titulo}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            Para identificação interna
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Assunto do Email</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="assunto"
                                            value={formData.assunto}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            O que os destinatários verão
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Conteúdo do Email</Form.Label>
                                <ReactQuill
                                    value={formData.corpo}
                                    onChange={handleEditorChange}
                                    theme="snow"
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'color': [] }, { 'background': [] }],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['link', 'image'],
                                            ['clean']
                                        ]
                                    }}
                                />
                                <Form.Text className="text-muted mt-2 d-block">
                                    Use {'{'}{'{'}'nome'{'}'}{'}'},  {'{'}{'{'}'sobrenome'{'}'}{'}'}  e  {'{'}{'{'}'email'{'}'}{'}'} para personalizar o conteúdo.
                                </Form.Text>
                            </Form.Group>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Grupos de Destinatários</Form.Label>
                                        <Form.Select
                                            name="grupos"
                                            multiple
                                            value={formData.grupos}
                                            onChange={handleGruposChange}
                                            disabled={formData.todos_clientes}
                                        >
                                            {grupos.map(grupo => (
                                                <option key={grupo.id} value={grupo.id}>
                                                    {grupo.nome} ({grupo.clientes_count} contatos)
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Anexos</Form.Label>
                                        <Form.Control
                                            type="file"
                                            multiple
                                            onChange={handleArquivosChange}
                                        />
                                        <Form.Text className="text-muted">
                                            Selecione as imagens para anexar ao email
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Enviar para todos os clientes ativos"
                                    name="todos_clientes"
                                    checked={formData.todos_clientes}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <hr />

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Enviar Email de Teste</Form.Label>
                                        <div className="d-flex">
                                            <Form.Control
                                                type="email"
                                                placeholder="Email para teste"
                                                value={emailTeste}
                                                onChange={(e) => setEmailTeste(e.target.value)}
                                                className="me-2"
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={enviarTeste}
                                                disabled={carregando}
                                            >
                                                Enviar Teste
                                            </Button>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="d-flex justify-content-end align-items-end">
                                    <Button
                                        variant="success"
                                        type="submit"
                                        className="px-4"
                                        disabled={carregando}
                                    >
                                        {carregando ? 'Salvando...' : 'Salvar Campanha'}
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    ) : (
                        <div className="email-preview">
                            <Card>
                                <Card.Header>
                                    <strong>De:</strong> Sistema de Email Marketing
                                </Card.Header>
                                <Card.Header>
                                    <strong>Assunto:</strong> {substituirCamposDinamicos(formData.assunto)}
                                </Card.Header>
                                <Card.Body>
                                    <div dangerouslySetInnerHTML={{ __html: substituirCamposDinamicos(formData.corpo) }} />
                                </Card.Body>
                                {arquivos.length > 0 && (
                                    <Card.Footer>
                                        <strong>Anexos ({arquivos.length}):</strong> {arquivos.map(arquivo => arquivo.name).join(', ')}
                                    </Card.Footer>
                                )}
                            </Card>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default NovaCampanha; 