import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;

export async function getRSVPs() {
  if (!supabase) return JSON.parse(localStorage.getItem('tisharsh-rsvps') || '[]');
  const { data } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function addRSVP(rsvp) {
  if (!supabase) {
    const list = JSON.parse(localStorage.getItem('tisharsh-rsvps') || '[]');
    const entry = { ...rsvp, id: Date.now(), created_at: new Date().toISOString() };
    list.unshift(entry);
    localStorage.setItem('tisharsh-rsvps', JSON.stringify(list));
    return entry;
  }
  const { data } = await supabase.from('rsvps').insert([rsvp]).select().single();
  return data;
}

export async function getWishes() {
  if (!supabase) return JSON.parse(localStorage.getItem('tisharsh-wishes') || '[]');
  const { data } = await supabase.from('wishes').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function addWish(wish) {
  if (!supabase) {
    const list = JSON.parse(localStorage.getItem('tisharsh-wishes') || '[]');
    const entry = { ...wish, id: Date.now(), created_at: new Date().toISOString() };
    list.unshift(entry);
    localStorage.setItem('tisharsh-wishes', JSON.stringify(list));
    return entry;
  }
  const { data } = await supabase.from('wishes').insert([wish]).select().single();
  return data;
}
