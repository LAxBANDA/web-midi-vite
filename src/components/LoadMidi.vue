<template>
  <div class="load-midi">
    <h2>Sube tu archivo MIDI</h2>
    <form @submit.prevent="!!displaySvg" method="POST" enctype="multipart/form-data">
      <label for="midiFile">Selecciona un archivo MIDI:</label><br /><br />
      <div class="mb-3">
        <input type="file" id="midiFile" name="midiFile" accept=".midi,.mid" required @change="handleFileChange" />
        <label for="midiFile" class="btn btn-primary">
          <i class="mdi mdi-file"></i>
          Buscar archivos
        </label>
        <div v-if="fileName">
          <p>Archivo seleccionado: {{ fileName }}</p>
        </div>

        <div v-if="statusMessage" class="mt-3">
          <p :class="statusClass">{{ statusMessage }}</p>
        </div>
      </div>
    </form>
    <button class="btn btn-primary d-flex align-items-center mb-3" type="submit"
      @click="midiStore.playTrack(fileName, 0)" :disabled="!midiStore.hasTracks(fileName)">
      <i class="mdi mdi-play me-2"></i>
      Iniciar demostración
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileName = ref('')
const displaySvg = ref('')
const statusMessage = ref('')
const statusClass = ref('')

// const playMidi = () => {
//   if (midiData.tracks.length === 0) {
//     return
//   }

//   midiData.tracks[0].notes.forEach(note => {
//     setTimeout(() => {
//       playNote(note.midi, note.duration);
//     }, note.time * 1000);
//   });
// }

import { useMidiStore } from '@/stores/midi'
import type { Midi } from '@tonejs/midi'

const midiStore = useMidiStore()

const changeMidi = (midi: Midi) => {
  statusMessage.value = `Archivo cargado: ${midi.header.name || ''} con ${midi.tracks.length} pista${midi.tracks.length > 1 ? 's' : ''} y ${midi.tracks[0].notes.length} notas`
  statusClass.value = 'text-success'
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement & EventTarget
  const file = target.files?.item(0)

  if (!file) {
    return;
  }

  fileName.value = file.name

  const midi = midiStore.get(fileName.value);

  if (midi) {
    changeMidi(midi)
    return;
  }

  // Crear un objeto FormData
  const formData = new FormData()
  formData.append('file', file)

  try {
    // Realizar la llamada al endpoint `/upload-midi`
    statusMessage.value = 'Subiendo archivo...'
    statusClass.value = 'text-info'

    const response = await fetch('http://localhost:8080/upload-midi', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      const result = await response.json() as Midi;
      midiStore.add(file.name, result)
      changeMidi(result)
    } else {
      const error = await response.text()
      statusMessage.value = `Error al subir el archivo: ${error}`
      statusClass.value = 'text-danger'
    }
  } catch (error: any) {
    statusMessage.value = `Error en la conexión: ${error.message}`
    statusClass.value = 'text-danger'
  }
}
</script>

<style scoped></style>
