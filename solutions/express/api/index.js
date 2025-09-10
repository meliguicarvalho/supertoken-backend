const express = require('express')
const axios = require('axios')
const cors = require('cors')
const corsOptions = {
  origin: '*',
  credentials: false, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

const app = express()
app.use(cors(corsOptions))
app.use(express.json())

const PORT = 3000

app.post('/api', (req, res) => {
  let data = JSON.stringify({
    processing_mode: 'automatic',
    external_reference: 'ext_ref_1234',
    description: 'order description',
    marketplace: 'NONE',
    marketplace_fee: '1.00',
    total_amount: req.body.transactions.payments[0].amount,
    expiration_time: 'P3Y6M4DT12H30M5S',
    type: 'online',
    payer: { ...req.body.payer },
    transactions: { ...req.body.transactions },
    items: [
      {
        title: 'title',
        description: 'descriptions',
        unit_price: req.body.transactions.payments[0].amount,
        //   id: "ABC",
        category_id: 'category',
        picture_url: 'https://www.mercadopago.com/img',
        quantity: 1,
      },
    ],
  })

  const getAT = () => {
    switch (req.body.site) {
      case 'mlb':
        if (req.body.test) {
          return process.env.MLB_TEST_PK
        }
        return process.env.PK
      case 'mla':
        if (req.body.test) {
          return process.env.MLA_TEST_PK
        }
        return process.env.MLA_PK
      case 'mlm':
        if (req.body.test) {
          return process.env.MLM_TEST_PK
        }
        return process.env.MLM_TEST_PK
      default:
        return process.env.PK
    }
  }

  let configs = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.mercadopago.com/v1/orders',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': Math.random(),
      Authorization: `Bearer ${getAT()}`,
    },
    data: data,
  }

  axios
    .request(configs)
    .then((response) => {
      console.log(response.data)
      res.status(response.status).send(response.data)
    })
    .catch((error) => {
      console.log(error)
      console.log(JSON.stringify(error.response.data.errors))
      console.log(error?.response?.headers['x-request-id'])
      res.status(error.response.status).send({
        error: error?.response?.data || error?.data?.errors,
        requestId: error.response?.headers['x-request-id'] || 'dado errado',
      })
    })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
