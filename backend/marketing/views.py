from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.utils import timezone
from django.template import Template, Context
from django.http import HttpResponse
from django.contrib.auth.models import User

from .models import Cliente, GrupoCliente, Campanha, Anexo, Email, Relatorio
from .serializers import (
    UserSerializer, ClienteSerializer, GrupoClienteSerializer,
    CampanhaSerializer, CampanhaDetailSerializer, AnexoSerializer, 
    EmailSerializer, RelatorioSerializer
)

import csv
import io

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    
    @action(detail=False, methods=['post'])
    def importar_csv(self, request):
        try:
            csv_file = request.FILES.get('arquivo')
            if not csv_file:
                return Response({'erro': 'Nenhum arquivo enviado'}, status=status.HTTP_400_BAD_REQUEST)
            
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.reader(io_string)
            next(reader)  # Pular cabeçalho
            
            clientes_criados = 0
            clientes_atualizados = 0
            erros = []
            
            for row in reader:
                if len(row) >= 3:  # Verificar se a linha tem os campos necessários
                    nome, sobrenome, email = row[0], row[1], row[2]
                    
                    try:
                        cliente, created = Cliente.objects.update_or_create(
                            email=email,
                            defaults={'nome': nome, 'sobrenome': sobrenome}
                        )
                        if created:
                            clientes_criados += 1
                        else:
                            clientes_atualizados += 1
                    except Exception as e:
                        erros.append(f"Erro ao processar linha {nome}, {sobrenome}, {email}: {str(e)}")
                else:
                    erros.append(f"Linha com formato inválido: {','.join(row)}")
            
            return Response({
                'clientes_criados': clientes_criados,
                'clientes_atualizados': clientes_atualizados,
                'erros': erros
            })
        except Exception as e:
            return Response({'erro': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GrupoClienteViewSet(viewsets.ModelViewSet):
    queryset = GrupoCliente.objects.all()
    serializer_class = GrupoClienteSerializer
    
    @action(detail=True, methods=['post'])
    def adicionar_clientes(self, request, pk=None):
        grupo = self.get_object()
        cliente_ids = request.data.get('cliente_ids', [])
        
        clientes = Cliente.objects.filter(id__in=cliente_ids)
        grupo.clientes.add(*clientes)
        
        return Response({'status': 'Clientes adicionados ao grupo'})
    
    @action(detail=True, methods=['post'])
    def remover_clientes(self, request, pk=None):
        grupo = self.get_object()
        cliente_ids = request.data.get('cliente_ids', [])
        
        clientes = Cliente.objects.filter(id__in=cliente_ids)
        grupo.clientes.remove(*clientes)
        
        return Response({'status': 'Clientes removidos do grupo'})

class CampanhaViewSet(viewsets.ModelViewSet):
    queryset = Campanha.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CampanhaDetailSerializer
        return CampanhaSerializer
    
    def perform_create(self, serializer):
        serializer.save(criador=self.request.user)
    
    @action(detail=True, methods=['post'])
    def agendar(self, request, pk=None):
        campanha = self.get_object()
        data_agendamento = request.data.get('data_agendamento')
        
        if not data_agendamento:
            return Response({'erro': 'Data de agendamento é obrigatória'}, status=status.HTTP_400_BAD_REQUEST)
        
        campanha.data_agendamento = data_agendamento
        campanha.status = 'agendada'
        campanha.save()
        
        return Response({'status': 'Campanha agendada com sucesso'})
    
    @action(detail=True, methods=['post'])
    def enviar_teste(self, request, pk=None):
        campanha = self.get_object()
        email_destino = request.data.get('email')
        
        if not email_destino:
            return Response({'erro': 'Email de destino é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Preparar email personalizado
            assunto = campanha.assunto
            corpo = campanha.corpo
            
            # Criar email
            email = EmailMultiAlternatives(
                subject=assunto,
                body=corpo,
                from_email=None,  # Usar o padrão do settings.py
                to=[email_destino]
            )
            
            # Adicionar anexos
            anexos = campanha.anexos.all()
            for anexo in anexos:
                email.attach_file(anexo.arquivo.path)
            
            # Enviar email
            email.send()
            
            return Response({'status': 'Email de teste enviado com sucesso'})
        except Exception as e:
            return Response({'erro': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def iniciar_envio(self, request, pk=None):
        campanha = self.get_object()
        
        if campanha.status not in ['rascunho', 'agendada']:
            return Response({'erro': 'Campanha não pode ser iniciada'}, status=status.HTTP_400_BAD_REQUEST)
        
        campanha.status = 'enviando'
        campanha.data_inicio_envio = timezone.now()
        campanha.save()
        
        # Em um cenário real, aqui você iniciaria um processo em background para enviar os emails
        # Como exemplo, vamos criar registros de Email para cada cliente
        clientes = []
        
        if campanha.todos_clientes:
            clientes = Cliente.objects.filter(ativo=True)
        else:
            for grupo in campanha.grupos.all():
                clientes.extend(grupo.clientes.filter(ativo=True))
        
        # Criar registros de Email
        for cliente in clientes:
            Email.objects.create(
                campanha=campanha,
                cliente=cliente,
                status='aguardando'
            )
        
        # Criar relatório se não existir
        Relatorio.objects.get_or_create(campanha=campanha)
        
        return Response({'status': 'Envio de campanha iniciado com sucesso'})
    
    @action(detail=True, methods=['get'])
    def exportar_relatorio(self, request, pk=None):
        campanha = self.get_object()
        
        try:
            # Verificar se existe relatório
            relatorio, created = Relatorio.objects.get_or_create(campanha=campanha)
            
            # Atualizar métricas
            relatorio.atualizar_metricas()
            
            # Criar arquivo CSV
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="relatorio_{campanha.titulo}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Campanha', 'Total de Envios', 'Total de Aberturas', 'Total de Cliques', 
                            'Total de Respostas', 'Taxa de Abertura (%)', 'Taxa de Clique (%)', 
                            'Taxa de Resposta (%)'])
            
            writer.writerow([
                campanha.titulo,
                relatorio.total_envios,
                relatorio.total_aberturas,
                relatorio.total_cliques,
                relatorio.total_respostas,
                round(relatorio.taxa_abertura, 2),
                round(relatorio.taxa_clique, 2),
                round(relatorio.taxa_resposta, 2)
            ])
            
            return response
        except Exception as e:
            return Response({'erro': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AnexoViewSet(viewsets.ModelViewSet):
    queryset = Anexo.objects.all()
    serializer_class = AnexoSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def perform_create(self, serializer):
        arquivo = self.request.FILES.get('arquivo')
        if not arquivo:
            return Response({'erro': 'Arquivo é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(
            nome=arquivo.name,
            tipo=arquivo.content_type
        )

class EmailViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Email.objects.all()
    serializer_class = EmailSerializer
    
    def get_queryset(self):
        queryset = Email.objects.all()
        campanha_id = self.request.query_params.get('campanha')
        if campanha_id:
            queryset = queryset.filter(campanha_id=campanha_id)
        return queryset
    
    @action(detail=True, methods=['get'])
    def rastreamento(self, request, pk=None):
        # Endpoint para rastrear aberturas de email
        email = self.get_object()
        email.marcar_como_aberto()
        
        # Retorna uma imagem transparente de 1x1 pixel
        pixel_gif = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        return HttpResponse(pixel_gif, content_type='image/gif')
    
    @action(detail=True, methods=['get'])
    def clique(self, request, pk=None):
        # Endpoint para rastrear cliques em links
        email = self.get_object()
        email.marcar_como_clicado()
        
        # Redirecionar para a URL original
        url_original = request.query_params.get('url', '/')
        return Response({'status': 'Clique registrado', 'redirect_url': url_original})

class RelatorioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Relatorio.objects.all()
    serializer_class = RelatorioSerializer
    
    @action(detail=True, methods=['post'])
    def atualizar(self, request, pk=None):
        relatorio = self.get_object()
        relatorio.atualizar_metricas()
        return Response({'status': 'Relatório atualizado com sucesso'})
