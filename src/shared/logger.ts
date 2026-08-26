import path from 'node:path';
import pino from 'pino';
import { envConfig } from '../config';

const infoTargets: pino.TransportTargetOptions[] = [
  {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:mmm d, yyyy h:MM TT'
    },
  }
];

if (envConfig.node_env !== 'production') {
  infoTargets.push({
    target: 'pino-roll',
    options: {
      file: path.join(process.cwd(), 'logs', 'successes', 'success'),
      size: '20m',
      frequency: 'daily',
      extension: '.log',
      mkdir: true,
    },
  });
}

const infoTransport = pino.transport({ targets: infoTargets });

export const logger = pino(
  {
    level: 'info',
    // base: { label: 'Pastry Shop' },
  },
  infoTransport
);

// Define the transport for error logs
const errorTargets: pino.TransportTargetOptions[] = [
  {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:mmm d, yyyy h:MM TT'
    },
  }
];

if (envConfig.node_env !== 'production') {
  errorTargets.push({
    target: 'pino-roll',
    options: {
      file: path.join(process.cwd(), 'logs', 'errors', 'error'),
      size: '20m',
      frequency: 'daily',
      extension: '.log',
      mkdir: true,
    },
  });
}

const errorTransport = pino.transport({ targets: errorTargets });

export const errorLogger = pino(
  {
    level: 'error',
    // base: { label: 'Pastry Shop' },
  },
  errorTransport
);

// Define the transport for HTTP server requests
const serverTargets: pino.TransportTargetOptions[] = [
  {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:mmm d, yyyy h:MM TT'
    },
  }
];

if (envConfig.node_env !== 'production') {
  serverTargets.push({
    target: 'pino-roll',
    options: {
      file: path.join(process.cwd(), 'logs', 'server_logs', 'server'),
      size: '20m',
      frequency: 'daily',
      extension: '.log',
      mkdir: true,
    },
  });
}

const serverTransport = pino.transport({ targets: serverTargets });

export const serverLogger = pino(
  {
    level: 'info',
  },
  serverTransport
);
