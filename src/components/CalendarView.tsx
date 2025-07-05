import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';

const CalendarView: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '2em auto', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '2em' }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        locale={jaLocale}
        buttonText={{ today: '今日' }}
        titleFormat={{ year: 'numeric', month: 'long' }}
      />
    </div>
  );
};

export default CalendarView;
