import { ModelInit, MutableModel } from "@aws-amplify/datastore";

type ReservationMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Reservation {
  readonly id: string;
  readonly owner: string;
  readonly description?: string | null;
  readonly start_date: string;
  readonly end_date: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Reservation, ReservationMetaData>);
  static copyOf(source: Reservation, mutator: (draft: MutableModel<Reservation, ReservationMetaData>) => MutableModel<Reservation, ReservationMetaData> | void): Reservation;
}