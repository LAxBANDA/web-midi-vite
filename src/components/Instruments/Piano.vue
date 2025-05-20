<template>
  <div class="piano" ref="piano"></div>
</template>

<script setup lang="ts">
import { Synth, start } from 'tone'

import '@/assets/piano.css'
import { onMounted, useTemplateRef, watch } from 'vue'
import { useMidiStore } from '@/stores/midi'
import type { Track } from '@tonejs/midi'
// Definición de las notas MIDI a las teclas del piano
const pianoKeys = [
  'C0',
  'C#0',
  'D0',
  'D#0',
  'E0',
  'F0',
  'F#0',
  'G0',
  'G#0',
  'A0',
  'A#0',
  'B0',
  'C1',
  'C#1',
  'D1',
  'D#1',
  'E1',
  'F1',
  'F#1',
  'G1',
  'G#1',
  'A1',
  'A#1',
  'B1',
  'C2',
  'C#2',
  'D2',
  'D#2',
  'E2',
  'F2',
  'F#2',
  'G2',
  'G#2',
  'A2',
  'A#2',
  'B2',
  'C3',
  'C#3',
  'D3',
  'D#3',
  'E3',
  'F3',
  'F#3',
  'G3',
  'G#3',
  'A3',
  'A#3',
  'B3',
  'C4',
  'C#4',
  'D4',
  'D#4',
  'E4',
  'F4',
  'F#4',
  'G4',
  'G#4',
  'A4',
  'A#4',
  'B4',
  'C5',
  'C#5',
  'D5',
  'D#5',
  'E5',
  'F5',
  'F#5',
  'G5',
  'G#5',
  'A5',
  'A#5',
  'B5',
  'C6',
  'C#6',
  'D6',
  'D#6',
  'E6',
  'F6',
  'F#6',
  'G6',
  'G#6',
  'A6',
  'A#6',
  'B6',
  'C7',
  'C#7',
  'D7',
  'D#7',
  'E7',
  'F7',
  'F#7',
  'G7',
  'G#7',
  'A7',
  'A#7',
  'B7',
  'C8',
]

// Datos MIDI de la canción (simplificados para el ejemplo)

// Crear el sintetizador de Tone.js
const synth = new Synth().toDestination()

onMounted(async () => {
  await createPiano()
})
const piano = useTemplateRef('piano')

// Crear el piano en la interfaz
async function createPiano() {
  const pianoContainer = piano.value;
  console.log({ pianoContainer })
  if (!pianoContainer) return

  for (let i = 0; i < pianoKeys.length; i++) {
    const key = document.createElement('div')
    key.classList.add('key')
    const note = pianoKeys[i]
    key.dataset.note = note
    key.addEventListener('mousedown', () => {
      console.log('Botón presionado')
      synth.triggerAttack(note)
    })

    key.addEventListener('mouseup', () => {
      console.log('Botón levantado')
      synth.triggerRelease()
    })

    key.setAttribute('tabindex', '0')

    // Crear teclas negras
    if (i % 12 === 1 || i % 12 === 3 || i % 12 === 6 || i % 12 === 8 || i % 12 === 10) {
      const blackKey = document.createElement('div')
      blackKey.classList.add('black-key')
      key.appendChild(blackKey)
      blackKey.setAttribute('tabindex', '0')
    }

    pianoContainer.appendChild(key)
  }
  await start() // Inicia el motor de audio
}


const midiStore = useMidiStore();

midiStore.$onAction(
  ({
    name, // name of the action
    store, // store instance, same as `someStore`
    args, // array of parameters passed to the action
    after, // hook after the action returns or resolves
    onError, // hook if the action throws or rejects
  }) => {
    // a shared variable for this specific action call
    const startTime = Date.now()
    // this will trigger before an action on `store` is executed
    console.log(`Start "${name}" with params [${args.join(', ')}].`)

    // this will trigger if the action succeeds and after it has fully run.
    // it waits for any returned promised
    after((result) => {
      if (name === "playTrack") {
        console.log({ result })
        const notes = (result as Track).notes;
        notes.forEach((note) => {
          setTimeout(() => {
            playNote(note.midi, note.duration)
          }, note.time * 1000)
        })
      }



      console.log(
        `Finished "${name}" after ${Date.now() - startTime
        }ms.\nResult: ${result}.`
      )
    })

    // this will trigger if the action throws or returns a promise that rejects
    onError((error) => {
      console.warn(
        `Failed "${name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
      )
    })
  }
)

// Función para reproducir sonido y activar las teclas visualmente
function playNote(midiNote: number, duration: number) {
  const key = document.querySelector(`[data-note="${pianoKeys[midiNote - 21]}"]`)
  if (key) {
    // Activar visualmente la tecla
    key.classList.add('active')
    setTimeout(() => {
      key.classList.remove('active')
    }, duration * 1000)

    // Reproducir el sonido
    const noteName = pianoKeys[midiNote - 21]
    synth.triggerAttackRelease(noteName, duration)
  }
}
</script>
