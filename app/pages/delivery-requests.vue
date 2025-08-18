<template>
  <div class="main-page">
    <SideBar />
    <div class="page">
  <!-- Header -->
  <div class="header">
    <div class="header-content">
      <div class="title-block">
        <h1 class="page-title">Хүргэлтийн хүсэлтүүд</h1>
        <p class="page-subtitle">Хүргэлтийн хүсэлтүүдийг удирдах</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-secondary">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Шинэчлэх
        </button>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="filters">
    <div class="filter-group">
               <!-- Division Filter -->
         <div class="filter-item">
           <label>Салбар</label>
           <select v-model="filters.divisionId" @change="applyFilters">
             <option value="all">Бүгд</option>
             <option v-for="division in divisions" :key="division.id" :value="division.id">
               {{ division.name }}
             </option>
           </select>
         </div>

      <!-- Status Filter -->
      <div class="filter-item">
        <label>Төлөв</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">Бүгд</option>
          <option value="PENDING">Хүлээгдэж буй</option>
          <option value="APPROVED">Зөвшөөрөгдсөн</option>
          <option value="REJECTED">Татгалзсан</option>
        </select>
      </div>

      <!-- Search -->
      <div class="filter-item">
        <label>Хайх</label>
        <input v-model="filters.search" @input="debouncedSearch" type="text"
          placeholder="Нэр, утас, трек дугаар..." />
      </div>

      <!-- Clear Filters -->
      <div class="filter-item filter-item-end">
        <button @click="clearFilters" class="btn btn-light">
          Шүүлтүүр цэвэрлэх
        </button>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="content">
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3>Алдаа гарлаа</h3>
      <p>{{ error }}</p>
      <button @click="fetchDeliveryRequests" class="btn btn-primary">
        Дахин оролдох
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="deliveryRequests.length === 0" class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3>Хүргэлтийн хүсэлт олдсонгүй</h3>
      <p>Шүүлтүүрээ өөрчилж үзнэ үү.</p>
    </div>

         <!-- Requests List -->
     <div v-else class="requests-list">
       <div v-for="addressGroup in deliveryRequests" :key="addressGroup.addressId" class="request-card">
         <!-- User Info -->
         <div class="request-header">
           <div class="user-info">
             <div class="avatar">
               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                   d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
             </div>
             <div>
               <h3 class="user-name">{{ addressGroup.user?.name || 'Нэргүй' }}</h3>
               <p class="user-phone">{{ addressGroup.user?.phoneNumber }}</p>
             </div>
           </div>
           <div class="status-section">
             <div v-if="addressGroup.user?.autoDeliveryRequest" class="auto-delivery">
               <span class="badge badge-green">Хүргэлт</span>
               <span>{{ addressGroup.totalCargos }} бараа</span>
             </div>
             <div class="cargo-summary">
               <span class="badge badge-blue">{{ addressGroup.approvableCargos.length }} хүлээн авах боломжтой</span>
               <span class="badge badge-yellow">{{ addressGroup.nonApprovableCargos.length }} хүлээгдэж буй</span>
             </div>
             <div class="total-price">
               <span class="badge badge-blue">Нийт: {{ formatPrice(addressGroup.totalPrice) }}</span>
             </div>
           </div>
         </div>

         <!-- Delivery Address -->
         <div class="request-body">
           <!-- Debug Info -->
           <!-- <div class="debug-section">
             <p>Debug: Total={{ addressGroup.totalCargos }}, Approvable={{ addressGroup.approvableCargos.length }}, Non-Approvable={{ addressGroup.nonApprovableCargos.length }}</p>
             <button @click="testMarkDelivered(addressGroup.cargos[0]?.requestId)" class="btn btn-secondary" style="margin-top: 0.5rem;">Test Mark Delivered</button>
             <div style="margin-top: 0.5rem; font-size: 0.7rem;">
               <p>All Cargos:</p>
               <ul>
                 <li v-for="cargo in addressGroup.cargos" :key="cargo.id">
                   {{ cargo.trackingNumber }} - Status: {{ cargo.currentStatus }} - Request: {{ cargo.requestStatus }}
                 </li>
               </ul>
             </div>
           </div>
            -->
           <div class="address-block">
             <h4>Хүргэх хаяг</h4>
             <div class="address">
               <p>{{ formatAddress(addressGroup.deliveryAddress) }}</p>
               <p>Утас: {{ addressGroup.deliveryAddress.contactPhone }}</p>
             </div>
           </div>

           <!-- Approve All Button -->
           <div v-if="addressGroup.approvableCargos.length > 0" class="approve-all-section">
             <button @click="approveAllCargos(addressGroup)" class="btn btn-green">
               Бүх барааг хүлээн авах ({{ addressGroup.approvableCargos.length }})
             </button>
           </div>

           <!-- Cargo List -->
           <div class="cargo-block">
             <h4>Барааны жагсаалт ({{ addressGroup.totalCargos }})</h4>
             
             <!-- Approvable Cargos -->
             <div v-if="addressGroup.approvableCargos.length > 0" class="cargo-section">
               <h5 class="cargo-section-title">Хүлээн авах боломжтой</h5>
               <div v-for="cargo in addressGroup.approvableCargos" :key="cargo.id" class="cargo-item approvable">
                 <div class="cargo-info">
                   <svg class="cargo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                       d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                   </svg>
                   <div>
                     <p class="tracking-number">{{ cargo.trackingNumber }}</p>
                     <p class="cargo-status">{{ getCargoStatusText(cargo.currentStatus) }}</p>
                     <p v-if="cargo.nickname" class="cargo-nickname">{{ cargo.nickname }}</p>
                     <p class="cargo-price">{{ formatPrice(cargo.price) }}</p>
                     <p class="debug-info">Request: {{ cargo.requestStatus }}</p>
                   </div>
                 </div>

                 <!-- Actions -->
                 <div class="cargo-actions">
                   <button v-if="cargo.requestStatus === 'PENDING'" @click="approveRequest(cargo.requestId)" class="btn btn-green">Хүлээн авах</button>
                   <button v-if="cargo.requestStatus === 'PENDING'" @click="rejectRequest(cargo.requestId)" class="btn btn-red">Татгалзах</button>
                   <button v-if="cargo.requestStatus === 'APPROVED'" @click="markDelivered(cargo.requestId)" class="btn btn-blue">Хүргэгдсэн</button>
                   <button @click="showResponseModal({ id: cargo.requestId, status: cargo.requestStatus })" class="btn btn-secondary">Хариулт</button>
                   <p class="debug-info">Request Status: {{ cargo.requestStatus }}</p>
                   <p class="debug-info">Request ID: {{ cargo.requestId }}, Status: {{ cargo.requestStatus }}</p>
                 </div>
               </div>
             </div>

             <!-- Non-Approvable Cargos -->
             <div v-if="addressGroup.nonApprovableCargos.length > 0" class="cargo-section">
               <h5 class="cargo-section-title">Хүлээгдэж буй</h5>
               <div v-for="cargo in addressGroup.nonApprovableCargos" :key="cargo.id" class="cargo-item non-approvable">
                 <div class="cargo-info">
                   <svg class="cargo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                       d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                   </svg>
                   <div>
                     <p class="tracking-number">{{ cargo.trackingNumber }}</p>
                     <p class="cargo-status">{{ getCargoStatusText(cargo.currentStatus) }}</p>
                     <p v-if="cargo.nickname" class="cargo-nickname">{{ cargo.nickname }}</p>
                     <p class="cargo-price">{{ formatPrice(cargo.price) }}</p>
                     <p class="debug-info">Request: {{ cargo.requestStatus }}</p>
                   </div>
                 </div>

                 <!-- Status Only (No Actions) -->
                 <div class="cargo-status-display">
                   <span class="badge badge-yellow">Хүлээгдэж буй</span>
                   <button v-if="cargo.requestStatus === 'APPROVED'" @click="markDelivered(cargo.requestId)" class="btn btn-blue">Хүргэгдсэн</button>
                   <!-- <p class="debug-info">Button should show if: {{ cargo.requestStatus }} === 'APPROVED' = {{ cargo.requestStatus === 'APPROVED' }}</p>
                   <p class="debug-info">Request ID: {{ cargo.requestId }}, Status: {{ cargo.requestStatus }}</p> -->
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="pagination">
      <div class="pagination-info">
        Нийт {{ pagination.total }} хүсэлтээс {{ (pagination.page - 1) * pagination.limit + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }}
      </div>
      <div class="pagination-controls">
        <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1" class="btn btn-secondary">Өмнөх</button>
        <span>{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages" class="btn btn-secondary">Дараах</button>
      </div>
    </div>
  </div>

  <!-- Response Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <h3>Хариулт бичих</h3>
      <textarea v-model="responseText" rows="4" placeholder="Хариултаа бичнэ үү..."></textarea>

      <div v-if="selectedRequest?.status === 'PENDING'" class="modal-actions">
        <div>
          <button @click="approveWithResponse" class="btn btn-green">Зөвшөөрөх</button>
          <button @click="rejectWithResponse" class="btn btn-red">Татгалзах</button>
        </div>
        <button @click="closeModal" class="btn btn-light">Цуцлах</button>
      </div>

      <div v-else class="modal-actions">
        <button @click="closeModal" class="btn btn-light">Цуцлах</button>
        <button @click="saveResponse" class="btn btn-blue">Хадгалах</button>
      </div>
    </div>
  </div>
    </div>
  </div>
</template>


<script setup>

// Set page title and meta
useHead({
  title: 'Хүргэлтийн хүсэлтүүд - NE Staff',
  meta: [
    { name: 'description', content: 'Хүргэлтийн хүсэлтүүдийг удирдах систем' }
  ]
})

// Reactive data
const loading = ref(false)
const error = ref(null)
const deliveryRequests = ref([])
const divisions = ref([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})
const filters = ref({
  divisionId: 'all', // Will be set to user's division after fetching
  status: '',
  search: ''
})
const showModal = ref(false)
const responseText = ref('')
const selectedRequest = ref(null)

// Fetch data on mount
onMounted(async () => {
  try {
    await fetchDivisions()
    await fetchDeliveryRequests()
  } catch (error) {
    console.error('Error initializing page:', error)
    error.value = 'Хуудас ачаалахад алдаа гарлаа'
  }
})

// API functions
const fetchDivisions = async () => {
  try {
    const response = await fetch('/api/delivery-requests/divisions', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    const data = await response.json()
    divisions.value = data.data
    
    // Set user's division as default (assuming first division or specific logic)
    if (divisions.value.length > 0) {
      // You can modify this logic to get the actual user's division
      filters.value.divisionId = divisions.value[0].id
    }
  } catch (error) {
    console.error('Error fetching divisions:', error)
    // Set default divisions if API fails
    divisions.value = []
  }
}

const fetchDeliveryRequests = async () => {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString()
    })
    
    if (filters.value.divisionId && filters.value.divisionId !== 'all') {
      params.append('divisionId', filters.value.divisionId)
    }
    if (filters.value.status) {
      params.append('status', filters.value.status)
    }
    if (filters.value.search) {
      params.append('search', filters.value.search)
    }

    const response = await fetch(`/api/delivery-requests?${params}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    const data = await response.json()
    
    // Debug: Log the API response structure
    console.log('API Response:', data)
    console.log('First request sample:', data.data[0])
    
    // Group delivery requests by address
    const groupedRequests = groupRequestsByAddress(data.data)
    deliveryRequests.value = groupedRequests
    pagination.value = data.pagination
  } catch (err) {
    console.error('Error fetching delivery requests:', err)
    // For development, show mock data if API is not available
    if (process.dev) {
      deliveryRequests.value = []
      pagination.value = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    } else {
      error.value = 'Хүргэлтийн хүсэлтүүдийг ачаалахад алдаа гарлаа'
    }
  } finally {
    loading.value = false
  }
}

// Group delivery requests by address
const groupRequestsByAddress = (requests) => {
  const groups = {}
  
  requests.forEach(request => {
    const addressKey = request.deliveryAddress.id
    
    if (!groups[addressKey]) {
      groups[addressKey] = {
        addressId: addressKey,
        deliveryAddress: request.deliveryAddress,
        user: request.requestedByUser || request.cargo.user,
        cargos: [],
        approvableCargos: [],
        nonApprovableCargos: [],
        totalCargos: 0,
        totalPrice: 0
      }
    }
    
    // Add cargo to the group
    const cargoData = {
      id: request.cargo.id,
      trackingNumber: request.cargo.trackingNumber,
      currentStatus: request.cargo.currentStatus,
      requestId: request.id,
      requestStatus: request.status,
      price: request.cargo.price,
      cargoType: request.cargo.cargoType,
      nickname: request.cargo.nickname
    }
    
    groups[addressKey].cargos.push(cargoData)
    
    // Separate approvable and non-approvable cargos
    // Only show PENDING requests as approvable
    if (request.cargo.currentStatus === 'DELIVERED_TO_UB' && request.status === 'PENDING') {
      groups[addressKey].approvableCargos.push(cargoData)
    } else {
      groups[addressKey].nonApprovableCargos.push(cargoData)
    }
    
    // Debug logging
    console.log(`Cargo ${cargoData.trackingNumber}: status=${cargoData.currentStatus}, requestStatus=${cargoData.requestStatus}`)
    
    groups[addressKey].totalCargos++

    // Sum price (handle Decimal string/number/null)
    const priceNumber = cargoData.price ? Number(cargoData.price) : 0
    groups[addressKey].totalPrice += isNaN(priceNumber) ? 0 : priceNumber
  })
  
  return Object.values(groups)
}

const approveRequest = async (requestId) => {
  try {
    await fetch('/api/delivery-requests/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requestId })
    })
    await fetchDeliveryRequests()
    // Show success message (you can add a toast notification here)
  } catch (error) {
    console.error('Error approving request:', error)
    // Show error message
  }
}

const approveAllCargos = async (addressGroup) => {
  try {
    // Only approve cargos with DELIVERED_TO_UB status and PENDING request status
    const approvableRequestIds = addressGroup.approvableCargos
      .filter(cargo => cargo.requestStatus === 'PENDING')
      .map(cargo => cargo.requestId)
    
    if (approvableRequestIds.length === 0) {
      console.log('No approvable cargos found')
      return
    }
    
    // Approve all approvable cargos
    for (const requestId of approvableRequestIds) {
      await fetch('/api/delivery-requests/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId })
      })
    }
    
    await fetchDeliveryRequests()
    console.log(`Approved ${approvableRequestIds.length} cargos`)
  } catch (error) {
    console.error('Error approving all cargos:', error)
  }
}

const rejectRequest = async (requestId) => {
  try {
    await fetch('/api/delivery-requests/reject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requestId })
    })
    await fetchDeliveryRequests()
  } catch (error) {
    console.error('Error rejecting request:', error)
  }
}

const markDelivered = async (requestId) => {
  try {
    await fetch('/api/delivery-requests/mark-delivered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requestId })
    })
    await fetchDeliveryRequests()
  } catch (error) {
    console.error('Error marking as delivered:', error)
  }
}

// Helper functions
const getStatusBadgeClass = (status) => {
  const classes = {
    PENDING: 'badge badge-yellow',
    APPROVED: 'badge badge-green',
    REJECTED: 'badge badge-red'
  }
  return classes[status] || classes.PENDING
}

const getStatusText = (status) => {
  const texts = {
    PENDING: 'Хүлээгдэж буй',
    APPROVED: 'Зөвшөөрөгдсөн',
    REJECTED: 'Татгалзсан'
  }
  return texts[status] || status
}

const getCargoStatusText = (status) => {
  const texts = {
    PRE_REGISTERED: 'Урьдчилан бүртгэгдсэн',
    RECEIVED_AT_ERENHOT: 'Эрээнхотод хүлээн авсан',
    IN_TRANSIT: 'Замд',
    DELIVERED_TO_UB: 'УБ-д хүргэгдсэн',
    DELIVERED: 'Хүргэгдсэн'
  }
  return texts[status] || status
}

const formatPrice = (value) => {
  const num = value ? Number(value) : 0
  if (isNaN(num)) return '₮0'
  return `₮${num.toLocaleString('mn-MN')}`
}

const formatAddress = (address) => {
  return `${address.provinceOrCity}, ${address.district}, ${address.subDistrict}, ${address.detailedLocation}`
}

const getCargosForAddress = (addressId) => {
  // Return the cargo for this specific delivery request
  return deliveryRequests.value.filter(req => req.deliveryAddress.id === addressId).map(req => req.cargo)
}

const getAutoDeliveryCargoCount = (userId) => {
  // Count cargos for this user that are not delivered
  return deliveryRequests.value.filter(req => 
    req.requestedByUser?.id === userId && 
    req.cargo.currentStatus !== 'DELIVERED'
  ).length
}

// Modal functions
const showResponseModal = (request) => {
  selectedRequest.value = request
  responseText.value = request.staffResponse || ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedRequest.value = null
  responseText.value = ''
}

const approveWithResponse = async () => {
  if (!selectedRequest.value) return
  
  try {
    await fetch('/api/delivery-requests/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        requestId: selectedRequest.value.id,
        staffResponse: responseText.value
      })
    })
    closeModal()
    await fetchDeliveryRequests()
  } catch (error) {
    console.error('Error approving with response:', error)
  }
}

const rejectWithResponse = async () => {
  if (!selectedRequest.value) return
  
  try {
    await fetch('/api/delivery-requests/reject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        requestId: selectedRequest.value.id,
        staffResponse: responseText.value
      })
    })
    closeModal()
    await fetchDeliveryRequests()
  } catch (error) {
    console.error('Error rejecting with response:', error)
  }
}

const saveResponse = async () => {
  if (!selectedRequest.value) return
  
  try {
    // For now, just close the modal since we don't have a separate endpoint for just saving response
    closeModal()
  } catch (error) {
    console.error('Error saving response:', error)
  }
}

// Debounced search
let searchTimeout = null

// Filter functions
const applyFilters = () => {
  pagination.value.page = 1
  fetchDeliveryRequests()
}

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const clearFilters = () => {
  filters.value = {
    divisionId: 'all',
    status: '',
    search: ''
  }
  applyFilters()
}

const changePage = (page) => {
  pagination.value.page = page
  fetchDeliveryRequests()
}

const refreshData = () => {
  fetchDeliveryRequests()
}

// Test function for manual markDelivered
const testMarkDelivered = async (requestId) => {
  if (!requestId) {
    console.warn('No requestId provided for testMarkDelivered')
    return
  }
  try {
    await markDelivered(requestId)
    console.log(`Manually marked request ${requestId} as delivered.`)
    await fetchDeliveryRequests()
  } catch (error) {
    console.error('Error testing markDelivered:', error)
  }
}
</script>

<style lang="scss" scoped>
// Variables
$primary: #0973FB;
$primary-hover: #0666e0;
$secondary: #697386;
$muted-bg: #F4F8FB;
$muted-bg-hover: #E9EEF3;
$border-color: #E5E8EB;
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;
$text-dark: #1F2937;
$text-light: #6B7280;
$sidebar-width: 280px;
$primary-color: #1a73e8;
$secondary-color: #4285f4;
$background-color: #f8f9fa;
$border-color: #e0e0e0;
$text-color: #202124;
$sidebar-width: 280px;


// Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin card {
  background: white;
  border-radius: 12px;
  border: 1px solid $border-color;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

// Header
.main-page {
  display: flex;
  .page {
    margin-left: $sidebar-width;
    width: calc(100% - #{$sidebar-width});
    background-color: $background-color;
    padding: 16px
  }
}

.header {
  @include card;
  margin-bottom: 1.5rem;
  padding: 1.5rem;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-block {
    .page-title {
      font-size: 1.8rem;
      color: $text-dark;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .page-subtitle {
      color: $text-light;
      margin: 0;
      font-size: 0.9rem;
    }
  }

  .header-actions {
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid $border-color;
      border-radius: 8px;
      background: white;
      color: $text-dark;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: $muted-bg;
      }

      .icon {
        width: 16px;
        height: 16px;
      }
    }
  }
}

// Filters
.filters {
  @include card;
  margin-bottom: 1.5rem;
  padding: 1.5rem;

  .filter-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: end;
  }

  .filter-item {
    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: $text-dark;
      margin-bottom: 0.5rem;
    }

    select, input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid $border-color;
      border-radius: 8px;
      background: white;
      font-size: 0.875rem;
      transition: border-color 0.2s ease;

      &:focus {
        outline: none;
        border-color: $primary;
      }
    }

    &.filter-item-end {
      display: flex;
      align-items: end;
    }
  }
}

// Content
.content {
  .loading {
    @include flex-center;
    padding: 3rem;

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid $muted-bg;
      border-top: 3px solid $primary;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .error-state, .empty-state {
    text-align: center;
    padding: 3rem;

    .error-icon, .empty-icon {
      width: 3rem;
      height: 3rem;
      margin: 0 auto 1rem;
      color: $text-light;
    }

    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: $text-dark;
      margin: 0 0 0.5rem 0;
    }

    p {
      color: $text-light;
      margin: 0 0 1.5rem 0;
    }
  }

  .error-state .error-icon {
    color: $danger;
  }
}

// Requests List
     .requests-list {
       display: flex;
       flex-direction: column;
       gap: 0.75rem;
     }

.request-card {
  @include card;
  overflow: hidden;

       .request-header {
       background: $muted-bg;
       padding: 0.75rem 1rem;
       border-bottom: 1px solid $border-color;
       display: flex;
       justify-content: space-between;
       align-items: center;

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      .avatar {
        width: 2.5rem;
        height: 2.5rem;
        background: rgba($primary, 0.1);
        border-radius: 50%;
        @include flex-center;

        svg {
          width: 1.25rem;
          height: 1.25rem;
          color: $primary;
        }
      }

      .user-name {
        font-size: 1.125rem;
        font-weight: 600;
        color: $text-dark;
        margin: 0 0 0.25rem 0;
      }

      .user-phone {
        color: $text-light;
        margin: 0;
        font-size: 0.875rem;
      }
    }

      .status-section {
       display: flex;
       align-items: center;
       gap: 1rem;

       .auto-delivery {
         display: flex;
         align-items: center;
         gap: 0.5rem;
         color: $text-light;
       }

       .cargo-summary {
         display: flex;
         gap: 0.5rem;
       }
       .total-price {
         display: flex;
         align-items: center;
         gap: 0.5rem;
         color: $text-light;
       }
     }
  }

       .request-body {
       padding: 1rem;

    .debug-section {
      background: $muted-bg;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border: 1px solid $border-color;
      font-size: 0.75rem;
      color: $text-light;
      font-family: monospace;
    }

    .address-block, .cargo-block {
      margin-bottom: 1.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        font-size: 0.875rem;
        font-weight: 600;
        color: $text-dark;
        margin: 0 0 0.75rem 0;
      }
    }

    .address {
      background: $muted-bg;
      padding: 1rem;
      border-radius: 8px;

      p {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        color: $text-dark;

        &:last-child {
          margin-bottom: 0;
          color: $text-light;
        }
      }
    }

         .approve-all-section {
       margin-bottom: 0.75rem;
       padding: 0.75rem;
       background: rgba($success, 0.1);
       border-radius: 8px;
       border: 1px solid rgba($success, 0.2);
     }

     .cargo-section {
       margin-bottom: 1rem;

       &:last-child {
         margin-bottom: 0;
       }

       .cargo-section-title {
         font-size: 0.875rem;
         font-weight: 600;
         color: $text-dark;
         margin: 0 0 0.5rem 0;
         padding-bottom: 0.25rem;
         border-bottom: 1px solid $border-color;
       }
     }

     .cargo-item {
       background: $muted-bg;
       padding: 0.75rem;
       border-radius: 8px;
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 0.5rem;

       &:last-child {
         margin-bottom: 0;
       }

       &.approvable {
         border-left: 4px solid $success;
       }

       &.non-approvable {
         border-left: 4px solid $warning;
         opacity: 0.8;
       }

       .cargo-info {
         display: flex;
         align-items: center;
         gap: 0.75rem;

         .cargo-icon {
           width: 1.25rem;
           height: 1.25rem;
           color: $text-light;
         }

         .tracking-number {
           font-size: 0.875rem;
           font-weight: 600;
           color: $text-dark;
           margin: 0 0 0.25rem 0;
         }

         .cargo-status {
           font-size: 0.75rem;
           color: $text-light;
           margin: 0 0 0.25rem 0;
         }

         .cargo-nickname {
           font-size: 0.75rem;
           color: $secondary;
           margin: 0;
           font-style: italic;
         }
         
         .debug-info {
           font-size: 0.7rem;
           color: #999;
           margin: 0;
           font-family: monospace;
         }
       }

       .cargo-actions {
         display: flex;
         gap: 0.5rem;
       }

       .cargo-status-display {
         display: flex;
         align-items: center;
       }
     }
  }
}

// Buttons
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.btn-primary {
    background: $primary;
    color: white;

    &:hover {
      background: $primary-hover;
    }
  }

  &.btn-secondary {
    background: white;
    color: $text-dark;
    border: 1px solid $border-color;

    &:hover {
      background: $muted-bg;
    }
  }

  &.btn-light {
    background: $muted-bg;
    color: $text-dark;

    &:hover {
      background: $muted-bg-hover;
    }
  }

  &.btn-green {
    background: $success;
    color: white;

    &:hover {
      background: darken($success, 10%);
    }
  }

  &.btn-red {
    background: $danger;
    color: white;

    &:hover {
      background: darken($danger, 10%);
    }
  }

  &.btn-blue {
    background: $primary;
    color: white;

    &:hover {
      background: $primary-hover;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Badges
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;

  &.badge-green {
    background: rgba($success, 0.1);
    color: $success;
  }

  &.badge-yellow {
    background: rgba($warning, 0.1);
    color: $warning;
  }

  &.badge-red {
    background: rgba($danger, 0.1);
    color: $danger;
  }

  &.badge-blue {
    background: rgba($primary, 0.1);
    color: $primary;
  }
}

// Pagination
.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;

  .pagination-info {
    font-size: 0.875rem;
    color: $text-light;
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    span {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      color: $text-dark;
    }
  }
}

// Modal
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-dark;
    margin: 0 0 1rem 0;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $border-color;
    border-radius: 8px;
    font-size: 0.875rem;
    resize: vertical;
    min-height: 100px;

    &:focus {
      outline: none;
      border-color: $primary;
    }
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    gap: 1rem;

    > div {
      display: flex;
      gap: 0.5rem;
    }
  }
}

// Animations
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Responsive
@media (max-width: 768px) {
  .page {
    padding: 1rem;
  }

  .header .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .filter-group {
    grid-template-columns: 1fr;
  }

  .request-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .cargo-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>