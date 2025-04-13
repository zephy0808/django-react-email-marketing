from rest_framework import serializers
from .models import Cliente, GrupoCliente, Campanha, Anexo, Email, Relatorio
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class GrupoClienteSerializer(serializers.ModelSerializer):
    clientes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = GrupoCliente
        fields = '__all__'
    
    def get_clientes_count(self, obj):
        return obj.clientes.count()

class AnexoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anexo
        fields = '__all__'

class EmailSerializer(serializers.ModelSerializer):
    cliente_email = serializers.ReadOnlyField(source='cliente.email')
    
    class Meta:
        model = Email
        fields = ['id', 'uuid', 'campanha', 'cliente', 'cliente_email', 'status', 
                  'data_envio', 'data_abertura', 'data_clique', 'data_resposta']

class RelatorioSerializer(serializers.ModelSerializer):
    campanha_titulo = serializers.ReadOnlyField(source='campanha.titulo')
    
    class Meta:
        model = Relatorio
        fields = '__all__'

class CampanhaSerializer(serializers.ModelSerializer):
    anexos = AnexoSerializer(many=True, read_only=True)
    criador_nome = serializers.ReadOnlyField(source='criador.username')
    relatorio = RelatorioSerializer(read_only=True)
    
    class Meta:
        model = Campanha
        fields = '__all__'

class CampanhaDetailSerializer(serializers.ModelSerializer):
    anexos = AnexoSerializer(many=True, read_only=True)
    criador = UserSerializer(read_only=True)
    grupos = GrupoClienteSerializer(many=True, read_only=True)
    relatorio = RelatorioSerializer(read_only=True)
    emails = serializers.SerializerMethodField()
    
    class Meta:
        model = Campanha
        fields = '__all__'
    
    def get_emails(self, obj):
        # Retorna apenas um resumo dos emails para não sobrecarregar a resposta
        emails = obj.emails.all()[:10]  # Limita a 10 emails
        return EmailSerializer(emails, many=True).data 