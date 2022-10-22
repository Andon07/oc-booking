import React from 'react';
import { EventInput } from '@fullcalendar/react'
import { DataStore } from 'aws-amplify';
import { Reservation } from '../models/index'

let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

export const INITIAL_EVENTS: EventInput[] = [
  {
    id: createEventId(),
    title: 'All-day event',
    start: todayStr
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: todayStr + 'T12:00:00'
  }
]


export const updateEvents = async () => {
  try {
    const reservations = await DataStore.query(Reservation); 
    console.log("Reservations retrieved successfully!", JSON.stringify(reservations, null, 2));
    const ressys = reservations.map((res) => ({
        id: res.id,
        title: res.description ? res.description : "None",
        start: res.start_date,
        end: res.end_date
      })
    )
    return ressys
  } catch (error) {
    console.log("Error retrieving posts", error);
    return []
  }
}



export function createEventId() {
  return String(eventGuid++)
}