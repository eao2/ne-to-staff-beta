<template>
  <div class="cargo-management">
    <SideBar />
    <div class="main-content">
      <div class="filter-section">
        <div class="filters">
          <div class="form-group">
            <label>Төлөв:</label>
            <select v-model="selectedStatus" @change="fetchCargos">
              <option value="DELIVERED_TO_UB">УБ-д ирсэн</option>
              <!-- <option value="PRE_REGISTERED">Хэрэглэгч бүртгүүлсэн</option>
              <option value="RECEIVED_AT_ERENHOT">Эрээнд ирсэн</option>
              <option value="IN_TRANSIT">Замд яваа</option> -->
              <option value="DELIVERED">Хүлээлгэж өгсөн</option>
            </select>
          </div>
          <div class="form-group">
            <label>Эхлэх огноо:</label>
            <input type="date" v-model="startDate" @change="fetchCargos" />
          </div>
          <div class="form-group">
            <label>Дуусах огноо:</label>
            <input type="date" v-model="endDate" @change="fetchCargos" />
          </div>
        </div>
      </div>

      <div class="summary-section">
        <div class="total-summary">
          <h2>Нийт дүн: {{ numberWithCommas(totalFilteredPrice) }}₮</h2>
          <span class="status-label">
            {{ formatStatus(selectedStatus) }}
          </span>
        </div>
      </div>

      <div class="tables-grid">
        <div v-for="userData in filteredUserCargos" :key="userData.user.phoneNumber" class="user-section">
          <div class="user-header">
            <h3>{{ userData.user.name }} - {{ userData.user.phoneNumber }}</h3>
            <div class="user-actions">
              <h4>Нийт дүн: {{ numberWithCommas(userData.totalPrice) }}₮</h4>
              <button @click="goToDeliveredToUB(userData.user.phoneNumber)" class="btn-add">
                + Ачаа нэмэх
              </button>
            </div>
          </div>

          <table class="cargos-table">
            <thead>
              <tr>
                <th>Трак код</th>
                <th>Нэр</th>
                <th>Төрөл</th>
                <th>Үнэ</th>
                <th>Огноо</th>
                <th>Төлөв</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cargo in userData.cargos" :key="cargo.trackingNumber">
                <td>{{ cargo.trackingNumber }}</td>
                <td>{{ cargo.nickname || '-' }}</td>
                <td>{{ cargo.cargoType === 'NORMAL' ? 'Энгийн' : 'Шуурхай' }}</td>
                <td>
                  <div v-if="editingPrice === cargo.trackingNumber" class="price-edit">
                    <input 
                      type="number" 
                      v-model="tempPrice" 
                      @keyup.enter="updatePrice(cargo)"
                    />
                    <button @click="updatePrice(cargo)" class="btn-save">💾</button>
                    <button @click="cancelEdit" class="btn-cancel">✖</button>
                  </div>
                  <div v-else @click="startEdit(cargo)" class="price-display">
                    {{ cargo.price ? `${numberWithCommas(cargo.price)}₮` : '-' }}
                  </div>
                </td>
                <td>{{ formatDate(getStatusDate(cargo)) }}</td>
                <td>{{ formatStatus(cargo.currentStatus) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userCargos = ref([])
const startDate = ref('')
const endDate = ref('')
const selectedStatus = ref('DELIVERED_TO_UB')
const editingPrice = ref(null)
const tempPrice = ref(null)

// Initialize with yesterday's date and today
onMounted(() => {
  const now = new Date()
  endDate.value = now.toISOString().split('T')[0]
  
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  startDate.value = yesterday.toISOString().split('T')[0]
  
  fetchCargos()
})

async function fetchCargos() {
  try {
    userCargos.value = await $fetch('/api/cargo/all-user-cargos', {
      method: 'POST',
      body: {
        startDate: startDate.value,
        endDate: endDate.value,
        status: selectedStatus.value
      }
    })
  } catch (error) {
    console.error('Error fetching cargos:', error)
    alert('Алдаа гарлаа, дахин оролдоно уу!')
  }
}

// Total price computation
const totalFilteredPrice = computed(() => {
  return userCargos.value.reduce((sum, userData) => {
    return sum + userData.totalPrice
  }, 0)
})

const filteredUserCargos = computed(() => userCargos.value)

function getStatusDate(cargo) {
  switch (cargo.currentStatus) {
    case 'PRE_REGISTERED': return cargo.preRegisteredDate
    case 'RECEIVED_AT_ERENHOT': return cargo.receivedAtErenhotDate
    case 'IN_TRANSIT': return cargo.inTransitDate
    case 'DELIVERED_TO_UB': return cargo.deliveredToUBDate
    case 'DELIVERED': return cargo.deliveredDate
    default: return null
  }
}

function startEdit(cargo) {
  editingPrice.value = cargo.trackingNumber
  tempPrice.value = cargo.price
}

function cancelEdit() {
  editingPrice.value = null
  tempPrice.value = null
}

async function updatePrice(cargo) {
  try {
    await $fetch('/api/cargo/update-price', {
      method: 'POST',
      body: {
        trackingNumber: cargo.trackingNumber,
        price: tempPrice.value
      }
    })
    cargo.price = tempPrice.value
    cancelEdit()
    await fetchCargos() // Refresh data to update totals
  } catch (error) {
    console.error('Error updating price:', error)
    alert('Үнийг шинэчлэхэд алдаа гарлаа!')
  }
}

function goToDeliveredToUB(phoneNumber) {
  sessionStorage.setItem('phoneNumber', phoneNumber)
  window.open('/delivered-to-ub', '_blank')
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
</script>

<style lang="scss" scoped>
$primary-color: #1a73e8;
$secondary-color: #4285f4;
$background-color: #f8f9fa;
$border-color: #e0e0e0;
$text-color: #202124;
$danger-color: #dc3545;
$sidebar-width: 80px;

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
    padding: 1rem;
  }
}

.filter-section {
  padding: 12px 1.5rem;
  display: flex;
  background-color: #F6F6F6;
  border-bottom: 1px dashed #DBE0E0;
  align-items: center;
  gap: 1.5rem;

  .filters {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }

  select {
    max-width: 15rem;
    height: 2.5rem;
    border-radius: 8px;
    border: 1px solid $border-color;
    color: $text-color;
    padding: 8px;
    background-color: #ffffff;
  }

  .date-filters {
    display: flex;
    gap: 1.5rem;

    .form-group {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        font-weight: 500;
        color: $text-color;
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
    }
  }
}

.summary-section {
  background-color: white;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1rem 0;

  .total-summary {
    display: flex;
    align-items: center;
    gap: 1rem;

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: $text-color;
    }

    .status-label {
      padding: 4px 12px;
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
      border-radius: 16px;
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

.tables-grid {
  display: flex;
  flex-direction: column;
}

.status-section {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;

  .status-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 1rem;
    padding: 0 1rem;
    border-bottom: 2px solid $primary-color;
  }
}

.user-section {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;

  .user-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0 1rem;

    h2 {
      font-weight: 600;
      color: $text-color;
    }

    .user-actions {
      display: flex;
      align-items: center;
      gap: 1rem;

      h3 {
        font-weight: 500;
        color: $text-color;
      }
    }
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

  tbody tr:hover {
    background-color: rgba($primary-color, 0.02);
  }

  th:nth-child(1), td:nth-child(1) { width: 15%; } // Трак код
  th:nth-child(2), td:nth-child(2) { width: 20%; } // Нэр
  th:nth-child(3), td:nth-child(3) { width: 10%; } // Төрөл
  th:nth-child(4), td:nth-child(4) { width: 20%; } // Үнэ
  th:nth-child(5), td:nth-child(5) { width: 20%; } // Огноо
  th:nth-child(6), td:nth-child(6) { width: 15%; } // Төлөв
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

.btn-add {
  @include button-base;
  background-color: $primary-color;
  color: white;

  &:hover {
    filter: brightness(0.9);
  }
}

.total-price {
  font-weight: 500;
  color: $text-color;
  margin: 0.5rem 0;
}
</style>