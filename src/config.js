const config = () => {
  const env = {
    production: {
      apiBaseUrl: process.env.API_BASE_URL,
      featureToggles: {
        UIRefresh2022: true,
      },
    },
    development: {
      apiBaseUrl: process.env.API_BASE_URL,
      featureToggles: {
        UIRefresh2022: true,
      },
    },
  }
  return process.env.ENVIRONMENT ? env[process.env.ENVIRONMENT] : env
}
module.exports = config
