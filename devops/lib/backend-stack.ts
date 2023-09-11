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
    // const vpc = ec2.Vpc.fromVpcAttributes(this, "MyVpc", {
    //   vpcId: "your-vpc-id",
    //   availabilityZones: ["us-east-1a", "us-east-1b", "us-east-1c"], // Replace with your AZs
    //   publicSubnetIds: [
    //     "subnet-044713d262f322cd7",
    //     "subnet-01a52e0d31abee1ec",
    //     "subnet-03067edc8ec4d5984",
    //   ],
    // });
    // Appsync + Lambda
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

    const api = new appsync.GraphqlApi(this, "Api", {
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


    const notesLambda = new lambda.Function(this, "Function", {
      functionName: `${props.appName}-Function-${props.stageName}`,
      description: `${props.appName} lambda function`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "main.handler",
      code: this.lambdaCode,
      memorySize: 128,
    });

    const meetingsLamda = new lambda.Function(this, "MeetingsFunction", {
      functionName: `meetings-Function-${props.stageName}`,
      description: `${props.appName} lambda function`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "meetings.handler",
      code: this.lambdaCode,
      memorySize: 128,
      role: lambdaRole, // Specify the Lambda function's role here
      // vpc: vpc, // Attach the Lambda to the VPC
    });

    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource("lambdaDatasource", notesLambda);
    const lambdaDsMeeting = api.addLambdaDataSource("lambdaDatasourceMeeting", meetingsLamda);
    lambdaDsMeeting.createResolver("checkValidMeeting", {
      typeName: "Query",
      fieldName: "checkValidMeeting",
    })
    lambdaDsMeeting.createResolver("checkValidMeetingPostgres", {
      typeName: "Query",
      fieldName: "checkValidMeetingPostgres",
    })
    lambdaDsMeeting.createResolver("listAvailableNumber", {
      typeName: "Query",
      fieldName: "listAvailableNumber",
    })

    lambdaDs.createResolver("getNoteById", {
      typeName: "Query",
      fieldName: "getNoteById",
    });

    lambdaDs.createResolver("listNotes", {
      typeName: "Query",
      fieldName: "listNotes",
    });

    lambdaDs.createResolver("createNote", {
      typeName: "Mutation",
      fieldName: "createNote",
    });

    lambdaDs.createResolver("deleteNote", {
      typeName: "Mutation",
      fieldName: "deleteNote",
    });

    lambdaDs.createResolver("updateNote", {
      typeName: "Mutation",
      fieldName: "updateNote",
    });

    // DynamoDB
    const notesTable = new ddb.Table(this, "NotesTable", {
      tableName: `${props.appName}-NotesTable-${props.stageName}`,
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });
    // enable the Lambda function to access the DynamoDB table (using IAM)
    notesTable.grantFullAccess(notesLambda);
    if (props.stageName !== "prod") {
      notesTable.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }

    // Create an environment variable that we will use in the function code
    notesLambda.addEnvironment("NOTES_TABLE", notesTable.tableName);

    // Amplify
    const amplifyApp = new amplify.App(this, "amplifyApp", {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        repository: props.githubRepoName,
        oauthToken: SecretValue.secretsManager(props.githubOAuthTokenSecretName),
        owner: props.githubRepoOwner,
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
