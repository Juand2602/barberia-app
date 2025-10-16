import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Cita, EventoCita } from '@/types/cita.types';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunes
  getDay,
  locales,
});

interface CitasCalendarProps {
  citas: Cita[];
  onSelectEvento: (cita: Cita) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  view?: View;
  onViewChange?: (view: View) => void;
  date?: Date;
  onNavigate?: (date: Date) => void;
}

export const CitasCalendar: React.FC<CitasCalendarProps> = ({
  citas,
  onSelectEvento,
  onSelectSlot,
  view = 'week',
  onViewChange,
  date = new Date(),
  onNavigate,
}) => {
  const eventos: EventoCita[] = useMemo(() => {
    return citas.map((cita) => {
      const start = new Date(cita.fechaHora);
      const end = new Date(start.getTime() + cita.duracionMinutos * 60000);

      return {
        id: cita.id,
        title: `${cita.cliente.nombre} - ${cita.servicioNombre}`,
        start,
        end,
        resource: cita,
      };
    });
  }, [citas]);

 const eventStyleGetter = (event: EventoCita) => {
    const cita = event.resource;
    let backgroundColor = '#eab308'; // yellow-600 (PENDIENTE)
    let borderColor = '#ca8a04'; // yellow-700

    switch (cita.estado) {
      case 'CONFIRMADA':
        backgroundColor = '#10b981'; // green-600
        borderColor = '#059669'; // green-700
        break;
      case 'COMPLETADA':
        backgroundColor = '#6b7280'; // gray-600
        borderColor = '#4b5563'; // gray-700
        break;
      case 'CANCELADA':
        backgroundColor = '#ef4444'; // red-600
        borderColor = '#dc2626'; // red-700
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.95,
        color: 'white',
        border: `2px solid ${borderColor}`,
        display: 'block',
        fontSize: '13px',
        padding: '4px 6px',
        fontWeight: '500',
      },
    };
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Cita',
    noEventsInRange: 'No hay citas en este rango',
    showMore: (total: number) => `+ Ver más (${total})`,
  };

  return (
    <div style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={(event) => onSelectEvento(event.resource)}
        onSelectSlot={onSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        messages={messages}
        culture="es"
        view={view}
        onView={onViewChange}
        date={date}
        onNavigate={onNavigate}
        min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
        max={new Date(0, 0, 0, 20, 0, 0)} // 8:00 PM
        step={15} // Intervalos de 15 minutos
        timeslots={4} // 4 slots por hora (15 min cada uno)
      />
    </div>
  );
};