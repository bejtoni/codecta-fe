# Image Cropper

A full-stack web application for cropping images and overlaying custom logos. Users can upload PNG images, select crop areas with an interactive interface, and generate final images with configurable logo overlays.

## Project Overview

Image Cropper is a modern web application that provides a streamlined workflow for image processing. The application allows authenticated users to:

- Upload PNG images for cropping
- Use an interactive cropping interface to select desired image regions
- Preview cropped results at a reduced scale
- Configure and apply custom logo overlays with position and scale controls
- Generate final processed images ready for download

The application follows a microservices architecture with a **React** frontend and **Spring Boot** backend, secured with OAuth2 authentication through Google.

## Architecture

### Frontend (`imagecropper-fe`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: ShadCN UI components with modern design
- **State Management**: Zustand for authentication state
- **Authentication**: OpenID Connect (OIDC) with Google Auth
- **API Client**: Axios with automatic token management

### Backend (`imagecropper-be`)
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Database**: Microsoft SQL Server 2022
- **Authentication**: OAuth2 Resource Server with JWT validation
- **Image Processing**: Thumbnailator and TwelveMonkeys ImageIO libraries
- **API Documentation**: SpringDoc OpenAPI (Swagger)

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **Networking**: Custom Docker network for service communication
- **Database Persistence**: Docker volumes for data storage

## Features

### Authentication & User Management
- **Google OAuth Integration**: Secure authentication using Google OAuth 2.0
- **JWT Token Management**: Automatic token handling and API integration
- **Protected Routes**: Frontend route guards to ensure authenticated access
- **User Auto-Registration**: Users are automatically created upon first login

### Image Cropping
- **Interactive Cropper**: Drag-and-select interface for choosing crop areas
- **Real-time Preview**: See a 5% scaled preview of the cropped region instantly
- **PNG Support**: Full support for PNG images with transparency
- **Coordinate Mapping**: Accurate conversion between display and natural image coordinates

### Logo Configuration
- **Logo Upload**: Upload custom PNG logos (with transparency support)
- **Position Control**: Choose from 5 predefined positions:
  - Top Left
  - Top Right
  - Bottom Left
  - Bottom Right
  - Center
- **Scale Control**: Adjustable logo size from 1% to 25% of cropped image dimensions
- **Per-User Configuration**: Each user maintains their own logo settings
- **Config Management**: Create, update, and view configuration at any time

### Image Generation
- **Full Quality Output**: Generate final images at original crop quality
- **Logo Overlay**: Automatically apply configured logo to generated images
- **Instant Download**: Download processed images directly from the browser

## Intended User Flow

1. **Initial Setup**
   - User navigates to the application
   - User clicks "Sign in with Google"
   - User authenticates through Google OAuth flow
   - System automatically creates user account and redirects to main application

2. **Logo Configuration (First Time)**
   - User navigates to the configuration panel
   - User uploads a PNG logo file
   - User selects desired logo position (e.g., Top Right)
   - User adjusts scale slider (1-25%)
   - User saves configuration
   - System stores configuration for future use

3. **Image Cropping Workflow**
   - User uploads a PNG image file
   - Image displays in the interactive cropper interface
   - User drags to select the desired crop area
   - User clicks "Preview" to see a scaled preview of the cropped result
   - User adjusts crop selection if needed
   - User clicks "Generate" to create the final image with logo overlay
   - User downloads the generated image

4. **Subsequent Sessions**
   - User logs in (stored configuration is automatically loaded)
   - User can immediately start cropping images
   - User can update logo configuration at any time without re-uploading unless changing the logo file

## Technical Specifications

### API Endpoints

#### Authentication
- `GET /api/auth/me` - Get current user information (requires authentication)

#### Configuration
- `GET /api/config/me` - Get user's logo configuration
- `POST /api/config` - Create new configuration (multipart form data)
- `PUT /api/config/me` - Update existing configuration (multipart form data)

#### Image Processing
- `POST /api/image/preview` - Get preview of cropped image (5% scale)
- `POST /api/image/generate` - Generate final image with logo overlay

### Database Schema

- **User**: Stores user information (ID, email from JWT)
- **ImageConfig**: Stores per-user logo configuration (logo blob, position, scale percentage)

### Image Processing Specifications

- **Supported Format**: PNG only (input and output)
- **Preview Scale**: Fixed at 5% of original crop size
- **Logo Scale Range**: 1% to 25% of cropped image dimensions
- **Coordinate System**: Natural pixel coordinates for accuracy
- **Logo Overlay**: Maintains transparency and alpha channel

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Both `imagecropper-be` and `imagecropper-fe` repositories cloned into the same parent folder
- `.env` files configured in both backend and frontend directories
- Google OAuth credentials set up

### Quick Start

See the [Docker Compose Guide](imagecropper-be/docker-compose-guide.md )

## Project Structure

```
parent-folder/
├── imagecropper-be/          # Backend Spring Boot application
│   ├── src/
│   ├── docker-compose.yml    # Docker Compose configuration
│   ├── Dockerfile
│   └── .env                  # Backend environment variables
├── imagecropper-fe/          # Frontend React application
│   ├── src/
│   ├── Dockerfile
│   └── .env                  # Frontend environment variables
└── README.md                 # This file
```

## Development

### Backend Development
- Spring Boot application runs on port 5000
- Database accessible on port 1433
- API documentation available at `localhost:5000/swagger-ui/index.html` when running

### Frontend Development
- Vite dev server typically runs on port 5173
- Hot module replacement enabled
- TypeScript strict mode enabled

## Security

- All API endpoints (except OAuth callbacks) require valid JWT authentication
- Frontend route guards protect authenticated pages
- Backend validates JWT tokens on every request

### Database design note
The database and entities are structured with scalability in mind and intended for extension. For demonstration purposes, the current implementation enforces a single `ImageConfig` per user. The model is ready to evolve to multiple configurations per user (e.g., a `user_id` to `config` one‑to‑many with a unique name key).

## Future Work

- Adding a Stepper component to enhance UX
- Additional image formats (JPEG/WebP) and export profiles
- S3 object storage for logos and generated assets
- Download pipeline and compliance: now FE uses `URL.createObjectURL(Blob)`. Migrate to S3 with short‑lived presigned URLs for HIPAA/PCI‑DSS/ISO compliance.
- Queue‑based horizontal scaling: add RabbitMQ with “competing consumers”. API enqueues jobs; multiple stateless workers process with retries/DLQ. Scale by adding replicas.
