module.exports = {
    apps: [
      {
        name: 'backend',
        cwd: './backend',
        script: 'bun',
        args: 'run src/server.ts',
        interpreter: 'none',
        instances: 1,
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        max_memory_restart: '1G',
        restart_delay: 2000,
        exp_backoff_restart_delay: 100,
        env: {
          NODE_ENV: 'development'
        },
        env_production: {
          NODE_ENV: 'production'
        },
        watch: ['src'],
        ignore_watch: ['node_modules', 'public/uploads'],
        error_file: './logs/backend-error.log',
        out_file: './logs/backend-out.log',
        log_file: './logs/backend-combined.log',
        time: true,
        merge_logs: true
      },
      {
        name: 'frontend',
        cwd: './frontend',
        script: 'start.bat',
        interpreter: 'none',
        instances: 1,
        autorestart: true,
        max_restarts: 5,
        min_uptime: '10s',
        restart_delay: 2000,
        env: {
          NODE_ENV: 'development'
        },
        env_production: {
          NODE_ENV: 'production'
        },
        watch: ['src'],
        ignore_watch: ['node_modules', '.next'],
        error_file: './logs/frontend-error.log',
        out_file: './logs/frontend-out.log',
        log_file: './logs/frontend-combined.log',
        time: true
      },
      {
        name: 'python-backend',
        cwd: './python-backend',
        script: 'python',
        args: 'app.py',
        interpreter: 'none',
        instances: 1,
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        restart_delay: 3000,
        exp_backoff_restart_delay: 100,
        env: {
          FLASK_ENV: 'development',
          PORT: '5007',
          PYTHONUNBUFFERED: '1'
        },
        env_production: {
          FLASK_ENV: 'production',
          PORT: '5007',
          PYTHONUNBUFFERED: '1'
        },
        watch: ['.'],
        ignore_watch: ['__pycache__', 'static/generated_images', '*.pyc'],
        error_file: './logs/python-backend-error.log',
        out_file: './logs/python-backend-out.log',
        log_file: './logs/python-backend-combined.log',
        time: true,
        merge_logs: true
      }
    ],
    
    // Deployment configuration
    deploy: {
      production: {
        user: 'node',
        host: 'your-server.com',
        ref: 'origin/main',
        repo: 'git@github.com:yourusername/yourproject.git',
        path: '/var/www/production',
        'pre-deploy-local': '',
        'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
        'pre-setup': ''
      }
    }
  };