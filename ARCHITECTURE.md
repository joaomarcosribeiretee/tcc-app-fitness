# 🏗️ Arquitetura do Projeto - MVVM

## 📋 Visão Geral

Este projeto segue o padrão **MVVM (Model-View-ViewModel)** para garantir separação de responsabilidades, testabilidade e manutenibilidade.

---

## 📁 Estrutura de Pastas

```
src/
├── presentation/           # Camada de apresentação (View + ViewModel)
│   ├── components/        # Componentes reutilizáveis
│   │   ├── ui/           # Componentes de interface (inputs, buttons, etc)
│   │   └── layout/       # Componentes de layout (header, tabs, etc)
│   │
│   ├── styles/           # Estilos centralizados
│   │   ├── colors.ts     # Paleta de cores
│   │   ├── fonts.ts      # Configuração de fontes
│   │   ├── authStyles.ts # Estilos de autenticação
│   │   ├── headerStyles.ts # Estilos do header
│   │   ├── homeStyles.ts # Estilos da home
│   │   └── appStyles.ts  # Estilos gerais
│   │
│   ├── viewmodels/       # ViewModels (lógica de apresentação)
│   │   └── AuthViewModel.ts
│   │
│   ├── auth/             # Telas de autenticação (Views)
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   │
│   ├── home/             # Tela principal de treino
│   │   └── HomeScreen.tsx
│   │
│   ├── diet/             # Tela de dieta
│   │   └── DietScreen.tsx
│   │
│   └── profile/          # Tela de perfil
│       └── ProfileScreen.tsx
│
├── domain/               # Camada de domínio (Model)
│   ├── entities/        # Entidades do domínio
│   ├── repositories/    # Interfaces de repositórios
│   └── usecases/        # Casos de uso
│
├── data/                # Camada de dados
│   └── repositories/    # Implementações de repositórios
│
├── infra/               # Infraestrutura
│   └── secureStore.ts   # Armazenamento seguro
│
└── di/                  # Injeção de dependências
    └── container.ts
```

---

## 🎯 Camadas da Arquitetura MVVM

### 1. **Model (Modelo)**
**Localização**: `src/domain/`

- **Entities**: Entidades do domínio (Usuario, Treino, etc)
- **Repositories**: Contratos/interfaces para acesso a dados
- **UseCases**: Regras de negócio da aplicação

**Responsabilidades**:
- Definir as regras de negócio
- Gerenciar os dados da aplicação
- Independente de UI e frameworks

### 2. **View (Visão)**
**Localização**: `src/presentation/[feature]/`

- **Screens**: Telas da aplicação (LoginScreen, HomeScreen, etc)
- **Components**: Componentes reutilizáveis

**Responsabilidades**:
- Renderizar a interface
- Capturar interações do usuário
- Observar o ViewModel e reagir às mudanças

### 3. **ViewModel (Modelo de Visão)**
**Localização**: `src/presentation/viewmodels/`

- Gerencia o estado da UI
- Processa a lógica de apresentação
- Comunica com os UseCases

**Responsabilidades**:
- Processar eventos da View
- Gerenciar estado da apresentação
- Chamar UseCases do domínio
- Notificar a View sobre mudanças

---

## 🔄 Fluxo de Dados

```
User Interaction (View)
        ↓
    ViewModel
        ↓
    UseCase (Domain)
        ↓
    Repository (Data)
        ↓
    Data Source (Infra)
        ↓
    Repository (Data)
        ↓
    UseCase (Domain)
        ↓
    ViewModel
        ↓
    View Update
```

---

## 📦 Organização de Estilos

### **Centralização de Estilos**
Todos os estilos estão na pasta `src/presentation/styles/`:

- ✅ **Separação**: Cada tela/componente tem seu arquivo de estilos
- ✅ **Reutilização**: Estilos compartilhados em arquivos comuns
- ✅ **Manutenibilidade**: Fácil encontrar e modificar estilos
- ✅ **Consistência**: Paleta de cores e fontes centralizadas

### **Exemplo de Uso**:
```typescript
// Em vez de estilos inline no componente:
<Text style={{ fontSize: 20, color: '#000' }}>Texto</Text>

// Use estilos importados:
import { homeStyles } from '../styles/homeStyles';
<Text style={homeStyles.title}>Texto</Text>
```

---

## 🎨 Componentes

### **UI Components** (`components/ui/`)
Componentes básicos de interface:
- `ValidatedInput`: Input com validação e mensagens de erro

### **Layout Components** (`components/layout/`)
Componentes de estrutura:
- `AppHeader`: Header superior com logo e ações
- `BottomTabBar`: Navegação inferior com ícones

---

## 🔤 Fontes

### **Configuração**
- Arquivo: `src/presentation/styles/fonts.ts`
- Fonte principal: **Mogra** (para títulos e logo)
- Carregamento: Hook `useAppFonts()` no App.tsx

### **Uso**:
```typescript
import { fonts } from '../styles/fonts';

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.mogra,
    fontSize: 24,
  },
});
```

---

## 🎯 Boas Práticas Implementadas

1. ✅ **Separação de Responsabilidades**: Cada camada tem sua função específica
2. ✅ **Componentização**: Componentes reutilizáveis e isolados
3. ✅ **Estilos Centralizados**: Sem estilos inline nos componentes
4. ✅ **TypeScript**: Tipagem forte para segurança
5. ✅ **Callbacks Otimizados**: useCallback para evitar re-renders
6. ✅ **Memoização**: React.memo() em componentes
7. ✅ **Injeção de Dependências**: Container para gerenciar dependências

---

## 🚀 Próximos Passos

1. **Implementar mais UseCases** para treinos e dietas
2. **Adicionar testes unitários** para ViewModels
3. **Criar mais componentes** reutilizáveis
4. **Implementar navegação** entre telas de treino
5. **Adicionar persistência** local de dados

---

## 📚 Referências

- [MVVM Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Native Best Practices](https://reactnative.dev/docs/performance)

