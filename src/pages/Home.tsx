import React from 'react'
import FullCalendar, { EventApi, DateSelectArg, EventClickArg, EventContentArg, formatDate } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { createEventId, INITIAL_EVENTS, updateEvents } from './event-utils'
import { EventInput } from '@fullcalendar/react'
import { DataStore } from 'aws-amplify';
import { Reservation } from '../models/index'


import './home.css'
import { constants } from 'buffer'

interface CalAppState {
  weekendsVisible: boolean
  currentEvents: EventInput[]
}

export const CalApp: React.FC<CalAppState> = ({weekendsVisible, currentEvents}) => {

  const [weekendsVis, setWeekendsVis] = React.useState(weekendsVisible);
  const [curEvents, setCurEvents] = React.useState(currentEvents)

  React.useEffect(() => {
    const fetchData = async () => {
      const reservations = await DataStore.query(Reservation); 
      console.log("Reservations retrieved successfully!", JSON.stringify(reservations, null, 2));
      const ressys = reservations.map((res) => ({
          id: res.id,
          title: res.description ? res.description : "None",
          start: res.start_date,
          end: res.end_date
        })
      )
      setCurEvents(ressys)
    }
  
    // call the function
    fetchData()
      // make sure to catch any error
      .catch(console.error);
  }, [])

  const renderSidebar = () => {
    return (
      <div className='cal-app-sidebar'>
        <div className='cal-app-sidebar-section'>
          <h2>Instructions</h2>
          <ul>
            <li>Select dates and you will be prompted to create a new event</li>
            <li>Drag, drop, and resize events</li>
            <li>Click an event to delete it</li>
          </ul>
        </div>
        <div className='cal-app-sidebar-section'>
          <label>
            <input
              type='checkbox'
              checked={weekendsVis}
              onChange={handleWeekendsToggle}
            ></input>
            toggle weekends
          </label>
        </div>
        <div className='cal-app-sidebar-section'>
          <h2>All Events ({currentEvents.length})</h2>
          <ul>
            {currentEvents.map(renderSidebarEvent)}
          </ul>
        </div>
      </div>
    )
  }

  const handleWeekendsToggle = () => {
      setWeekendsVis(!weekendsVis)
  }

  const handleDateSelect = async (selectInfo: DateSelectArg) => {
    let title = prompt('Please enter a new title for your event')
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    try {
      const newID = await DataStore.save(
        new Reservation({
          description: title,
          start_date: selectInfo.startStr,
          end_date: selectInfo.endStr,
          owner: "Admin"
        })
      );
      if (newID) {
        calendarApi.addEvent({
          id: createEventId(),
          title: title!,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay
        })
      }
      console.log("Post saved successfully!");
    } catch (error) {
      console.log("Error saving post", error);
    }
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    //   clickInfo.event.remove()
    // }
  }

  const handleEvents = (events: EventInput[]) => {
    setCurEvents(events)
  }


function renderEventContent(eventContent: EventContentArg) {
  return (
    <>
      <b>{eventContent.timeText}</b>
      <i>{eventContent.event.title}</i>
    </>
  )
}

function renderSidebarEvent(event: EventInput) {
  return (
    <li key={event.id}>
      <b>{formatDate(event.start!, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
      <i>{event.title}</i>
    </li>
  )
}
    return (
      <div className='cal-app'>
        {renderSidebar()}
        <div className='cal-app-main'>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView='dayGridMonth'
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={weekendsVis}
            events={curEvents} // alternatively, use the `events` setting to fetch from a feed
            select={handleDateSelect}
            eventContent={renderEventContent} // custom render function
            eventClick={handleEventClick}
            //eventsSet={handleEvents} // called after events are initialized/added/changed/removed
            /* you can update a remote database when these fire:
            eventAdd={function(){}}
            eventChange={function(){}}
            eventRemove={function(){}}
            */
          />
        </div>
      </div>
    )
}

export default CalApp