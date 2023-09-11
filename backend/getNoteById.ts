// eslint-disable-next-line
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function getNoteById (noteId: string) {
  const params = {
    TableName: process.env.NOTES_TABLE,
    Key: { id: noteId }
  }
  try {
    const { Item } = await docClient.get(params).promise()
    return Item
  } catch (err) {
    console.log('DynamoDB error: ', err)
  }
}

export default getNoteById
