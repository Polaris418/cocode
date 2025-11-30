module.exports = {
  apps: [{
    name: 'cocode-backend',
    script: 'src/server.js',
    cwd: './cocode-backend',
    instances: 1, // WebSocket needs single instance or use sticky sessions
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 1234
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 1234
    },
    // Restart settings
    max_memory_restart: '500M',
    restart_delay: 1000,
    max_restarts: 10,
    // Logs
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    merge_logs: true,
  }]
};
