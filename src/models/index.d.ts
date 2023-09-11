import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

type EagerresponseType = {
  readonly statusCode: number;
  readonly body: string;
  readonly headers?: string | null;
}

type LazyresponseType = {
  readonly statusCode: number;
  readonly body: string;
  readonly headers?: string | null;
}

export declare type responseType = LazyLoading extends LazyLoadingDisabled ? EagerresponseType : LazyresponseType

export declare const responseType: (new (init: ModelInit<responseType>) => responseType)

type EagerresponseTypeMeetingId = {
  readonly statusCode: number;
  readonly body: string;
  readonly headers?: string | null;
  readonly meeting_id?: string | null;
}

type LazyresponseTypeMeetingId = {
  readonly statusCode: number;
  readonly body: string;
  readonly headers?: string | null;
  readonly meeting_id?: string | null;
}

export declare type responseTypeMeetingId = LazyLoading extends LazyLoadingDisabled ? EagerresponseTypeMeetingId : LazyresponseTypeMeetingId

export declare const responseTypeMeetingId: (new (init: ModelInit<responseTypeMeetingId>) => responseTypeMeetingId)

type EagerscreenType = {
  readonly id: string;
  readonly name: string;
  readonly meeting_id: number;
  readonly has_note: boolean;
  readonly is_locked: boolean;
  readonly is_deleted: boolean;
  readonly scale_view: boolean;
  readonly layout_type: number;
  readonly description?: string | null;
  readonly display_seq: number;
  readonly created_by: string;
  readonly updated_by: string;
  readonly deleted_by: string;
}

type LazyscreenType = {
  readonly id: string;
  readonly name: string;
  readonly meeting_id: number;
  readonly has_note: boolean;
  readonly is_locked: boolean;
  readonly is_deleted: boolean;
  readonly scale_view: boolean;
  readonly layout_type: number;
  readonly description?: string | null;
  readonly display_seq: number;
  readonly created_by: string;
  readonly updated_by: string;
  readonly deleted_by: string;
}

export declare type screenType = LazyLoading extends LazyLoadingDisabled ? EagerscreenType : LazyscreenType

export declare const screenType: (new (init: ModelInit<screenType>) => screenType)