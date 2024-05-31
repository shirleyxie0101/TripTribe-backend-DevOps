export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  database: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27018/tripTribeDb',
  },
  graphql: {
    autoSchemaFile: 'src/schema.gql',
  },
  uploader: {
    middleware: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '', 10) || 1048576,
      maxFiles: parseInt(process.env.MAX_FILES || '', 10) || 10,
    },
  },
  redis: {
    host: 'localhost',
    port: 6379,
  },
  auth: {
    emailTokenExpiration: '7d',
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
});
