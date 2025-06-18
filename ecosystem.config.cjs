module.exports = { apps: [ 
    { name: 'ne-to-staff-beta',
        script: './.output/server/index.mjs',
        exec_mode: 'cluster',
        instances: 'max',
        env: {
            PORT: 4100,
            NITRO_PORT: 4100,
            DIVISION_LOCATION_ID: 'cm9vnxb4w0000s5d4debydiiq',
            NODE_ENV: 'production',
            DATABASE_URL: "mysql://admin:neto24@localhost:3306/neto",
            JWT_SECRET: 'BC879C9583AD29F34FACC7970B36C1E58D8ABBC785025B3A197BB0A4655669C6'

        }
    }
    ]
}