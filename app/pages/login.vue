<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <svg width="123" height="32" viewBox="0 0 123 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- ...existing SVG code... -->
        </svg>
      </div>
      <h2>Staff Login</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label>Phone number</label>
          <input 
            type="number" 
            v-model="phoneNumber"
            required
            placeholder="Enter your phone number"
          />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input 
            type="password"
            v-model="password"
            required
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
// definePageMeta({
//   layout: 'custom'
// })

const router = useRouter()
const phoneNumber = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  loading.value = true
  error.value = ''
  
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        phoneNumber: phoneNumber.value,
        password: password.value
      }
    })
    
    router.push('/')
  } catch (err) {
    error.value = err?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;

  .login-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    .logo {
      text-align: center;
      margin-bottom: 2rem;
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background: #1a73e8;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        background: #ccc;
      }
    }

    .error {
      color: red;
      margin-top: 1rem;
      text-align: center;
    }
  }
}
</style>
