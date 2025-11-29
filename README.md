# 🚀 Microservicio de Pagos

## 📝 Descripción
Microservicio encargado del procesamiento de pagos para el sistema de eventos. Maneja la creación, seguimiento y gestión de transacciones de pago de forma segura y eficiente.

## 🛠️ Características Principales

### 1. Estructura del Proyecto
```
src/
├── config/           # Configuraciones (DB, Swagger)
├── controllers/      # Lógica de negocio
├── middleware/       # Middlewares personalizados
├── models/          # Modelos de datos
│   └── payment.js   # Modelo de pagos
├── routes/          # Definición de rutas
├── utils/           # Utilidades
├── index.js         # Punto de entrada
└── app.js           # Configuración de Express
```

### 2. Tecnologías Utilizadas
- **Node.js** (v18+)
- **Express** (v4.18+)
- **MongoDB** con **Mongoose** (v8.0+)
- **Stripe** para procesamiento de pagos
- **JWT** para autenticación
- **Swagger** para documentación de API
- **ES Modules** (import/export)
- **Helmet** para seguridad HTTP
- **Winston** para logging estructurado
- **Redis** para caché (opcional)

### 3. Endpoints Principales

#### Pagos
- `POST /api/payments` - Crea un nuevo pago
- `POST /api/payments/batch` - Crea multiples pagos
- `GET /api/payments/:userId` - Obtiene un pago por ID
- `GET /api/payments/:paymentId` - Obtiene un pago por ID
- `GET /api/payments/user/:userId` - Lista pagos por usuario

#### Documentación
- `GET /api-docs` - Documentación interactiva

### 4. Variables de Entorno
Crear archivo `.env` en la raíz:
```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/payment-service
STRIPE_SECRET_KEY=sk_live_...
JWT_SECRET=tu_clave_secreta_jwt
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 5. Instalación y Uso

1. **Clonar el repositorio**
   ```bash
   git clone [url-del-repositorio]
   cd payment-service
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Iniciar en producción**
   ```bash
   npm start
   ```

### 6. Documentación de la API
La documentación interactiva de la API está disponible en:
- Desarrollo: http://localhost:3002/api-docs

### 7. Estándares de Código
- Uso de ES Modules (import/export)
- Nombres descriptivos en inglés
- Comentarios JSDoc para documentación
- Validación de datos con express-validator
- Manejo centralizado de errores

---

## Guía de Contribución

1. Hacer fork del repositorio
2. Crear una rama para la nueva característica (`git checkout -b feature/nueva-caracteristica`)
3. Hacer commit de los cambios (`git commit -am 'Agregar nueva característica'`)
4. Hacer push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
