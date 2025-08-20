<template>
  <div class="cargo-management">
    <SideBar />
    <div class="main-content">
      <form @submit.prevent="submitCargo" class="cargo-form">
        <div class="form-section">
          <div class="form-grid">
            <div class="form-group">
              <label>Төрөл:</label>
              <div class="cargo-type-options">
                <input 
                  id="normal"
                  type="radio" 
                  v-model="cargoData.cargoType" 
                  value="NORMAL"
                  tabindex="1"
                  name="cargoType"
                />
                <label for="normal" class="radio-box">
                  <span class="radio-label">Энгийн</span>
                </label>
                <input
                  id="quick"
                  type="radio" 
                  v-model="cargoData.cargoType" 
                  value="QUICK"
                  tabindex="2"
                  name="cargoType"
                />
                <label for="quick" class="radio-box">
                  <span class="radio-label">Шуурхай</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Төлөх дүн:</label>
              <input 
                type="number"
                v-model="cargoData.price"
                placeholder="Төлөх дүн оруулах"
                @keydown.enter.prevent="$refs.trackingNumber.focus()"
                ref="cargoPrice"
              />
            </div>

            <div class="form-group">
              <label>Трак Код:</label>
              <input
                type="text"
                v-model="cargoData.trackingNumber"
                required
                placeholder="Трак код оруулах"
                @keydown.enter.prevent="submitCargo"
                ref="trackingNumber"
              />
            </div>
            
            <button 
              type="submit"
              class="btn-submit"
              :disabled="!cargoData.trackingNumber"
            >
              Бүртгэх
            </button>
          </div>
        </div>

        <div class="search-section">
          <div class="search-group">
            <label>Трак Код Хайх:</label>
            <div class="search-container">
              <input 
                v-model="searchTrackingNumber"
                placeholder="Трак код оруулах"
                @input="searchCargo"
              />
              <button @click="searchCargo" class="btn-search">Хайх</button>
              <button @click="clearSearch" class="btn-search">Цэвэрлэх</button>
            </div>
          </div>
        </div>
      </form>

      <div v-if="message" class="message">{{ message }}</div>

      <!-- Cargos Table -->
      <div class="cargos-table-container">
        <h2>Хэрэглэгчгүй каргонууд</h2>
        <table class="cargos-table">
          <thead>
            <tr>
              <th>Трак Код</th>
              <th>Төрөл</th>
              <th>Төлөв</th>
              <th>Үнэ</th>
              <th>Огноо</th>
              <th>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cargo in filteredCargos" :key="cargo.id">
              <td>{{ cargo.trackingNumber }}</td>
              <td>{{ cargo.cargoType === 'NORMAL' ? 'Энгийн' : 'Шуурхай' }}</td>
              <td>{{ formatStatus(cargo.currentStatus) }}</td>
              <td>{{ cargo.price ? `${numberWithCommas(cargo.price)} ₮` : '-' }}</td>
              <td>{{ formatDate(cargo.createdAt) }}</td>
              <td>
                <button @click="editCargo(cargo)" class="btn-edit">
                  Засах
                </button>
                <button @click="deleteCargo(cargo)" class="btn-delete">
                  Устгах
                </button>
                <button 
                  v-if="cargo.currentStatus === 'DELIVERED_TO_UB'"
                  @click="setDelivered(cargo)" 
                  class="btn-delivered"
                >
                  Хүлээлгэж өгөх
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const cargoData = ref({
  trackingNumber: '',
  cargoType: 'NORMAL',
  price: null
})

const message = ref('')
const cargos = ref([])
const searchTrackingNumber = ref('')
const filteredCargos = ref([])

// Load cargos on component mount
onMounted(async () => {
  await fetchCargos()
})

async function submitCargo() {
  if (!cargoData.value.trackingNumber.trim()) {
    alert('Tracking number is required')
    return
  }

  try {
    const response = await fetch('/api/cargo/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cargoData.value)
    })
    const data = await response.json()
    
    message.value = 'Cargo registered successfully!'
    clearForm()
    await fetchCargos()
  } catch (error) {
    console.error('Error registering cargo:', error)
    message.value = 'Error registering cargo: ' + error.message
  }
}

async function fetchCargos() {
  try {
    const response = await fetch('/api/cargo/list-unassigned')
    const data = await response.json()
    cargos.value = data.cargos
    filteredCargos.value = data.cargos
  } catch (error) {
    console.error('Error fetching cargos:', error)
    message.value = 'Error loading cargos: ' + error.message
  }
}

function editCargo(cargo) {
  cargoData.value = {
    trackingNumber: cargo.trackingNumber,
    cargoType: cargo.cargoType,
    price: cargo.price
  }
}

async function deleteCargo(cargo) {
  if (!confirm(`Are you sure you want to delete cargo "${cargo.trackingNumber}"?`)) {
    return
  }

  try {
    const response = await fetch('/api/cargo/delete-delivered-to-ub', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trackingNumber: cargo.trackingNumber
      })
    })

    // console.log('Delete response:', response)

    response.ok
      ? message.value = 'Cargo deleted successfully!'
      : message.value = 'Error deleting cargo: ' + response.statusText
    await fetchCargos()
  } catch (error) {
    console.error('Error deleting cargo:', error)
    message.value = 'Error deleting cargo: ' + error.message
  }
}

function clearForm() {
  cargoData.value = {
    trackingNumber: '',
    cargoType: 'NORMAL',
    price: null
  }
}

function formatStatus(status) {
  const statusMap = {
    'PRE_REGISTERED': 'Хэрэглэгч бүртгүүлсэн',
    'RECEIVED_AT_ERENHOT': 'Эрээнд ирсэн',
    'IN_TRANSIT': 'Замд яваа',
    'DELIVERED_TO_UB': 'УБ-д ирсэн',
    'DELIVERED': 'Хүлээлгэж өгсөн'
  }
  return statusMap[status] || status
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function searchCargo() {
  if (!searchTrackingNumber.value) {
    filteredCargos.value = cargos.value
    return
  }
  
  filteredCargos.value = cargos.value.filter(cargo => 
    cargo.trackingNumber.toLowerCase().includes(searchTrackingNumber.value.toLowerCase())
  )
}

function clearSearch() {
  searchTrackingNumber.value = ''
  filteredCargos.value = cargos.value
}

async function setDelivered(cargo) {
  if (!confirm(`Are you sure you want to set cargo "${cargo.trackingNumber}" as delivered?`)) {
    return
  }

  try {
    await $fetch('/api/cargo/set-delivered-without-user', {
      method: 'POST',
      body: {
        trackingNumber: cargo.trackingNumber
      }
    })
    await fetchCargos()
    message.value = 'Cargo marked as delivered successfully!'
  } catch (error) {
    console.error('Error setting cargo as delivered:', error)
    message.value = 'Error setting cargo as delivered: ' + error.message
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #1a73e8;
$secondary-color: #4285f4;
$background-color: #f8f9fa;
$border-color: #e0e0e0;
$text-color: #202124;
$sidebar-width: 280px;

// Mixins
@mixin button-base {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cargo-management {
  display: flex;

  .main-content {
    margin-left: $sidebar-width;
    width: calc(100% - #{$sidebar-width});
    background-color: $background-color;
  }
}

.form-grid {
  padding: 12px 1.5rem;
  display: flex;
  background-color: #F6F6F6;
  border-bottom: 1px dashed #DBE0E0;
  align-items: center;
  gap: 1.5rem;
  .form-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.cargo-type-options {
  display: flex;
  
  input[type="radio"] {
    display: none;
    &:checked + .radio-box {
      color: #fff;
      background-color: $primary-color;
    }
  }

  .radio-box {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    width: 7.5rem;
    height: 2.5rem;
    background-color: #fff;

    .radio-label {
      display: block;
      text-align: center;
      font-weight: 500;
    }
  }
}

input {
  max-width: 15rem;
  height: 2.5rem;
  border-radius: 8px;
  border: 1px solid $border-color;
  color: $text-color;
  padding: 8px;
  background-color: #ffffff;
}

.btn-submit {
  @include button-base;
  background-color: $secondary-color;
  color: white;

  &:disabled {
    background-color: $border-color;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    filter: brightness(0.9);
  }
}

.message {
  margin: 1rem 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: white;
  color: $text-color;
}

.cargos-table-container {
  background-color: white;
  border-radius: 8px;
  margin: 1rem 1.5rem;
  padding: 1rem;

  h2 {
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .cargos-table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px dashed $border-color;
    }

    th {
      font-weight: 500;
      color: $text-color;
      background-color: rgba($primary-color, 0.05);
    }
  }
}

.search-section {
  padding: 12px 1.5rem;
  display: flex;
  background-color: #F6F6F6;
  border-bottom: 1px dashed #DBE0E0;
  align-items: center;
  gap: 1.5rem;
  
  .search-group {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .search-container {
      display: flex;
      gap: 1rem;
    }
  }
}

.btn-edit, .btn-delete, .btn-delivered, .btn-search {
  @include button-base;
  margin-right: 8px;
}

.btn-edit {
  background-color: transparent;
  color: $primary-color;

  &:hover {
    background-color: rgba($primary-color, 0.1);
  }
}

.btn-delete {
  background-color: transparent;
  color: #dc3545;

  &:hover {
    background-color: rgba(#dc3545, 0.1);
  }
}

.btn-delivered {
  @include button-base;
  background-color: #34A853;
  color: white;
  margin-right: 8px;

  &:hover {
    filter: brightness(0.9);
  }
}

.btn-search {
  @include button-base;
  background-color: $primary-color;
  color: white;

  &:hover {
    filter: brightness(0.9);
  }
}
</style>