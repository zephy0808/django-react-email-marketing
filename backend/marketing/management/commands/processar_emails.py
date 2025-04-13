from django.core.management.base import BaseCommand
from django.utils import timezone
from marketing.models import Campanha, Email
from marketing.tasks import processar_campanhas_agendadas, processar_envio_campanha

class Command(BaseCommand):
    help = 'Processa campanhas de email agendadas'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando processamento de campanhas agendadas...'))
        
        # Processar campanhas agendadas
        processar_campanhas_agendadas()
        
        # Buscar campanhas em andamento
        campanhas_em_andamento = Campanha.objects.filter(status='enviando')
        
        if campanhas_em_andamento.exists():
            self.stdout.write(self.style.SUCCESS(f'Processando {campanhas_em_andamento.count()} campanhas em andamento'))
            
            for campanha in campanhas_em_andamento:
                # Verificar se ainda há emails pendentes
                emails_pendentes = Email.objects.filter(campanha=campanha, status='aguardando').count()
                
                if emails_pendentes > 0:
                    self.stdout.write(self.style.SUCCESS(f'Campanha {campanha.titulo}: {emails_pendentes} emails pendentes'))
                    resultado = processar_envio_campanha(campanha)
                    self.stdout.write(self.style.SUCCESS(f'Enviados: {resultado["enviados"]}, Falhas: {resultado.get("falhas", 0)}'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Campanha {campanha.titulo}: todos os emails processados'))
                    
                    # Marcar como concluída se todos os emails foram processados
                    campanha.status = 'concluida'
                    campanha.data_fim_envio = timezone.now()
                    campanha.save()
        
        self.stdout.write(self.style.SUCCESS('Processamento de campanhas concluído!')) 