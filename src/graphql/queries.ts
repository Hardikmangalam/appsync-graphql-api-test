/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getNoteById = /* GraphQL */ `
  query GetNoteById($noteId: String!) {
    getNoteById(noteId: $noteId) {
      id
      name
      completed
      __typename
    }
  }
`;
export const listNotes = /* GraphQL */ `
  query ListNotes {
    listNotes {
      id
      name
      completed
      __typename
    }
  }
`;
