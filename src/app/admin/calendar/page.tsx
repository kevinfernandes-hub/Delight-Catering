'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';

type OrderEvent = {
  id: string;
  event_date: string;
  event_type: string;
  guest_count: number;
  venue: string;
  status: string;
  customer?: {
    name: string;
    phone?: string;
  };
};

const ACTIVE_STATUSES = ['Confirmed', 'In-Progress'];

function formatDateLabel(dateValue: string) {
  const date = new Date(dateValue);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load orders');
        const orders = await res.json();

        const filtered = (orders as OrderEvent[])
          .filter((order) => ACTIVE_STATUSES.includes(order.status))
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

        setEvents(filtered);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, OrderEvent[]>();
    for (const event of events) {
      const dayKey = new Date(event.event_date).toISOString().split('T')[0];
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(event);
    }
    return Array.from(map.entries());
  }, [events]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, color: '#fff', fontSize: '2rem' }}>Event Calendar</h1>
        <p style={{ color: '#A3A3A3', marginTop: '0.4rem' }}>
          Confirmed and in-progress catering events.
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#C9A84C' }}>Loading calendar...</div>
      ) : grouped.length === 0 ? (
        <div style={{ border: '1px dashed #333', borderRadius: '0.6rem', padding: '2rem', color: '#999' }}>
          No confirmed events yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {grouped.map(([day, dayEvents]) => (
            <div key={day} style={{ border: '1px solid #333', borderRadius: '0.6rem', backgroundColor: '#111', overflow: 'hidden' }}>
              <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CalendarDays size={18} color="#C9A84C" />
                <strong style={{ color: '#F5F0E8' }}>{formatDateLabel(day)}</strong>
                <span style={{ marginLeft: 'auto', color: '#999', fontSize: '0.85rem' }}>{dayEvents.length} event(s)</span>
              </div>

              <div style={{ padding: '0.8rem 1rem' }}>
                {dayEvents.map((event) => (
                  <div key={event.id} style={{ padding: '0.8rem', border: '1px solid #242424', borderRadius: '0.45rem', marginBottom: '0.7rem', backgroundColor: '#0d0d0d' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>{event.event_type}</div>
                        <div style={{ color: '#bbb', fontSize: '0.9rem' }}>{event.customer?.name || 'Customer'}</div>
                      </div>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', backgroundColor: event.status === 'Confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: event.status === 'Confirmed' ? '#10b981' : '#f59e0b', fontSize: '0.78rem', fontWeight: 600 }}>
                        {event.status}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.7rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#9ca3af', fontSize: '0.85rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={14} /> {event.guest_count} guests
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} /> {event.venue || 'Venue TBD'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
