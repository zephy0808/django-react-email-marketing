# Django React Email Marketing System

Email marketing management and campaign sending system built with Django and React.

## Requirements

- Python 3.8+
- Django 4.2+
- Django Rest Framework
- Node.js 14+
- React 18+

## Installation

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/zephy0808/django-react-email-marketing.git
cd django-react-email-marketing
```

2. Install Python dependencies:
```bash
pip install django djangorestframework django-cors-headers
```

3. Configure email credentials in `backend/email_app/settings.py`:
```python
EMAIL_HOST = 'your.smtp.server.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@example.com'
EMAIL_HOST_PASSWORD = 'your-password'
```

4. Run database migrations:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser to access the admin panel:
```bash
python manage.py createsuperuser
```

6. Start the Django development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

## Features

### 1. Email List Management
- Import contacts via CSV
- Manual contact registration
- Organization by groups

### 2. Custom Email Creation
- Editor with dynamic fields: `{{name}}`, `{{lastname}}`, `{{email}}`
- Support for images as attachments

### 3. Email Scheduling and Sending
- Schedule for specific date and time
- Segmentation by customer groups
- Preview before sending

### 4. Reports and Analytics
- Open rates, clicks, and responses
- Export reports to CSV

## Scheduled Email Processing

To process scheduled emails, run the command:
```bash
python manage.py processar_emails
```

This command can be configured for periodic execution using cron or system task scheduler.

## System Access

- Admin panel: http://localhost:8000/admin/
- API: http://localhost:8000/api/
- React frontend: http://localhost:3000/

## API Usage Examples

### List all customers
```
GET /api/clientes/
```

### Create a new campaign
```
POST /api/campanhas/
{
  "titulo": "Summer Promotion",
  "assunto": "Special Offers for {{name}}",
  "corpo": "Hello {{name}} {{lastname}}, take advantage of our promotions...",
  "grupos": [1, 2],
  "todos_clientes": false
}
```

### Schedule a campaign
```
POST /api/campanhas/1/agendar/
{
  "data_agendamento": "2023-12-31T10:00:00Z"
}
```

## Project Structure

```
django-react-email-marketing/
├── backend/
│   ├── email_app/          # Django project settings
│   ├── marketing/          # Main Django app
│   └── manage.py
├── frontend/
│   ├── src/                # React source code
│   ├── public/             # Static files
│   └── package.json
└── README.md
```

## Technology Stack

### Backend
- Django 4.2+
- Django REST Framework
- SQLite (default) / PostgreSQL (production)

### Frontend
- React 18+
- Axios for API calls
- Bootstrap/Material-UI for styling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the maintainer.
