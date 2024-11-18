const config = () => {
  const minRuRadars = process.env.MIN_RU_RADARS ?? 10
  const publicUrl = process.env.PUBLIC_URL || ''

  const env = {
    production: {
      publicUrl,
      api: {
        baseUrl: process.env.API_BASE_URL,
        token: process.env.API_AUTH_TOKEN,
      },
      minRuRadars,
    },
    development: {
      publicUrl,
      api: {
        baseUrl: process.env.API_BASE_URL,
        token: process.env.API_AUTH_TOKEN,
      },
      minRuRadars,
    },
  }
  return process.env.NODE_ENV ? env[process.env.NODE_ENV] : env
}
module.exports = config
