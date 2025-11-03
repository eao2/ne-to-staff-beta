<template>
  <div class="cargo-management">
    <SideBar />
    <div class="main-content">
      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-group">
          <label>Огноо талбар:</label>
          <select v-model="filters.dateField">
            <option value="preRegisteredDate">Бүртгэсэн</option>
            <option value="receivedAtErenhotDate">Эрээнд ирсэн</option>
            <option value="inTransitDate">Замд гарсан</option>
            <option value="deliveredToUBDate">УБ-д ирсэн</option>
            <option value="deliveredDate">Хүлээлгэн өгсөн</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Эхлэх огноо:</label>
          <input
            v-model="filters.startDate"
            type="datetime-local"
            lang="mn"
            class="border rounded px-2 py-1"
          />
        </div>

        <div class="filter-group">
          <label>Дуусах огноо:</label>
          <input
            v-model="filters.endDate"
            type="datetime-local"
            lang="mn"
            class="border rounded px-2 py-1"
          />
        </div>

        <div class="filter-group">
          <label>Төлөв:</label>
          <select v-model="filters.status">
            <option value="">Бүгд</option>
            <option v-for="s in statusOptions" :key="s" :value="s">
              {{ formatStatus(s) }}
            </option>
          </select>
        </div>

        <button class="btn-search" @click="fetchCargos">Шүүх</button>
      </div>

      <!-- Table -->
      <div v-if="cargos.length > 0" class="cargos-table-container">
        <h2 class="total-count">Нийт ачаа: {{ cargos.length }}</h2>
        <table class="cargos-table">
          <thead>
            <tr>
              <th>Дугаар</th>
              <th>Хэрэглэгчийн нэр</th>
              <th>Утас</th>
              <th>Төрөл</th>
              <th>Төлөв</th>
              <th>Үнэ</th>
              <th>Огноо</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cargo in cargos" :key="cargo.id">
              <td>{{ cargo.trackingNumber }}</td>
              <td>{{ cargo.user?.name || "-" }}</td>
              <td>{{ cargo.user?.phoneNumber || "-" }}</td>
              <td>{{ cargo.cargoType === "NORMAL" ? "Энгийн" : "Шуурхай" }}</td>
              <td>{{ formatStatus(cargo.currentStatus) }}</td>
              <td>{{ cargo.price ? numberWithCommas(cargo.price) + "₮" : "-" }}</td>
              <td>{{ formatDate(cargo[filters.dateField]) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="no-results">Илэрц алга.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const filters = ref({
  dateField: "preRegisteredDate",
  startDate: "",
  endDate: "",
  status: ""
});

const cargos = ref([]);

const statusOptions = [
  "PRE_REGISTERED",
  "RECEIVED_AT_ERENHOT",
  "IN_TRANSIT",
  "DELIVERED_TO_UB",
  "DELIVERED"
];

function formatStatus(status) {
  const map = {
    PRE_REGISTERED: "Бүртгэсэн",
    RECEIVED_AT_ERENHOT: "Эрээнд ирсэн",
    IN_TRANSIT: "Замд гарсан",
    DELIVERED_TO_UB: "УБ-д ирсэн",
    DELIVERED: "Хүлээлгэн өгсөн"
  };
  return map[status] || status;
}

function numberWithCommas(x) {
  return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

async function fetchCargos() {
  if (!filters.value.startDate || !filters.value.endDate) {
    cargos.value = [];
    return;
  }
  try {
    const res = await fetch("/api/filter-by-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters.value)
    });
    cargos.value = await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

onMounted(() => {
  // Default: 7 хоногийн өмнөөс одоо хүртэл
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  filters.value.startDate = weekAgo.toISOString().slice(0, 16);
  filters.value.endDate = now.toISOString().slice(0, 16);
  fetchCargos();
});
</script>

<style lang="scss" scoped>
$primary-color: #1a73e8;
$secondary-color: #4285f4;
$background-color: #f8f9fa;
$border-color: #e0e0e0;
$text-color: #202124;
$danger-color: #dc3545;
$sidebar-width: 80px;

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

// Form Styles
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
    .search-container{
      display: flex;
      gap: 1rem;
    }
  }
}

.form-grid{
  padding: 12px 1.5rem;
  display: flex;
  background-color: #F6F6F6;
  border-bottom: 1px dashed #DBE0E0;
  align-items: center;
  gap: 1.5rem;
  .form-group{
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

input{
  max-width: 15rem;
  height: 2.5rem;
  border-radius: 8px;
  border: 1px solid $border-color;
  color: $text-color;
  padding: 8px;
  background-color: #ffffff;
}

// Table Styles
.cargos-table-container {
  background-color: white;
  border-radius: 8px;
  padding-top: 1rem;

  .user-name{
    margin: 0 1rem;
    font-weight: 600;
  }

  .total-price{
    margin: 1rem;
    font-weight: 500;
  }

  table {
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

.action-buttons {
  display: flex;
  gap: 8px;
}

// Button Styles
.btn-search {
  @include button-base;
  background-color: $primary-color;
  color: white;

  &:hover {
    filter: brightness(0.9)
  }
}

.btn-submit {
  @include button-base;
  background-color: $secondary-color;
  color: white;

  &:disabled {
    background-color: $border-color;
    cursor: not-allowed;
  }
}

.btn-edit {
  @include button-base;
  background-color: transparent;
  color: $primary-color;

  &:hover {
    filter: brightness(0.9)
  }
}

.btn-delete {
  @include button-base;
  background-color: transparent;
  color: $danger-color;
  
  &:hover {
    background-color: rgba($danger-color, 0.1);
  }
}

.filter-section {
  padding: 12px 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f6f6f6;
  border-bottom: 1px dashed #dbe0e0;
  .filter-group {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    label {
      margin-bottom: 4px;
      font-weight: 500;
    }
    select,
    input {
      padding: 6px 10px;
      border: 1px solid #dbe0e0;
      border-radius: 6px;
    }
  }
  .btn-search {
    padding: 8px 14px;
    background: #1d4ed8;
    border: none;
    border-radius: 6px;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
  }
}

.cargos-table-container {
  background-color: white;
  border-radius: 8px;
  padding-top: 1rem;

  .user-name{
    margin: 0 1rem;
    font-weight: 600;
  }

  .total-price{
    margin: 1rem;
    font-weight: 500;
  }

  table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;

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

.total-count {
  padding-left: 1rem;
  font-weight: 500;
  color: $text-color;
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: #999;
}
</style>
