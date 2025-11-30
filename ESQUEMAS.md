## Arquitectura General
```mermaid
graph LR
    User[Operario/Admin] -->|HTTPS| Browser[SPA React]
    subgraph Frontend
        Browser --> AuthCtx[AuthContext / Hooks]
        Browser --> APIClient[Funciones fetchPedidos/create/update]
    end
    APIClient -->|REST JSON + JWT| ExpressAPI[Servidor Express]
    subgraph Backend
        ExpressAPI --> Routers[Routers / Middlewares]
        Routers --> Services[Servicios (auth, pedidos)]
        Services --> PGPool[Pool PostgreSQL]
    end
    PGPool -->|SQL| PostgreSQL[(Base de datos)]
```

## Estructura SPA
```mermaid
graph TD
    App[App.tsx] --> AuthProvider
    App --> Sidebar
    App --> Views{currentView}
    Views --> PanelGeneral
    Views --> DetallePedido
    Views --> PerfilUsuario
    PanelGeneral --> NuevoPedidoDialog
    PanelGeneral --> EditarPedidoDialog
    DetallePedido --> PedidoTimeline
    PerfilUsuario --> PerfilForm
    AuthProvider --> Login
```

## Flujo JWT
```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BE as Backend
    participant DB as PostgreSQL
    U->>FE: Credenciales (nombre, password)
    FE->>BE: POST /api/auth/login
    BE->>DB: SELECT usuario + hash
    DB-->>BE: Datos/Status
    BE->>BE: Validar contraseña + generar JWT/refresh
    BE-->>FE: { user, accessToken, refreshToken }
    FE->>FE: Guardar tokens en localStorage
    FE->>BE: Requests protegidos con Authorization: Bearer
    BE->>BE: authenticate + authorize middlewares
    BE-->>FE: Datos pedidos/respuestas
```

## Rutas Backend
```mermaid
graph LR
    A[Router /api/auth] -->|POST| Register
    A -->|POST| Login
    A -->|POST| Refresh
    A -->|GET| Me
    A -->|POST| ChangePassword
    P[Router /api/pedidos] -->|GET| ListPedidos
    P -->|GET| PedidoById
    P -->|POST (Admin/Oficina)| CrearPedido
    P -->|PUT (Roles específicos)| ActualizarPedido
    P -->|DELETE (Admin)| BorrarPedido
    subgraph Middlewares
        Authenticate --> Authorize
    end
    Middlewares --> A
    Middlewares --> P
```

## Esquema Base de Datos
```mermaid
erDiagram
    usuarios ||--o{ pedidos : "created_by"
    usuarios ||--o{ fases : "operario_id"
    pedidos ||--o{ fases : "pedido_id"
    usuarios ||--o{ audit_log : "usuario_id"
    pedidos {
        text id PK
        date fecha_entrada
        varchar centro
        varchar material
        date fecha_vencimiento
        varchar estado
        text incidencias
        boolean transporte
        integer created_by FK
        timestamptz created_at
        timestamptz updated_at
    }
    fases {
        serial id PK
        text pedido_id FK
        varchar tipo
        varchar estado
        date fecha_inicio
        date fecha_fin
        integer operario_id FK
        text observaciones
        timestamptz created_at
        timestamptz updated_at
    }
    usuarios {
        serial id PK
        varchar nombre UNIQUE
        varchar email UNIQUE
        varchar password_hash
        varchar rol
        boolean activo
        timestamptz created_at
        timestamptz updated_at
    }
    audit_log {
        serial id PK
        integer usuario_id FK
        varchar accion
        varchar entidad
        text entidad_id
        jsonb datos_anteriores
        jsonb datos_nuevos
        varchar ip_address
        text user_agent
        timestamptz timestamp
    }
```

## Pipeline de Despliegue
```mermaid
flowchart LR
    start[[Clonar repo]]
    start --> envs[Configurar .env front y backend]
    envs --> installFE[npm install (root)]
    envs --> installBE[npm install (backend/)]
    installBE --> devBE[npm run dev (backend)]
    installFE --> devFE[npm run dev]
    devFE -->|Build| buildFE[npm run build -> dist/]
    devBE -->|Build| buildBE[cd backend && npm run build]
    buildBE --> startBE[npm start (backend/dist)]
    buildFE --> ServeStatic[Servir dist/ con nginx/CDN]
```

## Pipeline de Testing
```mermaid
flowchart TD
    subgraph Frontend Tests
        Vitest --> jsdomEnv[Entorno jsdom + Testing Library]
        jsdomEnv --> SuitesFE[Suites *.test.tsx]
        SuitesFE --> CoverageFE[V8 coverage]
    end
    subgraph Backend Tests
        Jest --> tsjest[ts-jest preset ESM]
        tsjest --> SuitesBE[auth.service.test.ts ...]
        SuitesBE --> CoverageBE[text/lcov/html]
    end
```

## Librerías de UI
```mermaid
mindmap
  root((UI Stack))
    React 18
      Vite 6
    Componentes
      Radix UI
      cmdk
      embla-carousel-react
    Iconos
      lucide-react
    Formularios
      react-hook-form
      input-otp
    Feedback
      @radix-ui/react-toast
      sonner
    Estilos
      Tailwind (index.css)
      tailwind-merge
    Visualizaciones
      recharts
    Utilidades
      class-variance-authority
      clsx
```
