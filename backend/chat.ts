/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const AWS = require('aws-sdk');

const regionArr = ['us-east-1', 'us-east-2'];

const moment = require('moment');
const DynamoDB = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    region: regionArr[Math.floor(Math.random() * regionArr.length)],
});

const docClient = new AWS.DynamoDB.DocumentClient();

const { responseWrapper, verifyJWT } = require('/opt/utils');
const { _values } = require('/opt/constants');
const { closeConnection } = require('/opt/connectionClose');

/// Connection using node-postgres / pg

var { Pool } = require('pg');
let secretsManager = new AWS.SecretsManager();
let SM_EXAMPLE_DATABASE_CREDENTIALS = 'evsdevdb_secret';
// let URL_RDS_PROXY = 'evsdbproxy.proxy-clom6lg25ujp.us-east-1.rds.amazonaws.com';

var pool = null;
const pgConnection = async () => {
    try {
        let sm = await secretsManager
            .getSecretValue({ SecretId: SM_EXAMPLE_DATABASE_CREDENTIALS })
            .promise();
        let credentials = JSON.parse(sm.SecretString);

        pool = new Pool({
            user: credentials.username,
            host: credentials.host,
            database: credentials.dbname,
            password: credentials.password,
            port: credentials.port,
            max: 500,
            idleTimeoutMillis: 6000,
            allowExitOnIdle: true,
        });

        await pool.query('SELECT NOW()');

        return { pool };
    } catch (error) {
        throw error;
    }
};

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        // console.log(`EVENT: ${JSON.stringify(event)}`);
        const fieldName = event.fieldName;
        event.body = event.arguments;
        event.authorization = event.request.headers['x-auth-provider'];
        console.log('fieldName:::>>', fieldName);
        switch (fieldName) {
            case 'quickAnswer':
                return quickAnswer(event);
            case 'sendPublicChat':
                return sendPublicChat(event);
            case 'getPublicChat':
                return getPublicChat(event);
            default:
                return {
                    statusCode: 400,
                    //  Uncomment below to enable CORS requests
                    //  headers: {
                    //      "Access-Control-Allow-Origin": "*",
                    //      "Access-Control-Allow-Headers": "*"
                    //  },
                    body: {
                        succes: false,
                        message: 'Unreachable query / mutation',
                    },
                };
        }
    } catch (error) {
        return responseWrapper(
            { success: false, message: error.message || error },
            null,
            null,
            null,
            error.statusCode || 400,
        );
    }
};

const quickAnswer = async event => {
    let responseData;
    try {
        const { authorization } = event;
        if (!authorization) throw new Error('Invalid Token');

        const verifiedTokenInfo = await verifyJWT(authorization);
        if (!verifiedTokenInfo) throw new Error('Invalid Token');
        let {
            meeting_id,
            question_id,
            message,
            meetingGroupIds = [],
            meetingGroupIndex = [],
            userDBId,
            user_id,
            timezone,
        } = event.body.input;

        if (!meeting_id || !question_id) throw new Error('Please enter valid data');

        const TABLE_NAME = 'QuickChat';
        const currentTimestamp = new Date().getTime();
        const randomSuffix = Math.floor(Math.random() * 1000000);

        const uniquePartitionKey = `${currentTimestamp}${randomSuffix}`;
        let meetingGroupIdsForDynamo = meetingGroupIds.map(obj => {
            return { N: obj.toString() };
        });
        let meetingGroupIndexForDynamo = meetingGroupIndex.map(obj => {
            return { N: obj.toString() };
        });

        const createParams = {
            TableName: TABLE_NAME,
            Item: {
                id: { S: uniquePartitionKey },
                meetingGroupIds: {
                    L: meetingGroupIdsForDynamo,
                },
                meetingGroupIndex: {
                    L: meetingGroupIndexForDynamo,
                },
                userDBId: { S: userDBId.toString() },
                user_id: { S: user_id },
                message: { S: message },
                question_id: { S: question_id },
                timestamp: {
                    S: moment()
                        .utc()
                        .unix()
                        .toString(),
                },
            },
        };

        await DynamoDB.putItem(createParams).promise();

        const getParams = {
            TableName: TABLE_NAME,
            IndexName: 'question_id-index',
            KeyConditionExpression: 'question_id = :qid',
            // FilterExpression: 'contains(meetingGroups, :meetingGroupValue)',
            ExpressionAttributeValues: {
                ':qid': `${question_id}`,
                // ':meetingGroupValue': 1
            },
        };

        let getData = await docClient.query(getParams).promise();
        console.log('getData>>>', JSON.stringify(getData.Items));

        let userCount = new Set();
        user_id.includes('anon') ? userCount.add(user_id) : '';
        getData.Items.forEach(item => {
            if (item.user_id.includes('anon')) {
                userCount.add(item.user_id);
            }
        });
        userCount = userCount.size;
        responseData = responseWrapper(
            null,
            {
                success: true,
                data: {
                    id: uniquePartitionKey,
                    question_id,
                    meetingGroupIds,
                    meetingGroupIndex,
                    userDBId,
                    user_id,
                    message,
                    timezone,
                    meeting_id,
                    userCount,
                },
            },
            null,
            null,
        );
        responseData['meeting_id'] = meeting_id.toString();

        return responseData;
    } catch (error) {
        responseData = responseWrapper(
            {
                success: false,
                message: error.message || error,
                error,
            },
            null,
            null,
            null,
            error.statusCode || 400,
        );
        return responseData;
    }
};

const sendPublicChat = async event => {
    let responseData;
    try {
        const { authorization } = event;
        if (!authorization) throw new Error('Invalid Token');

        const verifiedTokenInfo = await verifyJWT(authorization);
        if (!verifiedTokenInfo) throw new Error('Invalid Token');
        const { id, role_id } = verifiedTokenInfo;
        const { meeting_id, typeId, chat } = event.body.input;

        let { pool } = await pgConnection();

        const sqlUserQuery = `select u.id as id, ms.full_name, email, ms.role_id as role_id from evs."USERS" u inner join evs."MS_USERS_MEETINGS_RELATION" ms on ms.user_id = u.id 
         where u.id=${id} and meeting_id = ${meeting_id};`;

        let userData = await pool.query(sqlUserQuery);
        userData = userData.rows;

        if (!userData || !Array.isArray(userData) || !userData.length)
            throw new Error(`User not found.`);

        userData = userData[0];

        if (!meeting_id) throw new Error('Please enter meeting id');
        if (!typeId) throw new Error('Please enter question id');
        if (!Object.keys(chat).length) throw new Error('Please enter chat text!');

        const TABLE_NAME = 'PublicChatTable';
        const typeName =
            _values.NEW_PUBLIC_CHAT_TYPES[
            typeId !== 1 ? `${typeId}${role_id}` : `${typeId}`
            ];
        const tableId = `${meeting_id}-${typeName}`;

        const existingData = await docClient
            .get({
                TableName: TABLE_NAME,
                Key: {
                    id: tableId,
                },
            })
            .promise();

        if (existingData.hasOwnProperty('Item')) {
            var paramsUpdate = {
                TableName: TABLE_NAME,
                Key: {
                    id: tableId,
                },
                UpdateExpression: 'set chat = list_append(chat, :chatObj)',
                ExpressionAttributeValues: {
                    ':chatObj': [
                        {
                            userDBId: chat.userDBId.toString(),
                            user_Id: chat.user_Id,
                            text: chat.text,
                            timestamp: chat.timestamp.toString(),
                            timezone: chat.timezone,
                            from: role_id.toString(),
                        },
                    ],
                },
                ReturnValues: 'ALL_NEW',
            };

            await docClient.update(paramsUpdate).promise();
        } else {
            const params = {
                TableName: TABLE_NAME,
                Item: {
                    id: {
                        S: tableId,
                    },
                    typeId: { S: typeId.toString() },
                    meeting_id: { N: meeting_id.toString() },
                    chat: {
                        L: [
                            {
                                M: {
                                    userDBId: { N: chat.userDBId.toString() },
                                    user_Id: { S: chat.user_Id },
                                    text: { S: chat.text },
                                    timestamp: {
                                        N: chat.timestamp.toString(),
                                    },
                                    timezone: { S: chat.timezone },
                                    from: {
                                        N: role_id.toString(),
                                    },
                                },
                            },
                        ],
                    },
                },
            };

            await DynamoDB.putItem(params).promise();
        }

        let newTypeId = typeId;

        if (tableId.includes('HOSTS-MODERATORS')) {
            if (role_id === _values.ROLES.HOST) {
                newTypeId = 3;
            } else if (role_id === _values.ROLES.MODERATOR) {
                newTypeId = 2;
            }
        }

        const returnChatObj = {
            typeId: newTypeId,
            userDBId: chat.userDBId.toString(),
            user_Id: chat.user_Id,
            text: chat.text,
            timestamp: chat.timestamp,
            timezone: chat.timezone,
            from: role_id,
            typeName,
        };

        await closeConnection(pool);
        responseData = responseWrapper(
            null,
            {
                success: true,
                data: {
                    existingData,
                    meeting_id,
                    typeId: newTypeId,
                    chat: returnChatObj,
                    from: role_id,
                    typeName,
                },
            },
            null,
            null,
        );
        responseData['meeting_id'] = meeting_id.toString();
        return responseData;
    } catch (error) {
        responseData = responseWrapper(
            {
                success: false,
                message: error.message || error,
                error,
            },
            null,
            null,
            null,
            error.statusCode || 400,
        );
        return responseData;
    }
};

const getPublicChat = async event => {
    let responseData;
    try {
        const { authorization } = event;
        if (!authorization) throw new Error('Invalid Token');

        const verifiedTokenInfo = await verifyJWT(authorization);
        if (!verifiedTokenInfo) throw new Error('Invalid Token');
        const { id, role_id } = verifiedTokenInfo;
        const { meeting_id } = event.body;
        let { pool } = await pgConnection();

        const sqlUserQuery = `select u.id as id, ms.full_name, email, ms.role_id as role_id from evs."USERS" u inner join evs."MS_USERS_MEETINGS_RELATION" ms on ms.user_id = u.id 
         where u.id=${id} and meeting_id = ${meeting_id};`;

        let userData = await pool.query(sqlUserQuery);
        userData = userData.rows;

        if (!userData || !Array.isArray(userData) || !userData.length)
            throw new Error(`User not found.`);

        userData = userData[0];

        if (!meeting_id) throw new Error('Please enter meeting id');

        const returnData = [];
        const TABLE_NAME = 'PublicChatTable';

        const chatSectionObj = _values.ALLOWED_PUBLIC_CHAT_SECTION_BY_ROLE.find(
            e => e.role_id === role_id,
        );

        for (const typeName of chatSectionObj.chat_section) {
            const tableId = `${meeting_id}-${typeName}`;

            const existingData = await docClient
                .get({
                    TableName: TABLE_NAME,
                    Key: {
                        id: tableId,
                    },
                })
                .promise();

            if (existingData.hasOwnProperty('Item')) {
                {
                    console.log('existingData[>>>', existingData['Item']);
                }
                if (existingData['Item'].id.includes('HOSTS-MODERATORS')) {
                    if (role_id === _values.ROLES.HOST) {
                        returnData.push({ ...existingData['Item'], typeId: 3 });
                    } else if (role_id === _values.ROLES.MODERATOR) {
                        returnData.push({ ...existingData['Item'], typeId: 2 });
                    }
                } else {
                    returnData.push(existingData['Item']);
                }
            }
        }

        await closeConnection(pool);
        responseData = responseWrapper(
            null,
            {
                success: true,
                data: { allChatData: returnData },
            },
            null,
            null,
        );

        return responseData;
    } catch (error) {
        responseData = responseWrapper(
            {
                success: false,
                message: error.message || error,
                error,
            },
            null,
            null,
            null,
            error.statusCode || 400,
        );
        return responseData;
    }
};
