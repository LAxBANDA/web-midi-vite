<template>
  <div class="acordeon">
    <div ref="acordeonSvgContainer" v-html="acordeonSvgContent" id="my-svg-instrument"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import acordeonSvgContent from '@/assets/acordeon-propuesta-mejorada.svg?raw';
import { Synth, start } from 'tone'
import { useMidiStore } from '@/stores/midi'
import type { Track } from '@tonejs/midi'

const synth = new Synth().toDestination()


const acordeonSvgContainer = ref<HTMLDivElement | null>(null);

onMounted(() => {
  console.log(acordeonSvgContainer.value)
  if (acordeonSvgContainer.value) {
    const rows = document.querySelectorAll(".acordeon-fila");
    if (rows) {
      rows.forEach(row => {
        for (let i = 0; i < row.children.length - 1; i++) {
          const button = row.children.item(i);
          if (button) {
            const [soplada, aspirada] = button.id.split("-");
            console.log({soplada, aspirada})
          }
        }
      })
    }
  }
});

// Crear el piano en la interfaz
async function createPiano() {

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
  // const key = document.querySelector(`[data-note="${pianoKeys[midiNote - 21]}"]`)
  // if (key) {
  //   // Activar visualmente la tecla
  //   key.classList.add('active')
  //   setTimeout(() => {
  //     key.classList.remove('active')
  //   }, duration * 1000)

  //   // Reproducir el sonido
  //   const noteName = pianoKeys[midiNote - 21]
  //   synth.triggerAttackRelease(noteName, duration)
  // }
}
</script>


<style scoped>
.acordeon {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
