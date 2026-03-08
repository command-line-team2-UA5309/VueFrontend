<template>
  <div class="map-container">
    <div v-if="draftLocation" class="sighting-form">
      <h3>Create New Sighting</h3>
      <p>Coordinates: {{ draftLocation.lat.toFixed(6) }}, {{ draftLocation.lng.toFixed(6) }}</p>
      
      <form @submit.prevent="submitSighting">
        <input v-model="form.title" type="text" placeholder="Title" required />
        <input v-model="form.type" type="text" placeholder="Type" required />
        <textarea v-model="form.description" placeholder="Description"></textarea>
        <input type="file" @change="handleFileUpload" accept="image/*" />

        <button type="submit">Save Sighting</button>
        <button type="button" @click="cancelDraft">Cancel</button>
      </form>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>
    <div class="map-wrapper">
      <l-map 
        ref="map" 
        v-model:zoom="zoom" 
        :center="center" 
        :use-global-leaflet="false"
        @click="handleMapClick"
      >
        <l-tile-layer
          url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
          layer-type="base"
          name="Stamen Terrain"
          :max-zoom="20"
          attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        ></l-tile-layer>

        <l-marker 
          v-for="sighting in sightings" 
          :key="sighting.id" 
          :lat-lng="[sighting.latitude, sighting.longitude]"
        >
          <l-popup>
            <b>{{ sighting.title }}</b><br>
            Type: {{ sighting.type }}<br>
            Confirmations: {{ sighting.confirmations_count }}<br>
            
            <div v-if="sighting.photo" class="popup-photo-container">
              <img :src="sighting.photo" class="popup-photo" />
            </div>

            <button @click="confirmSighting(sighting.id)" class="confirm-btn">
              Confirm Sighting
            </button>
          </l-popup>
        </l-marker>

        <l-marker 
          v-if="draftLocation" 
          :lat-lng="draftLocation"
        ></l-marker>
      </l-map>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet"
import { mapApi } from '@/services/api' 
import { useAuthStore } from '@/stores/auth'


const authStore = useAuthStore()

const zoom = ref(10)
const center = ref([50.4454601,30.5236796]) // Kyiv coordinates
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
  if (authStore.role === 'regular') {
    return 
  }
  // event.latlng contains the {lat, lng} object from Leaflet
  draftLocation.value = event.latlng
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.photo = file
  }
}

const submitSighting = async () => {
  errorMsg.value = ''
  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('type', form.value.type)
    formData.append('description', form.value.description)
    formData.append('latitude', draftLocation.value.lat)
    formData.append('longitude', draftLocation.value.lng)
    
    if (form.value.photo) {
      formData.append('photo', form.value.photo)
    }

    await mapApi.post('sighting/', formData) 

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

const confirmSighting = async (id) => {
  try {
    await mapApi.post(`sighting/${id}/confirm/`)
    alert("Sighting confirmed successfully!")
    await fetchSightings() 
  } catch (error) {
    alert(error.response?.data?.detail || "Failed to confirm sighting.")
  }
}

</script>

<style scoped>
.map-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.map-container > div:first-child {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border: 4px solid white;
}

.map-wrapper {
  height: 500px; 
  width: 100%; 
  border-radius: 8px; 
  overflow: hidden;
}

.sighting-form {
  padding: 25px;
  border: none;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.sighting-form h3 {
  margin-top: 0;
  color: #2e7d32;
  border-bottom: 2px solid #c8e6c9;
  padding-bottom: 10px;
}

.sighting-form p {
  color: #555;
  font-size: 0.9rem;
}

.sighting-form input, .sighting-form textarea {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 12px;
  box-sizing: border-box;
  font-family: inherit; 
  font-size: 1rem;
  border: 1px solid #a5d6a7;
  border-radius: 6px;
  background-color: #fcfcfc;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.sighting-form input:focus, .sighting-form textarea:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.sighting-form button {
  background-color: #2e7d32;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-right: 10px;
  transition: opacity 0.2s;
}

.sighting-form button[type="button"] {
  background-color: #757575;
}

.sighting-form button:hover {
  opacity: 0.85;
}

.error {
  color: #d32f2f;
  margin-top: 10px;
  font-weight: bold;
}

.popup-photo-container {
  margin-top: 10px;
  margin-bottom: 10px;
}

.popup-photo {
  max-width: 150px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.confirm-btn {
  margin-top: 5px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.confirm-btn:hover {
  background-color: #388e3c;
}
</style>