<template>
  <div class="cargo-management">
    <SideBar />
    <div class="main-content">
      <div class="search-section">
        <div class="search-group">
          <label>Трак Код:</label>
          <div class="search-container">
            <input 
              v-model="trackingNumber"
              placeholder="Трак код оруулах"
              @keydown.enter="searchCargo"
              autofocus
            />
            <button @click="searchCargo" class="btn-search">Хайх</button>
            <button @click="clearSearch" class="btn-search">Цэвэрлэх</button>
          </div>
        </div>
      </div>

      <div v-if="cargoData" class="cargos-table-container">
        <h2 class="user-name" v-if="cargoData.user">
          {{ cargoData.user.name }} - {{ cargoData.user.phoneNumber }}
        </h2>
        <table class="cargos-table">
          <thead>
            <tr>
              <th>Трак Код</th>
              <th>Нэр</th>
              <th>Төрөл</th>
              <th>Төлөв</th>
              <th>Үнэ</th>
              <th>Төлбөрийн төлөв</th>
              <th>Хүргэсэн салбар</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ cargoData.trackingNumber }}</td>
              <td>{{ cargoData.nickname || '-' }}</td>
              <td>{{ cargoData.cargoType === 'NORMAL' ? 'Энгийн' : 'Шуурхай' }}</td>
              <td>{{ formatStatus(cargoData.currentStatus) }}</td>
              <td>
                <div v-if="editingPrice" class="price-edit">
                  <input 
                    type="number" 
                    v-model="tempPrice" 
                    @keyup.enter="updatePrice"
                  />
                  <button @click="updatePrice" class="btn-save">💾</button>
                  <button @click="cancelEdit" class="btn-cancel">✖</button>
                </div>
                <div v-else @click="startEdit" class="price-display">
                  {{ cargoData.price ? `${numberWithCommas(cargoData.price)} ₮` : '-' }}
                </div>
              </td>
              <td>{{ formatPaymentStatus(cargoData.paymentStatus) }}</td>
              <td>{{ cargoData.destinationLocation?.name || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <h3 class="section-title">Төлөвийн түүх</h3>
        <table class="cargos-table">
          <thead>
            <tr>
              <th>Төлөв</th>
              <th>Огноо</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargoData.preRegisteredDate">
              <td>Хэрэглэгч бүртгүүлсэн</td>
              <td>{{ formatDate(cargoData.preRegisteredDate) }}</td>
            </tr>
            <tr v-if="cargoData.receivedAtErenhotDate">
              <td>Эрээнд ирсэн</td>
              <td>{{ formatDate(cargoData.receivedAtErenhotDate) }}</td>
            </tr>
            <tr v-if="cargoData.inTransitDate">
              <td>Замд яваа</td>
              <td>{{ formatDate(cargoData.inTransitDate) }}</td>
            </tr>
            <tr v-if="cargoData.deliveredToUBDate">
              <td>УБ-д ирсэн</td>
              <td>{{ formatDate(cargoData.deliveredToUBDate) }}</td>
            </tr>
            <tr v-if="cargoData.deliveredDate">
              <td>Хүлээлгэж өгсөн</td>
              <td>{{ formatDate(cargoData.deliveredDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const trackingNumber = ref('')
const cargoData = ref(null)
const editingPrice = ref(false)
const tempPrice = ref(null)

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

function formatPaymentStatus(status) {
  const statusMap = {
    'PENDING': 'Төлөөгүй',
    'PARTIALLY_PAID': 'Хэсэгчлэн төлсөн',
    'PAID': 'Төлсөн'
  }
  return statusMap[status] || status
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

async function searchCargo() {
  if (!trackingNumber.value.trim()) return

  try {
    const response = await fetch('/api/cargo/search-by-track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        trackingNumber: trackingNumber.value.trim() 
      })
    })
    const data = await response.json()
    cargoData.value = data
  } catch (error) {
    console.error('Error searching cargo:', error)
    alert('Error searching cargo')
  }
}

function clearSearch() {
  trackingNumber.value = ''
  cargoData.value = null
}

function startEdit() {
  editingPrice.value = true
  tempPrice.value = cargoData.value.price
}

function cancelEdit() {
  editingPrice.value = false
  tempPrice.value = null
}

async function updatePrice() {
  try {
    const response = await $fetch('/api/cargo/update-price', {
      method: 'POST',
      body: {
        trackingNumber: cargoData.value.trackingNumber,
        price: tempPrice.value
      }
    })
    
    cargoData.value.price = tempPrice.value
    editingPrice.value = false
    tempPrice.value = null
  } catch (error) {
    console.error('Error updating price:', error)
    alert('Үнийг шинэчлэхэд алдаа гарлаа!')
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #1a73e8;
$secondary-color: #4285f4;
$background-color: #f8f9fa;
$border-color: #e0e0e0;
$text-color: #202124;
$danger-color: #dc3545;
$sidebar-width: 280px;

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

.search-section {
  padding: 12px 1.5rem;
  display: flex;
  background-color: #F6F6F6;
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

input {
  max-width: 15rem;
  height: 2.5rem;
  border-radius: 8px;
  border: 1px solid $border-color;
  color: $text-color;
  padding: 8px;
  background-color: #ffffff;
}

.cargos-table-container {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;

  .user-name {
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .section-title {
    margin: 1.5rem 0 1rem;
    font-weight: 500;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;

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

    // Add fixed widths for main table cells
    &:first-of-type {
      th:nth-child(1), td:nth-child(1) { width: 15%; } // Трак Код
      th:nth-child(2), td:nth-child(2) { width: 15%; } // Нэр
      th:nth-child(3), td:nth-child(3) { width: 10%; } // Төрөл
      th:nth-child(4), td:nth-child(4) { width: 15%; } // Төлөв
      th:nth-child(5), td:nth-child(5) { width: 15%; } // Үнэ
      th:nth-child(6), td:nth-child(6) { width: 15%; } // Төлбөрийн төлөв
      th:nth-child(7), td:nth-child(7) { width: 15%; } // Хүргэсэн салбар
    }

    // Add fixed widths for status history table
    &:last-of-type {
      th:nth-child(1), td:nth-child(1) { width: 40%; } // Төлөв
      th:nth-child(2), td:nth-child(2) { width: 60%; } // Огноо
    }
  }
}

.btn-search {
  @include button-base;
  background-color: $primary-color;
  color: white;

  &:hover {
    filter: brightness(0.9)
  }
}

.price-edit {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  input {
    max-width: 8rem;
    height: 2rem;
    border-radius: 8px;
    border: 1px solid $border-color;
    color: $text-color;
    padding: 4px 8px;
    background-color: #ffffff;
  }

  .btn-save, .btn-cancel {
    @include button-base;
    padding: 4px 8px;
    background-color: transparent;
    
    &:hover {
      background-color: rgba($primary-color, 0.1);
    }
  }

  .btn-save {
    color: $secondary-color;
  }

  .btn-cancel {
    color: $danger-color;
  }
}

.price-display {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background-color: rgba($primary-color, 0.1);
  }
}
</style>
