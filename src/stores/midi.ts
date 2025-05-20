import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Midi } from '@tonejs/midi'
import type { Note } from '@tonejs/midi/dist/Note'

export const useMidiStore = defineStore('midi', () => {
  const midis = ref(new Map<string, Midi>())
  // const doublemidi = computed(() => midi.value * 2)

  function add(filename: string, payload: Midi) {
    midis.value.set(filename, payload)
  }

  function remove(filename: string) {
    midis.value.delete(filename)
  }

  function exist(filename: string) {
    return midis.value.has(filename)
  }

  function hasTracks(filename: string) {
    return midis.value.get(filename)?.tracks.length
  }

  function get(filename: string) {
    return midis.value.get(filename)
  }

  function playNote(filename: string, track: number, note: Note) {}

  function playTrack(filename: string, track: number) {
    const midi = get(filename)
    if (midi) {
      return midi.tracks[track]
    }

    return null
  }

  return { midis, add, remove, exist, hasTracks, get, playTrack, playNote }
})
