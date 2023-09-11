/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createNote = /* GraphQL */ `
  mutation CreateNote($note: NoteInput!) {
    createNote(note: $note) {
      id
      name
      completed
      __typename
    }
  }
`;
export const updateNote = /* GraphQL */ `
  mutation UpdateNote($note: UpdateNoteInput!) {
    updateNote(note: $note) {
      id
      name
      completed
      __typename
    }
  }
`;
export const deleteNote = /* GraphQL */ `
  mutation DeleteNote($noteId: String!) {
    deleteNote(noteId: $noteId)
  }
`;
