# Environment Variables Example

## Required Variables for Local Development

Create a `.env.local` file in the root directory with:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Feature Flags
VITE_ENABLE_SW=false
VITE_AUTH_MODE=supabase
VITE_ENABLE_APP_SHELL=true
VITE_ENABLE_APP_SHELL_ON_INTRO=false
```

## Quick Setup

Run the setup script:
```bash
bash scripts/LOCAL_ENV_SETUP.sh
```
