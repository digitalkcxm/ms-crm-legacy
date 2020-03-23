module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectTimeout: 90000
    },
    pool: {
      min: 1,
      max: 20,
    },
    migrations: {
      directory: __dirname + '/src/config/database/migrations'
    },
    seeds: {
      directory: __dirname + '/src/config/database/seeds'
    }
  },

  test: {
    client: 'postgresql',
    connection: {
      host:     process.env.DB_HOST,
      database: `${process.env.DB_DATABASE}_test`,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectTimeout: 90000
    },
    pool: {
      min: 1,
      max: 20,
    },
    migrations: {
      directory: __dirname + '/src/config/database/migrations'
    },
    seeds: {
      directory: __dirname + '/src/config/database/seeds'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectTimeout: 90000
    },
    pool: {
      min: 1,
      max: 20,
    },
    migrations: {
      directory: __dirname + '/src/config/database/migrations'
    },
    seeds: {
      directory: __dirname + '/src/config/database/seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectTimeout: 90000
    },
    pool: {
      min: 1,
      max: 20,
    },
    migrations: {
      directory: __dirname + '/src/config/database/migrations'
    },
    seeds: {
      directory: __dirname + '/src/config/database/seeds'
    }
  }

};