import {
  App,
  Stack,
  StackProps,
  CfnOutput,
  RemovalPolicy,
  SecretValue,
  Duration,
  Expiration,
} from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as amplify from "@aws-cdk/aws-amplify-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2"; // Import EC2 module
import path = require("path");

export interface BackendStackProps extends StackProps {
  readonly stageName: string;
  readonly appName: string;
  readonly githubRepoName: string;
  readonly githubRepoOwner: string;
  readonly githubOAuthTokenSecretName: string;
}

export class BackendStack extends Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;

  constructor(app: App, id: string, props: BackendStackProps) {
    super(app, id, props);
    this.lambdaCode = lambda.Code.fromCfnParameters();
    const secretsManagerPolicy = new iam.PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: ["arn:aws:secretsmanager:us-east-1:362826031414:secret:evsdevdb_secret-u5jCdo"],
    });
    const rdsConnectPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["rds-db:connect"],
      resources: [
        "arn:aws:rds:us-east-1:362826031414:db-proxy:prx-06d5453c2d493eb7a/*",
      ],
    });

    const api = new appsync.GraphqlApi(this, "ApiEvsHostCms", {
      name: `${props.appName}-api-${props.stageName}`,
      schema: appsync.SchemaFile.fromAsset(path.join(__dirname, "../../schema.graphql")),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            description: "Public key for accessing api",
            expires: Expiration.after(Duration.days(30)),
            name: "API Token",
          },
        },
      },
      xrayEnabled: true,
    });
    new CfnOutput(this, "GraphQLApiUrl", {
      value: api.graphqlUrl,
    });
    new CfnOutput(this, "GraphQLApiId", {
      value: api.apiId,
    });
    new CfnOutput(this, "GraphQLApiKey", {
      value: api.apiKey || "",
    });

    // Lambda Role
    const lambdaRole = new iam.Role(this, "LambdaRole", {
      roleName: `${props.appName}-lambda-role-${props.stageName}`,
      description: `Lambda role for ${props.appName}`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess")],
    });
    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "lambdaExecutionAccess", {
        policyName: "lambdaExecutionAccess",
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: ["*"],
            actions: [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:DescribeLogGroups",
              "logs:DescribeLogStreams",
              "logs:PutLogEvents",
            ],
          }),
        ],
      })
    );
    lambdaRole.addToPolicy(secretsManagerPolicy);
    lambdaRole.addToPolicy(rdsConnectPolicyStatement);


    // const chatLamda = new lambda.Function(this, "chatFunction", {
    //   functionName: `chat-Function-${props.stageName}`,
    //   description: `${props.appName} lambda function`,
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   handler: "chat.handler",
    //   code: this.lambdaCode,
    //   memorySize: 128,
    //   role: lambdaRole,
    // });
    // const meetingsLamda = new lambda.Function(this, "MeetingsFunction", {
    //   functionName: `meetings-Function-${props.stageName}`,
    //   description: `${props.appName} lambda function`,
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   handler: "meetings.handler",
    //   code: this.lambdaCode,
    //   memorySize: 128,
    //   role: lambdaRole,
    // });
    // const questionLamda = new lambda.Function(this, "questionFunction", {
    //   functionName: `question-Function-${props.stageName}`,
    //   description: `${props.appName} lambda function`,
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   handler: "question.handler",
    //   code: this.lambdaCode,
    //   memorySize: 128,
    //   role: lambdaRole,
    // });
    // const screenLamda = new lambda.Function(this, "screenFunction", {
    //   functionName: `screen-Function-${props.stageName}`,
    //   description: `${props.appName} lambda function`,
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   handler: "screen.handler",
    //   code: this.lambdaCode,
    //   memorySize: 128,
    //   role: lambdaRole,
    // });
    // const templateLamda = new lambda.Function(this, "templateFunction", {
    //   functionName: `template-Function-${props.stageName}`,
    //   description: `${props.appName} lambda function`,
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   handler: "template.handler",
    //   code: this.lambdaCode,
    //   memorySize: 128,
    //   role: lambdaRole,
    // });
    // const usersLamda = new lambda.Function(this, "usersFunction", {
    //   functionName: `users-Function-${props.stageName}`,
    //   description: `${props.appName} lambda function`,
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   handler: "users.handler",
    //   code: this.lambdaCode,
    //   memorySize: 128,
    //   role: lambdaRole,
    // });

    // const lambdaDsMeeting = api.addLambdaDataSource("lambdaDatasourceMeeting", meetingsLamda);
    // const lambdaDsChat = api.addLambdaDataSource("lambdaDatasourceChat", chatLamda);
    // const lambdaDsQuestion = api.addLambdaDataSource("lambdaDatasourceQuestion", questionLamda);
    // const lambdaDsScreen = api.addLambdaDataSource("lambdaDatasourceScreen", screenLamda);
    // const lambdaDsTemplate = api.addLambdaDataSource("lambdaDatasourceTemplate", templateLamda);
    // const lambdaDsUsers = api.addLambdaDataSource("lambdaDatasourceUsers", usersLamda);

    // lambdaDsMeeting.createResolver("checkValidMeeting", {
    //   typeName: "Query",
    //   fieldName: "checkValidMeeting",
    // })
    // lambdaDsMeeting.createResolver("checkValidMeetingPostgres", {
    //   typeName: "Query",
    //   fieldName: "checkValidMeetingPostgres",
    // })
    // lambdaDsMeeting.createResolver("listAvailableNumber", {
    //   typeName: "Query",
    //   fieldName: "listAvailableNumber",
    // })






    const amplifyApp = new amplify.App(this, "amplifyApp", {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        repository: "appsync-graphql-api-test",
        oauthToken: SecretValue.secretsManager(props.githubOAuthTokenSecretName),
        owner: "Hardikmangalam",
      }),
      environmentVariables: {
        REGION: this.region,
        GRAPHQL_API_URL: api.graphqlUrl,
        GRAPHQL_API_KEY: api.apiKey || "",
      },
    });
    const branch = amplifyApp.addBranch("Branch", {
      autoBuild: props.stageName === "dev",
      branchName: "main",
    });
    new CfnOutput(this, "AmplifyUrl", {
      value: `https://${branch.branchName}.${amplifyApp.defaultDomain}`,
    });
  }
}
