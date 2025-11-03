# Environment Variables Example

## Development Environment

Create a `.env.development` file in the root directory with:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/diagonale_dev

# Server Configuration
NODE_ENV=development
LOG_LEVEL=3

# Debug Tools
ENABLE_DEBUG_TOOLS=true
ENABLE_ERROR_OVERLAY=true
```

## Production Environment

Create a `.env.production` file with:

```bash
# Database Configuration
DATABASE_URL=${DATABASE_URL}

# Server Configuration
NODE_ENV=production
LOG_LEVEL=1

# Debug Tools
ENABLE_DEBUG_TOOLS=false
```

## Quick Setup

Run the setup script:
```bash
bash scripts/LOCAL_ENV_SETUP.sh
```
