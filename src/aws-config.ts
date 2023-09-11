const awsconfig = {
  aws_project_region: `${process.env.REACT_APP_REGION}`,
  aws_appsync_graphqlEndpoint: `${process.env.REACT_APP_GRAPHQL_API_URL}`,
  aws_appsync_apiKey: `${process.env.REACT_APP_GRAPHQL_API_KEY}`,
  aws_appsync_authenticationType: "API_KEY",
};

export default awsconfig;
