from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import uuid

class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    sobrenome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    ativo = models.BooleanField(default=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.nome} {self.sobrenome} ({self.email})"

class GrupoCliente(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    clientes = models.ManyToManyField(Cliente, related_name='grupos')
    
    def __str__(self):
        return self.nome

class Campanha(models.Model):
    STATUS_CHOICES = [
        ('rascunho', 'Rascunho'),
        ('agendada', 'Agendada'),
        ('enviando', 'Enviando'),
        ('concluida', 'Concluída'),
        ('cancelada', 'Cancelada'),
    ]
    
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    assunto = models.CharField(max_length=200)
    corpo = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='rascunho')
    criador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campanhas')
    grupos = models.ManyToManyField(GrupoCliente, blank=True, related_name='campanhas')
    todos_clientes = models.BooleanField(default=False)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    data_agendamento = models.DateTimeField(null=True, blank=True)
    data_inicio_envio = models.DateTimeField(null=True, blank=True)
    data_fim_envio = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.titulo

class Anexo(models.Model):
    campanha = models.ForeignKey(Campanha, on_delete=models.CASCADE, related_name='anexos')
    arquivo = models.FileField(upload_to='anexos/')
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50)
    
    def __str__(self):
        return self.nome

class Email(models.Model):
    STATUS_CHOICES = [
        ('aguardando', 'Aguardando Envio'),
        ('enviado', 'Enviado'),
        ('falha', 'Falha no Envio'),
        ('aberto', 'Aberto'),
        ('clicado', 'Clicado'),
        ('respondido', 'Respondido'),
    ]
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    campanha = models.ForeignKey(Campanha, on_delete=models.CASCADE, related_name='emails')
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='emails')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='aguardando')
    data_envio = models.DateTimeField(null=True, blank=True)
    data_abertura = models.DateTimeField(null=True, blank=True)
    data_clique = models.DateTimeField(null=True, blank=True)
    data_resposta = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Email para {self.cliente.email} - Campanha: {self.campanha.titulo}"
    
    def marcar_como_enviado(self):
        self.status = 'enviado'
        self.data_envio = timezone.now()
        self.save()
    
    def marcar_como_aberto(self):
        self.status = 'aberto'
        self.data_abertura = timezone.now()
        self.save()
    
    def marcar_como_clicado(self):
        self.status = 'clicado'
        self.data_clique = timezone.now()
        self.save()
    
    def marcar_como_respondido(self):
        self.status = 'respondido'
        self.data_resposta = timezone.now()
        self.save()

class Relatorio(models.Model):
    campanha = models.OneToOneField(Campanha, on_delete=models.CASCADE, related_name='relatorio')
    total_envios = models.IntegerField(default=0)
    total_aberturas = models.IntegerField(default=0)
    total_cliques = models.IntegerField(default=0)
    total_respostas = models.IntegerField(default=0)
    taxa_abertura = models.FloatField(default=0)
    taxa_clique = models.FloatField(default=0)
    taxa_resposta = models.FloatField(default=0)
    data_geracao = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Relatório: {self.campanha.titulo}"
    
    def atualizar_metricas(self):
        emails = self.campanha.emails.all()
        total = emails.count()
        
        if total > 0:
            aberturas = emails.filter(status__in=['aberto', 'clicado', 'respondido']).count()
            cliques = emails.filter(status__in=['clicado', 'respondido']).count()
            respostas = emails.filter(status='respondido').count()
            
            self.total_envios = total
            self.total_aberturas = aberturas
            self.total_cliques = cliques
            self.total_respostas = respostas
            self.taxa_abertura = (aberturas / total) * 100
            self.taxa_clique = (cliques / total) * 100
            self.taxa_resposta = (respostas / total) * 100
            self.save()
