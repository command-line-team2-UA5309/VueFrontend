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

    <div v-if="draftLocation" class="sighting-form">
      <h3>Create New Sighting</h3>
      <p>Coordinates: {{ draftLocation.lat.toFixed(4) }}, {{ draftLocation.lng.toFixed(4) }}</p>
      
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet"
import { mapApi } from '@/services/api' 
import { useAuthStore } from '@/stores/auth'


const authStore = useAuthStore()

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
  margin-top: 20px;
}
.map-wrapper {
  height: 500px; 
  width: 100%; 
  border-radius: 8px; 
  overflow: hidden;
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

.popup-photo-container {
  margin-top: 10px;
  margin-bottom: 10px;
}

.popup-photo {
  max-width: 150px;
  border-radius: 4px;
}

.confirm-btn {
  margin-top: 5px;
}
</style>