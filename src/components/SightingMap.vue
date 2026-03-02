<template>
  <div class="map-container">
    <div style="height: 500px; width: 100%; border-radius: 8px; overflow: hidden;">
      <l-map 
        ref="map" 
        v-model:zoom="zoom" 
        :center="center" 
        :use-global-leaflet="false"
        @click="handleMapClick"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          attribution="&copy; OpenStreetMap contributors"
        ></l-tile-layer>

        <l-marker 
          v-for="sighting in sightings" 
          :key="sighting.id" 
          :lat-lng="[sighting.latitude, sighting.longitude]"
        >
          <l-popup>
            <b>{{ sighting.title }}</b><br>
            Type: {{ sighting.type }}<br>
            Confirmations: {{ sighting.confirmations_count }}
          </l-popup>
        </l-marker>

        <l-marker 
          v-if="draftLocation" 
          :lat-lng="draftLocation"
        ></l-marker>
      </l-map>
    </div>

    <div v-if="draftLocation" class="sighting-form">
      <h3>Create New Sighting</h3>
      <p>Coordinates: {{ draftLocation.lat.toFixed(4) }}, {{ draftLocation.lng.toFixed(4) }}</p>
      
      <form @submit.prevent="submitSighting">
        <input v-model="form.title" type="text" placeholder="Title (e.g. Bigfoot)" required />
        <input v-model="form.type" type="text" placeholder="Type (e.g. Cryptid)" required />
        <textarea v-model="form.description" placeholder="Description"></textarea>
        
        <button type="submit">Save Sighting</button>
        <button type="button" @click="cancelDraft">Cancel</button>
      </form>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet"
import { mapApi } from '@/services/api' 

const zoom = ref(6)
const center = ref([50.4014305,30.2023616])
const sightings = ref([])
const draftLocation = ref(null)

const form = ref({ title: '', type: '', description: '' })
const errorMsg = ref('')

onMounted(async () => {
  await fetchSightings()
})

const fetchSightings = async () => {
  try {
    const response = await mapApi.get('sighting/') 
    sightings.value = response.data
  } catch (error) {
    console.error("Failed to fetch sightings", error)
  }
}

const handleMapClick = (event) => {
  // event.latlng contains the {lat, lng} object from Leaflet
  draftLocation.value = event.latlng
}

const submitSighting = async () => {
  errorMsg.value = ''
  try {
    const payload = {
      title: form.value.title,
      type: form.value.type,
      description: form.value.description,
      latitude: draftLocation.value.lat,
      longitude: draftLocation.value.lng,
    }

    await mapApi.post('sighting/', payload) 

    cancelDraft()
    await fetchSightings()
  } catch (error) {
    errorMsg.value = error.response?.data?.detail || "Failed to create sighting. Check permissions."
  }
}

const cancelDraft = () => {
  draftLocation.value = null
  form.value = { title: '', type: '', description: '' }
}
</script>

<style scoped>
.map-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}
.sighting-form {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
.sighting-form input, .sighting-form textarea {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>