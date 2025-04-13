# Sistema de Email Marketing

Sistema para gerenciamento e envio de campanhas de email marketing.

## Requisitos

- Python 3.8+
- Django 4.2+
- Biblioteca Django Rest Framework

## Instalação

1. Clone o repositório:
```
git clone https://github.com/seu-usuario/django-react-email-marketing.git
cd django-react-email-marketing
```

2. Instale as dependências:
```
pip install django djangorestframework django-cors-headers
```

3. Configure as credenciais de email no arquivo `backend/email_app/settings.py`:
```python
EMAIL_HOST = 'seu.servidor.smtp.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'seu-email@exemplo.com'
EMAIL_HOST_PASSWORD = 'sua-senha'
```

4. Execute as migrações do banco de dados:
```
cd backend
python manage.py makemigrations
python manage.py migrate
```

5. Crie um superusuário para acessar o painel administrativo:
```
python manage.py createsuperuser
```

6. Inicie o servidor:
```
python manage.py runserver
```

## Funcionalidades

### 1. Gerenciamento de Lista de Emails
- Importação de contatos por CSV
- Cadastro manual de contatos
- Organização por grupos

### 2. Criação de Emails Personalizados
- Editor com campos dinâmicos: `{{nome}}`, `{{sobrenome}}`, `{{email}}`
- Suporte para imagens como anexos

### 3. Agendamento e Envio de Emails
- Agendamento para data e hora específicas
- Segmentação por grupos de clientes
- Visualização prévia antes do envio

### 4. Relatórios e Estatísticas
- Taxa de abertura, cliques e respostas
- Exportação de relatórios em CSV

## Envio de Emails Agendados

Para processar emails agendados, execute o comando:
```
python manage.py processar_emails
```

Este comando pode ser configurado para execução periódica utilizando cron ou agendador de tarefas do sistema.

## Acesso ao Sistema

- Painel administrativo: http://localhost:8000/admin/
- API: http://localhost:8000/api/

## Exemplo de Uso da API

### Listar todos os clientes
```
GET /api/clientes/
```

### Criar uma nova campanha
```
POST /api/campanhas/
{
  "titulo": "Promoção de Verão",
  "assunto": "Ofertas Especiais para {{nome}}",
  "corpo": "Olá {{nome}} {{sobrenome}}, aproveite nossas promoções...",
  "grupos": [1, 2],
  "todos_clientes": false
}
```

### Agendar uma campanha
```
POST /api/campanhas/1/agendar/
{
  "data_agendamento": "2023-12-31T10:00:00Z"
}
```
