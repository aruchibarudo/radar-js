const config = () => {
  const minRuRadars = process.env.MIN_RU_RADARS ?? 25;

  const env = {
    production: {
      api: {
        baseUrl: process.env.API_BASE_URL,
        token: process.env.API_AUTH_TOKEN,
      },
      minRuRadars,
      featureToggles: {
        UIRefresh2022: true,
      },
    },
    development: {
      api: {
        baseUrl: process.env.API_BASE_URL,
        token: process.env.API_AUTH_TOKEN,
      },
      minRuRadars,
      featureToggles: {
        UIRefresh2022: true,
      },
    },
  }
  return process.env.ENVIRONMENT ? env[process.env.ENVIRONMENT] : env
}
module.exports = config
