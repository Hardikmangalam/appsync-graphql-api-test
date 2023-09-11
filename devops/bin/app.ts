#!/usr/bin/env node
import { App } from "aws-cdk-lib";

import { BackendStack } from "../lib/backend-stack";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new App();
const appName = app.node.tryGetContext("appName");

const githubRepoName = app.node.tryGetContext("githubRepoName");
const githubRepoOwner = app.node.tryGetContext("githubRepoOwner");
const githubOAuthTokenSecretName = app.node.tryGetContext("githubOAuthTokenSecretName");

const devBackendStack = new BackendStack(app, "devBackendStack", {
  description: `${appName} dev backend stack`,
  stageName: "dev",
  appName: appName,
  githubRepoName: githubRepoName,
  githubRepoOwner: githubRepoOwner,
  githubOAuthTokenSecretName: githubOAuthTokenSecretName,
});

const stagingAccountNumber = app.node.tryGetContext("stagingAccountNumber");
const stagingBackendStack = new BackendStack(app, "stagingBackendStack", {
  description: `${appName} staging backend stack`,
  stageName: "staging",
  appName: appName,
  githubRepoName: githubRepoName,
  githubRepoOwner: githubRepoOwner,
  githubOAuthTokenSecretName: githubOAuthTokenSecretName,
});

const prodAccountNumber = app.node.tryGetContext("prodAccountNumber");
const prodBackendStack = new BackendStack(app, "prodBackendStack", {
  description: `${appName} prod backend stack`,
  stageName: "prod",
  appName: appName,
  githubRepoName: githubRepoName,
  githubRepoOwner: githubRepoOwner,
  githubOAuthTokenSecretName: githubOAuthTokenSecretName,
});

new PipelineStack(app, `${appName}-pipeline`, {
  devBackendStack: devBackendStack,

  stagingAccountNumber: stagingAccountNumber,
  stagingBackendStack: stagingBackendStack,

  prodAccountNumber: prodAccountNumber,
  prodBackendStack: prodBackendStack,

  appName: appName,

  githubRepoName: githubRepoName,
  githubRepoOwner: githubRepoOwner,
  githubOAuthTokenSecretName: githubOAuthTokenSecretName,
});
