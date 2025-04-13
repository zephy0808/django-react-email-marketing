from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template import Template, Context
from django.conf import settings
import logging
import time

from .models import Campanha, Email, Cliente, Relatorio

logger = logging.getLogger(__name__)

def substituir_campos_dinamicos(texto, cliente):
    """Substitui campos dinâmicos no texto do email"""
    texto = texto.replace('{{nome}}', cliente.nome)
    texto = texto.replace('{{sobrenome}}', cliente.sobrenome)
    texto = texto.replace('{{email}}', cliente.email)
    return texto

def enviar_email_para_cliente(email_obj):
    """Envia um email para um cliente específico"""
    try:
        campanha = email_obj.campanha
        cliente = email_obj.cliente
        
        # Personalizar assunto e corpo
        assunto = substituir_campos_dinamicos(campanha.assunto, cliente)
        corpo = substituir_campos_dinamicos(campanha.corpo, cliente)
        
        # Adicionar imagem de rastreamento
        pixel_rastreamento = f"<img src='{settings.BASE_URL}/api/emails/{email_obj.uuid}/rastreamento/' width='1' height='1' />"
        
        # Criar email
        email = EmailMultiAlternatives(
            subject=assunto,
            body=corpo,
            from_email=settings.EMAIL_HOST_USER,
            to=[cliente.email]
        )
        
        # Adicionar versão HTML com pixel de rastreamento
        if "<html" in corpo:
            # Adicionar o pixel antes do </body>
            if "</body>" in corpo:
                corpo = corpo.replace("</body>", f"{pixel_rastreamento}</body>")
            else:
                corpo = f"{corpo}{pixel_rastreamento}"
        else:
            # Email de texto simples, converter para HTML simples
            corpo = f"<html><body>{corpo}{pixel_rastreamento}</body></html>"
        
        email.attach_alternative(corpo, "text/html")
        
        # Adicionar anexos
        anexos = campanha.anexos.all()
        for anexo in anexos:
            email.attach_file(anexo.arquivo.path)
        
        # Enviar email
        email.send()
        
        # Atualizar status do email
        email_obj.marcar_como_enviado()
        return True
    except Exception as e:
        logger.error(f"Erro ao enviar email para {cliente.email}: {str(e)}")
        email_obj.status = 'falha'
        email_obj.save()
        return False

def processar_campanhas_agendadas():
    """Verifica e processa campanhas agendadas"""
    agora = timezone.now()
    
    # Buscar campanhas agendadas para o momento atual
    campanhas = Campanha.objects.filter(
        status='agendada',
        data_agendamento__lte=agora  # Campanhas com data de agendamento no passado ou presente
    )
    
    for campanha in campanhas:
        try:
            # Atualizar status
            campanha.status = 'enviando'
            campanha.data_inicio_envio = agora
            campanha.save()
            
            # Criar relatório se não existir
            relatorio, _ = Relatorio.objects.get_or_create(campanha=campanha)
            
            # Identificar todos os clientes que devem receber
            clientes = []
            
            if campanha.todos_clientes:
                clientes = Cliente.objects.filter(ativo=True)
            else:
                for grupo in campanha.grupos.all():
                    for cliente in grupo.clientes.filter(ativo=True):
                        if cliente not in clientes:
                            clientes.append(cliente)
            
            # Criar objetos de email
            emails_criados = []
            for cliente in clientes:
                email, created = Email.objects.get_or_create(
                    campanha=campanha,
                    cliente=cliente,
                    defaults={'status': 'aguardando'}
                )
                if created:
                    emails_criados.append(email)
            
            # Iniciar processo de envio
            processar_envio_campanha(campanha)
            
        except Exception as e:
            logger.error(f"Erro ao processar campanha {campanha.id}: {str(e)}")
            campanha.status = 'falha'
            campanha.save()

def processar_envio_campanha(campanha):
    """Processa o envio de todos os emails de uma campanha"""
    try:
        # Buscar emails pendentes
        emails_pendentes = Email.objects.filter(
            campanha=campanha,
            status='aguardando'
        )
        
        total_enviados = 0
        total_falhas = 0
        
        # Enviar emails
        for email in emails_pendentes:
            sucesso = enviar_email_para_cliente(email)
            if sucesso:
                total_enviados += 1
            else:
                total_falhas += 1
            
            # Pequeno delay para não sobrecarregar o servidor SMTP
            time.sleep(0.1)
        
        # Atualizar status da campanha
        if total_falhas == 0 and Email.objects.filter(campanha=campanha, status='aguardando').count() == 0:
            campanha.status = 'concluida'
            campanha.data_fim_envio = timezone.now()
            campanha.save()
        
        # Atualizar relatório
        if hasattr(campanha, 'relatorio'):
            campanha.relatorio.atualizar_metricas()
        
        return {
            'enviados': total_enviados,
            'falhas': total_falhas
        }
    except Exception as e:
        logger.error(f"Erro no processamento da campanha {campanha.id}: {str(e)}")
        return {
            'enviados': 0,
            'falhas': 0,
            'erro': str(e)
        } 