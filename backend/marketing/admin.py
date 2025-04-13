from django.contrib import admin
from .models import Cliente, GrupoCliente, Campanha, Anexo, Email, Relatorio

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'sobrenome', 'email', 'ativo', 'data_cadastro')
    search_fields = ('nome', 'sobrenome', 'email')
    list_filter = ('ativo', 'data_cadastro')

@admin.register(GrupoCliente)
class GrupoClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'descricao')
    search_fields = ('nome',)
    filter_horizontal = ('clientes',)

@admin.register(Campanha)
class CampanhaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'status', 'criador', 'data_criacao', 'data_agendamento')
    search_fields = ('titulo', 'descricao')
    list_filter = ('status', 'data_criacao', 'data_agendamento')
    filter_horizontal = ('grupos',)

@admin.register(Anexo)
class AnexoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tipo', 'campanha')
    search_fields = ('nome',)
    list_filter = ('tipo',)

@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'campanha', 'status', 'data_envio')
    search_fields = ('cliente__email', 'campanha__titulo')
    list_filter = ('status', 'data_envio')

@admin.register(Relatorio)
class RelatorioAdmin(admin.ModelAdmin):
    list_display = ('campanha', 'total_envios', 'taxa_abertura', 'taxa_clique', 'taxa_resposta', 'data_geracao')
    search_fields = ('campanha__titulo',)
    list_filter = ('data_geracao',)
