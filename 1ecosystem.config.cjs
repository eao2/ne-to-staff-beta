// module.exports = { apps: [ 
//     { name: 'ne-to-staff-beta',
//         script: './.output/server/index.mjs',
//         exec_mode: 'cluster',
//         instances: 'max',
//         env: {
//             PORT: 4100,
//             NITRO_PORT: 4100,
//             DIVISION_LOCATION_ID: 'cm9vnxb4w0000s5d4debydiiq',
//             NODE_ENV: 'production',
//             DATABASE_URL: "mysql://admin:neto24@localhost:3306/neto"
//         }
//     }
//     ]
// }


module.exports = {
    apps: [
    { name: 'ne-to-staff-beta',
        script: './.output/server/index.mjs',
        exec_mode: 'cluster',
        instances: '1',
        env: {
            PORT: 4100,
            NITRO_PORT: 4100,
            DIVISION_LOCATION_ID: 'cm9vnxb4w0000s5d4debydiiq',
            NODE_ENV: 'production',
            DATABASE_URL: "mysql://admin:neto24@localhost:3306/neto"
        }
    },{
        name: 'ne-to-staff-21-beta',
        script: './.output/server/index.mjs',
        exec_mode: 'cluster',
        instances: '1',
        env: {
                PORT: 4101,
                NITRO_PORT: 4101,
                DIVISION_LOCATION_ID: 'cm9vnyoei0001s5d4f1hloil0',
                NODE_ENV: 'production',
                DATABASE_URL: "mysql://admin:neto24@localhost:3306/neto"
        }
    },{
        name: 'ne-to-staff-nar-beta',
        script: './.output/server/index.mjs',
        exec_mode: 'cluster',
        instances: '1',
        env: {
                PORT: 4102,
                NITRO_PORT: 4102,
                DIVISION_LOCATION_ID: 'cmaxjrpkj0001s5zgzdpod1h2',
                NODE_ENV: 'production',
                DATABASE_URL: "mysql://admin:neto24@localhost:3306/neto"
        }

        },{
        name: 'ne-to-staff-tengis-beta',
        script: './.output/server/index.mjs',
        exec_mode: 'cluster',
        instances: '1',
        env: {
                PORT: 4103,
                NITRO_PORT: 4103,
                DIVISION_LOCATION_ID: 'cmaxjrpkj0000s5zgkt8zextj',
                NODE_ENV: 'production',
                DATABASE_URL: "mysql://admin:neto24@localhost:3306/neto"
        }
}
]
}