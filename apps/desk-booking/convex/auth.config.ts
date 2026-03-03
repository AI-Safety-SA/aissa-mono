const authConfig = {
  providers: [
    {
      domain: process.env.AUTH_PROVIDER_DOMAIN,
      applicationID: process.env.AUTH_PROVIDER_APP_ID ?? "convex",
    },
  ],
};

export default authConfig;
