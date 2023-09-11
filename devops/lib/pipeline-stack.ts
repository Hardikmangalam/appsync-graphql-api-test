import {
  App,
  Stack,
  StackProps,
  RemovalPolicy,
  CfnCapabilities,
  SecretValue
} from "aws-cdk-lib";
import { AccountPrincipal, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Key } from "aws-cdk-lib/aws-kms";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { BuildSpec, LinuxBuildImage, PipelineProject } from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import {
  CloudFormationCreateUpdateStackAction,
  CodeBuildAction,
  GitHubSourceAction,
} from "aws-cdk-lib/aws-codepipeline-actions";

import { BackendStack } from "./backend-stack";

export interface PipelineStackProps extends StackProps {
  readonly devBackendStack: BackendStack;

  readonly stagingAccountNumber: string;
  readonly stagingBackendStack: BackendStack;

  readonly prodAccountNumber: string;
  readonly prodBackendStack: BackendStack;

  readonly appName: string;

  readonly githubRepoName: string;
  readonly githubRepoOwner: string;
  readonly githubOAuthTokenSecretName: string;
}

export class PipelineStack extends Stack {
  constructor(app: App, id: string, props: PipelineStackProps) {
    super(app, id, props);

    const prodDeploymentRole = Role.fromRoleArn(
      this,
      "ProdDeploymentRole",
      `arn:aws:iam::${props.prodAccountNumber}:role/CloudFormationDeploymentRole`,
      {
        mutable: false,
      }
    );
    const prodCrossAccountRole = Role.fromRoleArn(
      this,
      "ProdCrossAccountRole",
      `arn:aws:iam::${props.prodAccountNumber}:role/CodePipelineCrossAccountRole`,
      {
        mutable: false,
      }
    );
    const prodAccountRootPrincipal = new AccountPrincipal(props.prodAccountNumber);

    const stagingDeploymentRole = Role.fromRoleArn(
      this,
      "StagingDeploymentRole",
      `arn:aws:iam::${props.stagingAccountNumber}:role/CloudFormationDeploymentRole`,
      {
        mutable: false,
      }
    );
    const stagingCrossAccountRole = Role.fromRoleArn(
      this,
      "StagingCrossAccountRole",
      `arn:aws:iam::${props.stagingAccountNumber}:role/CodePipelineCrossAccountRole`,
      {
        mutable: false,
      }
    );
    const stagingAccountRootPrincipal = new AccountPrincipal(props.stagingAccountNumber);

    const key = new Key(this, "ArtifactKey", {
      alias: `key/${props.appName}-artifact-key`,
    });
    key.grantDecrypt(prodAccountRootPrincipal);
    key.grantDecrypt(prodCrossAccountRole);
    key.grantDecrypt(stagingAccountRootPrincipal);
    key.grantDecrypt(stagingCrossAccountRole);

    const artifactBucket = new Bucket(this, "ArtifactBucket", {
      bucketName: `${props.appName}-artifact-bucket-${this.account}`,
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: BucketEncryption.KMS,
      encryptionKey: key,
    });
    artifactBucket.grantPut(prodAccountRootPrincipal);
    artifactBucket.grantRead(prodAccountRootPrincipal);
    artifactBucket.grantPut(stagingAccountRootPrincipal);
    artifactBucket.grantRead(stagingAccountRootPrincipal);
    artifactBucket.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const cdkBuild = new PipelineProject(this, "CdkBuild", {
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            commands: ["cd devops", "npm install"],
          },
          build: {
            commands: ["npm run build", "npm run cdk synth"],
          },
        },
        artifacts: {
          "base-directory": "devops/cdk.out",
          files: ["*.template.json"],
        },
      }),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
      },
      encryptionKey: key,
    });
    const backendBuild = new PipelineProject(this, "BackendBuild", {
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            commands: ["cd backend", "npm install"],
          },
          build: {
            commands: "npm run build",
          },
        },
        artifacts: {
          "base-directory": "backend",
          files: ["*.js", "node_modules/**/*"],
        },
      }),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
      },
      encryptionKey: key,
    });

    const sourceOutput = new Artifact();
    const cdkBuildOutput = new Artifact("CdkBuildOutput");
    const backendBuildOutput = new Artifact("BackendBuildOutput");

    const pipeline = new Pipeline(this, "Pipeline", {
      pipelineName: `${props.appName}-pipeline`,
      artifactBucket: artifactBucket,
      stages: [
        {
          stageName: "Source",
          actions: [
            new GitHubSourceAction({
              actionName: "Github_Source",
              oauthToken: SecretValue.plainText("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"),
              owner: props.githubRepoOwner,
              repo: props.githubRepoName,
              branch: "main",
              output: sourceOutput,
            }),
          ],
        },
        {
          stageName: "Build",
          actions: [
            new CodeBuildAction({
              actionName: "Backend_Build",
              project: backendBuild,
              input: sourceOutput,
              outputs: [backendBuildOutput],
            }),
            new CodeBuildAction({
              actionName: "CDK_Synth",
              project: cdkBuild,
              input: sourceOutput,
              outputs: [cdkBuildOutput],
            }),
          ],
        },
        {
          stageName: "Deploy_Dev",
          actions: [
            new CloudFormationCreateUpdateStackAction({
              actionName: "Deploy",
              templatePath: cdkBuildOutput.atPath("devBackendStack.template.json"),
              stackName: `${props.appName}-stack-dev`,
              adminPermissions: true,
              parameterOverrides: {
                ...props.devBackendStack.lambdaCode.assign(backendBuildOutput.s3Location),
              },
              extraInputs: [backendBuildOutput],
            }),
          ],
        },
        {
          stageName: "Deploy_Staging",
          actions: [
            new CloudFormationCreateUpdateStackAction({
              actionName: "Deploy",
              templatePath: cdkBuildOutput.atPath("stagingBackendStack.template.json"),
              stackName: `${props.appName}-stack-staging`,
              adminPermissions: true,
              parameterOverrides: {
                ...props.prodBackendStack.lambdaCode.assign(backendBuildOutput.s3Location),
              },
              deploymentRole: stagingDeploymentRole,
              cfnCapabilities: [CfnCapabilities.NAMED_IAM, CfnCapabilities.AUTO_EXPAND],
              extraInputs: [backendBuildOutput],
              role: stagingCrossAccountRole,
            }),
          ],
          transitionToEnabled: false,
          transitionDisabledReason: "To be enabled once development is ready",
        },
        {
          stageName: "Deploy_Prod",
          actions: [
            new CloudFormationCreateUpdateStackAction({
              actionName: "Deploy",
              templatePath: cdkBuildOutput.atPath("prodBackendStack.template.json"),
              stackName: `${props.appName}-stack-prod`,
              adminPermissions: true,
              parameterOverrides: {
                ...props.prodBackendStack.lambdaCode.assign(backendBuildOutput.s3Location),
              },
              deploymentRole: prodDeploymentRole,
              cfnCapabilities: [CfnCapabilities.NAMED_IAM, CfnCapabilities.AUTO_EXPAND],
              extraInputs: [backendBuildOutput],
              role: prodCrossAccountRole,
            }),
          ],
          transitionToEnabled: false,
          transitionDisabledReason: "To be enabled once staging is validated",
        },
      ],
    });

    pipeline.addToRolePolicy(
      new PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [`arn:aws:iam::${props.prodAccountNumber}:role/*`],
      })
    );
  }
}
