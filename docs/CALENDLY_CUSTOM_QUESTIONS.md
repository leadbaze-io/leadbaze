# 📝 Como Passar Informações do Formulário para o Calendly

## ✅ Solução Implementada

O código já está configurado para passar todas as informações coletadas no formulário conversacional para o Calendly via URL parameters.

---

## 🎯 Como Configurar no Calendly (Passo a Passo)

### 1. Editar seu Event Type

1. Acesse: https://calendly.com/event_types
2. Encontre: **"Demonstração LeadBaze"** (ou seu evento)
3. Clique em **"Edit"**

---

### 2. Adicionar Perguntas Customizadas

Role até a seção **"Invitee Questions"** e adicione estas perguntas:

#### Pergunta 1: Empresa
```
Pergunta: Qual é o nome da sua empresa?
Tipo: One-line text
Required: Yes
```

#### Pergunta 2: Segmento
```
Pergunta: Em qual segmento sua empresa atua?
Tipo: One-line text
Required: Yes
```

#### Pergunta 3: Desafio
```
Pergunta: Qual é o principal desafio da sua empresa hoje?
Tipo: Multi-line text
Required: Yes
```

#### Pergunta 4: Volume Desejado
```
Pergunta: Quantos leads qualificados por mês seria ideal?
Tipo: One-line text
Required: Yes
```

---

### 3. Salvar Configurações

1. Clique em **"Save & Close"**
2. ✅ Pronto! As perguntas estão configuradas

---

## 📧 O que Acontece Agora

Quando alguém agenda uma demonstração:

### ✅ Email de Confirmação do Calendly

O email que você recebe terá:

```
📅 Nova Demonstração Agendada

Nome: João Silva
Email: joao@empresa.com
Telefone: (11) 99999-9999

Respostas:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Qual é o nome da sua empresa?
→ Tech Solutions LTDA

Em qual segmento sua empresa atua?
→ Tecnologia e Software

Qual é o principal desafio da sua empresa hoje?
→ Dificuldade em encontrar contatos qualificados

Quantos leads qualificados por mês seria ideal?
→ 100-300 leads/mês
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ✅ Painel do Calendly

No painel do Calendly você verá:
- Todas as informações do lead
- Respostas das perguntas
- Histórico de agendamentos

### ✅ Google Calendar (se conectado)

Se você conectou o Google Calendar:
- Evento criado automaticamente
- Descrição com todas as informações
- Lembrete antes da reunião

---

## 🎯 Alternativa: Email Automático

Se quiser receber as informações por email separadamente, podemos criar um script que:

1. Quando lead completa formulário
2. Envia email para você com:
   - Nome, empresa, desafios
   - Link para agendar
   - Resumo completo

**Quer que eu implemente isso?**

---

## 💡 Dica Extra

Para ver todas as informações de forma organizada:

1. Acesse: https://calendly.com/scheduled_events
2. Clique no evento agendado
3. Veja todas as respostas em "Event Details"

---

## 🚀 Próximos Passos

1. ✅ Configure as perguntas no Calendly (5 minutos)
2. ✅ Teste agendando uma demonstração
3. ✅ Verifique se as informações aparecem no email
4. ✅ Pronto para usar!

---

## ❓ Dúvidas?

As informações estão sendo passadas via URL parameters:
```
https://calendly.com/orafamachadoc/demonstracao-leadbaze?
  name=João Silva&
  email=joao@empresa.com&
  a1=Tech Solutions&
  a2=Tecnologia&
  a3=Dificuldade em encontrar contatos&
  a4=100-300 leads/mês
```

O Calendly automaticamente preenche os campos com esses dados! 🎉
