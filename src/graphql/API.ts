/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type NoteInput = {
  id: string,
  name: string,
  completed: boolean,
};

export type Note = {
  __typename: "Note",
  id: string,
  name: string,
  completed: boolean,
};

export type UpdateNoteInput = {
  id: string,
  name?: string | null,
  completed?: boolean | null,
};

export type CreateNoteMutationVariables = {
  note: NoteInput,
};

export type CreateNoteMutation = {
  createNote?:  {
    __typename: "Note",
    id: string,
    name: string,
    completed: boolean,
  } | null,
};

export type UpdateNoteMutationVariables = {
  note: UpdateNoteInput,
};

export type UpdateNoteMutation = {
  updateNote?:  {
    __typename: "Note",
    id: string,
    name: string,
    completed: boolean,
  } | null,
};

export type DeleteNoteMutationVariables = {
  noteId: string,
};

export type DeleteNoteMutation = {
  deleteNote?: string | null,
};

export type GetNoteByIdQueryVariables = {
  noteId: string,
};

export type GetNoteByIdQuery = {
  getNoteById?:  {
    __typename: "Note",
    id: string,
    name: string,
    completed: boolean,
  } | null,
};

export type ListNotesQuery = {
  listNotes?:  Array< {
    __typename: "Note",
    id: string,
    name: string,
    completed: boolean,
  } | null > | null,
};

export type OnCreateNoteSubscription = {
  onCreateNote?:  {
    __typename: "Note",
    id: string,
    name: string,
    completed: boolean,
  } | null,
};

export type OnDeleteNoteSubscription = {
  onDeleteNote?: string | null,
};

export type OnUpdateNoteSubscription = {
  onUpdateNote?:  {
    __typename: "Note",
    id: string,
    name: string,
    completed: boolean,
  } | null,
};
