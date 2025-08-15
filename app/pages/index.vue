<!-- pages/dashboard.vue -->
<template>
  <div class="cargo-management">
    <SideBar />
    <div class="main-content">
      <div class="dashboard-grid">
        <!-- Today's Stats -->
        <div class="stats-container">
          <h2>Өнөөдрийн Статистик</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Өнөөдөр Хүлээлгэж Өгсөн Каргоны дүн</h3>
              <p>{{ numberWithCommas(todayStats.revenue) }}₮</p>
            </div>
            <div class="stat-card">
              <h3>Өнөөдөр Нийт Улаанбаатарт Ирсэн Каргоны дүн</h3>
              <p>{{ numberWithCommas(todayStats.deliveredToUBRevenue) }}₮</p>
            </div>
            <div class="stat-card">
              <h3>Өнөөдөр Хүлээлгэж Өгсөн Энгийн Карго</h3>
              <p>{{ todayStats.normalCount }} ширхэг</p>
            </div>
            <div class="stat-card">
              <h3>Өнөөдөр Хүлээлгэж Өгсөн Шуурхай Карго</h3>
              <p>{{ todayStats.quickCount }} ширхэг</p>
            </div>
          </div>
        </div>

        <!-- Revenue Chart -->
        <div class="chart-container">
          <h2>Сүүлийн 7 Хоногийн Хүлээлгэж Өгсөн Орлого</h2>
          <Line
            v-if="chartData.datasets[0].data.length > 0"
            :data="chartData"
            :options="chartOptions"
          />
        </div>

        <!-- Monthly Revenue -->
        <div class="table-container">
          <h2>Сар Тус Бүрийн Хүлээлгэж Өгсөн Орлого</h2>
          <table class="cargos-table">
            <thead>
              <tr>
                <th>Сар</th>
                <th>Нийт Хүлээлгэж Өгсөн Орлого</th>
                <th>Нийт Хүлээлгэж Өгсөн Карго</th>
                <th>Дундаж Үнэ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="month in monthlyRevenue" :key="month.month">
                <td>{{ month.month }}</td>
                <td>{{ numberWithCommas(month.revenue) }}₮</td>
                <td>{{ month.count }} ширхэг</td>
                <td>{{ numberWithCommas(month.averagePrice) }}₮</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const todayStats = ref({
  revenue: 0,
  deliveredToUBRevenue: 0,
  normalCount: 0,
  quickCount: 0
})

const weeklyData = ref({
  dates: [],
  revenues: []
})

const chartData = computed(() => ({
  labels: weeklyData.value.dates,
  datasets: [
    {
      label: 'Өдрийн орлого',
      data: weeklyData.value.revenues,
      borderColor: '#1a73e8',
      tension: 0.1
    }
  ]
}))

const monthlyRevenue = ref([])

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => numberWithCommas(value) + '₮'
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          return numberWithCommas(context.raw) + '₮'
        }
      }
    }
  }
}

function numberWithCommas(x) {
  if (!x) return '0'
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

onMounted(async () => {
  try {
    const [todayRes, weeklyRes, monthlyRes] = await Promise.all([
      fetch('/api/dashboard/today').then(r => r.json()),
      fetch('/api/dashboard/weekly-revenue').then(r => r.json()),
      fetch('/api/dashboard/monthly-revenue').then(r => r.json())
    ])

    todayStats.value = todayRes
    weeklyData.value = weeklyRes
    monthlyRevenue.value = monthlyRes
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
})
</script>

<style lang="scss" scoped>
.cargo-management{
  margin-left: 17.5rem;
}

.stats-container{
  h2{
    margin-bottom: 1rem;
  }
}

.dashboard-grid {
  padding: 1.5rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, 1fr);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;

  h3 {
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #202124;
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  height: 400px;
}

.table-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  
  .cargos-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    th {
      font-weight: 500;
      color: #202124;
      background-color: rgba(26, 115, 232, 0.05);
    }
  }
}
</style>