import axios from 'axios';

// Configuração base para o Axios
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptador para adicionar o token de autenticação
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Serviços de clientes
const clienteService = {
    listarTodos: () => api.get('/clientes/'),
    obterPorId: (id) => api.get(`/clientes/${id}/`),
    criar: (dados) => api.post('/clientes/', dados),
    atualizar: (id, dados) => api.put(`/clientes/${id}/`, dados),
    excluir: (id) => api.delete(`/clientes/${id}/`),
    importarCSV: (arquivo) => {
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        return api.post('/clientes/importar_csv/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

// Serviços de grupos
const grupoService = {
    listarTodos: () => api.get('/grupos/'),
    obterPorId: (id) => api.get(`/grupos/${id}/`),
    criar: (dados) => api.post('/grupos/', dados),
    atualizar: (id, dados) => api.put(`/grupos/${id}/`, dados),
    excluir: (id) => api.delete(`/grupos/${id}/`),
    adicionarClientes: (id, clienteIds) => api.post(`/grupos/${id}/adicionar_clientes/`, { cliente_ids: clienteIds }),
    removerClientes: (id, clienteIds) => api.post(`/grupos/${id}/remover_clientes/`, { cliente_ids: clienteIds }),
};

// Serviços de campanhas
const campanhaService = {
    listarTodas: () => api.get('/campanhas/'),
    obterPorId: (id) => api.get(`/campanhas/${id}/`),
    criar: (dados) => api.post('/campanhas/', dados),
    atualizar: (id, dados) => api.put(`/campanhas/${id}/`, dados),
    excluir: (id) => api.delete(`/campanhas/${id}/`),
    agendar: (id, dataAgendamento) => api.post(`/campanhas/${id}/agendar/`, { data_agendamento: dataAgendamento }),
    enviarTeste: (id, email) => api.post(`/campanhas/${id}/enviar_teste/`, { email: email }),
    iniciarEnvio: (id) => api.post(`/campanhas/${id}/iniciar_envio/`),
    exportarRelatorio: (id) => api.get(`/campanhas/${id}/exportar_relatorio/`, { responseType: 'blob' }),
};

// Serviços de anexos
const anexoService = {
    upload: (campanhaId, arquivo) => {
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        formData.append('campanha', campanhaId);
        return api.post('/anexos/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    excluir: (id) => api.delete(`/anexos/${id}/`),
};

// Serviços de autenticação
const authService = {
    login: (username, password) => api.post('/api-token-auth/', { username, password }),
    registrar: (userData) => api.post('/usuarios/', userData),
};

export {
    clienteService,
    grupoService,
    campanhaService,
    anexoService,
    authService,
}; 