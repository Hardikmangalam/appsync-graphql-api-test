# Cross Account CD / CI Pipeline + AWS Fullstack Serverless application

This monopro hosts 3 projects:

- **/devops**: CD/CI pipeline + Infrastruct code for whole application
- **/backend**: Lambda functions (backend)
- **/**: Amplify / GraphQL / React (frontend)

## Build steps

### `cd devops && npm install && npm run build`

Build pipeline stack

### `cdk synth && cdk deploy appsync-graphql-api-pipeline`

Deploy pipeline stack to Contract-dev account. This step only need run once, so this is not in the CD/CI pipeline.

### `amplify codegen`

Generate client code for calling AppSync GraphQL api.

**Note**: Export AppSync GraphQL schema file and save to root as "schema.graphql" before running this script.

### `npm run start:local`

Run / Debug frontend in local environment.

**Note**: Copy Amplify environment variables and store them into .env.local file.

#### All the rest is triggered by pushing into main branch with 2 exceptions:

1. Under contrt-dev account, Amplify will pull and build the frontend. In Staging and Prod, I have turned this off- need manually trigger Amplify build under Amplify console.
2. Automatic transition from dev to staging and from staging to prod are disabled intentionally. Human is needed to enable the transition.

## Future enhancement

1. Trigger staging / production Amplify build using web hook.
2. When CDK AppSync transformer is upgraded to CDK v2, we can take advantage of all the Amplify AppSync transformers.

## Learn More

Following are a few resources I have used when researching this solution:

- https://github.com/ThomasRooney/reamplify
- https://github.com/sudokar/cdk-appsync-typescript-resolver-demo
- https://phatrabbitapps.com/pipeline-resolvers-with-cdk-v2-typescript-and-graphql
- https://dev.to/sudokar/simplify-aws-appsync-graphql-api-creation-with-strongly-typed-typescript-resolvers-g7b
- https://github.com/aws-samples/aws-codepipeline-cicd
- https://aws.amazon.com/blogs/mobile/deploying-a-static-website-with-aws-amplify-and-cdk/
- https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/automatically-detect-changes-and-initiate-different-codepipeline-pipelines-for-a-monorepo-in-codecommit.html
- https://github.com/aws-samples/monorepo-multi-pipeline-trigger
- https://dev.to/alexvladut/deploy-aws-amplify-graphql-transformers-with-aws-cdk-1n3m
- https://towardsdatascience.com/creating-react-graphql-serverless-web-application-using-aws-amplify-40e56f25796b
- https://github.com/kheriox-technologies/yt-appsync-graphql-api-cdk/tree/develop

Happy Coding!!
